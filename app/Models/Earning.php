<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Earning extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'title',
        'description',
        'related_order_id',
        'related_house_id',
        'status',
        'earned_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'earned_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function relatedOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'related_order_id');
    }

    public function relatedHouse(): BelongsTo
    {
        return $this->belongsTo(House::class, 'related_house_id');
    }

    public function getTypeTextAttribute(): string
    {
        $typeMap = [
            'house_sale' => '房屋销售收入',
            'referral_commission' => '推荐佣金',
            'platform_sale' => '平台回购收入',
        ];

        return $typeMap[$this->type] ?? $this->type;
    }
}
