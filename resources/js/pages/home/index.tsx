import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';

export default function HomeIndex() {
    const { pendingSalesCount } = usePendingSalesCount();
    return (
        <FrontendLayout>
            <Head title="首页 - 澳门房屋交易平台" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
                {/* 头部装饰 */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                    <div className="relative container mx-auto px-4 py-8">
                        <div className="text-center">
                            <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                                <h3 className="text-2xl font-bold text-white mb-2">✨ 澳门住宿娱乐指南 ✨</h3>
                            </div>
                            <p className="text-lg text-gray-700 font-medium bg-white/70 rounded-lg px-4 py-2 inline-block backdrop-blur-sm">🏨 澳门住宿娱乐指南 🎰</p>
                        </div>
                    </div>
                </div>

                {/* 主要内容 */}
                <div className="container mx-auto px-4 py-6">
                    <div className="mb-8">
                        
                        {/* 功能模块 */}
                        <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                            <Link
                                href="/houses"
                                className="group relative bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center text-center overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v2zm0 0V7l9-4.5L21 7" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-white mb-2">🏨 房间预定</h4>
                                    <p className="text-sm text-white/80">快速预订优质房源</p>
                                </div>
                            </Link>
                            
                            <Link
                                href="/videos"
                                className="group relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center text-center overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-white mb-2">🎬 精彩澳门</h4>
                                    <p className="text-sm text-white/80">精彩视频内容</p>
                                </div>
                            </Link>
                            
                            <Link
                                href="/investment-tools"
                                className="group relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center text-center overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-white mb-2">🎯 数理分析工具</h4>
                                    <p className="text-sm text-white/80">专业投资辅助工具</p>
                                </div>
                            </Link>

                            <button
                                onClick={() => alert('🚧 正在建设中，敬请期待！')}
                                className="group relative bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center text-center overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-white mb-2">💬 澳门讨论区</h4>
                                    <p className="text-sm text-white/80">交流分享讨论社区</p>
                                </div>
                            </button>
                        </div>

                        {/* 装饰性元素 */}
                        <div className="mt-12 text-center">
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-6 py-3 shadow-lg">
                                <span className="text-white font-semibold">🌟 澳门精彩体验等你来 🌟</span>
                            </div>
                        </div>

                        {/* 浮动装饰图案 */}
                        <div className="fixed inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-20 left-10 w-8 h-8 bg-gradient-to-br from-pink-400 to-red-400 rounded-full opacity-20 animate-pulse"></div>
                            <div className="absolute top-32 right-16 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-30 animate-bounce"></div>
                            <div className="absolute bottom-40 left-20 w-10 h-10 bg-gradient-to-br from-green-400 to-teal-400 rounded-full opacity-25 animate-pulse"></div>
                            <div className="absolute bottom-60 right-8 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-20 animate-bounce"></div>
                        </div>
                    </div>
                </div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>
        </FrontendLayout>
    );
}