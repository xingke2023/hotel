import { Head, useForm, Link, router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BiometricAuth from '@/components/biometric-auth';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            <Head title="注册 - 澳门实时房价信息平台" />
            
            <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Link href="/" className="inline-block">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                澳门实时房价信息平台
                            </h1>
                        </Link>
                        <h2 className="mt-6 text-xl font-medium text-gray-900 dark:text-white">
                            创建新账户
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            填写以下信息来创建您的账户
                        </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <form className="space-y-6" onSubmit={submit}>
                            <div>
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    用户名
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    placeholder="请输入用户名"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    电子邮箱
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                    placeholder="请输入邮箱地址"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    密码
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    disabled={processing}
                                    placeholder="请输入密码"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    确认密码
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    disabled={processing}
                                    placeholder="请再次输入密码"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500" 
                                tabIndex={5} 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                创建账户
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                已有账户？{' '}
                                <TextLink href={route('login')} className="text-blue-600 hover:text-blue-500 font-medium" tabIndex={6}>
                                    立即登录
                                </TextLink>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
