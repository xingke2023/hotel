<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCredential extends Model
{
    protected $fillable = [
        'user_id',
        'credential_id',
        'public_key',
        'attestation_object',
        'transports',
        'sign_count',
        'name',
        'last_used_at',
        'is_active',
    ];

    protected $casts = [
        'transports' => 'array',
        'sign_count' => 'integer',
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * 更新使用时间和签名计数
     */
    public function updateUsage(int $signCount): void
    {
        $this->update([
            'sign_count' => $signCount,
            'last_used_at' => now(),
        ]);
    }
}
