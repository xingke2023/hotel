import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface FrontendLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function FrontendLayout({ children, title = '澳门实时房价信息平台' }: FrontendLayoutProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title={title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                {/* 主要内容 */}
                <main className="w-full h-full">
                    {children}
                </main>
            </div>
        </>
    );
}