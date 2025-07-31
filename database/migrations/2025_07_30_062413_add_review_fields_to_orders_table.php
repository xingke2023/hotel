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
        Schema::table('orders', function (Blueprint $table) {
            $table->text('buyer_review')->nullable()->comment('买家评语');
            $table->text('seller_review')->nullable()->comment('卖家评语');
            $table->enum('buyer_rating', ['好', '中', '差'])->nullable()->comment('买家评分');
            $table->enum('seller_rating', ['好', '中', '差'])->nullable()->comment('卖家评分（给买家打分）');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['buyer_review', 'seller_review', 'buyer_rating', 'seller_rating']);
        });
    }
};
