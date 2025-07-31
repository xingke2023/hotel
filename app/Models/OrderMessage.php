<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderMessage extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'action',
        'message',
        'rating',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getActionTextAttribute(): string
    {
        return match($this->action) {
            'placed_order' => '下单',
            'confirmed' => '确认订单',
            'rejected' => '拒绝订单',
            'cancelled' => '取消订单',
            'shipped' => '发货',
            'received' => '确认收货',
            'rejected_delivery' => '拒收',
            'reviewed' => '评价',
            default => '未知操作'
        };
    }
}
