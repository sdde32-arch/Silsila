import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Sparkles,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Star,
  Lock,
  ArrowRight,
  Trophy,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  Flame,
  Award,
  BookMarked,
  Sliders,
  RefreshCw,
  Info,
  HelpCircle,
  Clock,
  Compass,
  DownloadCloud,
} from 'lucide-react';
import {
  getRetentionDatabase,
  getUserProgression,
  getMemorizationStatsSummary,
  getDueReviewAyahs,
  getWeakAyahs,
  isSurahUnlocked,
  isAyahAccessible,
  AyahRetentionRecord,
  UserProgressionState,
} from '../services/memorizationEngine';
import { SURAH_CONTENT_DB, AyahDetail, SurahContent } from '../data/quranVerses';
import { ALL_114_SURAHS, SurahMeta } from '../data/quranMetadata';
import {
  WordDetailData,
  getAyahWordsData,
  playArabicWordPronunciation,
  QURAN_RECITERS,
  ReciterProfile,
  globalAudioManager,
} from '../services/quranAudioEngine';
import { WordPronunciationModal } from './memorization/WordPronunciationModal';
import { AyahNumberBadge } from './ui/AyahNumberBadge';
import { downloadSurahOfflineNotes } from '../services/downloadService';

export interface LearnTabViewProps {
  onStartLesson: (surahNumber: number, ayahNumber: number) => void;
  onExploreSurah: (surahNumber: number) => void;
  onOpenAudio: (surahNumber: number) => void;
  onNavigateToReview: () => void;
  onOpenSurahTest: (surahNumber: number) => void;
  onOpenPlanModal?: () => void;
  onOpenGamesHub?: () => void;
  onStartExerciseSequence?: () => void;
}

