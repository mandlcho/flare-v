'use client';

import { useState } from 'react';

interface Props {
  videoId: string;
  currentTime: number;
}

export default function ShareButton({ videoId, currentTime }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/video/${videoId}?t=${Math.floor(currentTime)}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 border-2 px-3 py-1 text-base font-black tracking-widest transition-colors ${
        copied
          ? 'border-orange-300 bg-orange-300 text-black'
          : 'border-zinc-700 text-zinc-400 hover:border-orange-300 hover:text-orange-300'
      }`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="square" strokeLinejoin="miter" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
