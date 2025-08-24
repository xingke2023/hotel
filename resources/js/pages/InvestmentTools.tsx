import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';

export default function InvestmentTools() {
    const { pendingSalesCount } = usePendingSalesCount();

    const tools = [
        {
            href: '/calculator',
            title: '直缆',
            description: '红蓝智能注码控制工具',
            color: 'blue',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2v14a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            href: '/calculator6',
            title: '孖宝缆',
            description: '孖宝缆法注码控制',
            color: 'yellow',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            )
        },
        {
            href: '/calculator7',
            title: '孖宝加胜进双层缆',
            description: '双套注码增强系统',
            color: 'green',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
            )
        },

        {
            href: '/calculator2',
            title: '1221消数缆',
            description: '1221消数注码法',
            color: 'purple',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        
        {
            href: '/calculator4',
            title: '楼梯分层平注缆',
            description: '楼梯分层平注',
            color: 'indigo',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
            )
        },
        {
            href: '/calculator3',
            title: '多策略缆选择器',
            description: '多策略投注缆法',
            color: 'red',
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )
        }
    ];

    const getColorClasses = (color: string) => {
        const colorMap = {
            blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
            green: 'bg-green-100 text-green-600 hover:bg-green-200',
            purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
            red: 'bg-red-100 text-red-600 hover:bg-red-200',
            indigo: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
            yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.blue;
    };

    return (
        <FrontendLayout>
            <Head title="投资工具 - 澳门房屋交易平台" />
            
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* 头部 */}
                <div className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center">
                            <Link
                                href="/"
                                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-semibold text-gray-900">投资工具</h1>
                        </div>
                    </div>
                </div>

                {/* 主要内容 */}
                <div className="container mx-auto px-4 py-6">
                    <div className="mb-6">
                        <p className="text-gray-600 text-center">选择适合您的投资分析工具</p>
                    </div>

                    {/* 工具列表 */}
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                        {tools.map((tool, index) => (
                            <Link
                                key={index}
                                href={tool.href}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${getColorClasses(tool.color)}`}>
                                    {tool.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">{tool.title}</h3>
                                    <p className="text-xs text-gray-500 leading-tight">{tool.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>
        </FrontendLayout>
    );
}