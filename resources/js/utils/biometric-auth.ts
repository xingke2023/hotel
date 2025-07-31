// 生物识别认证工具函数

interface BiometricCredential {
    id: string;
    rawId: ArrayBuffer;
    response: AuthenticatorAttestationResponse | AuthenticatorAssertionResponse;
    type: 'public-key';
}

interface BiometricRegistrationOptions {
    challenge: Uint8Array;
    rp: {
        name: string;
        id: string;
    };
    user: {
        id: Uint8Array;
        name: string;
        displayName: string;
    };
    pubKeyCredParams: Array<{
        type: 'public-key';
        alg: number;
    }>;
    authenticatorSelection: {
        authenticatorAttachment: 'platform' | 'cross-platform';
        userVerification: 'required' | 'preferred' | 'discouraged';
        requireResidentKey: boolean;
    };
    timeout: number;
    attestation: 'none' | 'indirect' | 'direct';
}

interface BiometricAuthenticationOptions {
    challenge: Uint8Array;
    allowCredentials: Array<{
        type: 'public-key';
        id: Uint8Array;
    }>;
    timeout: number;
    userVerification: 'required' | 'preferred' | 'discouraged';
}

// 检查是否支持生物识别
export const isBiometricSupported = async (): Promise<boolean> => {
    try {
        if (!window.PublicKeyCredential) {
            return false;
        }
        
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
    } catch (error) {
        console.error('Error checking biometric support:', error);
        return false;
    }
};

// 检查是否支持条件UI（自动填充）
export const isConditionalUISupported = async (): Promise<boolean> => {
    try {
        if (!window.PublicKeyCredential) {
            return false;
        }
        
        // @ts-ignore - 这是一个新的API，可能没有类型定义
        return await PublicKeyCredential.isConditionalMediationAvailable?.() || false;
    } catch (error) {
        console.error('Error checking conditional UI support:', error);
        return false;
    }
};

// 将字符串转换为 Uint8Array
export const stringToUint8Array = (str: string): Uint8Array => {
    return new TextEncoder().encode(str);
};

// 将 ArrayBuffer 转换为 base64
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

// 将 base64 转换为 ArrayBuffer
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

// 注册生物识别凭据
export const registerBiometric = async (
    username: string,
    displayName: string,
    challenge: string
): Promise<BiometricCredential> => {
    const options: BiometricRegistrationOptions = {
        challenge: stringToUint8Array(challenge),
        rp: {
            name: '澳门实时房价信息平台',
            id: window.location.hostname,
        },
        user: {
            id: stringToUint8Array(username),
            name: username,
            displayName: displayName,
        },
        pubKeyCredParams: [
            { type: 'public-key', alg: -7 },  // ES256
            { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: true,
        },
        timeout: 60000,
        attestation: 'none',
    };

    try {
        const credential = await navigator.credentials.create({
            publicKey: options,
        }) as BiometricCredential;

        if (!credential) {
            throw new Error('Failed to create credential');
        }

        return credential;
    } catch (error) {
        console.error('Biometric registration failed:', error);
        throw error;
    }
};

// 使用生物识别进行认证
export const authenticateBiometric = async (
    challenge: string,
    allowedCredentials?: Array<string>
): Promise<BiometricCredential> => {
    const options: BiometricAuthenticationOptions = {
        challenge: stringToUint8Array(challenge),
        allowCredentials: allowedCredentials ? allowedCredentials.map(id => ({
            type: 'public-key' as const,
            id: base64ToArrayBuffer(id),
        })) : [],
        timeout: 60000,
        userVerification: 'required',
    };

    try {
        const credential = await navigator.credentials.get({
            publicKey: options,
            // @ts-ignore - 条件UI支持
            mediation: 'conditional',
        }) as BiometricCredential;

        if (!credential) {
            throw new Error('Authentication failed');
        }

        return credential;
    } catch (error) {
        console.error('Biometric authentication failed:', error);
        throw error;
    }
};

// 格式化凭据数据用于发送到服务器
export const formatCredentialForServer = (credential: BiometricCredential) => {
    const { response } = credential;
    
    if (response instanceof AuthenticatorAttestationResponse) {
        // 注册响应
        return {
            id: credential.id,
            rawId: arrayBufferToBase64(credential.rawId),
            type: credential.type,
            response: {
                clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
                attestationObject: arrayBufferToBase64(response.attestationObject),
            },
        };
    } else if (response instanceof AuthenticatorAssertionResponse) {
        // 认证响应
        return {
            id: credential.id,
            rawId: arrayBufferToBase64(credential.rawId),
            type: credential.type,
            response: {
                clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
                authenticatorData: arrayBufferToBase64(response.authenticatorData),
                signature: arrayBufferToBase64(response.signature),
                userHandle: response.userHandle ? arrayBufferToBase64(response.userHandle) : null,
            },
        };
    }
    
    throw new Error('Unknown credential response type');
};

// 生成随机挑战
export const generateChallenge = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return arrayBufferToBase64(array.buffer);
};