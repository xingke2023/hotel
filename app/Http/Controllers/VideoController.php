<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VideoController extends Controller
{
    public function index()
    {
        return Inertia::render('Videos');
    }

    public function getVideos(Request $request)
    {
        $page = $request->input('page', 1);
        $limit = 10;
        
        $videos = Video::with('user')
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->offset(($page - 1) * $limit)
            ->limit($limit)
            ->get()
            ->map(function ($video) {
                return [
                    'id' => $video->id,
                    'title' => $video->title,
                    'description' => $video->description,
                    'video_url' => $video->video_url,
                    'thumbnail_url' => $video->thumbnail_url,
                    'likes_count' => $video->likes_count,
                    'comments_count' => $video->comments_count,
                    'views_count' => $video->views_count,
                    'duration' => $video->duration,
                    'user' => [
                        'id' => $video->user->id,
                        'name' => $video->user->name,
                        'avatar' => $video->user->avatar_url ?? null,
                    ],
                ];
            });

        return response()->json($videos);
    }

    public function incrementViews(Video $video)
    {
        $video->incrementViews();
        return response()->json(['views_count' => $video->views_count]);
    }

    public function toggleLike(Video $video)
    {
        $video->incrementLikes();
        return response()->json(['likes_count' => $video->likes_count]);
    }
}
