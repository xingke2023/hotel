<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 只添加新的取消状态到orders表ENUM，保留所有现有状态
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'shipped', 'received', 'rejected', 'cancelled', 'user_cancelled', 'seller_cancelled', 'rejected_delivery', 'delivering', 'delivered', 'completed') NOT NULL DEFAULT 'pending'");
        
        // 只添加新的取消状态到houses表ENUM，保留所有现有状态包括sold等
        DB::statement("ALTER TABLE houses MODIFY COLUMN status ENUM('available', 'pending', 'confirmed', 'shipped', 'received', 'suspended', 'sold', 'user_cancelled', 'seller_cancelled') NOT NULL DEFAULT 'available'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 回滚时将user_cancelled和seller_cancelled合并回cancelled，suspended保持不变
        DB::statement("UPDATE orders SET status = 'cancelled' WHERE status IN ('user_cancelled', 'seller_cancelled')");
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'shipped', 'received', 'rejected', 'cancelled', 'rejected_delivery') NOT NULL DEFAULT 'pending'");
        
        DB::statement("UPDATE houses SET status = 'suspended' WHERE status IN ('user_cancelled', 'seller_cancelled')");
        DB::statement("ALTER TABLE houses MODIFY COLUMN status ENUM('available', 'pending', 'confirmed', 'shipped', 'received', 'suspended') NOT NULL DEFAULT 'available'");
    }
};
