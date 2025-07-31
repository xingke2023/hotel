<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'house_id',
        'buyer_id',
        'seller_id',
        'price',
        'status',
        'confirmed_at',
        'shipped_at',
        'delivered_at',
        'completed_at',
        'auto_confirm_at',
        'buyer_review',
        'seller_review',
        'buyer_rating',
        'seller_rating',
        'buyer_reviewed',
        'seller_reviewed',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'completed_at' => 'datetime',
        'auto_confirm_at' => 'datetime',
        'buyer_reviewed' => 'boolean',
        'seller_reviewed' => 'boolean',
    ];

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(OrderMessage::class)->orderBy('created_at', 'asc');
    }
}
