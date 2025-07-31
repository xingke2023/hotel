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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained()->onDelete('cascade');
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->decimal('price', 10, 2); // 订单价格
            $table->enum('status', ['pending', 'confirmed', 'delivering', 'delivered', 'completed', 'cancelled'])->default('pending');
            $table->timestamp('confirmed_at')->nullable(); // 商户确认时间
            $table->timestamp('delivered_at')->nullable(); // 交付时间
            $table->timestamp('completed_at')->nullable(); // 完成时间
            $table->timestamp('auto_confirm_at')->nullable(); // 自动确认时间（24小时后）
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
