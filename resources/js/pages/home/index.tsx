import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';

export default function HomeIndex() {
    const { pendingSalesCount } = usePendingSalesCount();
    return (
        <FrontendLayout>
            <Head title="首页 - 澳门房屋交易平台" />
            
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* 主要内容 */}
                <div className="container mx-auto px-4 py-6">
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-center">欢迎来到澳门娱乐指南</h3>
                        <p className="text-gray-500 text-center mb-6">澳门住宿娱乐指南</p>
                        
                        {/* 功能模块 */}
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                            <Link
                                href="/houses"
                                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v2zm0 0V7l9-4.5L21 7" />
                                    </svg>
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">房间预定</h4>
                                <p className="text-sm text-gray-500">快速预订优质房源</p>
                            </Link>
                            
                            <Link
                                href="/videos"
                                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">精彩澳门</h4>
                                <p className="text-sm text-gray-500">精彩视频内容</p>
                            </Link>
                            
                            <Link
                                href="/calculator"
                                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">投资工具</h4>
                                <p className="text-sm text-gray-500">专业投资分析工具</p>
                            </Link>
                        </div>
                    </div>
                </div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>
        </FrontendLayout>
    );
}