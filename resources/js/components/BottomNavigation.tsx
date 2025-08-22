import { Link, usePage } from '@inertiajs/react';

interface BottomNavigationProps {
    pendingSalesCount?: number;
}

// SVG图标组件
const HomeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
    </svg>
);

const HotelIcon = () => (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
    </svg>
);

const VideoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
    </svg>
);

const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
    </svg>
);

export default function BottomNavigation({ pendingSalesCount = 0 }: BottomNavigationProps) {
    const { url } = usePage();

    // Tab切换触感震动反馈
    const triggerTabHapticFeedback = (tabKey: string) => {
        try {
            if ('vibrate' in navigator) {
                // 不同tab使用不同的震动模式 - 增强震动强度
                const tabVibrationPatterns: { [key: string]: number[] } = {
                    'home': [25], // 首页 - 增强震动
                    'supply-demand': [30], // 房源交易 - 强震动
                    'videos': [25], // 视频 - 增强震动
                    'mine': [25], // 我的 - 增强震动
                    'mine-with-notification': [30, 10, 30, 10, 25], // 我的(有通知) - 特殊强双重震动
                    'test': [35] // 测试用 - 最强震动
                };
                
                const pattern = tabVibrationPatterns[tabKey] || [12];
                navigator.vibrate(pattern);
                console.log(`Tab切换震动反馈: ${tabKey}, 模式: [${pattern.join(', ')}]`);
            }
            
            // 如果支持 iOS HapticFeedback API - 使用更强的反馈
            if ('hapticFeedback' in window) {
                const windowWithHaptic = window as Window & {
                    hapticFeedback?: {
                        impactLight?: () => void;
                        impactMedium?: () => void;
                        impactHeavy?: () => void;
                    };
                };
                // 使用中等强度的触感反馈，比轻微反馈更明显
                windowWithHaptic.hapticFeedback?.impactMedium?.() || windowWithHaptic.hapticFeedback?.impactLight?.();
                console.log(`iOS Tab切换触感反馈: ${tabKey} (medium)`);
            }
            
            // 备用方案 - 使用Web Audio API创建轻微音频反馈
            if (!('vibrate' in navigator) && !('hapticFeedback' in window)) {
                try {
                    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                    if (AudioContextClass) {
                        const audioContext = new AudioContextClass();
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(600, audioContext.currentTime); // 稍低频音，更强反馈
                        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime); // 增强音量
                        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08); // 延长时间
                        
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.08); // 延长播放时间
                        
                        console.log(`Web Audio Tab切换反馈: ${tabKey}`);
                    }
                } catch (audioError) {
                    console.debug('Web Audio API 不可用:', audioError);
                }
            }
        } catch (error) {
            console.debug('Tab切换震动反馈不支持:', error);
        }
    };

    const tabs = [
        { 
            key: 'home', 
            title: '首页', 
            icon: <HomeIcon />, 
            href: '/'
        },
        { 
            key: 'supply-demand', 
            title: '房源交易', 
            icon: <HotelIcon />, 
            href: '/houses'
        },
        { 
            key: 'videos', 
            title: '视频', 
            icon: <VideoIcon />, 
            href: '/videos'
        },
        { 
            key: 'mine', 
            title: '我的', 
            icon: <UserIcon />, 
            href: '/profile'
        },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return url === '/';
        }
        return url.startsWith(href);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-50/95 backdrop-blur-sm border-t border-gray-300 z-50">
            {/* 开发环境震动测试按钮 */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute -top-8 right-2">
                    <button
                        onClick={() => {
                            triggerTabHapticFeedback('test');
                        }}
                        className="px-2 py-1 text-xs bg-purple-600 text-white rounded-t border border-purple-600 hover:bg-purple-700 transition-colors"
                        title="测试Tab震动"
                    >
                        📳 Tab
                    </button>
                </div>
            )}
            <div className="container mx-auto px-0">
                <div className="flex">
                    {tabs.map((tab) => {
                        const active = isActive(tab.href);
                        return (
                            <Link
                                key={tab.key}
                                href={tab.href}
                                className={`
                                    relative flex flex-col items-center justify-center
                                    flex-1 py-2 px-1 transition-all duration-200
                                    ${active 
                                        ? 'bg-white text-blue-600 border-t-2 border-blue-600' 
                                        : 'bg-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                                    }
                                `}
                                onClick={(e) => {
                                    // 只有在切换到不同tab时才触发震动反馈
                                    if (!active) {
                                        // 如果是"我的"tab且有待处理订单，使用特殊震动
                                        if (tab.key === 'mine' && pendingSalesCount > 0) {
                                            triggerTabHapticFeedback('mine-with-notification');
                                        } else {
                                            triggerTabHapticFeedback(tab.key);
                                        }
                                    }
                                }}
                            >
                                <div className="relative">
                                    <div className={`mb-1 ${
                                        active ? 'transform scale-110' : ''
                                    } transition-transform duration-200`}>
                                        {tab.icon}
                                    </div>
                                    {/* 红圈标注 - 只在"我的"标签且有待处理订单时显示 */}
                                    {tab.key === 'mine' && pendingSalesCount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                            {pendingSalesCount > 99 ? '99+' : pendingSalesCount}
                                        </div>
                                    )}
                                </div>
                                
                                <span className={`text-xs leading-tight text-center ${
                                    active ? 'font-medium' : 'font-normal'
                                }`}>
                                    {tab.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}