import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import { useState, useEffect } from 'react';

export default function HomeIndex() {
    const { pendingSalesCount } = usePendingSalesCount();
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 通过后端 API 获取实时汇率
        fetch('/api/exchange-rate')
            .then(response => response.json())
            .then(data => {
                if (data.rate) {
                    setExchangeRate(data.rate);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('获取汇率失败:', error);
                setExchangeRate(0.92); // 使用默认值
                setLoading(false);
            });
    }, []);
    
    return (
        <FrontendLayout>
            <Head title="首页 - 澳门房屋交易平台" />
            
            <div className="relative">
                {/* 第一屏 - 标题和功能模块 */}
                <div className="min-h-screen bg-blue-50/30 relative flex flex-col pb-20">
                    {/* 标题区域 - 紧凑设计 */}
                    <div className="container mx-auto px-3 pt-10 pb-0 flex-shrink-0">
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                                澳门讨论区
                            </h1>
                            <p className="text-base md:text-lg text-gray-600 mb-3">
                                澳门五星级酒店低价平台
                            </p>
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                                <span>{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                <span className="text-gray-400">|</span>
                                <span>
                                    港币汇率: 1 HKD = {loading ? '...' : exchangeRate ? exchangeRate.toFixed(4) : '0.9200'} CNY
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 功能模块区域 - 占用剩余空间 */}
                    <div className="flex-1 flex flex-col justify-center">

                        {/* 功能卡片网格 - 2x2布局 */}
                        <div className="grid grid-cols-2 gap-3 px-6 max-w-md mx-auto w-full">
                            <Link
                                href="/houses"
                                className="bg-white/80 backdrop-blur-sm rounded p-4 border border-blue-200 hover:border-blue-400 h-28 flex flex-col items-center justify-center text-center"
                            >
                                <div className="text-4xl mb-2">🏨</div>
                                <h3 className="font-medium text-gray-900 text-lg">今日低价房源</h3>
                            </Link>

                            <Link
                                href="/investment-tools"
                                className="bg-white/80 backdrop-blur-sm rounded p-4 border border-purple-200 hover:border-purple-400 h-28 flex flex-col items-center justify-center text-center"
                            >
                                <div className="text-4xl mb-2">🎯</div>
                                <h3 className="font-medium text-gray-900 text-lg">直播机助手</h3>
                            </Link>

                            <Link
                                href="/articles"
                                className="bg-white/80 backdrop-blur-sm rounded p-4 border border-orange-200 hover:border-orange-400 h-28 flex flex-col items-center justify-center text-center"
                            >
                                <div className="text-4xl mb-2">💬</div>
                                <h3 className="font-medium text-gray-900 text-lg">澳门讨论区</h3>
                            </Link>

                            <Link
                                href="/articles?category=5"
                                className="bg-white/80 backdrop-blur-sm rounded p-4 border border-pink-200 hover:border-pink-400 h-28 flex flex-col items-center justify-center text-center"
                            >
                                <div className="text-4xl mb-2">👥</div>
                                <h3 className="font-medium text-gray-900 text-lg">澳门交友区</h3>
                            </Link>
                        </div>

                        {/* 次要链接 */}
                        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
                            <Link href="/videos" className="underline hover:text-gray-900">
                                澳门视频
                            </Link>
                            <span className="text-gray-400">|</span>
                            <a href="https://www.dsat.gov.mo/bus/site/busstopwaiting.aspx?lang=tc" className="underline hover:text-gray-900">
                                实时公交
                            </a>
                        </div>
                    </div>

                    <BottomNavigation pendingSalesCount={pendingSalesCount} />
                </div>
            </div>
        </FrontendLayout>
    );
}