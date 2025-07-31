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
        Schema::create('user_referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade'); // 推荐人
            $table->foreignId('referred_id')->constrained('users')->onDelete('cascade'); // 被推荐人
            $table->string('referral_code'); // 推荐码
            $table->timestamp('referred_at'); // 推荐时间
            $table->timestamps();
            
            $table->unique(['referrer_id', 'referred_id']); // 确保同一个人不能被同一个推荐人重复推荐
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_referrals');
    }
};
