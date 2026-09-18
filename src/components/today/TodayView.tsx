import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  BookOpen,
  RotateCcw,
  Play,
  ArrowRight,
  Gamepad2,
  CheckCircle2,
  Map,
  Compass,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { StreakDetailsModal } from '../memorization/StreakDetailsModal';
import {
  getUserProgression,
  getMemorizationStatsSummary,
  getTodaysQueue,
  getStreakStats,
  StreakStats,
  DailyQueue,
  getUserPlan,
  isAyahMemorized,
} from '../../services/memorizationEngine';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { SURAH_CONTENT_DB, AyahDetail } from '../../data/quranVerses';
import {
  getSurahCompleteData,
  getAyahDetailFromCacheOrBundled,
  cleanAuthenticTranslation,
} from '../../services/quranDataService';
import { useScrollLock } from '../../hooks/useScrollLock';
import { getNiyyahEntries } from '../../services/niyyahService';
import { SilsilaEmblem } from '../ui/SilsilaLogo';
import { useAuth } from '../../context/AuthContext';
import { useTajweed } from '../tajweed/TajweedProvider';
import { getHijriDate } from '../../utils/islamicCalendar';
import { VisualStreakCounter } from './VisualStreakCounter';

export interface TodayViewProps {
  onStartLesson: (surahNumber?: number, ayahNumber?: number) => void;
  onNavigateToExplore: (surahNumber?: number) => void;
  onStartReviewSession: (surahNumber?: number, ayahNumber?: number) => void;
  onOpenSpacedDeck: () => void;
  onOpenPlanModal: () => void;
  onOpenGamesHub: () => void;
  onNavigateToProgress?: (subTab?: 'hifz-map' | 'mastery-exams' | 'analytics') => void;
  onOpenSurahTest?: (surahNumber: number) => void;
  onStartExerciseSequence?: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  onStartLesson,
  onNavigateToExplore,
  onStartReviewSession,
  onOpenSpacedDeck,
  onOpenPlanModal,
  onOpenGamesHub,
  onNavigateToProgress,
  onOpenSurahTest,
  onStartExerciseSequence,
}) => {
  const { user } = useAuth();
  const { annotateText } = useTajweed();
  const [showStreakModal, setShowStreakModal] = useState(false);
  useScrollLock(showStreakModal);

  const [progression, setProgression] = useState(() => getUserProgression());
  const [stats, setStats] = useState(() => getMemorizationStatsSummary());
  const [dailyQueue, setDailyQueue] = useState<DailyQueue>(() => getTodaysQueue());
  const [streakStats, setStreakStats] = useState<StreakStats>(() => getStreakStats());
  const [userPlan, setUserPlan] = useState(() => getUserPlan());
  const [sabaqAyahDetail, setSabaqAyahDetail] = useState<AyahDetail | null>(() => {
    const q = getTodaysQueue();
    return (
      SURAH_CONTENT_DB[q.sabaq.surahId]?.ayahs.find((a) => a.number === q.sabaq.ayahNumber) ||
      getAyahDetailFromCacheOrBundled(q.sabaq.surahId, q.sabaq.ayahNumber) ||
      null
    );
  });

  const refreshData = () => {
    const p = getUserProgression();
    const s = getMemorizationStatsSummary();
    const q = getTodaysQueue();
    const st = getStreakStats();
    const pl = getUserPlan();
    setProgression(p);
    setStats(s);
    setDailyQueue(q);
    setStreakStats(st);
    setUserPlan(pl);

    // Fetch accurate Arabic text & translation for active Sabaq
    const targetSurah = q.sabaq.surahId;
    const targetAyahNum = q.sabaq.ayahNumber;
    const existing =
      SURAH_CONTENT_DB[targetSurah]?.ayahs.find((a) => a.number === targetAyahNum) ||
      getAyahDetailFromCacheOrBundled(targetSurah, targetAyahNum);

    if (existing) {
      setSabaqAyahDetail(existing);
    } else {
      getSurahCompleteData(targetSurah).then((data) => {
        if (data && data.ayahs) {
          const found = data.ayahs.find((a) => a.number === targetAyahNum);
          if (found) setSabaqAyahDetail(found);
        }
      });
    }
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('storage', refreshData);
    window.addEventListener('hafiz_progress_updated', refreshData);
    window.addEventListener('silsila_progression_updated', refreshData);
    window.addEventListener('silsila_points_updated', refreshData);
    return () => {
      window.removeEventListener('storage', refreshData);
      window.removeEventListener('hafiz_progress_updated', refreshData);
      window.removeEventListener('silsila_progression_updated', refreshData);
      window.removeEventListener('silsila_points_updated', refreshData);
    };
  }, []);

  const sabaqSurahMeta = ALL_114_SURAHS.find((s) => s.number === dailyQueue.sabaq.surahId) || ALL_114_SURAHS[0];
  const isSabaqDoneToday = isAyahMemorized(dailyQueue.sabaq.surahId, dailyQueue.sabaq.ayahNumber);
  const sabqiCount = dailyQueue.sabqi.length;
  const manzilCount = dailyQueue.manzil.length;
  const totalReviewsDue = sabqiCount + manzilCount;
  const primaryNiyyah = getNiyyahEntries().find((n) => n.isPrimary) || getNiyyahEntries()[0];

  // Active study step if user stopped mid-way
  const activeStep =
    progression.activeStudyPosition?.surahNumber === dailyQueue.sabaq.surahId &&
    progression.activeStudyPosition?.ayahNumber === dailyQueue.sabaq.ayahNumber
      ? progression.activeStudyPosition.stepNumber || 1
      : 1;

  const displayUserName =
    user?.displayName ||
    (user?.email?.endsWith('@tester.silsila.app')
      ? user.email.replace('@tester.silsila.app', '')
      : 'Seeker');

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 pb-4 animate-in fade-in duration-200">
      {/* 1. CLEAN MINIMALIST HEADER */}
      <header className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 p-1 flex items-center justify-center shrink-0">
              <SilsilaEmblem className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight truncate">
                Salam, {displayUserName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Minimalist Stats Chips */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowStreakModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs font-bold transition-all hover:bg-amber-100/70 dark:hover:bg-amber-900/50 cursor-pointer active:scale-95"
              title="Daily consistency streak"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
              <span>{streakStats.currentStreak}d</span>
            </button>

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 text-xs font-bold"
              title={`Hifz Points: ${progression.hifzPoints ?? 15} pts`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{progression.hifzPoints ?? 15} pts</span>
            </div>
          </div>
        </div>

        {/* Quiet Spiritual Intention Quote */}
        {primaryNiyyah?.intentionText && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Heart className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-serif italic truncate">
              "{primaryNiyyah.intentionText}"
            </span>
          </div>
        )}
      </header>

      {/* 2. CORE ACTION: TODAY'S LESSON (SABAQ) */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
              Today's Lesson
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {activeStep > 1 ? `Step ${activeStep}/5 in progress` : 'New verse'}
          </span>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Surah {sabaqSurahMeta.name}{' '}
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-amiri">
                ({sabaqSurahMeta.arabicName})
              </span>
            </h2>
            <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400">
              Ayah {dailyQueue.sabaq.ayahNumber} of {sabaqSurahMeta.totalAyahs}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Juz {sabaqSurahMeta.juzNumber} • {userPlan.title || "The Whole Qur'an"}
          </p>
        </div>

        {/* Clean Arabic Verse Preview */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
          <div
            className="font-quran text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-[2.4] text-right selection:bg-amber-200/50"
            dir="rtl"
          >
            {sabaqAyahDetail?.arabic ? (
              annotateText(sabaqAyahDetail.arabic)
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-sans text-sm animate-pulse">
                Loading authentic Arabic text...
              </span>
            )}
          </div>
          {sabaqAyahDetail?.translation && (
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-200/60 dark:border-slate-750">
              {cleanAuthenticTranslation(sabaqAyahDetail.translation)}
            </p>
          )}
        </div>

        {/* Start / Continue Button */}
        <button
          onClick={() => onStartLesson(dailyQueue.sabaq.surahId, dailyQueue.sabaq.ayahNumber)}
          className="w-full min-h-[46px] py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>
            {activeStep > 1
              ? `Continue Ayah ${dailyQueue.sabaq.ayahNumber} (Step ${activeStep}/5)`
              : `Start Ayah ${dailyQueue.sabaq.ayahNumber} Lesson`}
          </span>
        </button>
      </section>

      {/* 3. DEDICATED FEATURE CARD: AYAH GAMES & PRACTICE */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3.5 transition-all hover:border-indigo-300 dark:hover:border-indigo-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                  Ayah Games & Practice
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-100 dark:border-indigo-800">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Strengthen retention through memory drills & active recall
              </p>
            </div>
          </div>
        </div>

        {/* 3 Quick Game Chips */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Guess the Ayah</p>
            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5">Audio & context</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Continue Verse</p>
            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5">Sequence order</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-center">
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Catch the Words</p>
            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5">Rapid recall</p>
          </div>
        </div>

        {/* Play Now CTA Button */}
        <button
          onClick={onOpenGamesHub}
          className="w-full min-h-[42px] py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
        >
          <span>Open Practice Games</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* 4. DAILY REVIEW (SPACED REPETITION) */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                Spaced Review
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {totalReviewsDue > 0
                  ? `${totalReviewsDue} verse${totalReviewsDue > 1 ? 's' : ''} due to prevent memory decay`
                  : 'All learned verses are securely retained'}
              </p>
            </div>
          </div>

          {totalReviewsDue > 0 ? (
            <button
              onClick={onOpenSpacedDeck}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <span>Review ({totalReviewsDue})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>Current</span>
            </div>
          )}
        </div>
      </section>

      {/* 5. QUICK OVERVIEW: KEY BASIC FEATURES (QURAN EXPLORER & ROADMAP) */}
      <div className="grid grid-cols-2 gap-3 pt-0.5">
        <button
          onClick={() => onNavigateToExplore(sabaqSurahMeta.number)}
          className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-all active:scale-[0.99] cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-2.5 border border-teal-200/60 dark:border-teal-800/60">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
            Read & Listen
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            114 Surahs & Reciters
          </p>
        </button>

        <button
          onClick={() => {
            if (onNavigateToProgress) onNavigateToProgress('hifz-map');
            else onNavigateToExplore(sabaqSurahMeta.number);
          }}
          className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-all active:scale-[0.99] cursor-pointer shadow-xs group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2.5 border border-emerald-200/60 dark:border-emerald-800/60">
            <Map className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
            Hifz Roadmap
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {stats.planMemorizedAyahs}/{stats.planTotalAyahs} Ayat ({stats.planPercent}%)
          </p>
        </button>
      </div>

      {/* Streak Details Modal */}
      {showStreakModal && (
        <StreakDetailsModal
          onClose={() => setShowStreakModal(false)}
          onStartLesson={() => {
            setShowStreakModal(false);
            onStartLesson(dailyQueue.sabaq.surahId, dailyQueue.sabaq.ayahNumber);
          }}
        />
      )}
    </div>
  );
};
