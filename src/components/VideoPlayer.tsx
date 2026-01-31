// File: src/components/VideoPlayer.tsx
// Updated for Build 6: Video Progress Tracking with Throttled Persistence

'use client';

import { useEffect, useRef, useState } from 'react';
import { Episode } from '@/lib/episodes';
import { saveVideoProgress, getVideoProgress, markEpisodeComplete } from '@/lib/firestore-service';
import { getUserId } from '@/lib/auth-service';

interface VideoPlayerProps {
  episode: Episode;
  onComplete?: () => void;
}

export default function VideoPlayer({ episode, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);

  // Refs for throttling
  const lastSaveTime = useRef<number>(0);
  const saveInterval = useRef<NodeJS.Timeout | null>(null);
  const hasMarkedComplete = useRef<boolean>(false);

  // Load saved progress when episode changes
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          setHasLoadedProgress(true);
          return;
        }

        const progress = await getVideoProgress(userId, episode.id);

        if (progress && progress.lastPosition > 0 && videoRef.current) {
          // Only resume if not already completed and has meaningful progress (> 5 seconds)
          if (!progress.isCompleted && progress.lastPosition > 5) {
            videoRef.current.currentTime = progress.lastPosition;
            console.log(`Resumed from ${progress.lastPosition}s`);
          }
        }

        setHasLoadedProgress(true);
      } catch (error) {
        console.error('Error loading progress:', error);
        setHasLoadedProgress(true);
      }
    };

    // Reset completion flag when episode changes
    hasMarkedComplete.current = false;
    setHasLoadedProgress(false);

    loadProgress();
  }, [episode.id]);

  // Throttled save function - saves every 15 seconds
  const throttledSave = async (position: number) => {
    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTime.current;

    // Save if 15 seconds have passed since last save
    if (timeSinceLastSave >= 15000) {
      const userId = getUserId();
      if (!userId) return;

      try {
        await saveVideoProgress(userId, episode.id, {
          lastPosition: position,
          isCompleted: false,
        });
        lastSaveTime.current = now;
        console.log(`Progress auto-saved at ${position}s`);
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  };

  // Handle time update - fires every second
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      const dur = videoRef.current.duration;

      setCurrentTime(time);
      setDuration(dur);

      // Only start tracking after progress has loaded
      if (hasLoadedProgress) {
        // Throttled save
        throttledSave(time);

        // Check for 90% completion threshold
        if (dur > 0 && time / dur >= 0.9 && !hasMarkedComplete.current) {
          handleCompletion(time);
        }
      }
    }
  };

  // Handle completion (90% threshold or video ended)
  const handleCompletion = async (position: number) => {
    if (hasMarkedComplete.current) return;

    hasMarkedComplete.current = true;

    const userId = getUserId();
    if (!userId) return;

    try {
      await markEpisodeComplete(userId, episode.id, position);
      console.log(`Episode ${episode.id} marked complete at ${position}s`);

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error marking complete:', error);
    }
  };

  // Save progress when user pauses
  const handlePause = async () => {
    setIsPlaying(false);

    if (videoRef.current && hasLoadedProgress) {
      const userId = getUserId();
      if (!userId) return;

      const position = videoRef.current.currentTime;
      try {
        await saveVideoProgress(userId, episode.id, {
          lastPosition: position,
          isCompleted: false,
        });
        console.log(`Progress saved on pause at ${position}s`);
      } catch (error) {
        console.error('Error saving on pause:', error);
      }
    }
  };

  // Save progress when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      if (videoRef.current && hasLoadedProgress) {
        const userId = getUserId();
        if (!userId) return;

        const position = videoRef.current.currentTime;
        // Use synchronous save for unmount
        saveVideoProgress(userId, episode.id, {
          lastPosition: position,
          isCompleted: false,
        }).catch(console.error);
      }
    };
  }, [episode.id, hasLoadedProgress]);

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      {/* Video Container */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
        <video
          ref={videoRef}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onPause={handlePause}
          onPlay={() => setIsPlaying(true)}
          onEnded={() => handleCompletion(duration)}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
        >
          <source src={episode.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Play Button Overlay (shown when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <button
              onClick={handlePlayPause}
              className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Video Controls */}
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Time Display */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
}
