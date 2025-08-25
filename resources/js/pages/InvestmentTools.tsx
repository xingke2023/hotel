import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import { useState, useEffect } from 'react';

export default function InvestmentTools() {
    const { pendingSalesCount } = usePendingSalesCount();
    const [floatingElements, setFloatingElements] = useState<number[]>([]);

    // 生成浮动元素动画
    useEffect(() => {
        setFloatingElements(Array.from({ length: 12 }, (_, i) => i));
    }, []);

    const games = [
        {
            href: '/calculator',
            title: '🎮 直缆游戏',
            description: '直缆数理游戏',
            emoji: '🎯',
            difficulty: '⭐⭐⭐',
            players: '1P',
            category: '策略',
            gradient: 'from-blue-400 to-cyan-400'
        },
        {
            href: '/calculator6',
            title: '💎 孖宝游戏',
            description: '孖宝数理游戏',
            emoji: '💰',
            difficulty: '⭐⭐',
            players: '1P',
            category: '解谜',
            gradient: 'from-yellow-400 to-orange-400'
        },
        {
            href: '/calculator7',
            title: '🚀 双层缆游戏',
            description: '孖宝胜进数理挑战',
            emoji: '🏆',
            difficulty: '⭐⭐⭐⭐',
            players: '1P',
            category: '冒险',
            gradient: 'from-green-400 to-emerald-400'
        },
        {
            href: '/calculator2',
            title: '⚡ 首尾消数法游戏',
            description: '1221消数游戏',
            emoji: '🔥',
            difficulty: '⭐⭐⭐',
            players: '1P',
            category: '休闲',
            gradient: 'from-purple-400 to-pink-400'
        },
        {
            href: '/calculator4',
            title: '🏗️ 分层游戏',
            description: '分层数理游戏',
            emoji: '🏗️',
            difficulty: '⭐⭐',
            players: '1P',
            category: '建造',
            gradient: 'from-indigo-400 to-blue-400'
        },
        {
            href: '/calculator3',
            title: '💖 1324法游戏',
            description: '1324循环挑战',
            emoji: '💕',
            difficulty: '⭐⭐⭐',
            players: '1P',
            category: '连线',
            gradient: 'from-red-400 to-rose-400'
        },
        {
            href: '/calculator5',
            title: '🎢 楼梯游戏',
            description: '上下阶梯大冒险',
            emoji: '🎠',
            difficulty: '⭐⭐',
            players: '1P',
            category: '动作',
            gradient: 'from-teal-400 to-cyan-400'
        },
        {
            href: '/calculator8',
            title: '👑 九宫游戏',
            description: '传奇九宫缆数理游戏',
            emoji: '💎',
            difficulty: '⭐⭐⭐⭐⭐',
            players: '1P',
            category: '冒险',
            gradient: 'from-orange-400 to-red-400'
        }
    ];

    // 获取随机浮动动画延迟
    const getRandomDelay = (index: number) => {
        return `${(index * 0.5) + Math.random() * 2}s`;
    };

    // 获取随机浮动位置
    const getRandomPosition = (index: number) => {
        const positions = [
            { top: '10%', left: '5%' },
            { top: '20%', right: '8%' },
            { top: '30%', left: '15%' },
            { top: '40%', right: '12%' },
            { top: '50%', left: '8%' },
            { top: '60%', right: '15%' },
            { top: '70%', left: '12%' },
            { top: '80%', right: '5%' },
            { bottom: '10%', left: '10%' },
            { bottom: '20%', right: '10%' },
            { top: '15%', left: '50%' },
            { bottom: '15%', right: '45%' }
        ];
        return positions[index % positions.length];
    };

    // 浮动元素表情
    const floatingEmojis = ['🎮', '🎯', '🎲', '🏆', '⭐', '💎', '🔥', '🚀', '🎪', '🎨', '🎭', '🎡'];

    return (
        <FrontendLayout>
            <Head title="🎮 游戏中心 - 澳门娱乐平台" />
            
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 pb-20 relative overflow-hidden">
                {/* 浮动背景元素 */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {floatingElements.map((_, index) => (
                        <div
                            key={index}
                            className="absolute text-2xl opacity-20 animate-bounce"
                            style={{
                                ...getRandomPosition(index),
                                animationDelay: getRandomDelay(index),
                                animationDuration: `${3 + Math.random() * 2}s`
                            }}
                        >
                            {floatingEmojis[index]}
                        </div>
                    ))}
                </div>

                {/* 装饰性渐变泡泡 */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-30 animate-pulse"></div>
                    <div className="absolute top-1/4 right-16 w-24 h-24 bg-gradient-to-br from-green-200 to-teal-200 rounded-full opacity-25 animate-bounce" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
                    <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-30 animate-bounce" style={{animationDelay: '0.5s'}}></div>
                </div>

                {/* 头部 */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="container mx-auto px-4 py-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    href="/"
                                    className="mr-4 p-3 hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-110"
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-white drop-shadow-lg">🎮 休闲数学游戏</h1>
                                    <p className="text-white/90 text-sm">选择你喜欢的游戏开始冒险吧！</p>
                                </div>
                            </div>
                            <div className="text-4xl animate-spin-slow">🎲</div>
                        </div>
                    </div>
                </div>

                {/* 主要内容 */}
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8 text-center">
                        <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/50">
                            <p className="text-sm font-medium text-gray-800 mb-2">🌟 游戏目标是运用数学方法，达到目标分数！每个游戏都蕴含不同的数学方法</p>
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <span className="text-yellow-500">⭐</span> 难度等级
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="text-blue-500">👤</span> 单人游戏
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="text-green-500">🎯</span> 多种类型
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 游戏列表 */}
                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                        {games.map((game, index) => (
                            <Link
                                key={index}
                                href={game.href}
                                className={`group relative bg-gradient-to-br ${game.gradient} rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1 border-2 border-white/50 backdrop-blur-sm overflow-hidden`}
                            >
                                {/* 游戏卡片内容 */}
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-3xl group-hover:animate-bounce">{game.emoji}</div>
                                        <div className="bg-white/30 backdrop-blur-sm rounded-lg px-2 py-1">
                                            <span className="text-xs font-bold text-white">{game.category}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-bold text-white text-sm mb-1 drop-shadow-md group-hover:text-yellow-100">
                                        {game.title}
                                    </h3>
                                    
                                    <p className="text-xs text-white/90 mb-2 leading-tight">
                                        {game.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between text-xs text-white/80">
                                        <span className="bg-black/20 rounded px-2 py-1">{game.difficulty}</span>
                                        <span className="bg-black/20 rounded px-2 py-1">{game.players}</span>
                                    </div>
                                </div>

                                {/* 悬停效果装饰 */}
                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>
                                <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/20 rounded-full -ml-6 -mb-6 group-hover:scale-125 transition-transform duration-300"></div>
                            </Link>
                        ))}
                    </div>
                    
                    {/* 底部装饰 */}
                    <div className="mt-12 text-center">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-6 py-3 shadow-lg text-white font-bold animate-pulse">
                            <span className="text-2xl">🏆</span>
                            <span>准备好挑战了吗？</span>
                            <span className="text-2xl">🚀</span>
                        </div>
                    </div>
                </div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>
        </FrontendLayout>
    );
}