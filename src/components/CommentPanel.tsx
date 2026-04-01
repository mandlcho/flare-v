'use client';

import { Comment, User } from '@/types';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

interface Props {
  comments: Comment[];
  users: User[];
  currentUser: User;
  onSeek: (time: number) => void;
  onAddComment: (text: string) => void;
  onDeleteComment: (id: string) => void;
}

export default function CommentPanel({
  comments,
  users,
  currentUser,
  onSeek,
  onAddComment,
  onDeleteComment,
}: Props) {
  const sorted = [...comments].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="flex h-full flex-col bg-black border-l-2 border-orange-300">
      <div className="flex items-center justify-between border-b-2 border-zinc-800 px-4 py-3">
        <h2 className="text-base font-black tracking-widest text-orange-300">Comments</h2>
        <span className="border border-orange-300 px-2 py-0.5 text-base font-black text-orange-300">
          {comments.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600 px-4">
            <svg className="h-10 w-10 mb-3 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="square" strokeLinejoin="miter" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-base font-bold tracking-wider text-center">No comments yet</p>
          </div>
        ) : (
          sorted.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onSeek={onSeek}
              isOwn={comment.author.id === currentUser.id}
              onDelete={() => onDeleteComment(comment.id)}
            />
          ))
        )}
      </div>

      <CommentInput users={users} currentUser={currentUser} onSubmit={onAddComment} />
    </div>
  );
}
