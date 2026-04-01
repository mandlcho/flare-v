'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Video, Annotation, Comment, Notification, User } from '@/types';
import { loadState, saveState } from '@/lib/storage';
import { getAvatarColor } from '@/lib/colors';
import { parseMentions } from '@/lib/mentions';
import { saveVideoBlob, deleteVideoBlob, getVideoBlob, createObjectURL } from '@/lib/videoStorage';

type Action =
  | { type: 'INIT'; payload: AppState }
  | { type: 'SET_USER'; payload: User }
  | { type: 'ADD_VIDEO'; payload: Video }
  | { type: 'DELETE_VIDEO'; payload: string }
  | { type: 'UPDATE_VIDEO_DURATION'; payload: { id: string; duration: number } }
  | { type: 'SET_VIDEO_URL'; payload: { id: string; url: string } }
  | { type: 'ADD_ANNOTATION'; payload: Annotation }
  | { type: 'DELETE_ANNOTATION'; payload: string }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'DELETE_COMMENT'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'ADD_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ'; payload: string };

interface ContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  currentUser: User | null;
  setCurrentUser: (name: string) => void;
  addVideo: (file: File, name: string, description: string) => Promise<Video>;
  deleteVideo: (id: string) => void;
  addAnnotation: (videoId: string, timestamp: number, canvasJSON: string) => Annotation;
  deleteAnnotation: (id: string) => void;
  addComment: (videoId: string, timestamp: number, text: string, annotationId?: string) => Comment;
  deleteComment: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const VideoAnnotatorContext = createContext<ContextValue | null>(null);

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'INIT':
      return action.payload;
    case 'SET_USER':
      return {
        ...state,
        currentUserId: action.payload.id,
        users: state.users.some((u) => u.id === action.payload.id)
          ? state.users
          : [...state.users, action.payload],
      };
    case 'ADD_VIDEO':
      return { ...state, videos: [...state.videos, action.payload] };
    case 'DELETE_VIDEO':
      return {
        ...state,
        videos: state.videos.filter((v) => v.id !== action.payload),
        annotations: state.annotations.filter((a) => a.videoId !== action.payload),
        comments: state.comments.filter((c) => c.videoId !== action.payload),
      };
    case 'UPDATE_VIDEO_DURATION':
      return {
        ...state,
        videos: state.videos.map((v) =>
          v.id === action.payload.id ? { ...v, duration: action.payload.duration } : v
        ),
      };
    case 'SET_VIDEO_URL':
      return {
        ...state,
        videos: state.videos.map((v) =>
          v.id === action.payload.id ? { ...v, url: action.payload.url } : v
        ),
      };
    case 'ADD_ANNOTATION':
      return { ...state, annotations: [...state.annotations, action.payload] };
    case 'DELETE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.filter((a) => a.id !== action.payload),
        comments: state.comments.map((c) =>
          c.annotationId === action.payload ? { ...c, annotationId: undefined } : c
        ),
      };
    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.payload] };
    case 'DELETE_COMMENT':
      return { ...state, comments: state.comments.filter((c) => c.id !== action.payload) };
    case 'ADD_USER':
      return {
        ...state,
        users: state.users.some((u) => u.id === action.payload.id)
          ? state.users
          : [...state.users, action.payload],
      };
    case 'ADD_NOTIFICATIONS':
      return { ...state, notifications: [...state.notifications, ...action.payload] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.userId === action.payload ? { ...n, read: true } : n
        ),
      };
    default:
      return state;
  }
}

const emptyState: AppState = {
  videos: [],
  annotations: [],
  comments: [],
  notifications: [],
  users: [],
  currentUserId: '',
};

