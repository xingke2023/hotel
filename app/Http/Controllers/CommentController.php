<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class CommentController extends Controller
{
    public function index(Article $article): JsonResponse
    {
        $comments = $article->approvedComments()->paginate(20);

        return response()->json([
            'comments' => $comments->items(),
            'pagination' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ]
        ]);
    }

    public function store(Request $request, Article $article): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json([
                'message' => '请先登录后再评论'
            ], 401);
        }

        $request->validate([
            'content' => 'required|string|min:1|max:2000',
            'parent_id' => 'nullable|exists:comments,id'
        ]);

        // 如果是回复评论，验证父评论属于同一篇文章
        if ($request->parent_id) {
            $parentComment = Comment::find($request->parent_id);
            if ($parentComment->article_id !== $article->id) {
                throw ValidationException::withMessages([
                    'parent_id' => '无效的父评论'
                ]);
            }
        }

        $comment = Comment::create([
            'article_id' => $article->id,
            'user_id' => Auth::id(),
            'parent_id' => $request->parent_id,
            'content' => $request->content,
            'status' => 'approved',
        ]);

        $comment->load(['user', 'replies.user']);

        return response()->json([
            'message' => '评论发布成功',
            'comment' => $comment
        ], 201);
    }

    public function destroy(Comment $comment): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json([
                'message' => '请先登录'
            ], 401);
        }

        // 只允许评论作者删除自己的评论
        if ($comment->user_id !== Auth::id()) {
            return response()->json([
                'message' => '无权删除此评论'
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => '评论已删除'
        ]);
    }

    public function like(Comment $comment): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json([
                'message' => '请先登录后再点赞'
            ], 401);
        }

        $comment->incrementLikes();

        return response()->json([
            'message' => '点赞成功',
            'likes_count' => $comment->likes_count
        ]);
    }
}
