<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\ArticleCategory;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 找到发布人
        $user = User::where('email', 'dev2@xingke888.com')->first();
        if (!$user) {
            $this->command->error('User dev2@xingke888.com not found!');
            return;
        }

        // 获取所有分类
        $categories = ArticleCategory::all();
        if ($categories->isEmpty()) {
            $this->command->error('No article categories found!');
            return;
        }

        // 18篇文章的标题
        $articleTitles = [
            // 澳门旅游 (3篇)
            '澳门大三巴牌坊游览攻略，必看的历史遗迹',
            '漫步澳门历史城区，感受东西方文化交融',
            '澳门观光塔体验记：240米高空的震撼视野',
            
            // 住宿推荐 (3篇)  
            '澳门威尼斯人酒店住宿体验：奢华与便利并存',
            '澳门半岛精品酒店推荐：性价比超高的住宿选择',
            '路氹金沙城中心住宿攻略：购物娱乐一站式',
            
            // 娱乐体验 (3篇)
            '新濠天地水舞间表演：震撼人心的视听盛宴',
            '澳门赌场初体验：百家乐入门指南',
            '澳门夜生活指南：酒吧街和夜市推荐',
            
            // 美食探店 (3篇)
            '澳门茶餐厅巡礼：地道港式茶餐厅推荐',
            '澳门葡国菜精选：正宗葡式烤鸡和马介休',
            '议事亭前地美食街：必尝的澳门小吃',
            
            // 生活日记 (3篇)
            '在澳门生活一年的感悟：小城大世界',
            '澳门工作日常：金融区的忙碌与宁静',
            '澳门四季变化：亚热带气候下的生活节奏',
            
            // 交通出行 (3篇)
            '澳门公交完全攻略：如何用巴士游遍全城',
            '港澳码头到市区交通指南：最便捷的出行方式',
            '澳门出租车使用心得：打车注意事项和价格'
        ];

        foreach ($articleTitles as $index => $title) {
            // 按分类循环分配，每个分类3篇
            $categoryIndex = intval($index / 3) % $categories->count();
            $category = $categories->get($categoryIndex);
            
            // 生成唯一的slug
            $slug = 'article-' . ($index + 1) . '-' . time();
            
            Article::create([
                'user_id' => $user->id,
                'article_category_id' => $category->id,
                'title' => $title,
                'slug' => $slug,
                'content' => $title, // 内容和标题一样
                'status' => 'published',
                'published_at' => now()->subDays(rand(1, 30)), // 随机发布时间（1-30天前）
                'views_count' => rand(10, 500), // 随机浏览量
                'likes_count' => rand(0, 50), // 随机点赞数
                'tags' => $this->generateRandomTags($category->name), // 根据分类生成标签
            ]);
        }

        $this->command->info('Successfully created 18 articles for dev2@xingke888.com');
    }

    /**
     * 根据分类生成随机标签
     */
    private function generateRandomTags($categoryName): array
    {
        $tagMap = [
            '澳门旅游' => ['景点', '攻略', '历史', '文化', '观光'],
            '住宿推荐' => ['酒店', '住宿', '体验', '服务', '位置'],
            '娱乐体验' => ['表演', '娱乐', '夜生活', '体验', '推荐'],
            '美食探店' => ['美食', '餐厅', '小吃', '地道', '推荐'],
            '生活日记' => ['生活', '日常', '感悟', '分享', '体验'],
            '交通出行' => ['交通', '出行', '攻略', '便民', '实用']
        ];

        $availableTags = $tagMap[$categoryName] ?? ['分享', '体验'];
        
        // 随机选择2-4个标签
        $numTags = rand(2, 4);
        $selectedTags = array_rand(array_flip($availableTags), min($numTags, count($availableTags)));
        
        return is_array($selectedTags) ? $selectedTags : [$selectedTags];
    }
}
