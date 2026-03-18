<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->foreignId('news_category_id')->constrained()->onDelete('cascade'); // 所属分类
            $table->foreignId('user_id')->constrained()->onDelete('cascade');          // 发布人（管理员）

            // 基本内容
            $table->string('title');                        // 标题
            $table->string('slug')->unique();               // URL slug
            $table->text('excerpt')->nullable();            // 摘要（列表页展示）
            $table->longText('content');                    // 正文（支持图文富文本）
            $table->string('cover_image')->nullable();      // 封面图
            $table->json('images')->nullable();             // 图集（多图）

            // 活动/优惠专用字段
            $table->timestamp('event_start_at')->nullable(); // 活动开始时间
            $table->timestamp('event_end_at')->nullable();   // 活动结束时间（过期自动归档）
            $table->string('venue')->nullable();             // 活动场所/地点
            $table->string('external_link')->nullable();     // 外部购票/详情链接

            // 状态与展示
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft'); // 状态
            $table->boolean('is_pinned')->default(false);   // 是否置顶
            $table->boolean('is_featured')->default(false); // 是否推荐（首页展示）
            $table->integer('sort_order')->default(0);      // 手动排序权重
            $table->integer('views_count')->default(0);     // 浏览次数
            $table->timestamp('published_at')->nullable();  // 发布时间

            $table->timestamps();

            // 索引
            $table->index(['status', 'published_at']);
            $table->index(['news_category_id', 'status']);
            $table->index('is_pinned');
            $table->index('is_featured');
            $table->index(['event_start_at', 'event_end_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
