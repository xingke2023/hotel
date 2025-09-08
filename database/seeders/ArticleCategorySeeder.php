<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ArticleCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => '综合讨论区',
                'slug' => 'general-discussion',
                'description' => '澳门相关综合话题讨论',
                'color' => '#3B82F6',
                'sort_order' => 1,
            ],
            [
                'name' => '澳门故事',
                'slug' => 'macau-stories',
                'description' => '分享澳门历史、文化、生活故事',
                'color' => '#10B981',
                'sort_order' => 2,
            ],
            [
                'name' => '景点美食',
                'slug' => 'attractions-food',
                'description' => '澳门景点推荐、美食探店分享',
                'color' => '#F59E0B',
                'sort_order' => 3,
            ],
            [
                'name' => '二手交易',
                'slug' => 'second-hand-trading',
                'description' => '澳门二手物品买卖交易',
                'color' => '#EF4444',
                'sort_order' => 4,
            ],
            [
                'name' => '澳门同城交友',
                'slug' => 'macau-friends',
                'description' => '澳门本地交友、活动组织',
                'color' => '#8B5CF6',
                'sort_order' => 5,
            ],
        ];

        foreach ($categories as $category) {
            \App\Models\ArticleCategory::create($category);
        }
        
        $this->command->info('文章分类已创建完成');
    }
}
