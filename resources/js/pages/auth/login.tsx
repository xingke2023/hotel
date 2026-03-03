import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BottomNavigation from '@/components/BottomNavigation';

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
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
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        {displayMessage && (
                            <div className={`mb-4 text-center text-sm font-medium ${
                                status ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                                {displayMessage}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={submit}>
                            <div>
                                <Label htmlFor="login" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    用户名或邮箱
                                </Label>
                                <Input
                                    id="login"
                                    type="text"
                                    required
                                    tabIndex={1}
                                    autoComplete="username"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    placeholder="请输入用户名或邮箱地址"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.login} />
                {errors.general && <InputError message={errors.general} />}
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

                        <div className="mt-6 space-y-3">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                        还没有账户？
                                    </span>
                                </div>
                            </div>
                            <Link href={route('register')}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-950 font-semibold"
                                    tabIndex={5}
                                >
                                    立即注册
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNavigation />
        </div>
    );
}
