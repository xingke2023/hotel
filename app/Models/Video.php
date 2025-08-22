<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Video extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'video_url',
        'thumbnail_url',
        'likes_count',
        'comments_count',
        'views_count',
        'duration',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'views_count' => 'integer',
        'duration' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function incrementLikes(): void
    {
        $this->increment('likes_count');
    }
}
