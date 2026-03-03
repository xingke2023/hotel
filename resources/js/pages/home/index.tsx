import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import { useState, useEffect } from 'react';
import {
    MessageCircle,
    Hotel,
    Users,
    Video,
    Bus,
    Currency,
    Megaphone,
    Sparkles,
    ChevronRight,
    Headset,
    Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility is available

interface House {
    id: number;
    title: string;
    price: number;
    original_price?: number;
}

export default function HomeIndex() {
    const { pendingSalesCount } = usePendingSalesCount();
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [houses, setHouses] = useState<House[]>([]);

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

        // 获取房源信息
        fetch('/api/houses')
            .then(response => response.json())
            .then(data => {
                // API直接返回数组，取前10条
                if (Array.isArray(data) && data.length > 0) {
                    setHouses(data.slice(0, 10));
                } else {
                    // 如果没有数据，使用默认示例数据
                    setHouses([
                        { id: 1, title: '澳门威尼斯人酒店豪华套房', price: 888, original_price: 1288 },
                        { id: 2, title: '新濠天地水舞间主题房', price: 999, original_price: 1599 },
                        { id: 3, title: '巴黎人铁塔景观房', price: 788, original_price: 1088 },
                        { id: 4, title: '金沙城中心家庭套房', price: 688, original_price: 988 },
                        { id: 5, title: '永利皇宫湖景房', price: 1288, original_price: 1888 },
                    ]);
                }
            })
            .catch(error => {
                console.error('获取房源失败:', error);
                // 出错时使用默认示例数据
                setHouses([
                    { id: 1, title: '澳门威尼斯人酒店豪华套房', price: 888, original_price: 1288 },
                    { id: 2, title: '新濠天地水舞间主题房', price: 999, original_price: 1599 },
                    { id: 3, title: '巴黎人铁塔景观房', price: 788, original_price: 1088 },
                    { id: 4, title: '金沙城中心家庭套房', price: 688, original_price: 988 },
                    { id: 5, title: '永利皇宫湖景房', price: 1288, original_price: 1888 },
                ]);
            });
    }, []);
    
    return (
        <FrontendLayout>
            <Head title="首页 - 澳门房屋交易平台" />
            
            <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-16">
                {/* Top Section - Title, Date, Exchange Rate */}
                <div className="container mx-auto px-4 pt-5 pb-3 flex-shrink-0">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="flex justify-center mb-3">
                            <div className="relative">
                                {/* Stylized Logo Container */}
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6 z-10 relative border-2 border-white/20">
                                    <span className="text-3xl font-black text-white tracking-tighter">M</span>
                                </div>
                                <div className="absolute top-0 right-0 w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg transform translate-x-1/2 -translate-y-1/3 rotate-12 z-20 border-2 border-white">
                                    <MessageCircle className="w-5 h-5 text-white" fill="currentColor" strokeWidth={0} />
                                </div>
                                <div className="absolute -bottom-2 -left-2 w-full h-full bg-blue-200/50 rounded-2xl -z-10"></div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-1.5 drop-shadow-sm">
                            澳门讨论区
                        </h1>
                        <p className="text-base text-blue-700 font-medium mb-3 animate-fade-in">
                            澳门五星级酒店低价订房平台
                        </p>
                        <div className="flex items-center justify-center gap-3 text-xs text-gray-600 bg-white/70 backdrop-blur-sm rounded-full py-1.5 px-3 shadow-sm mx-auto max-w-fit">
                            <span>{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span className="text-gray-400">|</span>
                            <span className="flex items-center">
                                <Currency className="w-3.5 h-3.5 mr-1 text-green-600" /> 港币汇率: {loading ? '...' : exchangeRate ? exchangeRate.toFixed(4) : '0.9200'} CNY
                            </span>
                        </div>
                    </div>

                    {/* Marquee Banners */}
                    <div className="mt-3 space-y-0">
                        {/* Marquee 1: Website Promotion */}
                        <div className="overflow-hidden"> {/* Removed bg, backdrop, rounded, border, shadow */}
                            <div className="flex items-center px-4 py-0.5"> {/* Adjusted py-3 to py-1.5 */}
                                <div className="flex-shrink-0 mr-3">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                        <Megaphone className="w-3.5 h-3.5 mr-1" /> 公告
                                    </span>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="relative h-6">
                                        <div className="absolute whitespace-nowrap animate-marquee flex items-center">
                                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                                <span key={`url-${i}`} className="inline-flex items-center mx-6 text-xs"> {/* text-sm to text-xs */}
                                                    <span className="text-blue-700 font-bold">澳门讨论区网址：aomen.chat</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Marquee 2: House Deals */}
                                                    {houses.length > 0 && (
                                                        <div className="overflow-hidden"> {/* Removed bg, backdrop, rounded, border, shadow */}
                                                            <div className="flex items-center px-4 py-0.5">                                    <div className="flex-shrink-0 mr-3">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                                            <Sparkles className="w-3.5 h-3.5 mr-1" /> 今日特价
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="relative h-6">
                                            <div className="absolute whitespace-nowrap animate-marquee flex items-center">
                                                {houses.concat(houses).map((house, index) => (
                                                    <span key={`row2-${house.id}-${index}`} className="inline-flex items-center mx-4 text-xs"> {/* text-sm to text-xs */}
                                                        <span className="text-gray-700">{house.title}</span>
                                                        <span className="mx-2 text-red-600 font-bold">
                                                            ¥{house.price}
                                                        </span>
                                                        {house.original_price && house.original_price > house.price && (
                                                            <span className="text-gray-500 line-through text-xs">
                                                                ¥{house.original_price}
                                                            </span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                                {/* Feature Cards Grid */}
                <div className="px-4 py-1.5">
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
                        <Link
                            href="/houses"
                            className="bg-white rounded-xl p-4 border border-blue-100 shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group h-28"
                        >
                            <div className="text-blue-500 mb-1.5 group-hover:scale-110 transition-transform duration-300">
                                <Hotel size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-base">特价房源</h3>
                            <p className="text-xs text-gray-500 mt-0.5">五星级酒店低价订</p>
                        </Link>

                        <Link
                            href="/articles"
                            className="bg-white rounded-xl p-4 border border-green-100 shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group h-28"
                        >
                            <div className="text-green-500 mb-1.5 group-hover:scale-110 transition-transform duration-300">
                                <MessageCircle size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-base">澳门讨论区</h3>
                            <p className="text-xs text-gray-500 mt-0.5">分享生活，寻找同伴</p>
                        </Link>

<a
                            href="https://odds-tools.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white rounded-xl p-4 border border-pink-100 shadow-lg flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group h-28"
                        >
                            <div className="text-pink-500 mb-1.5 group-hover:scale-110 transition-transform duration-300">
                                <Calculator size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-base">概率和方法</h3>
                            <p className="text-xs text-gray-500 mt-0.5">智能分析，科学决策</p>
                        </a>
                    </div>
                </div>

                {/* Secondary Links */}
                <div className="flex items-center justify-center gap-5 mt-2 text-xs font-medium text-gray-700">
                    <Link href="/videos" className="flex items-center hover:text-blue-600 transition-colors group">
                        <Video className="w-3.5 h-3.5 mr-1 text-purple-500 group-hover:text-blue-600" /> 澳门精彩视频
                        <ChevronRight className="w-3 h-3 ml-0.5 text-gray-400 group-hover:text-blue-600" />
                    </Link>
                    <span className="text-gray-400">|</span>
                    <a href="https://www.dsat.gov.mo/bus/site/busstopwaiting.aspx?lang=tc" className="flex items-center hover:text-blue-600 transition-colors group">
                        <Bus className="w-3.5 h-3.5 mr-1 text-green-500 group-hover:text-blue-600" /> 澳门实时公交
                        <ChevronRight className="w-3 h-3 ml-0.5 text-gray-400 group-hover:text-blue-600" />
                    </a>
                </div>

                {/* Bottom Navigation Space */}
                <div className="h-12"></div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />

                {/* Customer Service Button */}
                <a
                    href="https://work.weixin.qq.com/kfid/kfcdfdb02ed73c8e4d0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed right-4 bottom-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full px-4 py-3 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50 group"
                >
                    <Headset size={18} strokeWidth={2} className="mr-1.5" />
                    <span className="font-semibold text-sm whitespace-nowrap">客服</span>
                </a>
            </div>
        </FrontendLayout>
    );
}