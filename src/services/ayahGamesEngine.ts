import {
  MemorizedAyahItem,
  GameRound,
  GameSession,
  GameType,
} from '../types';
import { ALL_114_SURAHS } from '../data/quranMetadata';
import { SURAH_CONTENT_DB } from '../data/quranVerses';

export interface GuessOption {
  ayahId: string;
  surahNumber: number;
  ayahNumber: number;
  label: string; // e.g. "Surah Al-Fātihah 1:3"
  isCorrect: boolean;
}

export interface GuessTheAyahRoundData {
  targetAyah: MemorizedAyahItem;
  options: GuessOption[];
}

export interface ContinueOption {
  id: string;
  ayahId: string;
  arabicSnippet: string;
  transliterationSnippet: string;
  surahName?: string;
  ayahNumber?: number;
  isCorrect: boolean;
}

export interface ContinueTheAyahRoundData {
  targetAyah: MemorizedAyahItem;
  prefixSnippet: string;
  prefixTransliteration: string;
  correctContinuation: string;
  correctContinuationTransliteration: string;
  options: ContinueOption[];
}

export interface CatchWordToken {
  id: string;
  text: string;
  isTarget: boolean;
  orderIndex?: number;
  x: number; // Percentage 5..85 across screen
  speed: number; // Falling speed factor
}

export interface CatchTheAyatRoundData {
  targetAyah: MemorizedAyahItem;
  targetSequence: string[];
  allWordsPool: string[];
  decoyWords: string[];
}

// Minimum pool size required to unlock Ayah Games (Section 2)
export const MIN_MEMORIZED_POOL_SIZE = 10;

/**
 * Scoring & Streak Economy (Section 5 of Spec)
 * - Base XP per correct answer: 10 XP
 * - Streak 1-2: 1.0x (10 XP)
 * - Streak 3-4: 1.5x (15 XP)
 * - Streak 5+: 2.0x (20 XP)
 * - Speed bonus (< 3000ms response time): +5 XP
 */
export function calculateGameXP(
  isCorrect: boolean,
  currentStreak: number,
  responseTimeMs: number,
  isTimedMode = false
): { xpEarned: number; multiplier: number; speedBonus: number; newStreak: number } {
  if (!isCorrect) {
    return {
      xpEarned: 0,
      multiplier: 1.0,
      speedBonus: 0,
      newStreak: 0,
    };
  }

  const newStreak = currentStreak + 1;
  let multiplier = 1.0;
  if (newStreak >= 5) {
    multiplier = 2.0;
  } else if (newStreak >= 3) {
    multiplier = 1.5;
  }

  const baseXP = 10;
  const speedBonus = isTimedMode && responseTimeMs > 0 && responseTimeMs <= 3000 ? 5 : 0;
  const xpEarned = Math.round(baseXP * multiplier) + speedBonus;

  return {
    xpEarned,
    multiplier,
    speedBonus,
    newStreak,
  };
}

/**
 * Formats standard Ayah Option label: "Surah Al-Fatihah 1:3"
 */
export function formatAyahOptionLabel(surahId: number, ayahNumber: number): string {
  const meta = ALL_114_SURAHS.find((s) => s.number === surahId);
  const name = meta?.transliteration || meta?.name || `Surah ${surahId}`;
  return `Surah ${name} ${surahId}:${ayahNumber}`;
}

/**
 * Generates a round for 'Guess the Ayah' (Translation -> Reference multiple-choice)
 */
