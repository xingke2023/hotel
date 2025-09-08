import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BiometricAuth from '@/components/biometric-auth';

type LoginForm = {
    login: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const page = usePage();
    const queryMessage = new URLSearchParams(window.location.search).get('message');
    const displayMessage = status || queryMessage;
    
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        login: '',
        password: '',
        remember: false,
    });

    const [biometricError, setBiometricError] = useState<string>('');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onSuccess: () => {
                router.visit('/profile');
            },
            onFinish: () => reset('password'),
        });
    };

    const handleBiometricSuccess = (result: any) => {
        // 生物识别登录成功，跳转到个人资料页面
        router.visit('/profile');
    };

    const handleBiometricError = (error: string) => {
        setBiometricError(error);
        setTimeout(() => setBiometricError(''), 5000);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            <Head title="登录 - 澳门实时房价信息平台" />
            
            <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Link href="/" className="inline-block">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                澳门实时房价信息平台
                            </h1>
                        </Link>
                        <h2 className="mt-6 text-xl font-medium text-gray-900 dark:text-white">
                            登录您的账户
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            输入您的用户名或邮箱和密码进行登录
                        </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        {displayMessage && (
                            <div className={`mb-4 text-center text-sm font-medium ${
                                status ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                                {displayMessage}
                            </div>
                        )}

                        {biometricError && (
                            <div className="mb-4 text-center text-sm font-medium text-red-600 dark:text-red-400">
                                {biometricError}
                            </div>
                        )}

                        {/* 生物识别登录 */}
                        <div className="mb-6">
                            <BiometricAuth
                                mode="login"
                                userEmail={data.login}
                                onSuccess={handleBiometricSuccess}
                                onError={handleBiometricError}
                            />
                        </div>
                        
                        <form className="space-y-6" onSubmit={submit}>
                            <div>
                                <Label htmlFor="login" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    用户名或邮箱
                                </Label>
                                <Input
                                    id="login"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="请输入用户名或邮箱地址"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.login} />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        密码
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink href={route('password.request')} className="text-sm text-blue-600 hover:text-blue-500" tabIndex={5}>
                                            忘记密码？
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="请输入密码"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onClick={() => setData('remember', !data.remember)}
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    记住我
                                </Label>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" 
                                tabIndex={4} 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                登录
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                还没有账户？{' '}
                                <TextLink href={route('register')} className="text-blue-600 hover:text-blue-500 font-medium" tabIndex={5}>
                                    立即注册
                                </TextLink>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
