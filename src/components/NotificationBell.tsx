'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoAnnotator } from '@/store/VideoAnnotatorContext';

export default function NotificationBell() {
  const { state, currentUser, markNotificationRead, markAllNotificationsRead } = useVideoAnnotator();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const myNotifications = state.notifications
    .filter((n) => n.userId === currentUser?.id)
    .sort((a, b) => b.createdAt - a.createdAt);
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative border p-2 text-zinc-400 transition-colors ${
          open ? 'border-orange-300 text-orange-300' : 'border-zinc-700 hover:border-orange-300 hover:text-orange-300'
        }`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-orange-300 text-sm font-black text-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 border-2 border-orange-300 bg-black shadow-[4px_4px_0_#fdba74] z-50">
          <div className="flex items-center justify-between border-b-2 border-zinc-800 px-3 py-2">
            <span className="text-base font-black tracking-widest text-orange-300">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsRead()}
                className="text-base font-bold tracking-wider text-zinc-500 hover:text-orange-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {myNotifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-base font-bold tracking-wider text-zinc-600">
                No notifications
              </div>
            ) : (
              myNotifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    router.push(`/video/${n.videoId}`);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 border-b border-zinc-900 transition-colors hover:bg-zinc-900 ${
                    n.read ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="flex-shrink-0 h-5 w-5 flex items-center justify-center text-sm font-black text-white border border-zinc-700 mt-0.5"
                      style={{ backgroundColor: n.fromUser.avatarColor }}
                    >
                      {n.fromUser.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-base font-black tracking-wider text-white">
                        {n.fromUser.name}
                      </span>
                      <p className="text-base text-zinc-400 font-mono truncate mt-0.5">
                        {n.message}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="flex-shrink-0 h-2 w-2 bg-orange-300 mt-1" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
