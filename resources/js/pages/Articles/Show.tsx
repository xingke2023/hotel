import { Head, Link, usePage } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import Comments from '@/components/Comments';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { 
    ArrowLeft, 
    Calendar, 
    User, 
    Eye, 
    Heart, 
    Share2, 
    Tag,
    Clock,
    ChevronRight,
    MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
    content: string;
    featured_image?: string;
    views_count: number;
    likes_count: number;
    published_at: string;
    tags?: string[];
    user: User;
    category: ArticleCategory;
}

interface Props {
    article: Article;
    relatedArticles: Article[];
}

export default function ArticleShow({ article, relatedArticles }: Props) {
    const { pendingSalesCount } = usePendingSalesCount();
    const page = usePage<SharedData>();
    const { auth } = page.props;

    return (
        <FrontendLayout>
            <Head title={`${article.title} - 澳门讨论区`} />
            
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Mobile Navigation Header */}
                <div className="bg-white sticky top-0 z-30 shadow-sm px-4 py-3 flex items-center justify-between">
                    <Link href="/articles" className="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <span className="font-bold text-gray-900 text-lg truncate max-w-[200px]">文章详情</span>
                    <button className="p-2 -mr-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="w-full max-w-4xl mx-auto md:px-4 md:py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-4">
                            <article className="bg-white md:rounded-2xl shadow-sm overflow-hidden pb-8">
                                {/* Featured Image */}
                                {article.featured_image && (
                                    <div className="relative h-56 md:h-80 bg-gray-100">
                                        <img 
                                            src={`/storage/${article.featured_image}`} 
                                            alt={article.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
                                        <div className="absolute bottom-4 left-4 right-4 md:hidden text-white">
                                            <span 
                                                className="inline-block px-2.5 py-1 rounded-md text-xs font-bold mb-2 shadow-sm backdrop-blur-md bg-white/20 border border-white/30"
                                            >
                                                {article.category?.name || '未分类'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="px-4 pt-6 md:p-8">
                                    {/* Desktop Category & Title */}
                                    <div className="hidden md:flex items-center gap-2 mb-4">
                                        <Link href="/articles" className="text-gray-500 hover:text-blue-600 text-sm">讨论区</Link>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                        <span 
                                            className="px-2.5 py-0.5 rounded text-xs font-bold text-white"
                                            style={{ backgroundColor: article.category?.color || '#9ca3af' }}
                                        >
                                            {article.category?.name || '未分类'}
                                        </span>
                                    </div>

                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">
                                        {article.title}
                                    </h1>
                                    
                                    {/* Author & Meta Info */}
                                    <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-900">{article.user?.name || '匿名用户'}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                                    <span>{new Date(article.published_at).toLocaleDateString('zh-CN')}</span>
                                                    {/* <span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
                                                    <span>IP属地: 澳门</span> */}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-400 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                <span>{article.views_count}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Article Content */}
                                    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-img:rounded-xl">
                                        {article.content ? (
                                            <ReactMarkdown 
                                                rehypePlugins={[rehypeRaw]}
                                                components={{
                                                    h1: ({children, ...props}) => <h1 {...props} className="text-2xl font-bold mt-8 mb-4">{children}</h1>,
                                                    h2: ({children, ...props}) => <h2 {...props} className="text-xl font-bold mt-8 mb-4">{children}</h2>,
                                                    h3: ({children, ...props}) => <h3 {...props} className="text-lg font-bold mt-6 mb-3">{children}</h3>,
                                                    p: ({children, ...props}) => <p {...props} className="mb-4 text-base md:text-lg leading-relaxed text-gray-800">{children}</p>,
                                                    blockquote: ({children, ...props}) => (
                                                        <blockquote {...props} className="border-l-4 border-blue-500 pl-4 py-1 my-6 italic bg-blue-50/50 rounded-r-lg text-gray-700">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    ul: ({children, ...props}) => <ul {...props} className="list-disc pl-5 mb-4 space-y-1 marker:text-blue-500">{children}</ul>,
                                                    ol: ({children, ...props}) => <ol {...props} className="list-decimal pl-5 mb-4 space-y-1 marker:text-blue-500">{children}</ol>,
                                                    code: ({children, ...props}) => <code {...props} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-red-500">{children}</code>,
                                                    img: ({src, alt, ...props}) => <img {...props} src={src} alt={alt} className="w-full h-auto rounded-xl my-6 shadow-sm border border-gray-100" />,
                                                }}
                                            >
                                                {article.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <div className="py-12 text-center text-gray-400 italic bg-gray-50 rounded-xl">
                                                内容加载中或为空...
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {article.tags && article.tags.length > 0 && (
                                        <div className="mt-8 pt-6 flex flex-wrap gap-2">
                                            {article.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
                                                >
                                                    <Tag className="w-3 h-3 mr-1" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Action Bar (Like/Share) */}
                                    <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center gap-6">
                                        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-red-500 transition-colors group">
                                            <div className="p-3 bg-gray-50 rounded-full group-hover:bg-red-50 transition-colors">
                                                <Heart className="w-6 h-6 group-hover:fill-current" />
                                            </div>
                                            <span className="text-xs font-medium">点赞 {article.likes_count > 0 ? article.likes_count : ''}</span>
                                        </button>
                                        <button className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-500 transition-colors group">
                                            <div className="p-3 bg-gray-50 rounded-full group-hover:bg-green-50 transition-colors">
                                                <Share2 className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-medium">分享</span>
                                        </button>
                                    </div>
                                </div>
                            </article>

                            {/* Comments Section */}
                            <div className="bg-white md:rounded-2xl shadow-sm p-4 md:p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-blue-600" />
                                    全部评论
                                </h3>
                                <Comments articleId={article.id} articleSlug={article.slug} />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6 px-4 md:px-0">
                            {/* Action Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-md p-6 text-white text-center">
                                <h3 className="font-bold text-lg mb-2">加入讨论</h3>
                                <p className="text-blue-100 text-sm mb-4">分享你在澳门的见闻与故事</p>
                                <Link
                                    href={auth.user ? "/articles/create" : "/login?message=请先登录以发布文章"}
                                    className="block w-full bg-white text-blue-600 font-bold py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-sm active:scale-95"
                                >
                                    发布新话题
                                </Link>
                            </div>

                            {/* Related Articles */}
                            {relatedArticles.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                                        相关推荐
                                    </h3>
                                    <div className="space-y-4">
                                        {relatedArticles.map((relatedArticle) => (
                                            <Link 
                                                key={relatedArticle.id} 
                                                href={`/articles/${relatedArticle.slug}`}
                                                className="block group"
                                            >
                                                <h4 className="font-medium text-gray-800 text-sm mb-1 group-hover:text-blue-600 line-clamp-2 transition-colors">
                                                    {relatedArticle.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{new Date(relatedArticle.published_at).toLocaleDateString('zh-CN')}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>
        </FrontendLayout>
    );
}
