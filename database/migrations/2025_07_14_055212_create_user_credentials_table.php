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
        Schema::create('user_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('credential_id')->unique(); // Base64编码的凭据ID
            $table->text('public_key'); // 公钥数据
            $table->text('attestation_object')->nullable(); // 认证对象
            $table->json('transports')->nullable(); // 支持的传输方式
            $table->integer('sign_count')->default(0); // 签名计数器
            $table->string('name')->nullable(); // 凭据名称
            $table->timestamp('last_used_at')->nullable(); // 最后使用时间
            $table->boolean('is_active')->default(true); // 是否激活
            $table->timestamps();
            
            $table->index(['user_id', 'is_active']);
            $table->index('credential_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_credentials');
    }
};
