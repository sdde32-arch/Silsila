/**
 * Silsila - Contextual Coach Marks Service
 * Tracks one-time spotlight tooltips for contextual features.
 * Stored locally and synchronized with user profile in Firestore.
 */

export type CoachMarkKey =
  | 'word_inspector'
  | 'ayah_arcade'
  | 'mastery_exam'
  | 'offline_downloads'
  | 'reciter_settings';

const COACH_MARK_PREFIX = 'silsila_coachmark_';

export function getCoachMarkStorageKey(key: CoachMarkKey): string {
  return `${COACH_MARK_PREFIX}${key}`;
}

export function hasSeenCoachMark(key: CoachMarkKey): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(getCoachMarkStorageKey(key)) === 'true';
  } catch {
    return false;
  }
}

export function markCoachMarkSeen(key: CoachMarkKey): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getCoachMarkStorageKey(key), 'true');
    // Dispatch event to sync state across listeners
    window.dispatchEvent(new CustomEvent('silsila_coachmark_seen', { detail: { key } }));
  } catch {}
}

export function resetAllCoachMarks(): void {
  if (typeof window === 'undefined') return;
  try {
    const keys: CoachMarkKey[] = [
      'word_inspector',
      'ayah_arcade',
      'mastery_exam',
      'offline_downloads',
      'reciter_settings',
    ];
    keys.forEach((k) => localStorage.removeItem(getCoachMarkStorageKey(k)));
  } catch {}
}

export function getAllCoachMarksState(): Record<string, boolean> {
  const keys: CoachMarkKey[] = [
    'word_inspector',
    'ayah_arcade',
    'mastery_exam',
    'offline_downloads',
    'reciter_settings',
  ];
  const res: Record<string, boolean> = {};
  keys.forEach((k) => {
    res[`hasSeenCoachMark_${k}`] = hasSeenCoachMark(k);
  });
  return res;
}

export function hydrateCoachMarksFromRemote(remoteFlags: Record<string, boolean | undefined>): void {
  if (typeof window === 'undefined' || !remoteFlags) return;
  try {
    const map: Record<string, CoachMarkKey> = {
      hasSeenCoachMark_wordInspector: 'word_inspector',
      hasSeenCoachMark_word_inspector: 'word_inspector',
      hasSeenCoachMark_ayahArcade: 'ayah_arcade',
      hasSeenCoachMark_ayah_arcade: 'ayah_arcade',
      hasSeenCoachMark_masteryExam: 'mastery_exam',
      hasSeenCoachMark_mastery_exam: 'mastery_exam',
      hasSeenCoachMark_offlineDownloads: 'offline_downloads',
      hasSeenCoachMark_offline_downloads: 'offline_downloads',
      hasSeenCoachMark_reciterSettings: 'reciter_settings',
      hasSeenCoachMark_reciter_settings: 'reciter_settings',
    };

    Object.entries(remoteFlags).forEach(([flagKey, val]) => {
      if (val === true && map[flagKey]) {
        localStorage.setItem(getCoachMarkStorageKey(map[flagKey]), 'true');
      }
    });
  } catch {}
}
