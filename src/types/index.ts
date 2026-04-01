export interface User {
  id: string;
  name: string;
  avatarColor: string;
}

export interface Video {
  id: string;
  name: string;
  description: string;
  url: string;
  duration: number;
  createdAt: number;
  author: User;
}

export interface Annotation {
  id: string;
  videoId: string;
  timestamp: number;
  duration: number;
  canvasJSON: string;
  author: User;
  createdAt: number;
}

export interface Comment {
  id: string;
  videoId: string;
  annotationId?: string;
  timestamp: number;
  text: string;
  author: User;
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  fromUser: User;
  videoId: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export type ToolType = 'select' | 'rect' | 'circle' | 'arrow' | 'text' | 'freehand';

export interface AppState {
  videos: Video[];
  annotations: Annotation[];
  comments: Comment[];
  notifications: Notification[];
  users: User[];
  currentUserId: string;
}
