import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import {
    ArrowLeft,
    Calendar,
    Eye,
    Share2,
    MapPin,
    ExternalLink,
    Clock,
    Newspaper,
} from 'lucide-react';

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
    content: string;
    cover_image?: string;
    images?: string[];
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
    news: NewsItem;
    related: NewsItem[];
}

export default function NewsShow({ news, related }: Props) {
    const { pendingSalesCount } = usePendingSalesCount();

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('zh-CN');

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: news.title, url: window.location.href });
        } else {
            navigator.clipboard?.writeText(window.location.href);
        }
    };

    return (
        <FrontendLayout>
            <Head title={`${news.title} - 澳门资讯`} />

            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Top Nav */}
                <div className="bg-white sticky top-0 z-30 shadow-sm px-4 py-3 flex items-center justify-between">
                    <Link
                        href="/news"
                        className="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <span className="font-bold text-gray-900 text-base truncate max-w-[200px]">资讯详情</span>
                    <button
                        onClick={handleShare}
                        className="p-2 -mr-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="w-full max-w-4xl mx-auto md:px-4 md:py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <article className="bg-white md:rounded-2xl shadow-sm overflow-hidden pb-8">
                                {/* Cover Image */}
                                {news.cover_image && (
                                    <div className="relative h-56 md:h-80 bg-gray-100">
                                        <img
                                            src={`/storage/${news.cover_image}`}
                                            alt={news.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                                        <div className="absolute bottom-4 left-4 right-4 md:hidden">
                                            <span
                                                className="inline-block px-2.5 py-1 rounded-md text-xs font-bold text-white mb-2 backdrop-blur-md bg-white/20 border border-white/30"
                                            >
                                                {news.category?.icon} {news.category?.name}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="px-4 pt-5 md:p-8">
                                    {/* Breadcrumb (desktop) */}
                                    <div className="hidden md:flex items-center gap-2 mb-4 text-sm text-gray-500">
                                        <Link href="/news" className="hover:text-red-600">资讯</Link>
                                        <span>/</span>
                                        <span
                                            className="px-2.5 py-0.5 rounded text-xs font-bold text-white"
                                            style={{ backgroundColor: news.category?.color || '#ef4444' }}
                                        >
                                            {news.category?.icon} {news.category?.name}
                                        </span>
                                    </div>

                                    {/* Pinned badge */}
                                    {news.is_pinned && (
                                        <span className="inline-block bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-3">
                                            置顶公告
                                        </span>
                                    )}

                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">
                                        {news.title}
                                    </h1>

                                    {/* Meta */}
                                    <div className="flex flex-wrap items-center gap-4 py-4 border-b border-gray-100 mb-6 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {news.published_at ? formatDate(news.published_at) : ''}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Eye className="w-4 h-4" />
                                            {news.views_count} 次浏览
                                        </span>
                                    </div>

                                    {/* Event Info Card */}
                                    {(news.event_start_at || news.venue || news.external_link) && (
                                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 space-y-2">
                                            <h3 className="text-sm font-bold text-orange-800 mb-2">活动信息</h3>
                                            {news.event_start_at && (
                                                <div className="flex items-center gap-2 text-sm text-orange-700">
                                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                                    <span>
                                                        {formatDate(news.event_start_at)}
                                                        {news.event_end_at && ` 至 ${formatDate(news.event_end_at)}`}
                                                    </span>
                                                </div>
                                            )}
                                            {news.venue && (
                                                <div className="flex items-center gap-2 text-sm text-orange-700">
                                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                                    <span>{news.venue}</span>
                                                </div>
                                            )}
                                            {news.external_link && (
                                                <a
                                                    href={news.external_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 mt-1 text-sm text-orange-600 font-medium hover:text-orange-700"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    查看详情 / 购票
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-red-600 prose-img:rounded-xl">
                                        {news.content ? (
                                            <ReactMarkdown
                                                rehypePlugins={[rehypeRaw]}
                                                components={{
                                                    h1: ({ children, ...props }) => <h1 {...props} className="text-2xl font-bold mt-8 mb-4">{children}</h1>,
                                                    h2: ({ children, ...props }) => <h2 {...props} className="text-xl font-bold mt-8 mb-4">{children}</h2>,
                                                    h3: ({ children, ...props }) => <h3 {...props} className="text-lg font-bold mt-6 mb-3">{children}</h3>,
                                                    p: ({ children, ...props }) => <p {...props} className="mb-4 text-base md:text-lg leading-relaxed text-gray-800">{children}</p>,
                                                    blockquote: ({ children, ...props }) => (
                                                        <blockquote {...props} className="border-l-4 border-red-400 pl-4 py-1 my-6 italic bg-red-50/50 rounded-r-lg text-gray-700">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    ul: ({ children, ...props }) => <ul {...props} className="list-disc pl-5 mb-4 space-y-1 marker:text-red-500">{children}</ul>,
                                                    ol: ({ children, ...props }) => <ol {...props} className="list-decimal pl-5 mb-4 space-y-1 marker:text-red-500">{children}</ol>,
                                                    img: ({ src, alt, ...props }) => (
                                                        <img {...props} src={src} alt={alt} className="w-full h-auto rounded-xl my-6 shadow-sm border border-gray-100" />
                                                    ),
                                                }}
                                            >
                                                {news.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <div className="py-12 text-center text-gray-400 italic bg-gray-50 rounded-xl">
                                                内容加载中...
                                            </div>
                                        )}
                                    </div>

                                    {/* Image Gallery */}
                                    {news.images && news.images.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-sm font-bold text-gray-700 mb-3">图集</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {news.images.map((img, index) => (
                                                    <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                                                        <img
                                                            src={`/storage/${img}`}
                                                            alt={`图片 ${index + 1}`}
                                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Share */}
                                    <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center">
                                        <button
                                            onClick={handleShare}
                                            className="flex flex-col items-center gap-1 text-gray-500 hover:text-green-500 transition-colors group"
                                        >
                                            <div className="p-3 bg-gray-50 rounded-full group-hover:bg-green-50 transition-colors">
                                                <Share2 className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-medium">分享</span>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6 px-4 md:px-0">
                            {/* Back to list */}
                            <Link
                                href="/news"
                                className="block bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl shadow-md p-6 text-white text-center"
                            >
                                <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-90" />
                                <h3 className="font-bold text-lg mb-1">更多资讯</h3>
                                <p className="text-red-100 text-sm">查看全部澳门资讯</p>
                            </Link>

                            {/* Related */}
                            {related.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-4 bg-red-500 rounded-full" />
                                        相关资讯
                                    </h3>
                                    <div className="space-y-4">
                                        {related.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={`/news/${item.slug}`}
                                                className="block group"
                                            >
                                                <h4 className="font-medium text-gray-800 text-sm mb-1 group-hover:text-red-600 line-clamp-2 transition-colors">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{item.published_at ? formatDate(item.published_at) : ''}</span>
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
