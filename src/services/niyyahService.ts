/**
 * Silsila — Niyyah (Intention) & Reflection Journal Service
 * 
 * Provides persistent storage and retrieval for the user's Hifz intentions,
 * spiritual reflections, and Hadith reminders on sincerity (Ikhlas).
 */

export interface NiyyahEntry {
  id: string;
  intentionText: string;
  category: 'sincerity' | 'understanding' | 'family' | 'habit' | 'devotion';
  createdAt: number;
  reflectionNotes?: string;
  isPrimary: boolean;
}

const NIYYAH_STORAGE_KEY = 'hafiz_niyyah_history_v1';

export const SPIRITUAL_REFLECTIONS = [
  {
    hadith: '“Actions are judged only by intentions, and every person will have only what they intended.”',
    source: 'Sahih al-Bukhari 1',
    guidance: 'Renew your intention before every ayah — memorize to draw closer to Allah and live by His words.',
  },
  {
    hadith: '“The best of you are those who learn the Quran and teach it.”',
    source: 'Sahih al-Bukhari 5027',
    guidance: 'Every verse you commit to heart is an enduring light and a seed of knowledge for yourself and others.',
  },
  {
    hadith: '“It will be said to the companion of the Quran: Recite and ascend, and recite carefully as you recited in the worldly life.”',
    source: 'Sunan Abi Dawud 1464',
    guidance: 'Practice calmly with Tartil; memorization is not a race, but a lifelong companionship with Revelation.',
  },
];

const DEFAULT_NIYYAH_ENTRIES: NiyyahEntry[] = [
  {
    id: 'niyyah_primary_default',
    intentionText: "To memorize the Book of Allah sincerely for His pleasure, understand its wisdom, and implement its teachings in my daily life.",
    category: 'devotion',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    reflectionNotes: 'Established at the beginning of my Hifz journey.',
    isPrimary: true,
  },
  {
    id: 'niyyah_family_1',
    intentionText: "To bring the barakah and tranquility of the Quran into my home and family.",
    category: 'family',
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    reflectionNotes: 'Reciting daily with my loved ones.',
    isPrimary: false,
  },
];

export function getNiyyahEntries(): NiyyahEntry[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_NIYYAH_ENTRIES;
  }
  try {
    const raw = localStorage.getItem(NIYYAH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse Niyyah entries', e);
  }
  saveNiyyahEntries(DEFAULT_NIYYAH_ENTRIES);
  return DEFAULT_NIYYAH_ENTRIES;
}

export function saveNiyyahEntries(entries: NiyyahEntry[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(NIYYAH_STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent('hafiz_niyyah_updated'));
  } catch (e) {
    console.error('Failed to save Niyyah entries', e);
  }
}

export function addNiyyahEntry(
  intentionText: string,
  category: NiyyahEntry['category'] = 'devotion',
  reflectionNotes?: string,
  setAsPrimary = false
): NiyyahEntry {
  const current = getNiyyahEntries();
  if (setAsPrimary) {
    current.forEach((e) => (e.isPrimary = false));
  }
  const newEntry: NiyyahEntry = {
    id: `niyyah_${Date.now()}`,
    intentionText: intentionText.trim(),
    category,
    createdAt: Date.now(),
    reflectionNotes: reflectionNotes?.trim(),
    isPrimary: setAsPrimary || current.length === 0,
  };
  const updated = [newEntry, ...current];
  saveNiyyahEntries(updated);
  return newEntry;
}

export function setPrimaryNiyyah(id: string): void {
  const current = getNiyyahEntries();
  const updated = current.map((e) => ({
    ...e,
    isPrimary: e.id === id,
  }));
  saveNiyyahEntries(updated);
}

export function deleteNiyyahEntry(id: string): void {
  const current = getNiyyahEntries();
  const updated = current.filter((e) => e.id !== id);
  if (updated.length > 0 && !updated.some((e) => e.isPrimary)) {
    updated[0].isPrimary = true;
  }
  saveNiyyahEntries(updated);
}
