import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';

export default function HomeIndex() {
    const { pendingSalesCount } = usePendingSalesCount();
    
    return (
        <FrontendLayout>
            <Head title="首页 - 澳门房屋交易平台" />
            
            <div className="relative">
                {/* 澳门莲花淡色背景 */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {/* 莲花装饰图案 */}
                    <div className="absolute top-20 left-10 opacity-5">
                        <svg width="120" height="120" viewBox="0 0 120 120" fill="currentColor" className="text-pink-300">
                            <path d="M60 20c-8 0-15 6-15 15 0-8-7-15-15-15s-15 7-15 15c0 20 15 35 30 35s30-15 30-35c0-8-7-15-15-15z"/>
                            <path d="M60 20c8 0 15 6 15 15 0-8 7-15 15-15s15 7 15 15c0 20-15 35-30 35s-30-15-30-35c0-8 7-15 15-15z"/>
                            <path d="M60 100c0-8 6-15 15-15-8 0-15-7-15-15s-7-15-15-15-15 7-15 15c0 20 15 35 30 35z"/>
                            <path d="M60 100c0-8-6-15-15-15 8 0 15-7 15-15s7-15 15-15 15 7 15 15c0 20-15 35-30 35z"/>
                            <circle cx="60" cy="60" r="8" fill="currentColor" className="text-yellow-200"/>
                        </svg>
                    </div>
                    
                    <div className="absolute top-32 right-16 opacity-4">
                        <svg width="80" height="80" viewBox="0 0 120 120" fill="currentColor" className="text-rose-200">
                            <path d="M60 20c-8 0-15 6-15 15 0-8-7-15-15-15s-15 7-15 15c0 20 15 35 30 35s30-15 30-35c0-8-7-15-15-15z"/>
                            <path d="M60 20c8 0 15 6 15 15 0-8 7-15 15-15s15 7 15 15c0 20-15 35-30 35s-30-15-30-35c0-8 7-15 15-15z"/>
                            <circle cx="60" cy="50" r="6" fill="currentColor" className="text-yellow-200"/>
                        </svg>
                    </div>
                    
                    <div className="absolute bottom-40 left-20 opacity-3">
                        <svg width="100" height="100" viewBox="0 0 120 120" fill="currentColor" className="text-purple-200">
                            <path d="M60 20c-8 0-15 6-15 15 0-8-7-15-15-15s-15 7-15 15c0 20 15 35 30 35s30-15 30-35c0-8-7-15-15-15z"/>
                            <path d="M60 20c8 0 15 6 15 15 0-8 7-15 15-15s15 7 15 15c0 20-15 35-30 35s-30-15-30-35c0-8 7-15 15-15z"/>
                            <path d="M60 100c0-8 6-15 15-15-8 0-15-7-15-15s-7-15-15-15-15 7-15 15c0 20 15 35 30 35z"/>
                            <circle cx="60" cy="60" r="5" fill="currentColor" className="text-yellow-100"/>
                        </svg>
                    </div>
                    
                    <div className="absolute top-64 right-8 opacity-4">
                        <svg width="60" height="60" viewBox="0 0 120 120" fill="currentColor" className="text-blue-200">
                            <path d="M60 30c-5 0-10 4-10 10 0-5-5-10-10-10s-10 5-10 10c0 15 10 25 20 25s20-10 20-25c0-5-5-10-10-10z"/>
                            <circle cx="60" cy="45" r="4" fill="currentColor" className="text-yellow-100"/>
                        </svg>
                    </div>
                    
                    <div className="absolute bottom-20 right-32 opacity-3">
                        <svg width="90" height="90" viewBox="0 0 120 120" fill="currentColor" className="text-indigo-200">
                            <path d="M60 25c-6 0-12 5-12 12 0-6-6-12-12-12s-12 6-12 12c0 18 12 30 24 30s24-12 24-30c0-6-6-12-12-12z"/>
                            <path d="M60 25c6 0 12 5 12 12 0-6 6-12 12-12s12 6 12 12c0 18-12 30-24 30s-24-12-24-30c0-6 6-12 12-12z"/>
                            <circle cx="60" cy="50" r="6" fill="currentColor" className="text-yellow-100"/>
                        </svg>
                    </div>
                    
                    <div className="absolute top-16 right-40 opacity-2">
                        <svg width="70" height="70" viewBox="0 0 120 120" fill="currentColor" className="text-teal-200">
                            <path d="M60 30c-5 0-10 4-10 10 0-5-5-10-10-10s-10 5-10 10c0 15 10 25 20 25s20-10 20-25c0-5-5-10-10-10z"/>
                            <path d="M60 30c5 0 10 4 10 10 0-5 5-10 10-10s10 5 10 10c0 15-10 25-20 25s-20-10-20-25c0-5 5-10 10-10z"/>
                            <circle cx="60" cy="45" r="3" fill="currentColor" className="text-yellow-100"/>
                        </svg>
                    </div>
                </div>
                
                {/* 第一屏 - 标题和功能模块 */}
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative flex flex-col pb-20">
                    {/* 标题区域 - 紧凑设计 */}
                    <div className="container mx-auto px-6 py-6 flex-shrink-0">
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                                澳门住宿娱乐指南
                            </h1>
                            <p className="text-base md:text-lg text-gray-600 mb-4 leading-relaxed">
                                澳门五星级酒店低价平台，为您提供在澳门从住宿到娱乐的一站式体验平台
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                    🏨 五星级酒店
                                </span>
                                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                    💰 超低价格品质保证
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 功能模块区域 - 占用剩余空间 */}
                    <div className="flex-1 container mx-auto px-6 flex flex-col justify-center">
                        
                        {/* 功能卡片网格 - 2x2布局 */}
                        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                            <Link
                                href="/houses"
                                className="group bg-gradient-to-br from-white to-blue-50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 hover:border-blue-400 hover:-translate-y-1 aspect-square flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-2 group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v2zm0 0V7l9-4.5L21 7" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 text-sm">🏨 房间预定</h3>
                                <p className="text-gray-600 text-xs leading-tight">酒店最低价房源</p>
                            </Link>
                            
                            <Link
                                href="/videos"
                                className="group bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200 hover:border-purple-400 hover:-translate-y-1 aspect-square flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2 group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 text-sm">🎬 精彩澳门</h3>
                                <p className="text-gray-600 text-xs leading-tight">精彩视频内容</p>
                            </Link>
                            
                            <Link
                                href="/investment-tools"
                                className="group bg-gradient-to-br from-white to-indigo-50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-200 hover:border-indigo-400 hover:-translate-y-1 aspect-square flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-2 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 text-sm">🎯 休闲数学游戏</h3>
                                <p className="text-gray-600 text-xs leading-tight"></p>
                            </Link>

                            <button
                                onClick={() => alert('🚧 正在建设中，敬请期待！')}
                                className="group bg-gradient-to-br from-white to-orange-50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-200 hover:border-orange-400 hover:-translate-y-1 aspect-square flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-2 group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-300 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 text-sm">💬 澳门讨论区</h3>
                                <p className="text-gray-600 text-xs leading-tight"></p>
                                <div className="mt-1">
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">即将推出</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <BottomNavigation pendingSalesCount={pendingSalesCount} />
                </div>
                
                {/* 第二屏 - 为什么选择我们 */}
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative flex items-center">
                    <div className="container mx-auto px-6">
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-12">为什么选择我们</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                                <div className="text-center group hover:scale-105 transition-transform duration-300">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                        <span className="text-3xl">🏆</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-4 text-xl">品质保证</h3>
                                    <p className="text-gray-600 leading-relaxed">精选澳门优质酒店，确保住宿体验达到五星级标准，每一处细节都经过严格把控</p>
                                </div>
                                <div className="text-center group hover:scale-105 transition-transform duration-300">
                                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                        <span className="text-3xl">💰</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-4 text-xl">超低价格</h3>
                                    <p className="text-gray-600 leading-relaxed">直采房源，去除中间商环节，为您提供最具竞争力的价格，让奢华住宿触手可及</p>
                                </div>
                                <div className="text-center group hover:scale-105 transition-transform duration-300">
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                        <span className="text-3xl">⚡</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-4 text-xl">快速预订</h3>
                                    <p className="text-gray-600 leading-relaxed">简单便捷的预订流程，即时确认，专业客服24小时在线，为您的澳门之行保驾护航</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}