<?php

namespace App\Services;

use App\Models\SsoUser;
use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SsoAuthService
{
    private string $baseUrl;
    private ?string $secret;

    public function __construct()
    {
        $this->baseUrl = config('sso.base_url');
        $this->secret  = config('sso.jwt_secret');
    }

    /**
     * 代理登录请求到 SSO 中心。
     * 返回 ['accessToken' => ..., 'refreshToken' => ..., 'user' => ...]
     * 失败时抛出 RuntimeException。
     */
    public function login(string $identifier, string $password): array
    {
        $response = Http::post("{$this->baseUrl}/api/auth/login", [
            'identifier' => $identifier,
            'password'   => $password,
        ]);

        if (! $response->successful()) {
            $code = $response->json('error.code');
            $msg  = match ($code) {
                'INVALID_CREDENTIALS' => '账号或密码错误',
                'VALIDATION_ERROR'    => '参数格式不正确',
                default               => $response->json('error.message') ?? '登录失败',
            };
            throw new \RuntimeException($msg);
        }

        return $response->json('data');
    }

    /**
     * 代理注册请求到 SSO 中心。
     */
    public function register(string $username, string $password, ?string $email = null): array
    {
        $payload = ['username' => $username, 'password' => $password];
        if ($email) {
            $payload['email'] = $email;
        }

        $response = Http::post("{$this->baseUrl}/api/auth/register", $payload);

        if (! $response->successful()) {
            $code = $response->json('error.code');
            $msg  = match ($code) {
                'USERNAME_TAKEN'   => '该用户名已被占用',
                'EMAIL_TAKEN'      => '该邮箱已被注册',
                'VALIDATION_ERROR' => '参数格式不正确',
                default            => $response->json('error.message') ?? '注册失败',
            };
            throw new \RuntimeException($msg);
        }

        return $response->json('data');
    }

    /**
     * 用 refreshToken 换取新的 accessToken。
     * 失败返回 null。
     */
    public function refresh(string $refreshToken): ?array
    {
        $response = Http::post("{$this->baseUrl}/api/token/refresh", [
            'refreshToken' => $refreshToken,
        ]);

        if (! $response->successful()) {
            return null;
        }

        return $response->json('data');
    }

    /**
     * 吊销 refreshToken（fire-and-forget，不阻塞本地登出）。
     */
    public function logout(string $refreshToken): void
    {
        try {
            Http::post("{$this->baseUrl}/api/token/logout", [
                'refreshToken' => $refreshToken,
            ]);
        } catch (\Throwable) {
            // 忽略 SSO 侧错误，本地登出照常进行
        }
    }

    /**
     * 本地验证 JWT，返回 payload 对象。
     * 失败时抛出 Firebase\JWT 异常。
     */
    public function decodeToken(string $accessToken): object
    {
        return JWT::decode($accessToken, new Key($this->secret, 'HS256'));
    }

    /**
     * 根据 JWT payload 查找或创建本地用户，并同步 SSO 用户信息。
     */
    public function resolveLocalUser(object $payload): User
    {
        $ssoUserId = (string) $payload->userId;

        $ssoUser = SsoUser::with('user')->where('sso_user_id', $ssoUserId)->first();

        if (! $ssoUser) {
            $user = $this->createLocalUser($payload);
            SsoUser::create([
                'sso_user_id' => $ssoUserId,
                'user_id'     => $user->id,
            ]);
            return $user;
        }

        // 同步 SSO 侧的最新用户信息
        $updates = array_filter([
            'email'  => $payload->email  ?? null,
            'avatar' => $payload->avatar ?? null,
        ], fn ($v) => $v !== null);

        if (! empty($updates)) {
            $ssoUser->user->update($updates);
        }

        return $ssoUser->user->fresh();
    }

    private function createLocalUser(object $payload): User
    {
        return User::create([
            'name'          => $payload->username ?? ('user_' . $payload->userId),
            'email'         => $payload->email ?? null,
            'avatar'        => $payload->avatar ?? null,
            'password'      => null,
            'referral_code' => 'REF' . strtoupper(Str::random(8)),
        ]);
    }
}