export function VideoAnnotatorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyState);

  useEffect(() => {
    const init = async () => {
      const saved = loadState();
      // Ensure notifications array exists for older saved states
      if (!saved.notifications) saved.notifications = [];
      dispatch({ type: 'INIT', payload: saved });

      for (const video of saved.videos) {
        const blob = await getVideoBlob(video.id);
        if (blob) {
          const url = createObjectURL(blob);
          dispatch({ type: 'SET_VIDEO_URL', payload: { id: video.id, url } });
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (state.currentUserId) {
      const stateToSave: AppState = {
        ...state,
        videos: state.videos.map((v) => ({ ...v, url: '' })),
      };
      saveState(stateToSave);
    }
  }, [state]);

  const currentUser = state.users.find((u) => u.id === state.currentUserId) || null;

  const createNotifications = useCallback(
    (text: string, videoId: string, fromUser: User, messagePrefix: string) => {
      const mentionedNames = parseMentions(text);
      const notifications: Notification[] = [];

      for (const name of mentionedNames) {
        const user = state.users.find(
          (u) => u.name.toLowerCase() === name.toLowerCase() && u.id !== fromUser.id
        );
        if (user) {
          notifications.push({
            id: uuidv4(),
            userId: user.id,
            fromUser,
            videoId,
            message: `${messagePrefix}: "${text.length > 80 ? text.slice(0, 80) + '...' : text}"`,
            read: false,
            createdAt: Date.now(),
          });
        }
      }

      if (notifications.length > 0) {
        dispatch({ type: 'ADD_NOTIFICATIONS', payload: notifications });
      }
    },
    [state.users]
  );

  const setCurrentUser = useCallback(
    (name: string) => {
      const id = uuidv4();
      const user: User = { id, name, avatarColor: getAvatarColor(id) };
      dispatch({ type: 'SET_USER', payload: user });
    },
    []
  );

  const addVideo = useCallback(
    async (file: File, name: string, description: string): Promise<Video> => {
      if (!currentUser) throw new Error('No user set');
      const id = uuidv4();

      await saveVideoBlob(id, file);
      const url = createObjectURL(file);

      const video: Video = {
        id,
        name: name || file.name,
        description,
        url,
        duration: 0,
        createdAt: Date.now(),
        author: currentUser,
      };
      dispatch({ type: 'ADD_VIDEO', payload: video });

      // Create notifications for @mentions in description
      if (description) {
        createNotifications(description, id, currentUser, `mentioned you in video "${name}"`);
      }

      return video;
    },
    [currentUser, createNotifications]
  );

  const deleteVideo = useCallback(
    (id: string) => {
      deleteVideoBlob(id);
      dispatch({ type: 'DELETE_VIDEO', payload: id });
    },
    []
  );

  const addAnnotation = useCallback(
    (videoId: string, timestamp: number, canvasJSON: string): Annotation => {
      if (!currentUser) throw new Error('No user set');
      const annotation: Annotation = {
        id: uuidv4(),
        videoId,
        timestamp,
        duration: 0,
        canvasJSON,
        author: currentUser,
        createdAt: Date.now(),
      };
      dispatch({ type: 'ADD_ANNOTATION', payload: annotation });
      return annotation;
    },
    [currentUser]
  );

  const deleteAnnotation = useCallback(
    (id: string) => dispatch({ type: 'DELETE_ANNOTATION', payload: id }),
    []
  );

  const addComment = useCallback(
    (videoId: string, timestamp: number, text: string, annotationId?: string): Comment => {
      if (!currentUser) throw new Error('No user set');
      const comment: Comment = {
        id: uuidv4(),
        videoId,
        annotationId,
        timestamp,
        text,
        author: currentUser,
        createdAt: Date.now(),
      };
      dispatch({ type: 'ADD_COMMENT', payload: comment });

      // Create notifications for @mentions in comments
      createNotifications(text, videoId, currentUser, 'mentioned you in a comment');

      return comment;
    },
    [currentUser, createNotifications]
  );

  const deleteComment = useCallback(
    (id: string) => dispatch({ type: 'DELETE_COMMENT', payload: id }),
    []
  );

  const markNotificationRead = useCallback(
    (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
    []
  );

  const markAllNotificationsRead = useCallback(() => {
    if (currentUser) {
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', payload: currentUser.id });
    }
  }, [currentUser]);

  return (
    <VideoAnnotatorContext.Provider
      value={{
        state,
        dispatch,
        currentUser,
        setCurrentUser,
        addVideo,
        deleteVideo,
        addAnnotation,
        deleteAnnotation,
        addComment,
        deleteComment,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </VideoAnnotatorContext.Provider>
  );
}

export function useVideoAnnotator() {
  const ctx = useContext(VideoAnnotatorContext);
  if (!ctx) throw new Error('useVideoAnnotator must be used within VideoAnnotatorProvider');
  return ctx;
}
