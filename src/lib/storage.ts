import { AppState } from '@/types';

const STORAGE_KEY = 'video-annotator-state';

const defaultState: AppState = {
  videos: [],
  annotations: [],
  comments: [],
  notifications: [],
  users: [],
  currentUserId: '',
};

export function loadState(): AppState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw) as AppState;
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}
