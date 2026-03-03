import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { usePage, router } from '@inertiajs/react';
import axios from '@/lib/axios';

interface House {
    id: number;
    title: string;
    price: number;
    location: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
    };
}

interface SupplyDemandProps {
    onPurchase: (house: House) => void;
}

export default function SupplyDemand({ onPurchase }: SupplyDemandProps) {
    const { auth } = usePage<any>().props;
    const [houses, setHouses] = useState<House[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState<'price' | 'latest' | 'default'>('default');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const scrollRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const listItemRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageChanging, setPageChanging] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(160);
    const [viewportHeight, setViewportHeight] = useState(0);
    const [itemHeight, setItemHeight] = useState(50);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [exchangeRateLoading, setExchangeRateLoading] = useState(false);
    const bottomTabHeight = 60; // 底部tab高度
    
    // 触摸滑动处理
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isSwipeActive, setIsSwipeActive] = useState(false);
    
    // 触感震动反馈
    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'swipe' | 'ultra' = 'light') => {
        try {
            if ('vibrate' in navigator) {
                // 不同类型的震动模式 - 增强震动强度
                const patterns = {
                    light: [20],
                    medium: [40],
                    heavy: [80],
                    swipe: [30, 15, 50, 15, 30], // 更复杂的滑动震动模式：中-停-强-停-中
                    ultra: [100, 20, 80, 20, 100] // 超强震动：强-停-强-停-强
                };
                navigator.vibrate(patterns[type]);
                console.log(`触发震动反馈: ${type}, 模式: [${patterns[type].join(', ')}]`);
            }
            
            // 如果支持 HapticFeedback API (iOS Safari)
            if ('hapticFeedback' in window) {
                const hapticTypes = {
                    light: 'impactLight',
                    medium: 'impactMedium', 
                    heavy: 'impactHeavy',
                    swipe: 'impactHeavy', // 上滑使用重触感
                    ultra: 'impactHeavy'
                };
                const windowWithHaptic = window as Window & {
                    hapticFeedback?: {
                        [key: string]: () => void;
                    };
                };
                windowWithHaptic.hapticFeedback?.[hapticTypes[type]]?.();
                console.log(`触发iOS触感反馈: ${hapticTypes[type]}`);
                
                // 对于ultra和swipe类型，触发多次重触感
                if (type === 'ultra' || type === 'swipe') {
                    setTimeout(() => {
                        windowWithHaptic.hapticFeedback?.['impactHeavy']?.();
                    }, 100);
                    setTimeout(() => {
                        windowWithHaptic.hapticFeedback?.['impactHeavy']?.();
                    }, 200);
                }
            }
            
            // 备用震动方案 - 使用更强的震动
            if (!('vibrate' in navigator) && !('hapticFeedback' in window)) {
                // 尝试通过Web Audio API创建触感反馈
                try {
                    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                    const audioContext = new AudioContextClass();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(50, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.1);
                    
                    console.log('使用Web Audio API模拟触感反馈');
                } catch (audioError) {
                    console.debug('Web Audio API 不可用:', audioError);
                }
            }
        } catch (error) {
            // 静默失败，不影响功能
            console.debug('Haptic feedback not supported:', error);
        }
    };
    
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientY);
        setIsSwipeActive(true);
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientY);
    };
    
    const handleTouchEnd = (e: React.TouchEvent) => {
        setIsSwipeActive(false);
        
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isUpSwipe = distance > 16; // 向上滑动，下一页 - 调整阈值为16像素
        const isDownSwipe = distance < -16; // 向下滑动，上一页 - 调整阈值为16像素
        
        // 如果是轻微的滑动，不处理分页，让点击事件正常触发
        if (Math.abs(distance) < 16) {
            return;
        }
        
        // 阻止点击事件，因为这是一个滑动手势
        e.preventDefault();
        
        const totalPages = Math.ceil(houses.length / itemsPerPage);
        
        if (isUpSwipe && currentPage < totalPages - 1) {
            // 上滑翻页 - 使用最强的震动反馈
            triggerHapticFeedback('ultra');
            console.log('上滑翻页 - 触发超强震动反馈');
            setPageChanging(true);
            setCurrentPage(prev => prev + 1);
            setTimeout(() => setPageChanging(false), 500);
        }
        if (isDownSwipe && currentPage > 0) {
            // 下滑翻页 - 使用强震动
            triggerHapticFeedback('swipe');
            console.log('下滑翻页 - 触发强震动反馈');
            setPageChanging(true);
            setCurrentPage(prev => prev - 1);
            setTimeout(() => setPageChanging(false), 500);
        }
    };

    const fetchHouses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/houses', {
                params: { 
                    search,
                    sort_by: sortBy === 'default' ? undefined : sortBy,
                    sort_order: sortBy === 'default' ? undefined : sortOrder
                }
            });
            let newHouses = response.data || [];
            
            // 在前端进行排序
            newHouses = [...newHouses].sort((a, b) => {
                let comparison = 0;
                
                if (sortBy === 'price') {
                    comparison = a.price - b.price;
                } else if (sortBy === 'latest') {
                    comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
                } else {
                    // 默认按updated_at排序
                    comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
                }
                
                return sortOrder === 'desc' ? -comparison : comparison;
            });
            
            // 限制最多显示80条数据
            const limitedHouses = newHouses.slice(0, 80);
            setHouses(limitedHouses);
            
            // 如果当前页超出范围，重置到第一页
            const maxPages = Math.ceil(limitedHouses.length / itemsPerPage);
            if (currentPage >= maxPages && maxPages > 0) {
                setCurrentPage(0);
            }
            
        } catch (error) {
            console.error('获取房屋列表失败:', error);
        } finally {
            setLoading(false);
        }
    }, [search, sortBy, sortOrder, itemsPerPage, currentPage]);

    // 获取港币人民币汇率
    const fetchExchangeRate = useCallback(async () => {
        if (exchangeRateLoading) return;
        
        setExchangeRateLoading(true);
        try {
            // 使用免费汇率API - exchangerate-api.com
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/HKD');
            const data = await response.json();
            
            if (data && data.rates && data.rates.CNY) {
                setExchangeRate(data.rates.CNY);
            } else {
                // 备用方案：使用其他汇率API
                const backupResponse = await fetch('https://api.fixer.io/latest?base=HKD&symbols=CNY');
                const backupData = await backupResponse.json();
                
                if (backupData && backupData.rates && backupData.rates.CNY) {
                    setExchangeRate(backupData.rates.CNY);
                } else {
                    // 最后备用：设置一个默认值
                    setExchangeRate(0.91);
                }
            }
        } catch (error) {
            console.error('获取汇率失败:', error);
            // 网络错误时使用默认汇率
            setExchangeRate(0.91);
        } finally {
            setExchangeRateLoading(false);
        }
    }, [exchangeRateLoading]);

    // 使用refs存储最新的函数引用
    const fetchHousesRef = useRef(fetchHouses);
    const fetchExchangeRateRef = useRef(fetchExchangeRate);
    
    // 更新refs
    useEffect(() => {
        fetchHousesRef.current = fetchHouses;
        fetchExchangeRateRef.current = fetchExchangeRate;
    });

    // 初始化和定时器设置 - 只执行一次
    useEffect(() => {
        // 初始调用
        fetchHousesRef.current();
        fetchExchangeRateRef.current();
        
        const housesInterval = setInterval(() => {
            fetchHousesRef.current();
        }, 30000); // 每30秒更新房屋数据

        const exchangeRateInterval = setInterval(() => {
            fetchExchangeRateRef.current();
        }, 300000); // 每5分钟更新汇率

        return () => {
            clearInterval(housesInterval);
            clearInterval(exchangeRateInterval);
        };
    }, []); // 空依赖数组，只在组件挂载时执行一次

    // 键盘事件监听 - 单独的useEffect
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const totalPages = Math.ceil(houses.length / itemsPerPage);
            
            if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                if (currentPage > 0) {
                    triggerHapticFeedback('light');
                    setPageChanging(true);
                    setCurrentPage(prev => prev - 1);
                    setTimeout(() => setPageChanging(false), 500);
                }
            } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                if (currentPage < totalPages - 1) {
                    triggerHapticFeedback('light');
                    setPageChanging(true);
                    setCurrentPage(prev => prev + 1);
                    setTimeout(() => setPageChanging(false), 500);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentPage, houses.length, itemsPerPage]);

    // 智能计算显示数量
    const calculateItemsPerPage = useCallback(() => {
        const currentViewportHeight = window.innerHeight;
        const availableHeight = currentViewportHeight - headerHeight - bottomTabHeight;
        const calculatedItemsPerPage = Math.floor(availableHeight / itemHeight);
        
        // 确保至少显示1个项目，最多显示20个项目
        const optimalItemsPerPage = Math.max(1, Math.min(20, calculatedItemsPerPage));
        
        setViewportHeight(currentViewportHeight);
        setItemsPerPage(optimalItemsPerPage);
        
        // 如果当前页面超出了新的页数范围，调整到最后一页
        const newTotalPages = Math.ceil(houses.length / optimalItemsPerPage);
        if (currentPage >= newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages - 1);
        }
        
        return optimalItemsPerPage;
    }, [headerHeight, bottomTabHeight, itemHeight, houses.length, currentPage]);

    // 测量头部高度和列表项高度
    useEffect(() => {
        const measureDimensions = () => {
            let newHeaderHeight = headerHeight;
            let newItemHeight = itemHeight;
            
            if (headerRef.current) {
                newHeaderHeight = headerRef.current.offsetHeight;
                setHeaderHeight(newHeaderHeight);
            }
            
            if (listItemRef.current) {
                newItemHeight = listItemRef.current.offsetHeight;
                setItemHeight(newItemHeight);
            }
            
            // 重新计算显示数量
            calculateItemsPerPage();
        };

        measureDimensions();
        
        // 监听窗口大小变化
        const handleResize = () => {
            measureDimensions();
        };

        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [calculateItemsPerPage, headerHeight, itemHeight]);

    // 当houses数据变化时重新计算
    useEffect(() => {
        if (houses.length > 0) {
            calculateItemsPerPage();
        }
    }, [houses.length, calculateItemsPerPage]);
    
    // 当排序方式改变时，重新获取数据
    useEffect(() => {
        fetchHouses();
    }, [fetchHouses, sortBy, sortOrder]);

    const handleHouseClick = (house: House) => {
        if (house.status === 'available') {
            if (!auth.user) {
                if (confirm('请先登录后再购买房屋，点击确定跳转到登录页面')) {
                    router.visit('/login');
                }
                return;
            }
            onPurchase(house);
        }
    };

    return (
        <div className="relative">
            {/* 固定头部区域 - 包含所有头部内容 */}
            <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
                {/* 信息栏 - 包含标题和搜索栏 */}
                <div className="bg-gray-700 border-b border-yellow-400 mb-0">
                    {/* 手机端标题 */}
                    <div className="md:hidden py-3 px-4 border-b border-gray-600">
                        <div className="text-center text-yellow-400 font-bold text-base">
                            <div className="text-xl font-bold text-white">
                                {new Date().getMonth() + 1}月{new Date().getDate()}日澳门酒店实时交易牌价
                            </div>
                            <div className="flex items-center justify-center gap-3 mt-1">
                                <span className="text-xs text-gray-300">
                                    {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}
                                </span>
                                <span className="text-xs text-red-400 animate-pulse">↕ 滑动翻页实时更新</span>
                                <span className="text-xs text-red-250">
                                    中银港币实时汇率 {exchangeRate ? exchangeRate.toFixed(4) : '0.9100'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* 搜索框和分页信息 */}
                    <div className="px-1 py-1">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Input
                                    placeholder="搜索房屋..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-32 md:w-40 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400"
                                />
                                
                                {/* 排序按钮 */}
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            if (sortBy === 'price') {
                                                setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                                            } else {
                                                setSortBy('price');
                                                setSortOrder('desc');
                                            }
                                        }}
                                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                                            sortBy === 'price' 
                                                ? 'bg-yellow-400 text-black border-yellow-400' 
                                                : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                                        }`}
                                    >
                                        价格{sortBy === 'price' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (sortBy === 'latest') {
                                                setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                                            } else {
                                                setSortBy('latest');
                                                setSortOrder('desc');
                                            }
                                        }}
                                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                                            sortBy === 'latest' 
                                                ? 'bg-yellow-400 text-black border-yellow-400' 
                                                : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                                        }`}
                                    >
                                        最新{sortBy === 'latest' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
                                    </button>
                                    {sortBy !== 'default' && (
                                        <button
                                            onClick={() => {
                                                setSortBy('default');
                                                setSortOrder('desc');
                                            }}
                                            className="px-2 py-1 text-xs rounded border bg-red-600 text-white border-red-600 hover:bg-red-700 transition-colors"
                                            title="清除排序"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 md:gap-3 text-xs min-w-0">
                                <span className="text-yellow-400 whitespace-nowrap">
                                    第 {currentPage + 1}/{Math.ceil(houses.length / itemsPerPage)} 页
                                </span>
                                
                                <div className="text-gray-300 flex items-center gap-2 whitespace-nowrap">
                                    {/* 震动测试按钮 - 仅在开发环境显示 */}
                                    {process.env.NODE_ENV === 'development' && (
                                        <button
                                            onClick={() => {
                                                triggerHapticFeedback('ultra');
                                                console.log('测试超强震动反馈');
                                            }}
                                            className="px-1 py-1 text-xs rounded border bg-blue-600 text-white border-blue-600 hover:bg-blue-700 transition-colors"
                                            title="测试超强震动"
                                        >
                                            📳
                                        </button>
                                    )}
                                    
                                    {Math.ceil(houses.length / itemsPerPage) > 1 && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    if (currentPage > 0) {
                                                        triggerHapticFeedback('light');
                                                        setPageChanging(true);
                                                        setCurrentPage(0); // 直接跳到第一页
                                                        setTimeout(() => setPageChanging(false), 500);
                                                    }
                                                }}
                                                disabled={currentPage === 0}
                                                className={`w-6 h-6 rounded border text-sm ${
                                                    currentPage === 0 
                                                        ? 'bg-gray-600 text-gray-400 border-gray-600' 
                                                        : 'bg-gray-700 text-yellow-400 border-yellow-400 hover:bg-gray-600'
                                                }`}
                                                title="到第一页"
                                            >
                                                ⤒
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const totalPages = Math.ceil(houses.length / itemsPerPage);
                                                    if (currentPage < totalPages - 1) {
                                                        triggerHapticFeedback('light');
                                                        setPageChanging(true);
                                                        setCurrentPage(prev => prev + 1);
                                                        setTimeout(() => setPageChanging(false), 500);
                                                    }
                                                }}
                                                disabled={currentPage >= Math.ceil(houses.length / itemsPerPage) - 1}
                                                className={`w-6 h-6 rounded border text-xs ${
                                                    currentPage >= Math.ceil(houses.length / itemsPerPage) - 1
                                                        ? 'bg-gray-600 text-gray-400 border-gray-600' 
                                                        : 'bg-gray-700 text-yellow-400 border-yellow-400 hover:bg-gray-600'
                                                }`}
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 表头区域 - 也是固定的 */}
                <div className="bg-gray-800 text-white text-sm font-bold border-b-2 border-yellow-400">
                    {/* 桌面端表头 */}
                    <div className="hidden md:flex items-center justify-between py-3 px-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">房间信息</div>
                            <div className="text-xs text-yellow-400">
                                第 {currentPage + 1} / {Math.ceil(houses.length / itemsPerPage)} 页
                            </div>
                        </div>
                        <div className="w-24 text-center">价格</div>
                        <div className="w-20 text-center">时间</div>
                        <div className="w-20 text-center">卖家</div>
                        <div className="w-20 text-center">状态</div>
                    </div>
                </div>
            </div>

            {/* 可滚动的列表内容区域 - 紧贴固定头部 */}
            <div className="fixed top-0 left-0 right-0 bg-white border-l border-r border-b border-gray-200 overflow-hidden" style={{ 
                top: `${headerHeight}px`, 
                height: `${viewportHeight - headerHeight - bottomTabHeight}px` 
            }}>
                <div 
                    className={`overflow-hidden relative bg-black ${pageChanging ? 'opacity-90' : 'opacity-100'} ${isSwipeActive ? 'brightness-95' : 'brightness-100'} transition-all duration-200`} 
                    ref={scrollRef}
                    style={{ height: `${viewportHeight - headerHeight - bottomTabHeight}px` }}
                >
                    <div 
                        className="transition-transform duration-500 ease-out relative"
                        style={{
                            transform: `translateY(-${currentPage * (itemsPerPage * itemHeight)}px)`
                        }}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {Array.from({ length: Math.ceil(houses.length / itemsPerPage) }, (_, pageIndex) => (
                            <div key={pageIndex} style={{ height: `${itemsPerPage * itemHeight}px` }}>
                                {houses
                                    .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                                    .map((house, itemIndex) => (
                                    <div 
                                        key={house.id}
                                        ref={pageIndex === 0 && itemIndex === 0 ? listItemRef : null}
                                        className={`
                                            border-b border-gray-700 text-white
                                            ${itemIndex % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}
                                            ${house.status === 'available' ? 'border-l-4 border-l-green-400' : 'border-l-4 border-l-red-500'}
                                            hover:bg-gray-700 transition-all duration-300
                                            transform hover:scale-105 cursor-pointer
                                        `}
                                        style={{
                                            minHeight: `${itemHeight}px`,
                                            fontFamily: 'monospace',
                                            fontSize: '14px'
                                        }}
                                        onClick={() => handleHouseClick(house)}
                                    >
                                        {/* 桌面端布局 */}
                                        <div className="hidden md:flex items-center justify-between px-4 py-3" style={{ height: `${itemHeight}px` }}>
                                            {/* 房间信息 */}
                                            <div className="flex-1 truncate">
                                                <span className="text-yellow-300 font-bold mr-2">
                                                    {String(house.id).padStart(3, '0')}
                                                </span>
                                                <span className="text-white font-semibold">
                                                    {house.title}
                                                </span>
                                            </div>
                                            
                                            {/* 价格 */}
                                            <div className="w-24 text-center">
                                                <span className="text-green-400 font-bold text-lg">
                                                    ¥{house.price.toLocaleString()}
                                                </span>
                                            </div>
                                            
                                            {/* 时间 */}
                                            <div className="w-20 text-center text-gray-300 text-xs">
                                                {new Date(house.created_at).toLocaleDateString('zh-CN', {
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                })}
                                            </div>
                                            
                                            {/* 卖家 */}
                                            <div className="w-20 text-center text-gray-300 text-xs truncate">
                                                {house.user.name}
                                            </div>
                                            
                                            {/* 状态 */}
                                            <div className="w-20 text-center">
                                                {house.status === 'available' ? (
                                                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                                                        可购买
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                                                        {house.status === 'pending' ? '待确认' : '已售'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* 手机端布局 - 占满宽度，避免换行 */}
                                        <div className="md:hidden px-3 py-2">
                                            {/* 第一行：编号 + 房间标题 */}
                                            <div className="flex items-center mb-1">
                                                <span className="text-yellow-300 font-bold text-xs mr-2 flex-shrink-0">
                                                    {String(house.id).padStart(3, '0')}
                                                </span>
                                                <span className="text-white font-semibold text-sm flex-1 leading-tight">
                                                    {house.title}
                                                </span>
                                            </div>
                                            
                                            {/* 第二行：价格 + 状态 */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-green-400 font-bold text-base">
                                                    ¥{house.price.toLocaleString()}
                                                </span>
                                                <div>
                                                    {house.status === 'available' ? (
                                                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                                                            可购买
                                                        </span>
                                                    ) : (
                                                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                                                            {house.status === 'pending' ? '待确认' : '已售'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                
                {houses.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                        暂无房屋信息
                    </div>
                )}
                
                {loading && (
                    <div className="text-center py-8">
                        <span className="text-gray-500">加载中...</span>
                    </div>
                )}
            </div>
        </div>
    );
}