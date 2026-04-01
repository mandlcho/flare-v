'use client';

import { Comment } from '@/types';
import { segmentText } from '@/lib/mentions';
import { getInitials } from '@/lib/colors';

interface Props {
  comment: Comment;
  onSeek: (time: number) => void;
  onDelete?: () => void;
  isOwn: boolean;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function CommentItem({ comment, onSeek, onDelete, isOwn }: Props) {
  const segments = segmentText(comment.text);

  return (
    <div className="group flex gap-3 px-4 py-3 border-b border-zinc-900 hover:bg-zinc-950 transition-colors">
      <div
        className="flex-shrink-0 h-7 w-7 flex items-center justify-center text-base font-black text-white border border-zinc-700"
        style={{ backgroundColor: comment.author.avatarColor }}
      >
        {getInitials(comment.author.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-black uppercase tracking-wider text-white">{comment.author.name}</span>
          <button
            onClick={() => onSeek(comment.timestamp)}
            className="border border-zinc-700 px-1.5 py-0.5 text-base font-mono font-bold text-orange-300 hover:border-orange-300 hover:bg-orange-300/10 transition-colors"
          >
            {formatTime(comment.timestamp)}
          </button>
          {comment.annotationId && (
            <span className="text-base font-bold uppercase tracking-wider text-zinc-600">+ annotation</span>
          )}
        </div>
        <p className="mt-1 text-lg text-zinc-400 break-words font-mono">
          {segments.map((seg, i) =>
            seg.type === 'mention' ? (
              <span key={i} className="font-bold text-orange-300">
                @{seg.value}
              </span>
            ) : (
              <span key={i}>{seg.value}</span>
            )
          )}
        </p>
      </div>
      {isOwn && onDelete && (
        <button
          onClick={onDelete}
          className="flex-shrink-0 self-start opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
