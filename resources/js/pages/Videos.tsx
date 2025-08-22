import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import VideoPlayer from '../components/VideoPlayer';

interface User {
  id: number;
  name: string;
  avatar?: string;
}

interface Video {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  duration?: number;
  user: User;
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<'up' | 'down' | null>(null);

  const fetchVideos = async (pageNum: number = 1) => {
    try {
      const response = await fetch(`/api/videos?page=${pageNum}`);
      const newVideos = await response.json();
      
      if (newVideos.length === 0) {
        setHasMore(false);
        return;
      }

      if (pageNum === 1) {
        setVideos(newVideos);
      } else {
        setVideos(prev => [...prev, ...newVideos]);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(1);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    touchEndY.current = e.touches[0].clientY;
    
    // 实时跟随手指移动
    const deltaY = touchStartY.current - touchEndY.current;
    const maxDelta = window.innerHeight * 0.3; // 限制最大拖拽距离
    const clampedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaY));
    setTranslateY(-clampedDelta); // 负值因为我们要反向移动
  };

  const handleTouchEnd = () => {
    if (isTransitioning) return;
    
    const deltaY = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 80;
    
    // 重置位置
    setTranslateY(0);

    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) {
        // 上滑 - 下一个视频
        handleNextVideo();
      } else {
        // 下滑 - 上一个视频
        handlePreviousVideo();
      }
    }
  };

  const handleNextVideo = () => {
    if (isTransitioning || currentVideoIndex >= videos.length - 1) return;
    
    setIsTransitioning(true);
    setTransitionDirection('up');
    
    // 滑动效果：当前视频向上移动，下一个视频从下方进入
    setTimeout(() => {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setIsTransitioning(false);
      setTransitionDirection(null);
      
      // 如果接近视频列表末尾，加载更多视频
      if (currentVideoIndex >= videos.length - 3 && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchVideos(nextPage);
      }
    }, 300); // 动画持续时间
  };

  const handlePreviousVideo = () => {
    if (isTransitioning || currentVideoIndex <= 0) return;
    
    setIsTransitioning(true);
    setTransitionDirection('down');
    
    // 滑动效果：当前视频向下移动，上一个视频从上方进入
    setTimeout(() => {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, 300); // 动画持续时间
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePreviousVideo();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextVideo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentVideoIndex, videos.length]);

  const handleVideoLike = async (videoId: number) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      
      const data = await response.json();
      
      // 更新本地视频数据
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, likes_count: data.likes_count }
          : video
      ));
    } catch (error) {
      console.error('Failed to like video:', error);
    }
  };

  const handleVideoView = async (videoId: number) => {
    try {
      await fetch(`/api/videos/${videoId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
    } catch (error) {
      console.error('Failed to increment video views:', error);
    }
  };

  if (loading && videos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Head title="视频" />
        <div className="text-white text-lg">加载视频中...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Head title="视频" />
        <div className="text-white text-lg">暂无视频</div>
      </div>
    );
  }

  // 计算要显示的视频（当前、前一个、后一个）
  const getVisibleVideos = () => {
    const visibleVideos = [];
    
    // 前一个视频
    if (currentVideoIndex > 0) {
      visibleVideos.push({
        video: videos[currentVideoIndex - 1],
        index: currentVideoIndex - 1,
        position: 'previous'
      });
    }
    
    // 当前视频
    if (videos[currentVideoIndex]) {
      visibleVideos.push({
        video: videos[currentVideoIndex],
        index: currentVideoIndex,
        position: 'current'
      });
    }
    
    // 下一个视频
    if (currentVideoIndex < videos.length - 1) {
      visibleVideos.push({
        video: videos[currentVideoIndex + 1],
        index: currentVideoIndex + 1,
        position: 'next'
      });
    }
    
    return visibleVideos;
  };

  const visibleVideos = getVisibleVideos();

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Head title="视频" />
      
      {/* 视频容器 */}
      <div className="relative w-full h-full">
        {visibleVideos.map(({ video, index, position }) => {
          let transform = '';
          let zIndex = 1;
          
          // 计算位置和动画
          if (position === 'previous') {
            if (isTransitioning && transitionDirection === 'down') {
              transform = 'translateY(0)'; // 下滑时，前一个视频移动到当前位置
              zIndex = 2;
            } else {
              transform = `translateY(-100vh)${translateY > 0 ? ` translateY(${translateY}px)` : ''}`;
              zIndex = 1;
            }
          } else if (position === 'current') {
            if (isTransitioning) {
              if (transitionDirection === 'up') {
                transform = 'translateY(-100vh)'; // 上滑时，当前视频向上移出
              } else {
                transform = 'translateY(100vh)'; // 下滑时，当前视频向下移出
              }
              zIndex = 1;
            } else {
              transform = `translateY(${translateY}px)`;
              zIndex = 2;
            }
          } else if (position === 'next') {
            if (isTransitioning && transitionDirection === 'up') {
              transform = 'translateY(0)'; // 上滑时，下一个视频移动到当前位置
              zIndex = 2;
            } else {
              transform = `translateY(100vh)${translateY < 0 ? ` translateY(${translateY}px)` : ''}`;
              zIndex = 1;
            }
          }

          return (
            <div
              key={`${index}-${position}`}
              className={`absolute inset-0 w-full h-full transition-transform duration-300 ease-out ${
                isTransitioning ? 'transition-transform' : ''
              }`}
              style={{
                transform,
                zIndex
              }}
            >
              <VideoPlayer
                video={video}
                isActive={position === 'current'}
                onLike={() => handleVideoLike(video.id)}
                onView={() => handleVideoView(video.id)}
              />
            </div>
          );
        })}
      </div>

      {/* 视频指示器 */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <div className="flex flex-col space-y-2">
          {videos.slice(Math.max(0, currentVideoIndex - 2), currentVideoIndex + 3).map((_, index) => {
            const actualIndex = Math.max(0, currentVideoIndex - 2) + index;
            return (
              <div
                key={actualIndex}
                className={`w-2 h-8 rounded-full transition-all duration-300 ${
                  actualIndex === currentVideoIndex 
                    ? 'bg-white' 
                    : 'bg-gray-500'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 滑动提示（仅在第一个视频时显示） */}
      {currentVideoIndex === 0 && !isTransitioning && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 text-white text-center">
          <div className="bg-black bg-opacity-50 px-4 py-2 rounded-full">
            <div className="text-sm">向上滑动查看更多视频</div>
            <div className="animate-bounce mt-2">
              ↑
            </div>
          </div>
        </div>
      )}
    </div>
  );
}