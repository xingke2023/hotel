<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');                         // 分类名称
            $table->string('slug')->unique();               // URL slug
            $table->text('description')->nullable();        // 分类描述
            $table->string('icon')->nullable();             // 图标（emoji 或 icon class）
            $table->string('color', 7)->default('#3B82F6'); // 标签颜色
            $table->boolean('is_active')->default(true);    // 是否启用
            $table->integer('sort_order')->default(0);      // 排序
            $table->timestamps();
        });

        // 初始分类
        DB::table('news_categories')->insert([
            [
                'name'        => '澳门旅游攻略',
                'slug'        => 'travel-guide',
                'description' => '澳门景点、交通、签注、行程规划等旅游攻略',
                'icon'        => '🗺️',
                'color'       => '#3B82F6',
                'sort_order'  => 1,
                'is_active'   => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => '最新优惠汇总',
                'slug'        => 'promotions',
                'description' => '酒店、餐饮、娱乐等最新折扣与优惠活动',
                'icon'        => '🎁',
                'color'       => '#EF4444',
                'sort_order'  => 2,
                'is_active'   => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'name'        => '近期演唱会',
                'slug'        => 'concerts',
                'description' => '澳门近期演唱会、表演、展览等活动资讯',
                'icon'        => '🎤',
                'color'       => '#8B5CF6',
                'sort_order'  => 3,
                'is_active'   => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('news_categories');
    }
};
