/**
 * Silsila - Core Product Types & Data Models
 * Master Specification for Quran Memorization, Guided Hifz & Spaced Repetition
 */

export type PlanType = 'full_quran' | 'single_surah' | 'package' | 'custom_selection';

export interface PlanAyahItem {
  surahId: number;
  ayahNumber: number;
  globalOrder: number;
  ayahId: string;
}

export interface MemorizationPackage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  surahNumbers: number[];
  icon: string;
  badge?: string;
  gradient?: string;
}

export interface MemorizationPlan {
  id: string;
  planType: PlanType;
  title: string;
  description?: string;
  selectedSurahs: number[];
  orderedAyahSequence: PlanAyahItem[];
  dailyPace: number;
  createdAt: number;
  currentIndex: number;
  isCompleted: boolean;
  packageId?: string;
}

/**
 * Ayah Games Arcade Data Model (Section 3 of Spec)
 */
export type GameType = 'guess_the_ayah' | 'continue_the_ayah' | 'catch_the_ayat';

export interface GameRound {
  ayahId: string;
  correct: boolean;
  selectedWrongAyahId?: string;   // if incorrect, what they picked instead
  wasKnownConfusionPair: boolean; // true if selectedWrongAyahId was already in confusionPairs
  responseTimeMs: number;
  xpEarned: number;
}

export interface GameSession {
  id: string;
  gameType: GameType;
  startedAt: number;
  endedAt: number | null;
  rounds: GameRound[];
  totalXP: number;
  bestStreak: number;
}

export interface MemorizedAyahItem {
  surahId: number;
  ayahNumber: number;
  ayahId: string;
  arabic: string;
  transliteration: string;
  translation: string;
  surahName: string;
  surahTransliteration: string;
  totalSurahAyahs: number;
  confusionPairs: string[];
}

/**
 * Exercise type variant
 */
export type ExerciseType =
  | 'fill-blank'
  | 'meaning-choice'
  | 'arabic-choice'
  | 'sequence-choice';

export type DirectionType = 'arabic-to-meaning' | 'meaning-to-arabic';

export type TabType =
  | 'today'
  | 'study'
  | 'games'
  | 'arcade'
  | 'explore'
  | 'progress'
  | 'you'
  | 'dashboard'
  | 'journey'
  | 'learn'
  | 'surahs'
  | 'hifz'
  | 'review'
  | 'stats'
  | 'profile'
  | 'listen'
  | 'settings'
  | 'exercise';

export type AIQuickActionType = 'explain' | 'tajweed' | 'tafsir' | 'vocabulary';

export interface ChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  arabicText?: string;
}

export interface ExerciseCardProps {
  /**
   * Exercise type variant
   */
  type: ExerciseType;

  /**
   * Current exercise number in lesson (1-indexed)
   */
  progressCurrent: number;

  /**
   * Total exercises in lesson
   */
  progressTotal: number;

  /**
   * Main prompt text or translation instruction
   */
  promptText?: string;

  /**
   * Optional Ayah reference badge (e.g. "Surah Al-Mulk 67:19")
   */
  ayahReference?: string;

  // --- For 'fill-blank' type ---
  /**
   * Full Ayah string with blank placeholders (___) or full words
   */
  ayahWithBlanks?: string;

  /**
   * Array of available words in word bank
   */
  wordBank?: string[];

  /**
   * Expected correct words for the blanks in order
   */
  correctBlanks?: string[];

  /**
   * Number of missing blanks expected
   */
  blankCount?: number;

  // --- For choice-based types ---
  /**
   * Options for multiple choice questions (usually 4 items)
   */
  options?: ChoiceOption[];

  /**
   * Translation direction (only for meaning-choice / arabic-choice)
   */
  direction?: DirectionType;

  // --- Customization ---
  /**
   * Custom Quranic Arabic font family name
   */
  fontFamily?: string;

  // --- Callbacks ---
  onClose?: () => void;
  onSubmit?: (isCorrect: boolean) => void;
  onContinue?: () => void;
}

/**
 * Smart Hifz Memory Engine Model (SuperMemo SM-2 & Multi-dimension memory)
 */
export interface AyahMemory {
  surahId: number;
  surahName: string;
  ayahNumber: number;
  arabicText: string;
  translation: string;

  ease: number;
  intervalDays: number;
  repetitions: number;

  lastReviewedAt: string;
  nextReviewAt: string;

  status: 'new' | 'learning' | 'stable' | 'due' | 'at-risk';
  humanStatus?: string;

  accuracy: number;
  meaningAccuracy: number;
  arabicAccuracy: number;
  sequenceAccuracy: number;
  tajweedAccuracy?: number;
  audioDependence?: number;
}

/**
 * Visual Quran Learning Path Node
 */
export interface LearningPathNode {
  id: string;
  surahNumber: number;
  title: string;
  arabicTitle: string;
  ayahsRange: string;
  estMinutes: number;
  status: 'completed' | 'current' | 'review' | 'upcoming' | 'locked';
  score?: number;
  dueAyahsCount?: number;
  juzNumber: number;
  type: 'lesson' | 'review' | 'milestone' | 'chest';
  description?: string;
  totalAyahs?: number;
  themeColor?: string;
  juzName?: string;
  versePreview?: string;
  translationSnippet?: string;
}

/**
 * Weekly Study Module Card (Study Guide Screen)
 */
export interface WeekModule {
  weekNumber: number;
  title: string;
  subjectsCount: number;
  surahs: {
    number: number;
    name: string;
    arabicName: string;
    progress: number;
    ayahsCount: number;
    iconType: 'globe' | 'cube' | 'book' | 'star' | 'atom' | 'flask';
  }[];
  todayLesson?: {
    surahNumber: number;
    surahName: string;
    ayahsRange: string;
    estMinutes: number;
  };
}

/**
 * Qari Reciter Model
 */
export interface QariReciter {
  id: string;
  name: string;
  arabicName: string;
  style: string;
  rating: number;
  avatarColor: string;
}