export function generateGuessTheAyahRound(
  pool: MemorizedAyahItem[],
  excludedAyahIds: Set<string> = new Set()
): GuessTheAyahRoundData | null {
  if (pool.length === 0) return null;

  // Prefer choosing an ayah that hasn't been tested yet this session
  const available = pool.filter((item) => !excludedAyahIds.has(item.ayahId));
  const candidatePool = available.length > 0 ? available : pool;
  const targetAyah = candidatePool[Math.floor(Math.random() * candidatePool.length)];

  // Decoy Selection Priority:
  // 1. Prefer ayat already in target's confusionPairs (if present in memorized pool)
  const confusionDecoys: MemorizedAyahItem[] = [];
  if (targetAyah.confusionPairs && targetAyah.confusionPairs.length > 0) {
    for (const cId of targetAyah.confusionPairs) {
      const match = pool.find((p) => p.ayahId === cId && p.ayahId !== targetAyah.ayahId);
      if (match && !confusionDecoys.some((cd) => cd.ayahId === match.ayahId)) {
        confusionDecoys.push(match);
      }
    }
  }

  // 2. Fall back to random other ayat from memorized pool
  const otherPool = pool.filter(
    (p) => p.ayahId !== targetAyah.ayahId && !confusionDecoys.some((cd) => cd.ayahId === p.ayahId)
  );
  const shuffledOthers = [...otherPool].sort(() => 0.5 - Math.random());

  const selectedDecoys = [...confusionDecoys, ...shuffledOthers].slice(0, 3);

  // If pool has fewer than 4 distinct items, synthesize surrounding decoys to guarantee 4 options
  while (selectedDecoys.length < 3) {
    const fakeSurah = targetAyah.surahId === 1 ? 114 : 1;
    const fakeAyah = Math.max(1, (targetAyah.ayahNumber % 5) + 1);
    const meta = ALL_114_SURAHS.find((s) => s.number === fakeSurah) || ALL_114_SURAHS[0];
    selectedDecoys.push({
      surahId: fakeSurah,
      ayahNumber: fakeAyah,
      ayahId: `${fakeSurah}:${fakeAyah}`,
      arabic: '',
      transliteration: '',
      translation: '',
      surahName: meta.name,
      surahTransliteration: meta.transliteration,
      totalSurahAyahs: meta.totalAyahs,
      confusionPairs: [],
    });
  }

  const options: GuessOption[] = [
    {
      ayahId: targetAyah.ayahId,
      surahNumber: targetAyah.surahId,
      ayahNumber: targetAyah.ayahNumber,
      label: formatAyahOptionLabel(targetAyah.surahId, targetAyah.ayahNumber),
      isCorrect: true,
    },
    ...selectedDecoys.map((d) => ({
      ayahId: d.ayahId,
      surahNumber: d.surahId,
      ayahNumber: d.ayahNumber,
      label: formatAyahOptionLabel(d.surahId, d.ayahNumber),
      isCorrect: false,
    })),
  ].sort(() => 0.5 - Math.random());

  return {
    targetAyah,
    options,
  };
}

/**
 * Splits Arabic verse and its transliteration into opening prefix and continuation chunk
 */
export function splitVerseSnippets(
  arabicText: string,
  transliterationText?: string
): {
  prefix: string;
  continuation: string;
  prefixTransliteration: string;
  continuationTransliteration: string;
} {
  const arWords = (arabicText || '').trim().split(/\s+/).filter(Boolean);
  const trWords = (transliterationText || '').trim().split(/\s+/).filter(Boolean);

  if (arWords.length <= 2) {
    const prefix = arWords[0] || '';
    const continuation = arWords.slice(1).join(' ') || arWords[0] || '';
    const prefixTransliteration = trWords[0] || '';
    const continuationTransliteration = trWords.slice(1).join(' ') || trWords[0] || '';
    return { prefix, continuation, prefixTransliteration, continuationTransliteration };
  }

  const splitIdx = Math.max(1, Math.min(3, Math.floor(arWords.length / 2)));
  const prefix = arWords.slice(0, splitIdx).join(' ');
  const continuation = arWords.slice(splitIdx).join(' ');

  let prefixTransliteration = '';
  let continuationTransliteration = '';

  if (trWords.length > 0) {
    const trRatio = splitIdx / arWords.length;
    const trSplitIdx = Math.max(1, Math.min(trWords.length - 1, Math.round(trRatio * trWords.length)));
    prefixTransliteration = trWords.slice(0, trSplitIdx).join(' ');
    continuationTransliteration = trWords.slice(trSplitIdx).join(' ');
  }

  return {
    prefix,
    continuation,
    prefixTransliteration,
    continuationTransliteration,
  };
}

/**
 * Generates a round for 'Continue the Ayah' (Opening Words -> Arabic Continuation Choice)
 */
