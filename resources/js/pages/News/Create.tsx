import { Head, useForm, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import { FormEventHandler, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface NewsCategory {
    id: number;
    name: string;
    slug: string;
    color: string;
    icon?: string;
}

interface Props {
    categories: NewsCategory[];
}

export default function NewsCreate({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        news_category_id: '',
        title: '',
        excerpt: '',
        content: '',
        cover_image: null as File | null,
        images: [] as File[],
        event_start_at: '',
        event_end_at: '',
        venue: '',
        external_link: '',
        status: 'draft' as 'draft' | 'published',
        is_pinned: false,
        is_featured: false,
    });

    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('cover_image', file);
        if (file) {
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('news_category_id', data.news_category_id);
        formData.append('title', data.title);
        formData.append('excerpt', data.excerpt);
        formData.append('content', data.content);
        formData.append('status', data.status);
        formData.append('is_pinned', data.is_pinned ? '1' : '0');
        formData.append('is_featured', data.is_featured ? '1' : '0');
        if (data.event_start_at) formData.append('event_start_at', data.event_start_at);
        if (data.event_end_at) formData.append('event_end_at', data.event_end_at);
        if (data.venue) formData.append('venue', data.venue);
        if (data.external_link) formData.append('external_link', data.external_link);
        if (data.cover_image) formData.append('cover_image', data.cover_image);
        data.images.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
        });

        post('/news', { data: formData, forceFormData: true });
    };

    return (
        <FrontendLayout>
            <Head title="发布资讯" />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white sticky top-0 z-30 shadow-sm px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">发布资讯</h1>
                </div>

                <form onSubmit={submit} className="max-w-2xl mx-auto p-4 space-y-5 pb-12">
                    {/* 分类 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            资讯分类 <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.news_category_id}
                            onChange={(e) => setData('news_category_id', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                        >
                            <option value="">请选择分类</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.news_category_id && <p className="mt-1 text-xs text-red-500">{errors.news_category_id}</p>}
                    </div>

                    {/* 标题 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            标题 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="输入资讯标题..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                    </div>

                    {/* 摘要 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">摘要</label>
                        <textarea
                            value={data.excerpt}
                            onChange={(e) => setData('excerpt', e.target.value)}
                            rows={2}
                            placeholder="简短描述，显示在列表页..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 resize-none"
                        />
                        {errors.excerpt && <p className="mt-1 text-xs text-red-500">{errors.excerpt}</p>}
                    </div>

                    {/* 封面图 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">封面图</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                        />
                        {coverPreview && (
                            <div className="mt-2 h-36 rounded-xl overflow-hidden bg-gray-100">
                                <img src={coverPreview} alt="封面预览" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {errors.cover_image && <p className="mt-1 text-xs text-red-500">{errors.cover_image}</p>}
                    </div>

                    {/* 正文 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            正文内容 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={12}
                            placeholder="支持 Markdown 和 HTML 格式..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 resize-none"
                        />
                        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
                    </div>

                    {/* 活动信息 */}
                    <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                        <h3 className="text-sm font-bold text-orange-800">活动信息（演唱会/优惠活动填写）</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">开始时间</label>
                                <input
                                    type="datetime-local"
                                    value={data.event_start_at}
                                    onChange={(e) => setData('event_start_at', e.target.value)}
                                    className="w-full rounded-lg border border-orange-200 bg-white py-2 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">结束时间</label>
                                <input
                                    type="datetime-local"
                                    value={data.event_end_at}
                                    onChange={(e) => setData('event_end_at', e.target.value)}
                                    className="w-full rounded-lg border border-orange-200 bg-white py-2 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-100"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">活动场所</label>
                            <input
                                type="text"
                                value={data.venue}
                                onChange={(e) => setData('venue', e.target.value)}
                                placeholder="例：澳门威尼斯人大剧院"
                                className="w-full rounded-lg border border-orange-200 bg-white py-2 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">外部链接（购票/详情）</label>
                            <input
                                type="url"
                                value={data.external_link}
                                onChange={(e) => setData('external_link', e.target.value)}
                                placeholder="https://..."
                                className="w-full rounded-lg border border-orange-200 bg-white py-2 px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100"
                            />
                        </div>
                    </div>

                    {/* 展示选项 */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <h3 className="text-sm font-bold text-gray-700">展示选项</h3>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_pinned}
                                    onChange={(e) => setData('is_pinned', e.target.checked)}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">置顶显示</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm text-gray-700">首页推荐（Banner 展示）</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">发布状态</label>
                            <div className="flex gap-4">
                                {(['draft', 'published'] as const).map((s) => (
                                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value={s}
                                            checked={data.status === s}
                                            onChange={() => setData('status', s)}
                                            className="text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700">{s === 'draft' ? '保存草稿' : '立即发布'}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 active:scale-95"
                        >
                            {processing ? '处理中...' : data.status === 'published' ? '发布资讯' : '保存草稿'}
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-6 py-3 rounded-xl font-medium text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors active:scale-95"
                        >
                            取消
                        </button>
                    </div>
                </form>
            </div>
        </FrontendLayout>
    );
}
