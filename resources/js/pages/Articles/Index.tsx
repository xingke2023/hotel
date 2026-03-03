import { Head, Link, router, usePage } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import { useState } from 'react';
import { type SharedData } from '@/types';
import { 
    Search, 
    PenLine, 
    MessageCircle, 
    Eye, 
    Heart, 
    Calendar,
    User,
    ChevronRight,
    Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
    id: number;
    name: string;
}

interface ArticleCategory {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image?: string;
    views_count: number;
    likes_count: number;
    published_at: string;
    user: User;
    category: ArticleCategory;
}

interface Props {
    articles: {
        data: Article[];
        links: any[];
        meta?: any; // Made optional
        last_page?: number; // Potential flat structure
    };
    categories: ArticleCategory[];
    filters: {
        category?: string;
        search?: string;
    };
}

export default function ArticlesIndex({ articles, categories = [], filters = {} }: Props) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { pendingSalesCount } = usePendingSalesCount();
    const [search, setSearch] = useState(filters.search || '');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/articles', { search, category: filters.category });
    };

    const handleCategoryFilter = (categoryId?: string) => {
        router.get('/articles', { category: categoryId, search: filters.search });
    };

    // Safe access to data
    const articleList = articles?.data || [];
    const paginationLinks = articles?.links || [];
    
    // Determine if we should show pagination
    const hasPagination = paginationLinks.length > 3; // Basic heuristic if meta is missing

    return (
        <FrontendLayout>
            <Head title="澳门讨论区" />

            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Modern Header Section */}
                <div className="bg-white sticky top-0 z-30 shadow-sm">
                    {/* Top Bar */}
                    <div className="px-4 py-3 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="bg-blue-600 text-white p-1 rounded-lg">
                                <MessageCircle className="w-5 h-5" />
                            </span>
                            澳门讨论区
                        </h1>
                        
                        {/* Create Post Button */}
                        <Link
                            href={auth.user ? "/articles/create" : "/login?message=请先登录以发布文章"}
                            className="bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors shadow-sm active:scale-95 transition-transform"
                        >
                            <PenLine className="w-3.5 h-3.5" />
                            <span>发布</span>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="px-4 pb-3">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className={cn(
                                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none",
                                isSearchFocused ? "text-blue-600" : "text-gray-400"
                            )} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                placeholder="搜索话题、攻略、心情..."
                                className="w-full bg-gray-100 border-none rounded-xl py-2 pl-10 pr-20 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors active:scale-95"
                            >
                                搜索
                            </button>
                        </form>
                    </div>

                    {/* Categories Grid */}
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
                                全部话题
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryFilter(category.id.toString())}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border border-transparent",
                                        filters.category === category.id.toString()
                                            ? "shadow-sm text-white border-opacity-20"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    )}
                                    style={
                                        filters.category === category.id.toString()
                                            ? { backgroundColor: category.color, borderColor: 'rgba(0,0,0,0.1)' }
                                            : {}
                                    }
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Article List */}
                <div className="px-2 py-3 space-y-1"> {/* space-y-2 to space-y-1 */}
                    {articleList.length > 0 ? (
                        articleList.map((article) => (
                            <Link 
                                key={article.id} 
                                href={`/articles/${article.slug}`}
                                className="block bg-white rounded-lg p-3 shadow-sm border border-gray-100 active:scale-[0.99] transition-transform"> {/* rounded-xl to rounded-lg */}
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        {/* Consolidated Category, User, Date, Views, Likes */}
                                        <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                                            {article.category ? (
                                                <span 
                                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-sm"
                                                    style={{ backgroundColor: article.category.color }}
                                                >
                                                    {article.category.name}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-400 text-white">
                                                    未分类
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {article.user?.name || '匿名'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {article.published_at ? new Date(article.published_at).toLocaleDateString('zh-CN') : ''}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {article.views_count || 0}
                                            </span>
                                            <span className="flex items-center gap-1 text-red-500/80">
                                                <Heart className="w-3 h-3" />
                                                {article.likes_count || 0}
                                            </span>
                                        </div>
                                        
                                        <h2 className="text-base font-bold text-gray-900 leading-snug mb-1 line-clamp-2">
                                            {article.title}
                                        </h2>
                                        
                                        {/* Removed redundant view/like count div */}
                                        {/* <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        </div> */}
                                    </div>
                                    
                                    {article.featured_image && (
                                        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                                            <img 
                                                src={`/storage/${article.featured_image}`} 
                                                alt={article.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <Search className="w-10 h-10 opacity-50" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">暂无文章</h3>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                                {filters.category || filters.search 
                                    ? '没有找到匹配的话题，换个关键词试试？' 
                                    : '这里还很冷清，快来发布第一篇话题吧！'}
                            </p>
                            {!filters.category && !filters.search && (
                                <Link
                                    href={auth.user ? "/articles/create" : "/login?message=请先登录以发布文章"}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-md active:scale-95"
                                >
                                    发布新话题
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {hasPagination && (
                        <div className="flex justify-center pt-4 pb-8">
                            <div className="flex gap-2 items-center bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                                {paginationLinks.map((link: any, index: number) => {
                                    // Simple logic to show clearer pagination on mobile
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