<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\House;
use App\Models\Video;
use Carbon\Carbon;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class SitemapController extends Controller
{
    public function index()
    {
        $sitemap = Sitemap::create();

        // 首页 - 最高优先级
        $sitemap->add(
            Url::create(route('home'))
                ->setLastModificationDate(Carbon::now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                ->setPriority(1.0)
        );

        // 房源列表页 - 高优先级
        $sitemap->add(
            Url::create(route('houses'))
                ->setLastModificationDate(Carbon::now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_HOURLY)
                ->setPriority(0.9)
        );

        // 视频页面
        $sitemap->add(
            Url::create(route('videos'))
                ->setLastModificationDate(Carbon::now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                ->setPriority(0.8)
        );

        // 文章列表页
        $sitemap->add(
            Url::create(route('articles.index'))
                ->setLastModificationDate(Carbon::now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
                ->setPriority(0.8)
        );

        // 投资工具页面
        $sitemap->add(
            Url::create(route('investment-tools'))
                ->setLastModificationDate(Carbon::now())
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                ->setPriority(0.7)
        );

        // 计算器页面
        $calculators = [
            'calculator', 'calculator1', 'calculator2', 'calculator3',
            'calculator4', 'calculator5', 'calculator6', 'calculator7',
            'calculator8', 'calculator21', 'calculator71'
        ];

        foreach ($calculators as $calculator) {
            $sitemap->add(
                Url::create(route($calculator))
                    ->setLastModificationDate(Carbon::now())
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
                    ->setPriority(0.6)
            );
        }

        // 添加所有可用的房源
        House::where('status', 'available')
            ->orderBy('updated_at', 'desc')
            ->chunk(100, function ($houses) use ($sitemap) {
                foreach ($houses as $house) {
                    // 注意：需要确保有房源详情页路由
                    // 如果没有，可以跳过或创建一个
                    // $sitemap->add(
                    //     Url::create(route('houses.show', $house))
                    //         ->setLastModificationDate($house->updated_at)
                    //         ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                    //         ->setPriority(0.7)
                    // );
                }
            });

        // 添加所有文章
        Article::orderBy('updated_at', 'desc')
            ->chunk(100, function ($articles) use ($sitemap) {
                foreach ($articles as $article) {
                    $sitemap->add(
                        Url::create(route('articles.show', $article))
                            ->setLastModificationDate($article->updated_at)
                            ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
                            ->setPriority(0.7)
                    );
                }
            });

        return $sitemap->toResponse(request());
    }
}