export function generateContinueTheAyahRound(
  pool: MemorizedAyahItem[],
  excludedAyahIds: Set<string> = new Set()
): ContinueTheAyahRoundData | null {
  if (pool.length === 0) return null;

  const available = pool.filter((item) => !excludedAyahIds.has(item.ayahId));
  const candidatePool = available.length > 0 ? available : pool;
  const targetAyah = candidatePool[Math.floor(Math.random() * candidatePool.length)];

  const {
    prefix: prefixSnippet,
    continuation: correctContinuation,
    prefixTransliteration,
    continuationTransliteration: correctContinuationTransliteration,
  } = splitVerseSnippets(targetAyah.arabic, targetAyah.transliteration);

  // Decoy Selection Priority (prefer confusion pairs)
  const confusionDecoys: MemorizedAyahItem[] = [];
  if (targetAyah.confusionPairs && targetAyah.confusionPairs.length > 0) {
    for (const cId of targetAyah.confusionPairs) {
      const match = pool.find((p) => p.ayahId === cId && p.ayahId !== targetAyah.ayahId);
      if (match) confusionDecoys.push(match);
    }
  }

  const otherPool = pool.filter(
    (p) => p.ayahId !== targetAyah.ayahId && !confusionDecoys.some((cd) => cd.ayahId === p.ayahId)
  );
  const shuffledOthers = [...otherPool].sort(() => 0.5 - Math.random());
  const selectedDecoyItems = [...confusionDecoys, ...shuffledOthers].slice(0, 3);

  const options: ContinueOption[] = [
    {
      id: `opt_correct_${targetAyah.ayahId}`,
      ayahId: targetAyah.ayahId,
      arabicSnippet: correctContinuation,
      transliterationSnippet: correctContinuationTransliteration || targetAyah.transliteration,
      surahName: targetAyah.surahName,
      ayahNumber: targetAyah.ayahNumber,
      isCorrect: true,
    },
    ...selectedDecoyItems.map((item, idx) => {
      const { continuation, continuationTransliteration } = splitVerseSnippets(
        item.arabic,
        item.transliteration
      );
      return {
        id: `opt_decoy_${item.ayahId}_${idx}`,
        ayahId: item.ayahId,
        arabicSnippet: continuation || item.arabic,
        transliterationSnippet: continuationTransliteration || item.transliteration,
        surahName: item.surahName,
        ayahNumber: item.ayahNumber,
        isCorrect: false,
      };
    }),
  ].sort(() => 0.5 - Math.random());

  return {
    targetAyah,
    prefixSnippet,
    prefixTransliteration,
    correctContinuation,
    correctContinuationTransliteration,
    options,
  };
}

/**
 * Generates a round for 'Catch the Ayat' (Falling Words sequence)
 */
export function generateCatchTheAyatRound(
  pool: MemorizedAyahItem[],
  excludedAyahIds: Set<string> = new Set()
): CatchTheAyatRoundData | null {
  if (pool.length === 0) return null;

  const available = pool.filter((item) => !excludedAyahIds.has(item.ayahId));
  const candidatePool = available.length > 0 ? available : pool;
  const targetAyah = candidatePool[Math.floor(Math.random() * candidatePool.length)];

  const words = targetAyah.arabic.trim().split(/\s+/).filter(Boolean);
  const targetSequence = words.length > 0 ? words : ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَـٰنِ', 'ٱلرَّحِيمِ'];

  // Decoy words from other memorized ayat
  const otherAyats = pool.filter((p) => p.ayahId !== targetAyah.ayahId);
  const otherWordsSet = new Set<string>();
  for (const item of otherAyats) {
    const itemWords = item.arabic.trim().split(/\s+/).filter(Boolean);
    for (const w of itemWords) {
      if (!targetSequence.includes(w)) {
        otherWordsSet.add(w);
      }
    }
  }

  const decoyWords = Array.from(otherWordsSet).sort(() => 0.5 - Math.random()).slice(0, 4);

  return {
    targetAyah,
    targetSequence,
    allWordsPool: [...targetSequence, ...decoyWords].sort(() => 0.5 - Math.random()),
    decoyWords,
  };
}
