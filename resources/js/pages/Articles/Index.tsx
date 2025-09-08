import { Head, Link, router, usePage } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import { useState } from 'react';
import { type SharedData } from '@/types';

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
        meta: any;
    };
    categories: ArticleCategory[];
    filters: {
        category?: string;
        search?: string;
    };
}

export default function ArticlesIndex({ articles, categories, filters }: Props) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/articles', { search, category: filters.category });
    };

    const handleCategoryFilter = (categoryId?: string) => {
        router.get('/articles', { category: categoryId, search: filters.search });
    };

    return (
        <FrontendLayout>
            <Head title="澳门讨论区 - 分享澳门生活" />
            
            <div className="min-h-screen bg-gray-50">
                {/* 头部区域 - 压缩高度 */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-6">
                    <div className="w-[99%] mx-auto px-4">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">💬 澳门讨论区</h1>
                            
                            {/* 发布按钮 - 右上角 */}
                            {auth.user ? (
                                <Link
                                    href="/articles/create"
                                    className="px-4 sm:px-6 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <span>✍️</span>
                                    <span className="hidden sm:inline">发布文章</span>
                                    <span className="sm:hidden">发布</span>
                                </Link>
                            ) : (
                                <Link
                                    href="/login?message=请先登录以发布文章"
                                    className="px-4 sm:px-6 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                >
                                    <span>✍️</span>
                                    <span className="hidden sm:inline">发布文章</span>
                                    <span className="sm:hidden">发布</span>
                                </Link>
                            )}
                        </div>
                        
                        {/* 搜索栏 */}
                        <form onSubmit={handleSearch} className="max-w-md mx-auto">
                            <div className="flex">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="搜索文章..."
                                    className="flex-1 px-4 py-2 rounded-l-lg border-0 text-gray-900 focus:ring-2 focus:ring-orange-300"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-r-lg transition-colors"
                                >
                                    搜索
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="w-full px-2 py-6">
                    {/* 顶部分类badge选择器 */}
                    <div className="w-[99%] mx-auto p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => handleCategoryFilter()}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    !filters.category 
                                        ? 'bg-orange-500 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                全部
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryFilter(category.id.toString())}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        filters.category === category.id.toString()
                                            ? 'text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                    style={
                                        filters.category === category.id.toString()
                                            ? { backgroundColor: category.color }
                                            : {}
                                    }
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 文章紧凑列表 */}
                    <div className="w-[99%] mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
                        {articles.data.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {articles.data.map((article) => (
                                    <div key={article.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0 mr-4">
                                                {/* 标题 */}
                                                <h2 className="text-base font-medium text-gray-900 hover:text-orange-600 transition-colors line-clamp-1 mb-1">
                                                    <Link href={`/articles/${article.slug}`}>
                                                        {article.title}
                                                    </Link>
                                                </h2>
                                                
                                                {/* 分类和元信息 */}
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    {article.category ? (
                                                        <span 
                                                            className="px-2 py-0.5 rounded text-xs text-white font-medium"
                                                            style={{ backgroundColor: article.category.color }}
                                                        >
                                                            {article.category.name}
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-xs bg-gray-400 text-white font-medium">
                                                            未分类
                                                        </span>
                                                    )}
                                                    <span>👤 {article.user.name}</span>
                                                    <span>📅 {new Date(article.published_at).toLocaleDateString('zh-CN')}</span>
                                                    <span>👁 {article.views_count}</span>
                                                    <span>❤️ {article.likes_count}</span>
                                                </div>
                                            </div>
                                            
                                            {/* 右侧特色图片（如果有） */}
                                            {article.featured_image && (
                                                <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                                    <img 
                                                        src={`/storage/${article.featured_image}`} 
                                                        alt={article.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无文章</h3>
                                <p className="text-gray-500 mb-6">
                                    {filters.category || filters.search ? '没有找到匹配的文章' : '还没有人发布文章'}
                                </p>
                                {!filters.category && !filters.search && (
                                    <Link
                                        href={auth.user ? "/articles/create" : "/login?message=请先登录以发布文章"}
                                        className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-md hover:from-orange-600 hover:to-red-600 transition-colors"
                                    >
                                        成为第一个发文章的人
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 分页 */}
                    {articles.data.length > 0 && articles.links && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                {articles.links.map((link: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 rounded-md transition-colors ${
                                            link.active 
                                                ? 'bg-orange-500 text-white' 
                                                : link.url 
                                                ? 'bg-white text-gray-700 hover:bg-gray-100' 
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </FrontendLayout>
    );
}