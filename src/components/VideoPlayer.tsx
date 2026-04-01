'use client';

import { forwardRef, useEffect, useCallback } from 'react';

interface Props {
  src: string;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
}

const VideoPlayer = forwardRef<HTMLVideoElement, Props>(
  ({ src, onTimeUpdate, onDurationChange, onPlayStateChange }, ref) => {
    const handleTimeUpdate = useCallback(
      (e: Event) => {
        const video = e.target as HTMLVideoElement;
        onTimeUpdate?.(video.currentTime);
      },
      [onTimeUpdate]
    );

    const handleMetadata = useCallback(
      (e: Event) => {
        const video = e.target as HTMLVideoElement;
        onDurationChange?.(video.duration);
      },
      [onDurationChange]
    );

    useEffect(() => {
      const el = (ref as React.RefObject<HTMLVideoElement>)?.current;
      if (!el) return;

      el.addEventListener('loadedmetadata', handleMetadata);
      el.addEventListener('play', () => onPlayStateChange?.(true));
      el.addEventListener('pause', () => onPlayStateChange?.(false));

      // Use requestAnimationFrame for high-frequency time updates during playback
      let rafId: number;
      const tick = () => {
        if (el && !el.paused) {
          onTimeUpdate?.(el.currentTime);
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      // Also update on seek when paused
      el.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        cancelAnimationFrame(rafId);
        el.removeEventListener('loadedmetadata', handleMetadata);
        el.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }, [ref, handleTimeUpdate, handleMetadata, onPlayStateChange, onTimeUpdate]);

    return (
      <video
        ref={ref}
        src={src || undefined}
        className="w-full h-full object-contain bg-black"
        playsInline
        preload="auto"
      />
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
