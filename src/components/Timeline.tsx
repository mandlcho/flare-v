'use client';

import { Annotation } from '@/types';

interface Props {
  currentTime: number;
  duration: number;
  annotations: Annotation[];
  onSeek: (time: number) => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Timeline({ currentTime, duration, annotations, onSeek }: Props) {
  if (duration <= 0) return null;

  const progress = (currentTime / duration) * 100;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(ratio * duration);
  };

  return (
    <div className="space-y-1">
      <div
        className="relative h-8 cursor-pointer border-2 border-zinc-800 bg-black group"
        onClick={handleClick}
      >
        {/* Progress bar */}
        <div
          className="absolute left-0 top-0 h-full bg-orange-300/20"
          style={{ width: `${progress}%` }}
        />

        {/* Playhead */}
        <div
          className="absolute top-0 h-full w-0.5 bg-orange-300 z-10"
          style={{ left: `${progress}%` }}
        >
          <div className="absolute -top-1 -left-1.5 h-3 w-3 bg-orange-300 border-2 border-black" />
        </div>

        {/* Annotation markers */}
        {annotations.map((ann) => {
          const pos = (ann.timestamp / duration) * 100;
          return (
            <div
              key={ann.id}
              className="absolute top-1/2 -translate-y-1/2 z-20 group/marker"
              style={{ left: `${pos}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(ann.timestamp);
              }}
            >
              <div
                className="h-4 w-1.5 -ml-[3px] border border-black cursor-pointer hover:scale-y-150 transition-transform origin-center"
                style={{ backgroundColor: ann.author.avatarColor }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/marker:block whitespace-nowrap border border-orange-300 bg-black px-2 py-1 text-base font-bold tracking-wider text-orange-300 shadow-[2px_2px_0_#fdba74]">
                {ann.author.name} // {formatTime(ann.timestamp)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time display */}
      <div className="flex justify-between text-base text-zinc-600 font-mono font-bold tracking-wider px-0.5">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
