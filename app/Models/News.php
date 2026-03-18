<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class News extends Model
{
    protected $fillable = [
        'news_category_id',
        'user_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'cover_image',
        'images',
        'event_start_at',
        'event_end_at',
        'venue',
        'external_link',
        'status',
        'is_pinned',
        'is_featured',
        'sort_order',
        'views_count',
        'published_at',
    ];

    protected $casts = [
        'images'         => 'array',
        'is_pinned'      => 'boolean',
        'is_featured'    => 'boolean',
        'views_count'    => 'integer',
        'sort_order'     => 'integer',
        'event_start_at' => 'datetime',
        'event_end_at'   => 'datetime',
        'published_at'   => 'datetime',
        'created_at'     => 'datetime',
        'updated_at'     => 'datetime',
    ];

    // Relations

    public function category(): BelongsTo
    {
        return $this->belongsTo(NewsCategory::class, 'news_category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopePinned(Builder $query): Builder
    {
        return $query->where('is_pinned', true);
    }

    public function scopeByCategory(Builder $query, $categoryId): Builder
    {
        return $query->where('news_category_id', $categoryId);
    }

    // Route model binding by slug
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // Auto-generate excerpt from content if not set
    public function getExcerptAttribute($value): string
    {
        return $value ?: Str::limit(strip_tags($this->content), 150);
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    // Auto slug + published_at management
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($news) {
            if (empty($news->slug)) {
                $news->slug = Str::slug($news->title);
            }

            if ($news->status === 'published' && empty($news->published_at)) {
                $news->published_at = now();
            }
        });

        static::updating(function ($news) {
            if ($news->isDirty('title') && empty($news->slug)) {
                $news->slug = Str::slug($news->title);
            }

            if ($news->isDirty('status') && $news->status === 'published' && empty($news->published_at)) {
                $news->published_at = now();
            }
        });
    }
}
