<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class Comment extends Model
{
    protected $fillable = [
        'article_id',
        'user_id',
        'parent_id',
        'content',
        'status',
        'likes_count',
        'published_at',
    ];

    protected $casts = [
        'likes_count' => 'integer',
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')->with('user', 'replies')->orderBy('created_at', 'desc');
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', 'approved');
    }

    public function scopeTopLevel(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }

    public function scopeByArticle(Builder $query, $articleId): Builder
    {
        return $query->where('article_id', $articleId);
    }

    public function incrementLikes(): void
    {
        $this->increment('likes_count');
    }

    public function isReply(): bool
    {
        return !is_null($this->parent_id);
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($comment) {
            if ($comment->status === 'approved' && empty($comment->published_at)) {
                $comment->published_at = now();
            }
        });
        
        static::updating(function ($comment) {
            if ($comment->isDirty('status') && $comment->status === 'approved' && empty($comment->published_at)) {
                $comment->published_at = now();
            }
        });
    }
}
