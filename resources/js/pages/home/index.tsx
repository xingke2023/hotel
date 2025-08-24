import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';

export default function HomeIndex() {
    const { pendingSalesCount } = usePendingSalesCount();
    return (
        <FrontendLayout>
            <Head title="首页 - 澳门房屋交易平台" />
            
            <div className="min-h-screen w-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 pb-20 relative overflow-hidden -mx-4 -my-6 sm:-mx-6 lg:-mx-8">
                {/* 多层清淡背景渐变 */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-100/40 via-blue-50/30 to-purple-100/40"></div>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-bl from-pink-50/30 via-rose-50/20 to-orange-50/30"></div>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-emerald-50/25 via-teal-50/15 to-cyan-50/25"></div>
                
                {/* 头部装饰 */}
                <div className="relative overflow-hidden w-full">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-100/15 via-orange-100/15 to-red-100/15"></div>
                    <div className="relative container mx-auto px-8 py-8">
                        <div className="text-center">
                            <div className="inline-block p-6 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 shadow-2xl border border-white/20">
                                <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">✨ 欢迎来到澳门找房网 ✨</h3>
                                <p className="text-lg text-white/90 font-semibold">🏨 澳门五星级酒店低价平台 🎰</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 主要内容 */}
                <div className="container mx-auto px-8 py-4">
                    <div className="mb-6">
                        
                        {/* 功能模块 */}
                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                            <Link
                                href="/houses"
                                className="group relative bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-1 flex flex-col items-center justify-center text-center overflow-hidden border-2 border-white/30"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tl from-lime-400/30 to-emerald-300/30 backdrop-blur-sm"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-700/20"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2 group-hover:rotate-12 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v2zm0 0V7l9-4.5L21 7" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1">🏨 房间预定</h4>
                                    <p className="text-xs text-white/80">酒店最低价房源</p>
                                </div>
                            </Link>
                            
                            <Link
                                href="/videos"
                                className="group relative bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-600 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1 flex flex-col items-center justify-center text-center overflow-hidden border-2 border-white/30"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tl from-pink-400/30 to-purple-300/30 backdrop-blur-sm"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-700/20"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2 group-hover:rotate-12 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1">🎬 精彩澳门</h4>
                                    <p className="text-xs text-white/80">精彩视频内容</p>
                                </div>
                            </Link>
                            
                            <Link
                                href="/investment-tools"
                                className="group relative bg-gradient-to-br from-sky-600 via-blue-500 to-indigo-600 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-1 flex flex-col items-center justify-center text-center overflow-hidden border-2 border-white/30"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tl from-cyan-400/30 to-blue-300/30 backdrop-blur-sm"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-700/20"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2 group-hover:rotate-12 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1">🎯 数理分析</h4>
                                    <p className="text-xs text-white/80">投资辅助工具</p>
                                </div>
                            </Link>

                            <button
                                onClick={() => alert('🚧 正在建设中，敬请期待！')}
                                className="group relative bg-gradient-to-br from-orange-600 via-red-500 to-pink-600 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1 flex flex-col items-center justify-center text-center overflow-hidden border-2 border-white/30"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tl from-yellow-400/30 to-orange-300/30 backdrop-blur-sm"></div>
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-700/20"></div>
                                <div className="relative z-10">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-2 group-hover:rotate-12 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1">💬 澳门讨论区</h4>
                                    <p className="text-xs text-white/80">交流分享社区</p>
                                </div>
                            </button>
                        </div>

                        {/* 装饰性元素 */}
                        <div className="mt-8 text-center">
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-600 rounded-full px-6 py-3 shadow-xl border border-white/40 backdrop-blur-md">
                                <span className="text-white font-bold text-lg drop-shadow-lg">🌟 澳门精彩体验等你来 🌟</span>
                            </div>
                        </div>

                        {/* 清淡的浮动装饰图案 */}
                        <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
                            <div className="absolute top-16 left-8 w-12 h-12 bg-gradient-to-br from-rose-200 to-pink-300 rounded-full opacity-20 animate-pulse shadow-sm"></div>
                            <div className="absolute top-28 right-12 w-8 h-8 bg-gradient-to-br from-sky-200 to-blue-300 rounded-full opacity-25 animate-bounce shadow-sm"></div>
                            <div className="absolute top-48 left-16 w-6 h-6 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full opacity-20 animate-pulse"></div>
                            <div className="absolute bottom-32 left-12 w-14 h-14 bg-gradient-to-br from-lime-200 to-green-300 rounded-full opacity-15 animate-bounce shadow-sm"></div>
                            <div className="absolute bottom-48 right-6 w-10 h-10 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full opacity-20 animate-pulse shadow-sm"></div>
                            <div className="absolute top-36 left-1/2 w-7 h-7 bg-gradient-to-br from-violet-200 to-purple-300 rounded-full opacity-20 animate-bounce"></div>
                            <div className="absolute bottom-64 right-20 w-9 h-9 bg-gradient-to-br from-fuchsia-200 to-pink-300 rounded-full opacity-15 animate-pulse shadow-sm"></div>
                            <div className="absolute top-64 right-4 w-5 h-5 bg-gradient-to-br from-cyan-200 to-teal-300 rounded-full opacity-25 animate-bounce"></div>
                        </div>
                    </div>
                </div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>
        </FrontendLayout>
    );
}