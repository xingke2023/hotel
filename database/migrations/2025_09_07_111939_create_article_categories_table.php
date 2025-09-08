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
        Schema::create('article_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // 分类名称
            $table->string('slug')->unique(); // URL友好的slug
            $table->text('description')->nullable(); // 分类描述
            $table->string('color', 7)->default('#3B82F6'); // 分类颜色（十六进制）
            $table->boolean('is_active')->default(true); // 是否启用
            $table->integer('sort_order')->default(0); // 排序顺序
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_categories');
    }
};
