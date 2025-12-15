import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InvestmentTools() {
    const { pendingSalesCount } = usePendingSalesCount();

    const games = [
        {
            href: '/calculator',
            title: '直缆缆法',
            description: '直缆数理缆法',
            emoji: '🎯'
        },
        {
            href: '/calculator6',
            title: '孖宝缆法',
            description: '孖宝数理缆法',
            emoji: '💰'
        },
        {
            href: '/calculator7',
            title: '双层缆缆法',
            description: '孖宝胜进数理挑战',
            emoji: '🏆'
        },
        {
            href: '/calculator2',
            title: '首尾消数法缆法',
            description: '1221消数缆法',
            emoji: '🔥'
        },
        {
            href: '/calculator4',
            title: '分层缆法',
            description: '分层数理缆法',
            emoji: '🏗️'
        },
        {
            href: '/calculator3',
            title: '1324法缆法',
            description: '1324循环挑战',
            emoji: '💕'
        },
        {
            href: '/calculator5',
            title: '楼梯缆法',
            description: '上下阶梯大冒险',
            emoji: '🎠'
        },
        {
            href: '/calculator8',
            title: '九宫缆法',
            description: '传奇九宫缆数理缆法',
            emoji: '💎'
        }
    ];

    return (
        <FrontendLayout>
            <Head title="直播机缆法" />

            <div className="min-h-screen bg-gray-50 pb-20">
                {/* 头部 */}
                <div className="bg-white border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-semibold text-gray-900">直播机缆法</h1>
                        </div>
                    </div>
                </div>

                {/* 缆法列表 */}
                <div className="container mx-auto px-4 py-6">
                    <div className="max-w-lg mx-auto mb-6">
                        <p className="text-center text-base text-red-600 font-medium">
                            控制注码是取胜的核心 千万不要裸杀
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                        {games.map((game, index) => (
                            <Link key={index} href={game.href}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer py-6 flex items-center justify-center">
                                    <CardHeader>
                                        <CardTitle className="text-xl text-center">{game.title}</CardTitle>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>
        </FrontendLayout>
    );
}