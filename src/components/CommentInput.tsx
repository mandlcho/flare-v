'use client';

import { useState, useRef, useEffect } from 'react';
import { User } from '@/types';

interface Props {
  users: User[];
  currentUser: User;
  onSubmit: (text: string) => void;
}

export default function CommentInput({ users, currentUser, onSubmit }: Props) {
  const [text, setText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredUsers = users
    .filter((u) => u.id !== currentUser.id)
    .filter((u) => u.name.toLowerCase().includes(mentionFilter.toLowerCase()));

  useEffect(() => {
    setMentionIndex(0);
  }, [mentionFilter]);

  const handleChange = (value: string) => {
    setText(value);
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBefore = value.slice(0, cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      setShowMentions(true);
      setMentionFilter(atMatch[1]);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: User) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBefore = text.slice(0, cursorPos);
    const textAfter = text.slice(cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      const newBefore = textBefore.slice(0, atMatch.index) + `@${user.name} `;
      setText(newBefore + textAfter);
    }
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % filteredUsers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + filteredUsers.length) % filteredUsers.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredUsers[mentionIndex]);
        return;
      } else if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
      e.preventDefault();
      if (text.trim()) {
        onSubmit(text.trim());
        setText('');
      }
    }
  };

  return (
    <div className="relative border-t-2 border-zinc-800 p-3">
      {showMentions && filteredUsers.length > 0 && (
        <div className="absolute bottom-full left-3 right-3 mb-1 border-2 border-orange-300 bg-black shadow-[4px_4px_0_#fdba74] overflow-hidden z-30">
          {filteredUsers.map((user, i) => (
            <button
              key={user.id}
              onClick={() => insertMention(user)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-base font-bold uppercase tracking-wider text-left transition-colors ${
                i === mentionIndex ? 'bg-orange-300 text-black' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <div
                className="h-5 w-5 flex items-center justify-center text-base font-black text-white border border-zinc-700"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.name[0]?.toUpperCase()}
              </div>
              {user.name}
            </button>
          ))}
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="COMMENT... (@ TO MENTION)"
        rows={2}
        className="w-full resize-none border-2 border-zinc-800 bg-black px-3 py-2 text-lg text-white placeholder-zinc-700 font-mono focus:outline-none focus:border-orange-300"
      />
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => {
            if (text.trim()) {
              onSubmit(text.trim());
              setText('');
            }
          }}
          disabled={!text.trim()}
          className="border-2 border-orange-300 bg-orange-300 px-4 py-1.5 text-base font-black uppercase tracking-widest text-black hover:bg-orange-300 hover:border-orange-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Post
        </button>
      </div>
    </div>
  );
}
