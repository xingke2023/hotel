<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\NewsCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class NewsController extends Controller
{
    // 列表页和详情页公开访问，管理操作需登录
    public function __construct()
    {
        $this->middleware('auth')->only(['create', 'store', 'edit', 'update', 'destroy']);
    }

    /**
     * 新闻列表页
     */
    public function index(Request $request)
    {
        $query = News::query()
            ->with(['category'])
            ->published()
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at');

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('excerpt', 'like', "%{$request->search}%");
            });
        }

        $news = $query->paginate(12)->withQueryString();

        $categories = NewsCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // 首页推荐（置顶 + featured，最多 5 条）
        $featured = News::published()
            ->featured()
            ->with('category')
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at')
            ->limit(5)
            ->get();

        return Inertia::render('News/Index', [
            'news'       => $news,
            'categories' => $categories,
            'featured'   => $featured,
            'filters'    => $request->only(['category', 'search']),
        ]);
    }

    /**
     * 新闻详情页
     */
    public function show(News $news)
    {
        if ($news->status !== 'published') {
            abort(404);
        }

        $news->load('category', 'user');
        $news->incrementViews();

        // 同分类相关新闻
        $related = News::published()
            ->where('id', '!=', $news->id)
            ->byCategory($news->news_category_id)
            ->orderByDesc('published_at')
            ->limit(4)
            ->get();

        return Inertia::render('News/Show', [
            'news'    => $news,
            'related' => $related,
        ]);
    }

    /**
     * 创建新闻表单（管理员）
     */
    public function create()
    {
        $categories = NewsCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('News/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * 保存新闻
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'news_category_id' => 'required|exists:news_categories,id',
            'title'            => 'required|string|max:255',
            'excerpt'          => 'nullable|string|max:500',
            'content'          => 'required|string',
            'cover_image'      => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'images'           => 'nullable|array',
            'images.*'         => 'image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'event_start_at'   => 'nullable|date',
            'event_end_at'     => 'nullable|date|after_or_equal:event_start_at',
            'venue'            => 'nullable|string|max:255',
            'external_link'    => 'nullable|url|max:500',
            'status'           => ['required', Rule::in(['draft', 'published'])],
            'is_pinned'        => 'boolean',
            'is_featured'      => 'boolean',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['slug'] = $this->generateUniqueSlug($validated['title']);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')
                ->store('news/covers', 'public');
        }

        if ($request->hasFile('images')) {
            $validated['images'] = collect($request->file('images'))
                ->map(fn ($file) => $file->store('news/images', 'public'))
                ->values()
                ->toArray();
        }

        if ($validated['status'] === 'published') {
            $validated['published_at'] = now();
        }

        $news = News::create($validated);

        return redirect()->route('news.show', $news)
            ->with('success', '新闻发布成功！');
    }

    /**
     * 编辑新闻表单（管理员）
     */
    public function edit(News $news)
    {
        $categories = NewsCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('News/Edit', [
            'news'       => $news,
            'categories' => $categories,
        ]);
    }

    /**
     * 更新新闻
     */
    public function update(Request $request, News $news)
    {
        $validated = $request->validate([
            'news_category_id' => 'required|exists:news_categories,id',
            'title'            => 'required|string|max:255',
            'excerpt'          => 'nullable|string|max:500',
            'content'          => 'required|string',
            'cover_image'      => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'images'           => 'nullable|array',
            'images.*'         => 'image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'event_start_at'   => 'nullable|date',
            'event_end_at'     => 'nullable|date|after_or_equal:event_start_at',
            'venue'            => 'nullable|string|max:255',
            'external_link'    => 'nullable|url|max:500',
            'status'           => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_pinned'        => 'boolean',
            'is_featured'      => 'boolean',
        ]);

        if ($validated['title'] !== $news->title) {
            $validated['slug'] = $this->generateUniqueSlug($validated['title'], $news->id);
        }

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')
                ->store('news/covers', 'public');
        }

        if ($request->hasFile('images')) {
            $validated['images'] = collect($request->file('images'))
                ->map(fn ($file) => $file->store('news/images', 'public'))
                ->values()
                ->toArray();
        }

        $news->update($validated);

        return redirect()->route('news.show', $news)
            ->with('success', '新闻更新成功！');
    }

    /**
     * 删除新闻
     */
    public function destroy(News $news)
    {
        $news->delete();

        return redirect()->route('news.index')
            ->with('success', '新闻已删除！');
    }

    /**
     * 生成唯一 slug
     */
    private function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 1;

        while (
            News::where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
