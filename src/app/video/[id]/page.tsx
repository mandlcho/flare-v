'use client';

import { use, useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { VideoAnnotatorProvider, useVideoAnnotator } from '@/store/VideoAnnotatorContext';
import { ToolType } from '@/types';
import VideoPlayer from '@/components/VideoPlayer';
import CanvasOverlay, { CanvasOverlayHandle } from '@/components/CanvasOverlay';
import DrawingToolbar from '@/components/DrawingToolbar';
import Timeline from '@/components/Timeline';
import CommentPanel from '@/components/CommentPanel';
import PlaybackControls from '@/components/PlaybackControls';
import ShareButton from '@/components/ShareButton';
import UserSetup from '@/components/UserSetup';
import NotificationBell from '@/components/NotificationBell';

function VideoWorkspace({ videoId }: { videoId: string }) {
  const {
    state,
    currentUser,
    dispatch,
    addAnnotation,
    addComment,
    deleteAnnotation,
    deleteComment,
  } = useVideoAnnotator();
  const searchParams = useSearchParams();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<CanvasOverlayHandle>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [strokeColor, setStrokeColor] = useState('#EF4444');
  const [hasDrawing, setHasDrawing] = useState(false);

  const video = state.videos.find((v) => v.id === videoId);
  const annotations = state.annotations.filter((a) => a.videoId === videoId);
  const comments = state.comments.filter((c) => c.videoId === videoId);

  useEffect(() => {
    const t = searchParams.get('t');
    if (t && videoRef.current) {
      const time = parseFloat(t);
      if (!isNaN(time)) {
        videoRef.current.currentTime = time;
      }
    }
  }, [searchParams]);

  const handleDurationChange = useCallback(
    (dur: number) => {
      setDuration(dur);
      if (video && video.duration === 0) {
        dispatch({ type: 'UPDATE_VIDEO_DURATION', payload: { id: videoId, duration: dur } });
      }
    },
    [video, videoId, dispatch]
  );

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleTogglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, []);

  const handleStop = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setCurrentTime(0);
  }, []);

  const handleStepBackward = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, v.currentTime - 5);
    setCurrentTime(v.currentTime);
  }, []);

  const handleStepForward = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(v.duration || 0, v.currentTime + 5);
    setCurrentTime(v.currentTime);
  }, []);

  const handleSaveAnnotation = useCallback(() => {
    if (!canvasRef.current || !currentUser) return;
    const json = canvasRef.current.toJSON();
    if (!json) return;

    const annotation = addAnnotation(videoId, currentTime, json);
    addComment(videoId, currentTime, `Added annotation`, annotation.id);
    canvasRef.current.clear();
    setActiveTool(null);
    setHasDrawing(false);
  }, [videoId, currentTime, currentUser, addAnnotation, addComment]);

  const handleClearCanvas = useCallback(() => {
    canvasRef.current?.clear();
    setHasDrawing(false);
  }, []);

  const handleAddComment = useCallback(
    (text: string) => {
      addComment(videoId, currentTime, text);
    },
    [videoId, currentTime, addComment]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (canvasRef.current) {
        setHasDrawing(canvasRef.current.hasObjects());
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepBackward();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepForward();
      } else if (e.key === 'Escape') {
        setActiveTool(null);
        handleClearCanvas();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleClearCanvas, handleStepBackward, handleStepForward]);

  if (!video) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-lg font-black uppercase tracking-widest text-zinc-500">Video not found</p>
          <Link href="/" className="mt-4 inline-block text-base font-bold uppercase tracking-widest text-orange-300 border-b-2 border-orange-300 pb-0.5 hover:text-orange-300">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-black">
      <UserSetup />

      {/* Header */}
      <header className="flex items-center justify-between border-b-2 border-orange-300 px-4 py-2">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-500 hover:text-orange-300 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="square" strokeLinejoin="miter" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-black uppercase tracking-widest text-white truncate max-w-md">{video.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <ShareButton videoId={videoId} currentTime={currentTime} />
          {currentUser && <NotificationBell />}
          {currentUser && (
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center text-base font-black text-white border border-zinc-700"
                style={{ backgroundColor: currentUser.avatarColor }}
              >
                {currentUser.name[0]?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex flex-1 flex-col">
          {/* Video + Canvas */}
          <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
            <div className="relative w-full h-full">
              <VideoPlayer
                ref={videoRef}
                src={video.url}
                onTimeUpdate={setCurrentTime}
                onDurationChange={handleDurationChange}
                onPlayStateChange={setIsPlaying}
              />
              <CanvasOverlay
                ref={canvasRef}
                videoRef={videoRef}
                activeTool={activeTool}
                strokeColor={strokeColor}
                currentTime={currentTime}
                annotations={annotations}
              />

              {/* Click to play/pause when no tool active */}
              {!activeTool && (
                <button
                  onClick={handleTogglePlay}
                  className="absolute inset-0 z-10"
                />
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 border-t-2 border-zinc-800 p-3">
            <PlaybackControls
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onStop={handleStop}
              onStepBackward={handleStepBackward}
              onStepForward={handleStepForward}
            />
            <div className="h-8 w-0.5 bg-zinc-800" />
            <DrawingToolbar
              activeTool={activeTool}
              onToolChange={setActiveTool}
              strokeColor={strokeColor}
              onColorChange={setStrokeColor}
              onSave={handleSaveAnnotation}
              onClear={handleClearCanvas}
              hasDrawing={hasDrawing}
            />
          </div>

          {/* Timeline */}
          <div className="border-t-2 border-zinc-800 px-4 py-3">
            <Timeline
              currentTime={currentTime}
              duration={duration}
              annotations={annotations}
              onSeek={handleSeek}
            />
          </div>
        </div>

        {/* Comment panel */}
        <div className="w-80 flex-shrink-0">
          {currentUser && (
            <CommentPanel
              comments={comments}
              users={state.users}
              currentUser={currentUser}
              onSeek={handleSeek}
              onAddComment={handleAddComment}
              onDeleteComment={deleteComment}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <VideoAnnotatorProvider>
      <VideoWorkspace videoId={id} />
    </VideoAnnotatorProvider>
  );
}
