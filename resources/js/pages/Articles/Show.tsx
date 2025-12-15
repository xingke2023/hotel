import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import Comments from '@/components/Comments';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

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

    return (
        <FrontendLayout>
            <Head title={`${article.title} - 澳门濠江论坛`} />
            
            <div className="min-h-screen bg-gray-50">
                <div className="w-[99%] mx-auto px-4 py-8">
                    {/* 面包屑导航 */}
                    <div className="mb-6">
                        <nav className="flex items-center space-x-2 text-sm text-gray-500">
                            <Link href="/" className="hover:text-orange-600">首页</Link>
                            <span>›</span>
                            <Link href="/articles" className="hover:text-orange-600">澳门濠江论坛</Link>
                            <span>›</span>
                            <span 
                                className="px-2 py-1 rounded text-white text-xs"
                                style={{ backgroundColor: article.category.color }}
                            >
                                {article.category.name}
                            </span>
                        </nav>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* 主内容 */}
                        <div className="lg:col-span-3">
                            <article className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* 特色图片 */}
                                {article.featured_image && (
                                    <div className="h-64 md:h-80 bg-gray-200">
                                        <img 
                                            src={`/storage/${article.featured_image}`} 
                                            alt={article.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="p-6 md:p-8">
                                    {/* 文章头部 */}
                                    <div className="mb-6">
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                            {article.title}
                                        </h1>
                                        
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{new Date(article.published_at).toLocaleDateString('zh-CN')}</span>
                                            <span>👤 {article.user.name}</span>
                                            <span>👁 {article.views_count}</span>
                                            <span>❤️ {article.likes_count}</span>
                                        </div>
                                    </div>

                                    {/* 文章内容 */}
                                    <div className="prose prose-lg max-w-none">
                                        <div className="text-gray-800 leading-relaxed markdown-content">
                                            {article.content ? (
                                                <ReactMarkdown 
                                                    rehypePlugins={[rehypeRaw]}
                                                    components={{
                                                        // 自定义HTML元素样式
                                                        h1: ({children, ...props}) => <h1 {...props} className="text-2xl font-bold mb-4 mt-6 text-gray-900">{children}</h1>,
                                                        h2: ({children, ...props}) => <h2 {...props} className="text-xl font-bold mb-3 mt-5 text-gray-900">{children}</h2>,
                                                        h3: ({children, ...props}) => <h3 {...props} className="text-lg font-bold mb-2 mt-4 text-gray-900">{children}</h3>,
                                                        p: ({children, ...props}) => <p {...props} className="mb-4 text-gray-800 leading-relaxed">{children}</p>,
                                                        ul: ({children, ...props}) => <ul {...props} className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                                                        ol: ({children, ...props}) => <ol {...props} className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                                                        li: ({children, ...props}) => <li {...props} className="text-gray-800">{children}</li>,
                                                        blockquote: ({children, ...props}) => (
                                                            <blockquote {...props} className="border-l-4 border-orange-500 pl-4 my-4 italic text-gray-600 bg-orange-50 py-2">
                                                                {children}
                                                            </blockquote>
                                                        ),
                                                        code: ({children, ...props}) => (
                                                            <code {...props} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                                                                {children}
                                                            </code>
                                                        ),
                                                        pre: ({children, ...props}) => (
                                                            <pre {...props} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                                                                {children}
                                                            </pre>
                                                        ),
                                                        a: ({children, href, ...props}) => (
                                                            <a {...props} href={href} className="text-orange-600 hover:text-orange-800 underline" target="_blank" rel="noopener noreferrer">
                                                                {children}
                                                            </a>
                                                        ),
                                                        strong: ({children, ...props}) => <strong {...props} className="font-bold text-gray-900">{children}</strong>,
                                                        em: ({children, ...props}) => <em {...props} className="italic text-gray-700">{children}</em>,
                                                        // HTML元素样式
                                                        div: ({children, ...props}) => <div {...props} className="mb-2">{children}</div>,
                                                        span: ({children, ...props}) => <span {...props}>{children}</span>,
                                                        img: ({src, alt, ...props}) => (
                                                            <img {...props} src={src} alt={alt} className="max-w-full h-auto rounded-lg my-4" />
                                                        ),
                                                        hr: ({...props}) => <hr {...props} className="my-6 border-gray-300" />,
                                                        table: ({children, ...props}) => (
                                                            <div className="overflow-x-auto my-4">
                                                                <table {...props} className="min-w-full border-collapse border border-gray-300">
                                                                    {children}
                                                                </table>
                                                            </div>
                                                        ),
                                                        th: ({children, ...props}) => (
                                                            <th {...props} className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-bold">
                                                                {children}
                                                            </th>
                                                        ),
                                                        td: ({children, ...props}) => (
                                                            <td {...props} className="border border-gray-300 px-4 py-2">
                                                                {children}
                                                            </td>
                                                        ),
                                                    }}
                                                >
                                                    {article.content}
                                                </ReactMarkdown>
                                            ) : (
                                                <p className="text-gray-500 italic">文章内容为空</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* 标签 */}
                                    {article.tags && article.tags.length > 0 && (
                                        <div className="mt-8 pt-6 border-t">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-sm text-gray-600 mr-2">标签：</span>
                                                {article.tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 作者信息 */}
                                    <div className="mt-8 pt-6 border-t">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {article.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{article.user.name}</h3>
                                                <p className="text-sm text-gray-500">发布于 {new Date(article.published_at).toLocaleDateString('zh-CN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            {/* 评论区域 */}
                            <div className="mt-8">
                                <Comments articleId={article.id} articleSlug={article.slug} />
                            </div>
                        </div>

                        {/* 侧边栏 */}
                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                {/* 相关文章 */}
                                {relatedArticles.length > 0 && (
                                    <div className="bg-white rounded-lg shadow-md p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">相关文章</h3>
                                        <div className="space-y-4">
                                            {relatedArticles.map((relatedArticle) => (
                                                <div key={relatedArticle.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                                    <h4 className="font-medium text-gray-900 mb-2 hover:text-orange-600 transition-colors">
                                                        <Link href={`/articles/${relatedArticle.slug}`}>
                                                            {relatedArticle.title}
                                                        </Link>
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{new Date(relatedArticle.published_at).toLocaleDateString('zh-CN')}</span>
                                                        <span>👁 {relatedArticle.views_count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 操作按钮 */}
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <div className="space-y-3">
                                        <Link
                                            href="/articles/create"
                                            className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 rounded-md hover:from-orange-600 hover:to-red-600 transition-colors"
                                        >
                                            ✍️ 我也要发文章
                                        </Link>
                                        <Link
                                            href="/articles"
                                            className="block w-full bg-gray-100 text-gray-700 text-center py-2 rounded-md hover:bg-gray-200 transition-colors"
                                        >
                                            📋 返回讨论区
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}