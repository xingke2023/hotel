import { Link, usePage } from '@inertiajs/react';
import { Home, Hotel, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
    pendingSalesCount?: number;
}

export default function BottomNavigation({ pendingSalesCount = 0 }: BottomNavigationProps) {
    const { url } = usePage();

    const triggerTabHapticFeedback = (tabKey: string) => {
        try {
            if ('vibrate' in navigator) {
                navigator.vibrate(15);
            }
        } catch (error) {
            console.debug('Tab切换震动反馈不支持:', error);
        }
    };

    const tabs = [
        {
            key: 'home',
            title: '首页',
            icon: Home,
            href: '/'
        },
        {
            key: 'houses',
            title: '特价房源',
            icon: Hotel,
            href: '/houses'
        },
        {
            key: 'forum',
            title: '澳门讨论区',
            icon: MessageCircle,
            href: '/articles'
        },
        {
            key: 'mine',
            title: '我的',
            icon: User,
            href: '/profile'
        },
    ];

    const isActive = (href: string) => {
        if (href === '/') return url === '/';
        // 登录和注册页面高亮"我的"标签
        if (href === '/profile' && (url === '/login' || url === '/register')) {
            return true;
        }
        return url.startsWith(href);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const active = isActive(tab.href);
                    const Icon = tab.icon;
                    
                    const content = (
                        <div className="flex flex-col items-center justify-center w-full h-full space-y-1">
                            <div className="relative">
                                <Icon 
                                    className={cn(
                                        "w-7 h-7 transition-all duration-200",
                                        active ? "text-blue-600 fill-blue-100" : "text-gray-400"
                                    )} 
                                    strokeWidth={active ? 2.5 : 2}
                                />
                                {tab.key === 'mine' && pendingSalesCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                        {pendingSalesCount > 99 ? '99+' : pendingSalesCount}
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium transition-colors duration-200",
                                active ? "text-blue-600" : "text-gray-500"
                            )}>
                                {tab.title}
                            </span>
                        </div>
                    );

                    if ((tab as any).isExternal) {
                        return (
                            <a
                                key={tab.key}
                                href={tab.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 h-full select-none"
                                onClick={() => triggerTabHapticFeedback(tab.key)}
                            >
                                {content}
                            </a>
                        );
                    }

                    return (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            className="flex-1 h-full select-none"
                            onClick={() => !active && triggerTabHapticFeedback(tab.key)}
                        >
                            {content}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
