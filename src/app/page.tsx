'use client';

import { VideoAnnotatorProvider, useVideoAnnotator } from '@/store/VideoAnnotatorContext';
import UserSetup from '@/components/UserSetup';
import VideoUploader from '@/components/VideoUploader';
import VideoCard from '@/components/VideoCard';
import NotificationBell from '@/components/NotificationBell';

function HomeContent() {
  const { state, currentUser } = useVideoAnnotator();
  const videos = [...state.videos].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen bg-black">
      <UserSetup />
      <header className="border-b-2 border-orange-300">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border-2 border-orange-300 bg-orange-300">
              <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-widest text-orange-300">Flare</h1>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center border-2 border-orange-300 text-base font-black text-white"
                  style={{ backgroundColor: currentUser.avatarColor }}
                >
                  {currentUser.name[0]?.toUpperCase()}
                </div>
                <span className="text-base font-bold tracking-wider text-zinc-400">{currentUser.name}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <VideoUploader />

        {videos.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-black tracking-widest text-orange-300">Your Videos</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <VideoAnnotatorProvider>
      <HomeContent />
    </VideoAnnotatorProvider>
  );
}
