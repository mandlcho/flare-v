'use client';

import Link from 'next/link';
import { Video } from '@/types';
import { useVideoAnnotator } from '@/store/VideoAnnotatorContext';

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function VideoCard({ video }: { video: Video }) {
  const { deleteVideo, state } = useVideoAnnotator();
  const commentCount = state.comments.filter((c) => c.videoId === video.id).length;
  const annotationCount = state.annotations.filter((a) => a.videoId === video.id).length;

  return (
    <div className="group relative border-2 border-zinc-800 bg-black overflow-hidden hover:border-orange-300 transition-colors">
      <Link href={`/video/${video.id}`}>
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video src={video.url} className="w-full h-full object-cover" muted preload="metadata" />
          {video.duration > 0 && (
            <span className="absolute bottom-2 right-2 border border-zinc-700 bg-black px-2 py-0.5 text-base font-mono font-bold text-zinc-400">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
        <div className="p-3 border-t border-zinc-800">
          <h3 className="text-base font-black uppercase tracking-wider text-white truncate">{video.name}</h3>
          <div className="mt-1 flex items-center gap-3 text-base font-bold uppercase tracking-wider text-zinc-600">
            <span>{annotationCount} ann.</span>
            <span>{commentCount} cmt.</span>
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          if (confirm('Delete this video?')) deleteVideo(video.id);
        }}
        className="absolute top-2 right-2 border border-zinc-700 bg-black p-1.5 text-zinc-500 opacity-0 group-hover:opacity-100 hover:border-red-500 hover:text-red-500 transition-all"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
