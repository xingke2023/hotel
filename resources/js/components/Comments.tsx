import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface User {
    id: number;
    name: string;
}

interface Comment {
    id: number;
    content: string;
    likes_count: number;
    created_at: string;
    user: User;
    replies: Comment[];
}

interface CommentsProps {
    articleId: number;
    articleSlug: string;
}

export default function Comments({ articleId, articleSlug }: CommentsProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [error, setError] = useState('');
    const [deletingComment, setDeletingComment] = useState<number | null>(null);

    useEffect(() => {
        fetchComments();
    }, [articleId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/articles/${articleSlug}/comments`);
            const data = await response.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error('获取评论失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!auth.user) {
            window.location.href = '/login?message=请先登录后再评论';
            return;
        }

        if (!newComment.trim()) {
            setError('请输入评论内容');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const response = await fetch(`/api/articles/${articleSlug}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    content: newComment,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setComments([...comments, data.comment]);
                setNewComment('');
            } else {
                setError(data.message || '评论发布失败');
            }
        } catch (error) {
            setError('网络错误，请稍后再试');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (parentId: number) => {
        if (!auth.user) {
            window.location.href = '/login?message=请先登录后再评论';
            return;
        }

        if (!replyContent.trim()) {
            setError('请输入回复内容');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const response = await fetch(`/api/articles/${articleSlug}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    content: replyContent,
                    parent_id: parentId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // 重新获取评论以包含回复
                fetchComments();
                setReplyContent('');
                setReplyingTo(null);
            } else {
                setError(data.message || '回复发布失败');
            }
        } catch (error) {
            setError('网络错误，请稍后再试');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (commentId: number) => {
        if (!auth.user) {
            window.location.href = '/login?message=请先登录后再点赞';
            return;
        }

        try {
            const response = await fetch(`/api/comments/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                // 重新获取评论以更新点赞数
                fetchComments();
            }
        } catch (error) {
            console.error('点赞失败:', error);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!auth.user) {
            return;
        }

        if (!confirm('确定要删除这条评论吗？')) {
            return;
        }

        try {
            setDeletingComment(commentId);

            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                // 重新获取评论以更新列表
                fetchComments();
            } else {
                const data = await response.json();
                alert(data.message || '删除失败');
            }
        } catch (error) {
            console.error('删除评论失败:', error);
            alert('网络错误，删除失败');
        } finally {
            setDeletingComment(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    };

    const renderComment = (comment: Comment, isReply = false) => (
        <div key={comment.id} className={`${isReply ? 'ml-8 mt-4' : 'mb-6'} border-b border-gray-100 pb-4 last:border-0`}>
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {comment.user.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{comment.user.name}</span>
                        <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                    </div>
                    <div className="text-gray-800 mb-3 whitespace-pre-wrap">
                        {comment.content}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <button
                            onClick={() => handleLike(comment.id)}
                            className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                        >
                            ❤️ {comment.likes_count || 0}
                        </button>
                        {!isReply && (
                            <button
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="text-gray-500 hover:text-orange-600 transition-colors"
                            >
                                回复
                            </button>
                        )}
                        {auth.user && auth.user.id === comment.user.id && (
                            <button
                                onClick={() => handleDelete(comment.id)}
                                disabled={deletingComment === comment.id}
                                className="text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                                {deletingComment === comment.id ? '删除中...' : '删除'}
                            </button>
                        )}
                    </div>

                    {/* 回复表单 */}
                    {replyingTo === comment.id && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="写下你的回复..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                rows={3}
                            />
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => handleReply(comment.id)}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? '发布中...' : '发布回复'}
                                </button>
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 渲染回复 */}
                    {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">评论 (加载中...)</h3>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-16 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                评论 ({comments.length})
            </h3>

            {/* 评论表单 */}
            <div className="mb-8">
                {auth.user ? (
                    <form onSubmit={handleSubmitComment} className="space-y-4">
                        <div>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="写下你的评论..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                rows={4}
                            />
                        </div>
                        {error && (
                            <div className="text-red-600 text-sm">{error}</div>
                        )}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                            >
                                {submitting ? '发布中...' : '发布评论'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">登录后可以发表评论</p>
                        <Link
                            href="/login?message=请先登录后再评论"
                            className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            立即登录
                        </Link>
                    </div>
                )}
            </div>

            {/* 评论列表 */}
            <div className="space-y-6">
                {comments.length > 0 ? (
                    comments.map(comment => renderComment(comment))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-6xl mb-4">💬</div>
                        <p>还没有评论，来发表第一个评论吧！</p>
                    </div>
                )}
            </div>
        </div>
    );
}