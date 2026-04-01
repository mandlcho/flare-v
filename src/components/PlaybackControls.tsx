'use client';

interface Props {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
}

export default function PlaybackControls({
  isPlaying,
  onTogglePlay,
  onStop,
  onStepBackward,
  onStepForward,
}: Props) {
  return (
    <div className="flex items-center gap-1">
      {/* Step Backward */}
      <button
        onClick={onStepBackward}
        title="Step backward 5s"
        className="border border-zinc-700 p-2 text-zinc-400 hover:border-orange-300 hover:text-orange-300 transition-colors"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
        </svg>
      </button>

      {/* Play/Pause */}
      <button
        onClick={onTogglePlay}
        title={isPlaying ? 'Pause' : 'Play'}
        className="border-2 border-orange-300 bg-orange-300 p-2 text-black hover:bg-orange-300 hover:border-orange-300 transition-colors"
      >
        {isPlaying ? (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Stop */}
      <button
        onClick={onStop}
        title="Stop"
        className="border border-zinc-700 p-2 text-zinc-400 hover:border-orange-300 hover:text-orange-300 transition-colors"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h12v12H6z" />
        </svg>
      </button>

      {/* Step Forward */}
      <button
        onClick={onStepForward}
        title="Step forward 5s"
        className="border border-zinc-700 p-2 text-zinc-400 hover:border-orange-300 hover:text-orange-300 transition-colors"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
        </svg>
      </button>
    </div>
  );
}
