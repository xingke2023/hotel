<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = \App\Models\User::all();
        $articles = \App\Models\Article::published()->get();

        if ($users->isEmpty() || $articles->isEmpty()) {
            $this->command->info('需要先有用户和文章才能创建评论');
            return;
        }

        foreach ($articles as $article) {
            // 为每篇文章创建 2-5 个评论
            $commentCount = rand(2, 5);
            
            for ($i = 0; $i < $commentCount; $i++) {
                $comment = \App\Models\Comment::create([
                    'article_id' => $article->id,
                    'user_id' => $users->random()->id,
                    'content' => $this->getRandomComment(),
                    'status' => 'approved',
                    'likes_count' => rand(0, 10),
                    'published_at' => now()->subDays(rand(0, 30)),
                ]);

                // 30% 的概率为评论添加回复
                if (rand(1, 100) <= 30) {
                    \App\Models\Comment::create([
                        'article_id' => $article->id,
                        'user_id' => $users->random()->id,
                        'parent_id' => $comment->id,
                        'content' => $this->getRandomReply(),
                        'status' => 'approved',
                        'likes_count' => rand(0, 5),
                        'published_at' => now()->subDays(rand(0, 20)),
                    ]);
                }
            }
        }

        $this->command->info('评论数据已创建完成');
    }

    private function getRandomComment(): string
    {
        $comments = [
            '非常有用的分享，感谢作者！',
            '这个观点很有趣，我有不同的看法...',
            '澳门确实是个特别的地方，有很多值得探索的。',
            '作者写得很详细，对我帮助很大。',
            '想了解更多相关信息，有推荐的资源吗？',
            '我也有类似的经历，深有同感。',
            '数据很有说服力，支持作者的结论。',
            '希望能看到更多这类文章！',
            '作为澳门本地人，我觉得这个分析很准确。',
            '这篇文章解答了我很多疑问，太棒了！',
        ];

        return $comments[array_rand($comments)];
    }

    private function getRandomReply(): string
    {
        $replies = [
            '同意你的观点！',
            '我也是这么想的。',
            '谢谢分享！',
            '很有道理。',
            '学到了很多。',
            '非常赞同！',
            '说得对！',
            '很好的补充。',
        ];

        return $replies[array_rand($replies)];
    }
}
