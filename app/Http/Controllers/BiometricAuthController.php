<?php

namespace App\Http\Controllers;

use App\Services\BiometricAuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class BiometricAuthController extends Controller
{
    protected BiometricAuthService $biometricService;

    public function __construct(BiometricAuthService $biometricService)
    {
        $this->biometricService = $biometricService;
    }

    /**
     * 检查用户是否有生物识别凭据
     */
    public function checkCredentials(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $hasCredentials = $this->biometricService->hasCredentials($request->email);
            
            return response()->json([
                'hasCredentials' => $hasCredentials,
            ]);
        } catch (\Exception $e) {
            Log::error('Biometric credential check failed: ' . $e->getMessage());
            
            return response()->json([
                'hasCredentials' => false,
            ]);
        }
    }

    /**
     * 生成注册选项
     */
    public function generateRegistrationOptions(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string|max:255',
        ]);

        try {
            $options = $this->biometricService->generateRegistrationOptions(
                $request->email,
                $request->name
            );
            
            return response()->json($options);
        } catch (\Exception $e) {
            Log::error('Biometric registration options failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => '生成注册选项失败',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 验证注册凭据
     */
    public function verifyRegistration(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'credential' => 'required|array',
            'challenge' => 'required|string',
        ]);

        try {
            $success = $this->biometricService->verifyRegistrationCredential(
                $request->email,
                $request->credential,
                $request->challenge
            );
            
            return response()->json([
                'success' => $success,
                'message' => '生物识别凭据注册成功',
            ]);
        } catch (\Exception $e) {
            Log::error('Biometric registration verification failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => '注册验证失败',
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * 生成认证选项
     */
    public function generateAuthenticationOptions(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $options = $this->biometricService->generateAuthenticationOptions($request->email);
            
            return response()->json($options);
        } catch (\Exception $e) {
            Log::error('Biometric authentication options failed: ' . $e->getMessage());
            
            return response()->json([
                'error' => '生成认证选项失败',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 验证认证凭据
     */
    public function verifyAuthentication(Request $request): JsonResponse
    {
        $request->validate([
            'credential' => 'required|array',
            'challenge' => 'required|string',
        ]);

        try {
            $result = $this->biometricService->verifyAuthenticationCredential(
                $request->credential,
                $request->challenge
            );
            
            return response()->json([
                'success' => true,
                'message' => '生物识别登录成功',
                'user' => [
                    'id' => $result['user']->id,
                    'name' => $result['user']->name,
                    'email' => $result['user']->email,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Biometric authentication verification failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => '认证验证失败',
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
