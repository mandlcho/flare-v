'use client';

import { useState } from 'react';
import { useVideoAnnotator } from '@/store/VideoAnnotatorContext';

export default function UserSetup() {
  const { currentUser, setCurrentUser } = useVideoAnnotator();
  const [name, setName] = useState('');

  if (currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-sm border-2 border-orange-300 bg-black p-8 shadow-[8px_8px_0_#fdba74]">
        <h2 className="text-2xl font-black tracking-widest text-orange-300 mb-2">Who are you?</h2>
        <p className="text-base font-bold tracking-wider text-zinc-500 mb-6">Enter your name to continue.</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) setCurrentUser(name.trim());
          }}
          placeholder="YOUR NAME"
          className="w-full border-2 border-zinc-700 bg-black px-4 py-3 text-white font-bold tracking-wider placeholder-zinc-600 focus:outline-none focus:border-orange-300"
          autoFocus
        />
        <button
          onClick={() => name.trim() && setCurrentUser(name.trim())}
          disabled={!name.trim()}
          className="mt-4 w-full border-2 border-orange-300 bg-orange-300 py-3 font-black tracking-widest text-black hover:bg-orange-300 hover:border-orange-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
