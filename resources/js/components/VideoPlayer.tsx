import React, { useRef, useEffect, useState } from 'react';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, BookmarkIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

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

interface VideoPlayerProps {
  video: Video;
  isActive: boolean;
  onLike: () => void;
  onView: () => void;
}

export default function VideoPlayer({ video, isActive, onLike, onView }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);

  // 当视频变为活动状态时自动播放
  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        onView();
      }).catch(console.error);
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, onView, volume, isMuted]);

  // 处理视频播放/暂停
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  // 处理点赞
  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike();
  };

  // 处理分享
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description || '观看这个精彩视频！',
        url: window.location.href,
      });
    } else {
      // 降级方案：复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  // 处理静音切换
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
    }
  };

  // 处理音量调节
  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      setVolume(newVolume);
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  // 格式化数字显示
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // 格式化时间显示
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 视频时间更新
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    
    setCurrentTime(current);
    setDuration(total);
    setProgress((current / total) * 100);
  };

  // 视频结束处理
  const handleVideoEnd = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // 显示/隐藏控制栏
  const toggleControls = () => {
    setShowControls(!showControls);
    
    // 3秒后自动隐藏控制栏
    if (!showControls) {
      setTimeout(() => setShowControls(false), 3000);
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* 视频播放器 */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={video.video_url}
        poster={video.thumbnail_url}
        loop
        playsInline
        volume={volume}
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        onLoadedMetadata={handleTimeUpdate}
        onClick={toggleControls}
      />

      {/* 播放/暂停覆盖层 */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={togglePlayPause}
      >
        {!isPlaying && (
          <div className="w-20 h-20 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-2" />
          </div>
        )}
      </div>

      {/* 右侧操作按钮 */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6 z-10">
        {/* 用户头像 */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
            {video.user.avatar ? (
              <img 
                src={video.user.avatar} 
                alt={video.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {video.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">+</span>
          </div>
        </div>

        {/* 点赞按钮 */}
        <div className="flex flex-col items-center">
          <button 
            onClick={handleLike}
            className="p-3 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-all duration-200"
          >
            {isLiked ? (
              <HeartSolidIcon className="w-8 h-8 text-red-500" />
            ) : (
              <HeartIcon className="w-8 h-8 text-white" />
            )}
          </button>
          <span className="text-white text-sm mt-1">
            {formatNumber(video.likes_count + (isLiked ? 1 : 0))}
          </span>
        </div>

        {/* 评论按钮 */}
        <div className="flex flex-col items-center">
          <button className="p-3 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-all duration-200">
            <ChatBubbleLeftIcon className="w-8 h-8 text-white" />
          </button>
          <span className="text-white text-sm mt-1">
            {formatNumber(video.comments_count)}
          </span>
        </div>

        {/* 分享按钮 */}
        <div className="flex flex-col items-center">
          <button 
            onClick={handleShare}
            className="p-3 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-all duration-200"
          >
            <ShareIcon className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* 收藏按钮 */}
        <div className="flex flex-col items-center">
          <button className="p-3 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-all duration-200">
            <BookmarkIcon className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* 音量控制 */}
        <div className="flex flex-col items-center">
          <button 
            onClick={toggleMute}
            className="p-3 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-all duration-200"
          >
            {isMuted || volume === 0 ? (
              <SpeakerXMarkIcon className="w-8 h-8 text-white" />
            ) : (
              <SpeakerWaveIcon className="w-8 h-8 text-white" />
            )}
          </button>
          
          {/* 音量滑块 */}
          <div className="mt-2 h-20 w-1 bg-gray-600 rounded-full relative">
            <div 
              className="absolute bottom-0 w-full bg-white rounded-full transition-all duration-200"
              style={{ height: `${isMuted ? 0 : volume * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ 
                writingMode: 'bt-lr', /* IE */
                WebkitAppearance: 'slider-vertical' /* WebKit */
              }}
            />
          </div>
        </div>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent z-10">
        <div className="max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-white font-bold">@{video.user.name}</span>
          </div>
          <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-white text-sm opacity-90 line-clamp-3">
              {video.description}
            </p>
          )}
          
          {/* 播放统计 */}
          <div className="flex items-center space-x-4 mt-2 text-white text-sm opacity-75">
            <span>{formatNumber(video.views_count)} 播放</span>
            {duration > 0 && (
              <span>{formatTime(duration)}</span>
            )}
          </div>
        </div>
      </div>

      {/* 进度条（当显示控制栏时） */}
      {showControls && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <div className="flex items-center space-x-2 text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}