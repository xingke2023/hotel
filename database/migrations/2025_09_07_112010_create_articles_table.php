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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // 作者
            $table->foreignId('article_category_id')->constrained()->onDelete('cascade'); // 分类
            $table->string('title'); // 标题
            $table->string('slug')->unique(); // URL友好的slug
            $table->text('excerpt')->nullable(); // 摘要
            $table->longText('content'); // 文章内容
            $table->string('featured_image')->nullable(); // 特色图片
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft'); // 状态
            $table->boolean('is_featured')->default(false); // 是否推荐
            $table->integer('views_count')->default(0); // 浏览次数
            $table->integer('likes_count')->default(0); // 点赞次数
            $table->json('tags')->nullable(); // 标签（JSON格式）
            $table->timestamp('published_at')->nullable(); // 发布时间
            $table->timestamps();
            
            // 索引
            $table->index(['status', 'published_at']);
            $table->index('user_id');
            $table->index('article_category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
