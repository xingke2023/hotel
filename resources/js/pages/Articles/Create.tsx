import { Head, useForm } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import { FormEventHandler, useState } from 'react';

interface ArticleCategory {
    id: number;
    name: string;
    slug: string;
    color: string;
}

interface Props {
    categories: ArticleCategory[];
}

export default function ArticleCreate({ categories }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        article_category_id: '',
        title: '',
        content: '',
        featured_image: null as File | null,
        status: 'draft' as 'draft' | 'published',
        tags: [] as string[],
    });

    const [tagInput, setTagInput] = useState('');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('article_category_id', data.article_category_id);
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('status', data.status);
        
        if (data.featured_image) {
            formData.append('featured_image', data.featured_image);
        }
        
        data.tags.forEach((tag, index) => {
            formData.append(`tags[${index}]`, tag);
        });

        post('/articles', {
            data: formData,
            forceFormData: true,
        });
    };

    const addTag = () => {
        if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
            setData('tags', [...data.tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setData('tags', data.tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <FrontendLayout>
            <Head title="发布文章 - 澳门濠江论坛" />
            
            <div className="min-h-screen bg-gray-50">
                <div className="w-full h-screen">
                    <div className="w-full h-full bg-white overflow-auto">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                            <h1 className="text-2xl font-bold">✍️ 发布文章</h1>
                            <p className="text-orange-100 mt-2">分享您在澳门的精彩体验和见闻</p>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-6 h-full">
                            {/* 分类选择 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    文章分类 <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.article_category_id}
                                    onChange={(e) => setData('article_category_id', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                >
                                    <option value="">请选择分类</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.article_category_id && (
                                    <div className="mt-1 text-sm text-red-600">{errors.article_category_id}</div>
                                )}
                            </div>

                            {/* 文章标题 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    文章标题 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="输入一个吸引人的标题..."
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                />
                                {errors.title && (
                                    <div className="mt-1 text-sm text-red-600">{errors.title}</div>
                                )}
                            </div>


                            {/* 特色图片 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    特色图片
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('featured_image', e.target.files?.[0] || null)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    支持 JPG、PNG、GIF 格式，最大 2MB
                                </p>
                                {errors.featured_image && (
                                    <div className="mt-1 text-sm text-red-600">{errors.featured_image}</div>
                                )}
                            </div>

                            {/* 文章内容 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    文章内容 <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    rows={25}
                                    placeholder="在这里写下您想分享的内容...&#10;&#10;支持 Markdown 格式：&#10;# 标题&#10;**粗体** *斜体*&#10;- 列表项&#10;> 引用&#10;`代码`&#10;[链接](https://example.com)"
                                    className="w-full h-96 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 resize-none"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    💡 支持 Markdown 和 HTML 格式：<code className="bg-gray-100 px-1 rounded">**粗体**</code>、
                                    <code className="bg-gray-100 px-1 rounded">*斜体*</code>、
                                    <code className="bg-gray-100 px-1 rounded"># 标题</code>、
                                    <code className="bg-gray-100 px-1 rounded">- 列表</code>、
                                    <code className="bg-gray-100 px-1 rounded">`代码`</code>、
                                    <code className="bg-gray-100 px-1 rounded">&lt;div&gt;</code>、
                                    <code className="bg-gray-100 px-1 rounded">&lt;img&gt;</code> 等
                                </p>
                                {errors.content && (
                                    <div className="mt-1 text-sm text-red-600">{errors.content}</div>
                                )}
                            </div>

                            {/* 标签 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    标签
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="输入标签后按回车添加"
                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                    >
                                        添加
                                    </button>
                                </div>
                                {data.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {data.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="text-orange-600 hover:text-orange-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 发布选项 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    发布状态
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="draft"
                                            checked={data.status === 'draft'}
                                            onChange={(e) => setData('status', e.target.value as 'draft' | 'published')}
                                            className="mr-2 text-orange-500 focus:ring-orange-500"
                                        />
                                        保存为草稿
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="published"
                                            checked={data.status === 'published'}
                                            onChange={(e) => setData('status', e.target.value as 'draft' | 'published')}
                                            className="mr-2 text-orange-500 focus:ring-orange-500"
                                        />
                                        立即发布
                                    </label>
                                </div>
                            </div>

                            {/* 提交按钮 */}
                            <div className="flex gap-4 pt-6 border-t">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? '处理中...' : data.status === 'published' ? '发布文章' : '保存草稿'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => window.history.back()}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    取消
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}