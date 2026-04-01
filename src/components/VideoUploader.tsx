'use client';

import { useState, useRef, useEffect, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoAnnotator } from '@/store/VideoAnnotatorContext';
import { User } from '@/types';

export default function VideoUploader() {
  const { addVideo, state, currentUser } = useVideoAnnotator();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Dialog state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const otherUsers = state.users.filter((u) => u.id !== currentUser?.id);
  const filteredUsers = otherUsers.filter((u) =>
    u.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  useEffect(() => {
    setMentionIndex(0);
  }, [mentionFilter]);

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith('video/')) return;
    setPendingFile(file);
    setVideoName(file.name.replace(/\.[^.]+$/, ''));
    setVideoDescription('');
  };

  const handleConfirm = async () => {
    if (!pendingFile || !videoName.trim()) return;
    setUploading(true);
    try {
      const video = await addVideo(pendingFile, videoName.trim(), videoDescription.trim());
      setPendingFile(null);
      router.push(`/video/${video.id}`);
    } catch (e) {
      console.error('Upload failed:', e);
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPendingFile(null);
    setVideoName('');
    setVideoDescription('');
  };

  const handleDescriptionChange = (value: string) => {
    setVideoDescription(value);
    const cursorPos = descRef.current?.selectionStart || 0;
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
    const cursorPos = descRef.current?.selectionStart || 0;
    const textBefore = videoDescription.slice(0, cursorPos);
    const textAfter = videoDescription.slice(cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      const newBefore = textBefore.slice(0, atMatch.index) + `@${user.name} `;
      setVideoDescription(newBefore + textAfter);
    }
    setShowMentions(false);
    descRef.current?.focus();
  };

  const handleDescKeyDown = (e: React.KeyboardEvent) => {
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
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelected(file);
  };

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed p-16 text-center transition-colors ${
          dragging
            ? 'border-orange-300 bg-orange-300/5'
            : 'border-zinc-800 hover:border-orange-300/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelected(file);
            if (inputRef.current) inputRef.current.value = '';
          }}
        />
        <svg className="mx-auto mb-4 h-12 w-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-lg font-black tracking-widest text-zinc-300">Drop video or click to upload</p>
        <p className="mt-2 text-base font-bold tracking-wider text-zinc-600">MP4 / WebM / MOV</p>
      </div>

      {/* Upload dialog */}
      {pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-lg border-2 border-orange-300 bg-black p-6 shadow-[8px_8px_0_#fdba74]">
            <h2 className="text-lg font-black tracking-widest text-orange-300 mb-1">Upload Video</h2>
            <p className="text-base font-bold tracking-wider text-zinc-600 mb-6">
              {pendingFile.name} — {(pendingFile.size / (1024 * 1024)).toFixed(1)} MB
            </p>

            {/* Video name */}
            <label className="block text-base font-black tracking-widest text-zinc-500 mb-1">
              Name
            </label>
            <input
              type="text"
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
              placeholder="VIDEO NAME"
              className="w-full border-2 border-zinc-700 bg-black px-4 py-3 text-white font-bold tracking-wider placeholder-zinc-600 focus:outline-none focus:border-orange-300 mb-4"
              autoFocus
            />

            {/* Description with @mentions */}
            <label className="block text-base font-black tracking-widest text-zinc-500 mb-1">
              Description
            </label>
            <div className="relative">
              {showMentions && filteredUsers.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-1 border-2 border-orange-300 bg-black shadow-[4px_4px_0_#fdba74] overflow-hidden z-30 max-h-40 overflow-y-auto">
                  {filteredUsers.map((user, i) => (
                    <button
                      key={user.id}
                      onClick={() => insertMention(user)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-base font-bold tracking-wider text-left transition-colors ${
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
                ref={descRef}
                value={videoDescription}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                onKeyDown={handleDescKeyDown}
                placeholder="DESCRIBE THE VIDEO... (@ TO MENTION)"
                rows={3}
                className="w-full resize-none border-2 border-zinc-700 bg-black px-4 py-3 text-lg text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-orange-300"
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="border border-zinc-700 px-4 py-2 text-base font-bold tracking-widest text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!videoName.trim() || uploading}
                className="border-2 border-orange-300 bg-orange-300 px-6 py-2 text-base font-black tracking-widest text-black hover:bg-orange-300 hover:border-orange-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
