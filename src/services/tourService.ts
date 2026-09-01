/**
 * Silsila - Interactive Walkthrough Tour Service
 * Manages tour completion state and cross-component tour replay events.
 */

export const TOUR_COMPLETED_KEY = 'silsila_tour_completed_v1';
export const TOUR_REPLAY_EVENT = 'silsila_replay_tour_requested';

export function hasUserCompletedTour(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(TOUR_COMPLETED_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export function setUserCompletedTour(completed: boolean = true): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOUR_COMPLETED_KEY, completed ? 'true' : 'false');
  } catch {}
}

export function resetUserTour(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
  } catch {}
}

export function triggerTourReplay(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TOUR_REPLAY_EVENT));
}

export function subscribeToTourReplay(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(TOUR_REPLAY_EVENT, handler);
  return () => window.removeEventListener(TOUR_REPLAY_EVENT, handler);
}