export const LearnTabView: React.FC<LearnTabViewProps> = ({
  onStartLesson,
  onExploreSurah,
  onOpenAudio,
  onNavigateToReview,
  onOpenSurahTest,
  onOpenPlanModal,
  onOpenGamesHub,
  onStartExerciseSequence,
}) => {
  // Progression & Retention State (Synced in Real Time)
  const [progression, setUserProgressionState] = useState<UserProgressionState>(getUserProgression());
  const [retentionDb, setRetentionDb] = useState<Record<string, AyahRetentionRecord>>(getRetentionDatabase());
  const [statsSummary, setStatsSummary] = useState(getMemorizationStatsSummary());

  // Selected Surah for browsing in the Learn tab
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(progression.currentSurah || 1);
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number>(progression.currentAyah || 1);

  // Audio Playback
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  // Word Pronunciation Modal
  const [selectedWordForDrill, setSelectedWordForDrill] = useState<WordDetailData | null>(null);

  // Active Reciter
  const [selectedReciter, setSelectedReciter] = useState<ReciterProfile>(QURAN_RECITERS[0]);

  // Sync state from storage
  const syncStateFromStorage = useCallback(() => {
    const freshProg = getUserProgression();
    const freshDb = getRetentionDatabase();
    const freshStats = getMemorizationStatsSummary();

    setUserProgressionState(freshProg);
    setRetentionDb(freshDb);
    setStatsSummary(freshStats);
  }, []);

  useEffect(() => {
    syncStateFromStorage();

    const handleStorage = () => syncStateFromStorage();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('hafiz_progress_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('hafiz_progress_updated', handleStorage);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, [syncStateFromStorage]);

  // Active Surah Content
  const surahContent: SurahContent | undefined =
    SURAH_CONTENT_DB[selectedSurahNumber] || SURAH_CONTENT_DB[1];
  const surahMeta: SurahMeta | undefined =
    ALL_114_SURAHS.find((s) => s.number === selectedSurahNumber) || ALL_114_SURAHS[0];

  // Active Ayah Detail
  const activeAyah: AyahDetail =
    surahContent.ayahs.find((a) => a.number === selectedAyahNumber) || surahContent.ayahs[0];

  // Retention record for active Ayah
  const activeAyahRecord: AyahRetentionRecord =
    retentionDb[`${selectedSurahNumber}:${selectedAyahNumber}`] || {
      surahId: selectedSurahNumber,
      surahNumber: selectedSurahNumber,
      ayahNumber: selectedAyahNumber,
      globalOrder: 1,
      stage: 'sabaq',
      state: 'LEARNING',
      stageEnteredAt: Date.now(),
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
      nextReviewAt: 0,
      retentionScore: 0,
      completedSteps: [],
      recallHistory: [],
      confusionPairs: [],
      consecutiveCorrectBlindRecalls: 0,
      lastBlankPattern: [],
    };

  // Surah retention stats computed dynamically
  const surahRecords: AyahRetentionRecord[] = (Object.values(retentionDb) as AyahRetentionRecord[]).filter(
    (r) => (r.surahNumber || r.surahId) === selectedSurahNumber
  );
  const masteredCount = surahRecords.filter((r) => r.state === 'MASTERED' || r.stage === 'manzil').length;
  const learningCount = surahRecords.filter((r) => r.state === 'LEARNING' || r.stage === 'sabaq').length;
  const practicingCount = surahRecords.filter((r) => r.state === 'PRACTICING').length;
  const recallingCount = surahRecords.filter((r) => r.state === 'RECALLING' || r.stage === 'sabqi').length;
  const totalScore = surahRecords.reduce((acc, r) => acc + (r.retentionScore || (r.stage === 'manzil' ? 95 : r.stage === 'sabqi' ? 80 : 50)), 0);
  const averageRetention = surahRecords.length > 0 ? Math.round(totalScore / surahRecords.length) : 0;

  const surahStats = {
    masteredCount,
    learningCount,
    practicingCount,
    recallingCount,
    averageRetention,
  };

  const wordsInActiveAyah = getAyahWordsData(selectedSurahNumber, activeAyah.number, activeAyah.arabic);

  // Handle playing audio for Ayah
  const handleToggleAyahAudio = (surahNum: number, ayahNum: number) => {
    const key = `${surahNum}:${ayahNum}`;
    if (playingAudioKey === key) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingAudioKey(null);
      return;
    }

    globalAudioManager.stopAll(`learn-tab-${key}`);

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    const sPad = String(surahNum).padStart(3, '0');
    const aPad = String(ayahNum).padStart(3, '0');
    const audioUrl = `https://everyayah.com/data/${selectedReciter.subfolder}/${sPad}${aPad}.mp3`;

    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    setPlayingAudioKey(key);

    const unregister = globalAudioManager.registerAudioElement(audio, `learn-tab-${key}`, () => {
      try {
        if (!audio.paused) audio.pause();
      } catch {}
      setPlayingAudioKey(null);
    });

    audio.onended = () => {
      unregister();
      setPlayingAudioKey(null);
    };
    audio.onerror = () => {
      unregister();
      setPlayingAudioKey(null);
    };
    audio.play().catch(() => {
      unregister();
      setPlayingAudioKey(null);
    });
  };

  const dueReviews = getDueReviewAyahs();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP LEARNING HERO / ACTIVE FOCUS BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] text-white p-5 sm:p-6 shadow-xl border border-slate-800">
        {/* Background Islamic Calligraphy Watermark */}
        <div className="absolute right-[-10px] top-[-10px] text-white/5 select-none pointer-events-none text-9xl font-amiri font-bold">
          {surahMeta.number}
        </div>

        {/* Top Header info */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
                Current Focus • Surah #{surahMeta.number}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {surahMeta.revelationType} • {surahMeta.totalAyahs} Ayahs
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5 flex items-center gap-2">
              <span>{surahMeta.name}</span>
              <span className="text-emerald-400 font-amiri text-lg sm:text-xl font-bold">
                ({surahMeta.arabicName})
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              {surahMeta.translation} • Juz {surahMeta.juzNumber}
            </p>
          </div>
          
          <button
            onClick={async () => {
              const btn = document.getElementById('learn-tab-download-btn');
              if (btn) btn.classList.add('animate-pulse', 'text-amber-300');
              await downloadSurahOfflineNotes(surahMeta.number);
              if (btn) btn.classList.remove('animate-pulse', 'text-amber-300');
            }}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            title="Download full Surah notes offline"
          >
            <DownloadCloud id="learn-tab-download-btn" className="w-5 h-5 transition-colors" />
          </button>
        </div>

        {/* Active Ayah Calligraphy & Audio Spotlight */}
        <div className="relative z-10 mt-4 p-4 sm:p-5 rounded-3xl bg-white/5 backdrop-blur-xs border border-white/10 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5" />
              <span>Current Memorization Focus</span>
            </span>

            {/* Recitation Audio Trigger */}
            <button
              onClick={() => handleToggleAyahAudio(selectedSurahNumber, activeAyah.number)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {playingAudioKey === `${selectedSurahNumber}:${activeAyah.number}` ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Listen</span>
                </>
              )}
            </button>
          </div>

          {/* Pure Arabic Calligraphy Container (Isolated from clutter) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/20 border border-white/10 shadow-inner">
            <p className="font-amiri text-2xl sm:text-3xl text-right leading-[2.2] text-white" dir="rtl">
              {activeAyah.arabic}
            </p>
          </div>

          {/* Meta Bar with Standardized Ayah Number Badge positioned on Bottom-Right */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[11px] text-slate-300 font-medium">
              Surah {surahMeta.name} • Juz {surahMeta.juzNumber}
            </span>
            <AyahNumberBadge
              ayahNumber={activeAyah.number}
              surahNumber={surahMeta.number}
              variant="dark"
              size="sm"
            />
          </div>

          {/* Translation & Transliteration */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
              "{activeAyah.translation}"
            </p>
            <p className="text-[11px] text-slate-400 italic">
              {activeAyah.transliteration}
            </p>
          </div>
        </div>

        {/* 6-Step Pedagogical Progression Roadmap Indicator */}
        <div className="relative z-10 mt-4 pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>6-Step Learning Methodology</span>
            </span>
            <span className="text-amber-400 font-extrabold">
              {activeAyahRecord.completedSteps?.length || 0} of 6 Steps Completed
            </span>
          </div>

          {/* Step dots */}
          <div className="grid grid-cols-6 gap-1.5">
            {[
              { num: 1, name: 'Listen' },
              { num: 2, name: 'Understand' },
              { num: 3, name: 'Practice' },
              { num: 4, name: 'Fade' },
              { num: 5, name: 'Recall' },
              { num: 6, name: 'Master' },
            ].map((st) => {
              const isDone = (activeAyahRecord.completedSteps || []).includes(st.num);
              return (
                <div
                  key={st.num}
                  className={`py-1 px-1 rounded-lg text-center border transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <p className="text-[9px] font-black uppercase tracking-wider">{st.num}. {st.name}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary CTA: Launch Full-Page 6-Step Lesson & Interactive Drills */}
        <div className="relative z-10 mt-5 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => onStartLesson(selectedSurahNumber, activeAyah.number)}
            className="w-full flex-1 min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
            <span>Start Full 6-Step Memorization Lesson</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {onStartExerciseSequence && (
            <button
              onClick={onStartExerciseSequence}
              className="w-full sm:w-auto min-h-[48px] py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
              title="Practice interactive verse exercise drill sequence"
            >
              <Sparkles className="w-4 h-4" />
              <span>Interactive Drills</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. "WHAT IS NEEDED" LEARNING BLUEPRINT & PREREQUISITES */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                What is Needed for Mastery
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Key requirements to advance Ayah {activeAyah.number} from learning to long-term memory
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
            Hifz Standards
          </span>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Pillar 1: Word-by-Word Articulation */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-amber-900/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                1. Word-by-Word Tajweed
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {wordsInActiveAyah.length} Words
              </span>
            </div>
            <p className="font-bold text-xs text-slate-800">
              Clear pronunciation of each root word and articulation point (Makhraj).
            </p>
            <p className="text-[11px] text-slate-500">
              Tap any word below in the Word Studio to practice individual letter syllables.
            </p>
          </div>

          {/* Pillar 2: Contextual Meaning & Tafsir */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-amber-900/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                2. Meaning Comprehension
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                Understanding
              </span>
            </div>
            <p className="font-bold text-xs text-slate-800">
              Grasp the translation and thematic context of the verse.
            </p>
            <p className="text-[11px] text-slate-500">
              Helps prevent word mixups and reinforces logical sentence flow.
            </p>
          </div>

          {/* Pillar 3: Active Recall Scramble */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-amber-900/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                3. Active Recall Test
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                Independence
              </span>
            </div>
            <p className="font-bold text-xs text-slate-800">
              Reconstructing and reciting the verse from memory with zero visual aids.
            </p>
            <p className="text-[11px] text-slate-500">
              Tested in Step 5 of the learning lesson through word scramble ordering.
            </p>
          </div>

          {/* Pillar 4: SM-2 Spaced Retention */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-amber-900/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">
                4. Spaced Retention (SM-2)
              </span>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                Retention
              </span>
            </div>
            <p className="font-bold text-xs text-slate-800">
              Passing reviews at dynamic intervals: Day 1 → Day 3 → Day 7 → Day 14.
            </p>
            <p className="text-[11px] text-slate-500">
              Ensures verses transition permanently into long-term memory.
            </p>
          </div>
        </div>
      </div>

      {/* 3. WORD-BY-WORD PRONUNCIATION STUDIO (TAP TO DRILL) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Word-by-Word Articulation Studio</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tap any Arabic word in Ayah {activeAyah.number} to practice authentic pronunciation
            </p>
          </div>

          <span className="text-xs font-bold text-slate-400">
            {wordsInActiveAyah.length} Words
          </span>
        </div>

        {/* Word Chips Carousel / Grid (RTL Order) */}
        <div className="flex flex-wrap gap-2.5 justify-end" dir="rtl">
          {wordsInActiveAyah.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWordForDrill(w)}
              className="group text-right p-3 rounded-2xl bg-[#FAF9F5] hover:bg-amber-50 border border-slate-200/90 hover:border-amber-400 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex flex-col items-center min-w-[80px]"
            >
              <span className="font-amiri text-xl font-bold text-slate-900 group-hover:text-amber-800 transition-colors dark:text-slate-100">
                {w.arabic}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 group-hover:text-amber-700 mt-1" dir="ltr">
                {w.translation}
              </span>
              <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-emerald-600 opacity-80 group-hover:opacity-100" dir="ltr">
                <Volume2 className="w-2.5 h-2.5" />
                <span>Practice</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. SURAH MEMORIZATION PROGRESS MATRIX & AYAH NAVIGATOR */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Header & Surah Selector */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Surah Memorization Progress</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time synchronization across all verses in {surahMeta.name}
            </p>
          </div>

          {/* Surah Dropdown Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSurahNumber}
              onChange={(e) => {
                const sNum = Number(e.target.value);
                setSelectedSurahNumber(sNum);
                setSelectedAyahNumber(1);
              }}
              aria-label="Select Surah to view memorization progress"
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-800 hover:border-amber-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {ALL_114_SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name} ({s.arabicName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Surah Progress Summary Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 via-[#FAF9F5] to-emerald-50/70 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              Surah {surahMeta.name} Mastery:
            </span>
            <span className="font-black text-slate-900">
              {surahStats.masteredCount} / {surahMeta.totalAyahs} Ayahs ({Math.round((surahStats.masteredCount / surahMeta.totalAyahs) * 100)}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (surahStats.masteredCount / surahMeta.totalAyahs) * 100)}%` }}
            />
          </div>

          {/* Quick stats mini row */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-white/80 border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Mastered</p>
              <p className="font-black text-xs text-emerald-700">{surahStats.masteredCount} Ayahs</p>
            </div>
            <div className="p-2 rounded-xl bg-white/80 border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase">In Progress</p>
              <p className="font-black text-xs text-indigo-700">
                {surahStats.learningCount + surahStats.practicingCount + surahStats.recallingCount} Ayahs
              </p>
            </div>
            <div className="p-2 rounded-xl bg-white/80 border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Average Retention</p>
              <p className="font-black text-xs text-amber-700">{surahStats.averageRetention}%</p>
            </div>
          </div>
        </div>

        {/* Ayah-by-Ayah Table / Cards */}
        <div className="space-y-2.5 pt-1">
          <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
            All Ayahs in {surahMeta.name}
          </h4>

          <div className="space-y-2">
            {surahContent.ayahs.map((ayah) => {
              const rec = retentionDb[`${selectedSurahNumber}:${ayah.number}`];
              const isSelected = selectedAyahNumber === ayah.number;
              const isMastered = rec?.state === 'MASTERED';
              const isLearning = rec?.state === 'LEARNING' || rec?.state === 'PRACTICING' || rec?.state === 'RECALLING';
              const isDue = rec?.state === 'DUE_FOR_REVIEW' || rec?.state === 'NEEDS_REINFORCEMENT';

              return (
                <div
                  key={ayah.number}
                  onClick={() => setSelectedAyahNumber(ayah.number)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-amber-50/60 border-amber-400 shadow-xs ring-2 ring-amber-400/20'
                      : 'bg-[#FAF9F5] hover:bg-slate-50 border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {/* State Tag */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            isMastered
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isDue
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : isLearning
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {rec?.state || 'NOT STARTED'}
                        </span>

                        {/* Retention Score */}
                        {rec && (rec.retentionScore ?? 0) > 0 && (
                          <span className="text-[10px] font-bold text-slate-500">
                            {rec.retentionScore}% Retention
                          </span>
                        )}
                      </div>

                      {/* Arabic text snippet in clean container */}
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs my-1.5" dir="rtl">
                        <p className="font-quran text-lg sm:text-xl font-bold text-slate-900 text-right leading-relaxed dark:text-slate-100">
                          {ayah.arabic}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 font-medium line-clamp-1 mt-1">
                        "{ayah.translation}"
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleAyahAudio(selectedSurahNumber, ayah.number)}
                        className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                        title="Listen to Ayah audio"
                      >
                        {playingAudioKey === `${selectedSurahNumber}:${ayah.number}` ? (
                          <Pause className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </button>

                      <button
                        onClick={() => onStartLesson(selectedSurahNumber, ayah.number)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <span>Learn</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Standardized Bottom Meta Row with Ayah Number Badge positioned at Bottom-Right */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10.5px] text-slate-400">
                    <span>{ayah.words ? `${ayah.words.length} Words` : ''}</span>
                    <AyahNumberBadge
                      ayahNumber={ayah.number}
                      surahNumber={selectedSurahNumber}
                      variant={isMastered ? 'emerald' : isLearning ? 'subtle' : 'minimal'}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. QUICK PRACTICE & MASTERY EXAM SHORTCUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Spaced Repetition Due Reviews Card */}
        <div
          onClick={onNavigateToReview}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-[#FAF9F5] border border-indigo-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-[10px] uppercase tracking-wide">
              {dueReviews.length} Due for Review
            </span>
          </div>

          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
              Spaced Repetition Deck
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Review verses scheduled by the SM-2 algorithm to prevent memory decay.
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs font-extrabold text-indigo-600 pt-1">
            <span>Open Review Deck</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Surah Exam Card */}
        <div
          onClick={() => onOpenSurahTest(selectedSurahNumber)}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-[#FAF9F5] border border-amber-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase tracking-wide">
              Mastery Verification
            </span>
          </div>

          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-amber-700 transition-colors">
              Surah {surahMeta.name} Exam
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Comprehensive exam testing all verses, Ayah order, and cumulative recitation.
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs font-extrabold text-amber-700 pt-1">
            <span>Take Surah Exam</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Word-by-Word Pronunciation Drill Modal */}
      {selectedWordForDrill && (
        <WordPronunciationModal
          word={selectedWordForDrill}
          allAyahWords={wordsInActiveAyah}
          surahNumber={selectedSurahNumber}
          ayahNumber={activeAyah.number}
          surahName={surahMeta.name}
          activeReciter={selectedReciter}
          onSelectReciter={(r) => setSelectedReciter(r)}
          onSelectWord={(newW) => setSelectedWordForDrill(newW)}
          onClose={() => {
            setSelectedWordForDrill(null);
            syncStateFromStorage();
          }}
          onContinue={() => {
            setSelectedWordForDrill(null);
            syncStateFromStorage();
          }}
        />
      )}
    </div>
  );
};

export default LearnTabView;
