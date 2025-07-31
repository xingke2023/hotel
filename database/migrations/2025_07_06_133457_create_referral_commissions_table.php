<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('referral_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade'); // 推荐人
            $table->foreignId('referred_user_id')->constrained('users')->onDelete('cascade'); // 被推荐人
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade'); // 相关订单
            $table->decimal('order_amount', 10, 2); // 订单金额
            $table->decimal('commission_rate', 5, 2)->default(10.00); // 佣金比例(%)
            $table->decimal('commission_amount', 10, 2); // 佣金金额
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending'); // 佣金状态
            $table->timestamp('earned_at'); // 佣金产生时间
            $table->timestamp('paid_at')->nullable(); // 佣金支付时间
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_commissions');
    }
};
