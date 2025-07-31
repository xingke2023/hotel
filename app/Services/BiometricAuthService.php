<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserCredential;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class BiometricAuthService
{
    /**
     * 生成注册选项
     */
    public function generateRegistrationOptions(string $email, string $name): array
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            throw new \Exception('用户不存在');
        }

        $challenge = $this->generateChallenge();
        
        // 将挑战存储在session中用于后续验证
        session(['biometric_challenge' => $challenge]);
        session(['biometric_user_id' => $user->id]);

        return [
            'challenge' => $challenge,
            'rp' => [
                'name' => '澳门实时房价信息平台',
                'id' => request()->getHost(),
            ],
            'user' => [
                'id' => base64_encode($user->id),
                'name' => $email,
                'displayName' => $name,
            ],
            'pubKeyCredParams' => [
                ['type' => 'public-key', 'alg' => -7],  // ES256
                ['type' => 'public-key', 'alg' => -257], // RS256
            ],
            'authenticatorSelection' => [
                'authenticatorAttachment' => 'platform',
                'userVerification' => 'required',
                'requireResidentKey' => true,
            ],
            'timeout' => 60000,
            'attestation' => 'none',
        ];
    }

    /**
     * 验证注册凭据
     */
    public function verifyRegistrationCredential(string $email, array $credential, string $challenge): bool
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            throw new \Exception('用户不存在');
        }

        // 验证挑战
        $sessionChallenge = session('biometric_challenge');
        $sessionUserId = session('biometric_user_id');
        
        if (!$sessionChallenge || !$sessionUserId || $sessionUserId != $user->id) {
            throw new \Exception('无效的会话');
        }

        // 清除session数据
        session()->forget(['biometric_challenge', 'biometric_user_id']);

        // 解析客户端数据
        $clientDataJSON = json_decode(base64_decode($credential['response']['clientDataJSON']), true);
        
        // 验证挑战
        if ($clientDataJSON['challenge'] !== base64_encode($challenge)) {
            throw new \Exception('挑战验证失败');
        }

        // 验证origin
        $expectedOrigin = (request()->isSecure() ? 'https://' : 'http://') . request()->getHost();
        if ($clientDataJSON['origin'] !== $expectedOrigin) {
            throw new \Exception('Origin验证失败');
        }

        // 解析认证对象
        $attestationObject = base64_decode($credential['response']['attestationObject']);
        $attestationData = $this->parseAttestationObject($attestationObject);

        // 存储凭据
        UserCredential::create([
            'user_id' => $user->id,
            'credential_id' => $credential['id'],
            'public_key' => base64_encode($attestationData['publicKey']),
            'attestation_object' => $credential['response']['attestationObject'],
            'transports' => ['internal'], // 平台认证器
            'sign_count' => 0,
            'name' => '生物识别凭据 - ' . now()->format('Y-m-d H:i'),
        ]);

        return true;
    }

    /**
     * 生成认证选项
     */
    public function generateAuthenticationOptions(string $email): array
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            throw new \Exception('用户不存在');
        }

        $challenge = $this->generateChallenge();
        
        // 将挑战存储在session中用于后续验证
        session(['biometric_challenge' => $challenge]);
        session(['biometric_user_id' => $user->id]);

        // 获取用户的活跃凭据
        $credentials = $user->activeCredentials()->get();
        $allowCredentials = $credentials->map(function ($credential) {
            return [
                'type' => 'public-key',
                'id' => $credential->credential_id,
            ];
        })->toArray();

        return [
            'challenge' => $challenge,
            'allowCredentials' => $allowCredentials,
            'timeout' => 60000,
            'userVerification' => 'required',
        ];
    }

    /**
     * 验证认证凭据
     */
    public function verifyAuthenticationCredential(array $credential, string $challenge): array
    {
        // 验证挑战
        $sessionChallenge = session('biometric_challenge');
        $sessionUserId = session('biometric_user_id');
        
        if (!$sessionChallenge || !$sessionUserId) {
            throw new \Exception('无效的会话');
        }

        // 清除session数据
        session()->forget(['biometric_challenge', 'biometric_user_id']);

        // 查找凭据
        $userCredential = UserCredential::where('credential_id', $credential['id'])
            ->where('is_active', true)
            ->first();

        if (!$userCredential) {
            throw new \Exception('凭据不存在');
        }

        $user = $userCredential->user;

        // 解析客户端数据
        $clientDataJSON = json_decode(base64_decode($credential['response']['clientDataJSON']), true);
        
        // 验证挑战
        if ($clientDataJSON['challenge'] !== base64_encode($challenge)) {
            throw new \Exception('挑战验证失败');
        }

        // 验证origin
        $expectedOrigin = (request()->isSecure() ? 'https://' : 'http://') . request()->getHost();
        if ($clientDataJSON['origin'] !== $expectedOrigin) {
            throw new \Exception('Origin验证失败');
        }

        // 解析认证数据
        $authenticatorData = base64_decode($credential['response']['authenticatorData']);
        $signature = base64_decode($credential['response']['signature']);

        // 验证签名（简化版本，实际应用需要完整的加密验证）
        $signCount = $this->extractSignCount($authenticatorData);
        
        // 更新凭据使用信息
        $userCredential->updateUsage($signCount);

        // 登录用户
        Auth::login($user, true);

        return [
            'success' => true,
            'user' => $user,
        ];
    }

    /**
     * 检查用户是否有生物识别凭据
     */
    public function hasCredentials(string $email): bool
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            return false;
        }

        return $user->activeCredentials()->exists();
    }

    /**
     * 生成随机挑战
     */
    private function generateChallenge(): string
    {
        return Str::random(32);
    }

    /**
     * 解析认证对象（简化版本）
     */
    private function parseAttestationObject(string $attestationObject): array
    {
        // 这里应该使用CBOR解析库来解析认证对象
        // 为了演示，我们返回模拟数据
        return [
            'publicKey' => 'mock_public_key_' . Str::random(32),
        ];
    }

    /**
     * 从认证数据中提取签名计数
     */
    private function extractSignCount(string $authenticatorData): int
    {
        // 签名计数在认证数据的第33-36字节
        if (strlen($authenticatorData) >= 37) {
            $signCountBytes = substr($authenticatorData, 33, 4);
            return unpack('N', $signCountBytes)[1];
        }
        
        return 0;
    }
}