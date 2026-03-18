import { Head, Link, router } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import { useState } from 'react';
import { Search, Eye, Calendar, MapPin, ExternalLink, ChevronRight, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsCategory {
    id: number;
    name: string;
    slug: string;
    color: string;
    icon?: string;
}

interface NewsItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    cover_image?: string;
    views_count: number;
    published_at: string;
    is_pinned: boolean;
    is_featured: boolean;
    event_start_at?: string;
    event_end_at?: string;
    venue?: string;
    external_link?: string;
    category: NewsCategory;
}

interface Props {
    news: {
        data: NewsItem[];
        links: any[];
    };
    categories: NewsCategory[];
    featured: NewsItem[];
    filters: {
        category?: string;
        search?: string;
    };
}

export default function NewsIndex({ news, categories = [], featured = [], filters = {} }: Props) {
    const { pendingSalesCount } = usePendingSalesCount();
    const [search, setSearch] = useState(filters.search || '');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/news', { search, category: filters.category });
    };

    const handleCategoryFilter = (categoryId?: string) => {
        router.get('/news', { category: categoryId, search: filters.search });
    };

    const newsList = news?.data || [];
    const paginationLinks = news?.links || [];
    const hasPagination = paginationLinks.length > 3;

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('zh-CN');

    return (
        <FrontendLayout>
            <Head title="澳门资讯" />

            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header */}
                <div className="bg-white sticky top-0 z-30 shadow-sm">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="bg-red-600 text-white p-1 rounded-lg">
                                <Newspaper className="w-5 h-5" />
                            </span>
                            澳门资讯
                        </h1>
                    </div>

                    {/* Search */}
                    <div className="px-4 pb-3">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className={cn(
                                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none",
                                isSearchFocused ? "text-red-600" : "text-gray-400"
                            )} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                placeholder="搜索旅游攻略、优惠活动、演唱会..."
                                className="w-full bg-gray-100 border-none rounded-xl py-2 pl-10 pr-20 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-100 focus:bg-white transition-all outline-none"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-1 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors active:scale-95"
                            >
                                搜索
                            </button>
                        </form>
                    </div>

                    {/* Categories */}
                    <div className="border-t border-gray-100">
                        <div className="flex flex-wrap px-4 py-2 gap-1.5">
                            <button
                                onClick={() => handleCategoryFilter()}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                                    !filters.category
                                        ? "bg-gray-900 text-white shadow-sm"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                全部资讯
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryFilter(category.id.toString())}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-transparent",
                                        filters.category === category.id.toString()
                                            ? "shadow-sm text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    )}
                                    style={
                                        filters.category === category.id.toString()
                                            ? { backgroundColor: category.color }
                                            : {}
                                    }
                                >
                                    {category.icon && <span className="mr-1">{category.icon}</span>}
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Featured Banner (首页推荐，无筛选时展示) */}
                {!filters.category && !filters.search && featured.length > 0 && (
                    <div className="px-4 pt-4 pb-2">
                        <Link
                            href={`/news/${featured[0].slug}`}
                            className="block relative h-44 rounded-2xl overflow-hidden shadow-md"
                        >
                            {featured[0].cover_image ? (
                                <img
                                    src={`/storage/${featured[0].cover_image}`}
                                    alt={featured[0].title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-400" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <span
                                    className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white mb-2"
                                    style={{ backgroundColor: featured[0].category?.color || '#ef4444' }}
                                >
                                    {featured[0].category?.name}
                                </span>
                                <h2 className="text-white font-bold text-base leading-snug line-clamp-2">
                                    {featured[0].title}
                                </h2>
                            </div>
                            <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                置顶
                            </div>
                        </Link>

                        {/* 其余 featured 小图 */}
                        {featured.length > 1 && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {featured.slice(1, 3).map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/news/${item.slug}`}
                                        className="relative h-24 rounded-xl overflow-hidden shadow-sm"
                                    >
                                        {item.cover_image ? (
                                            <img
                                                src={`/storage/${item.cover_image}`}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-2">
                                            <p className="text-white text-xs font-medium line-clamp-2 leading-tight">
                                                {item.title}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* News List */}
                <div className="px-2 py-3 space-y-1">
                    {newsList.length > 0 ? (
                        newsList.map((item) => (
                            <Link
                                key={item.id}
                                href={`/news/${item.slug}`}
                                className="block bg-white rounded-lg p-3 shadow-sm border border-gray-100 active:scale-[0.99] transition-transform"
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        {/* Meta row */}
                                        <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-500 flex-wrap">
                                            {item.is_pinned && (
                                                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">置顶</span>
                                            )}
                                            {item.category && (
                                                <span
                                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-sm"
                                                    style={{ backgroundColor: item.category.color }}
                                                >
                                                    {item.category.icon} {item.category.name}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {item.published_at ? formatDate(item.published_at) : ''}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {item.views_count}
                                            </span>
                                        </div>

                                        <h2 className="text-base font-bold text-gray-900 leading-snug mb-1 line-clamp-2">
                                            {item.title}
                                        </h2>

                                        {/* Event info */}
                                        {(item.venue || item.event_start_at) && (
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                {item.venue && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-red-400" />
                                                        {item.venue}
                                                    </span>
                                                )}
                                                {item.event_start_at && (
                                                    <span className="flex items-center gap-1 text-orange-500 font-medium">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(item.event_start_at)}
                                                        {item.event_end_at && ` - ${formatDate(item.event_end_at)}`}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {item.cover_image && (
                                        <div className="w-24 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                            <img
                                                src={`/storage/${item.cover_image}`}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Newspaper className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">暂无资讯</h3>
                            <p className="text-sm text-gray-500">
                                {filters.category || filters.search ? '没有找到相关资讯' : '敬请期待最新资讯'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {hasPagination && (
                        <div className="flex justify-center pt-4 pb-8">
                            <div className="flex gap-2 items-center bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                                {paginationLinks.map((link: any, index: number) => {
                                    if (link.label.includes('&laquo;') || link.label.includes('&raquo;')) return null;
                                    return (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all",
                                                link.active
                                                    ? "bg-gray-900 text-white shadow-sm"
                                                    : link.url
                                                    ? "text-gray-600 hover:bg-gray-100"
                                                    : "text-gray-300 cursor-not-allowed"
                                            )}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>
        </FrontendLayout>
    );
}
