import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import { ChevronLeft } from 'lucide-react';

export default function InvestmentTools() {
    const { pendingSalesCount } = usePendingSalesCount();

    const standardGames = [
        { href: '/calculator', title: '直缆缆法' },
        { href: '/calculator6', title: '孖宝缆法' },
        { href: '/calculator7', title: '双层缆缆法' },
        { href: '/calculator4', title: '分层缆法' },
        { href: '/calculator3', title: '1324法缆法' },
        { href: '/calculator5', title: '楼梯缆法' },
        { href: '/calculator8', title: '九宫缆法' }
    ];

    const proGames = [
        { href: '/calculator2', title: '蒙特卡洛缆法' }
    ];

    return (
        <FrontendLayout>
            <Head title="直播机缆法" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-24">
                {/* 头部区域 - 参考首页 */}
                <div className="container mx-auto px-4 pt-8 pb-6 text-center">
                    <div className="relative mb-4 flex items-center justify-center">
                         <Link
                            href="/"
                            className="absolute left-0 p-2 text-gray-600 hover:bg-white/50 rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-3xl font-semibold text-gray-900 drop-shadow-sm">
                            直播机缆法
                        </h1>
                    </div>
                    
                    {/* 提示语 - 参考首页的胶囊样式 */}
                    <div className="inline-flex items-center justify-center gap-2 text-xs font-normal text-red-600 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-full py-1.5 px-4 shadow-sm mx-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        控制注码是取胜的核心 · 千万不要裸杀
                    </div>
                </div>

                <div className="container mx-auto max-w-md w-full px-4 space-y-8">
                    {/* 普通缆法区 */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-800 mb-3 pl-2 border-l-4 border-indigo-500">
                            普通缆法区
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {standardGames.map((game, index) => (
                                <Link
                                    key={index}
                                    href={game.href}
                                    className="bg-white rounded-md px-4 py-1 border border-indigo-50 shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group h-12"
                                >
                                    <h3 className="font-medium text-gray-800 text-base group-hover:text-indigo-600 transition-colors">
                                        {game.title}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 高手缆法区 */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-800 mb-3 pl-2 border-l-4 border-amber-500">
                            高手缆法区
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {proGames.map((game, index) => (
                                <Link
                                    key={index}
                                    href={game.href}
                                    className="bg-white rounded-md px-4 py-1 border border-amber-50 shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group h-12"
                                >
                                    <h3 className="font-medium text-gray-800 text-base group-hover:text-amber-600 transition-colors">
                                        {game.title}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <BottomNavigation pendingSalesCount={pendingSalesCount} />
        </FrontendLayout>
    );
}