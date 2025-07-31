import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fingerprint, Scan, Shield, AlertCircle } from 'lucide-react';
import { 
    isBiometricSupported, 
    isConditionalUISupported,
    registerBiometric,
    authenticateBiometric,
    formatCredentialForServer,
    generateChallenge 
} from '@/utils/biometric-auth';
import axios from 'axios';

interface BiometricAuthProps {
    onSuccess?: (credential: any) => void;
    onError?: (error: string) => void;
    mode: 'login' | 'register';
    userEmail?: string;
    userName?: string;
}

export default function BiometricAuth({ 
    onSuccess, 
    onError, 
    mode, 
    userEmail, 
    userName 
}: BiometricAuthProps) {
    const [isSupported, setIsSupported] = useState(false);
    const [isConditionalSupported, setIsConditionalSupported] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasCredentials, setHasCredentials] = useState(false);

    useEffect(() => {
        checkSupport();
        if (mode === 'login') {
            checkExistingCredentials();
        }
    }, [mode, userEmail]);

    const checkSupport = async () => {
        const supported = await isBiometricSupported();
        const conditionalSupported = await isConditionalUISupported();
        setIsSupported(supported);
        setIsConditionalSupported(conditionalSupported);
    };

    const checkExistingCredentials = async () => {
        try {
            const response = await axios.get('/api/biometric/credentials', {
                params: { email: userEmail }
            });
            setHasCredentials(response.data.hasCredentials);
        } catch (error) {
            console.error('Error checking credentials:', error);
        }
    };

    const handleRegister = async () => {
        if (!userEmail || !userName) {
            onError?.('用户信息不完整');
            return;
        }

        setIsLoading(true);
        try {
            // 从服务器获取注册选项
            const optionsResponse = await axios.post('/api/biometric/register/options', {
                email: userEmail,
                name: userName
            });

            const { challenge } = optionsResponse.data;

            // 创建生物识别凭据
            const credential = await registerBiometric(userEmail, userName, challenge);
            const credentialData = formatCredentialForServer(credential);

            // 发送到服务器验证并保存
            const verifyResponse = await axios.post('/api/biometric/register/verify', {
                email: userEmail,
                credential: credentialData,
                challenge
            });

            if (verifyResponse.data.success) {
                onSuccess?.(credentialData);
            } else {
                onError?.('生物识别注册失败');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            if (error.name === 'NotAllowedError') {
                onError?.('用户取消了生物识别注册');
            } else if (error.name === 'NotSupportedError') {
                onError?.('设备不支持生物识别');
            } else {
                onError?.('生物识别注册失败，请重试');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthenticate = async () => {
        setIsLoading(true);
        try {
            // 从服务器获取认证选项
            const optionsResponse = await axios.post('/api/biometric/authenticate/options', {
                email: userEmail
            });

            const { challenge, allowCredentials } = optionsResponse.data;

            // 执行生物识别认证
            const credential = await authenticateBiometric(challenge, allowCredentials);
            const credentialData = formatCredentialForServer(credential);

            // 发送到服务器验证
            const verifyResponse = await axios.post('/api/biometric/authenticate/verify', {
                credential: credentialData,
                challenge
            });

            if (verifyResponse.data.success) {
                onSuccess?.(verifyResponse.data);
            } else {
                onError?.('生物识别认证失败');
            }
        } catch (error: any) {
            console.error('Authentication error:', error);
            if (error.name === 'NotAllowedError') {
                onError?.('用户取消了生物识别认证');
            } else if (error.name === 'NotSupportedError') {
                onError?.('设备不支持生物识别');
            } else {
                onError?.('生物识别认证失败，请重试');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSupported) {
        return (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <AlertCircle className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">此设备不支持生物识别</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {mode === 'register' && (
                <div className="text-center">
                    <div className="mb-4">
                        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-gray-900">设置生物识别登录</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            使用指纹或面部识别快速安全登录
                        </p>
                    </div>
                    
                    <Button
                        onClick={handleRegister}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <>
                                <Scan className="h-4 w-4 mr-2 animate-pulse" />
                                正在设置...
                            </>
                        ) : (
                            <>
                                <Fingerprint className="h-4 w-4 mr-2" />
                                启用生物识别登录
                            </>
                        )}
                    </Button>
                </div>
            )}

            {mode === 'login' && hasCredentials && (
                <div className="text-center">
                    <Button
                        onClick={handleAuthenticate}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                        {isLoading ? (
                            <>
                                <Scan className="h-4 w-4 mr-2 animate-pulse" />
                                正在验证...
                            </>
                        ) : (
                            <>
                                <Fingerprint className="h-4 w-4 mr-2" />
                                使用生物识别登录
                            </>
                        )}
                    </Button>
                    
                    <div className="mt-2 text-xs text-gray-500">
                        或使用下方的密码登录
                    </div>
                    
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">或</span>
                        </div>
                    </div>
                </div>
            )}

            {mode === 'login' && !hasCredentials && isConditionalSupported && (
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Fingerprint className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-800">
                        登录后可在设置中启用生物识别快速登录
                    </p>
                </div>
            )}
        </div>
    );
}