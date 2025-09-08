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
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear existing categories
        DB::table('article_categories')->truncate();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        // Insert new categories
        $categories = [
            [
                'name' => '综合讨论区',
                'slug' => 'general-discussion',
                'description' => '澳门相关综合话题讨论',
                'color' => '#3B82F6',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '澳门故事',
                'slug' => 'macau-stories',
                'description' => '分享澳门历史、文化、生活故事',
                'color' => '#10B981',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '景点美食',
                'slug' => 'attractions-food',
                'description' => '澳门景点推荐、美食探店分享',
                'color' => '#F59E0B',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '二手交易',
                'slug' => 'second-hand-trading',
                'description' => '澳门二手物品买卖交易',
                'color' => '#EF4444',
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '澳门同城交友',
                'slug' => 'macau-friends',
                'description' => '澳门本地交友、活动组织',
                'color' => '#8B5CF6',
                'sort_order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('article_categories')->insert($categories);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // This will restore the old categories
        DB::table('article_categories')->truncate();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        $oldCategories = [
            [
                'name' => '澳门旅游',
                'slug' => 'macau-travel',
                'description' => '分享澳门旅游景点、美食、购物等攻略',
                'color' => '#3B82F6',
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '住宿推荐',
                'slug' => 'accommodation',
                'description' => '澳门酒店、民宿住宿体验分享',
                'color' => '#10B981',
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '娱乐体验',
                'slug' => 'entertainment',
                'description' => '娱乐场所、表演、夜生活体验分享',
                'color' => '#F59E0B',
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '美食探店',
                'slug' => 'food',
                'description' => '澳门特色美食、餐厅推荐',
                'color' => '#EF4444',
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '生活日记',
                'slug' => 'life',
                'description' => '澳门生活见闻、日常分享',
                'color' => '#8B5CF6',
                'sort_order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '交通出行',
                'slug' => 'transportation',
                'description' => '澳门交通、出行经验分享',
                'color' => '#06B6D4',
                'sort_order' => 6,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('article_categories')->insert($oldCategories);
    }
};
