import React, { useState, useEffect } from 'react';
import {
  Flame,
  Star,
  Sparkles,
  BookOpen,
  RotateCcw,
  Play,
  ChevronRight,
  Info,
  Zap,
  CheckCircle2,
  Trophy,
  Volume2,
  Calendar,
  Layers,
  ArrowRight,
  Target,
  Bookmark,
  Gamepad2,
} from 'lucide-react';
import { JourneyPath } from './journey/JourneyPath';
import { MemorizationJourney } from './memorization/MemorizationJourney';
import { StreakDetailsModal } from './memorization/StreakDetailsModal';
import { getLastReadPosition, LastReadPosition } from '../services/quranDataService';
import {
  getUserProgression,
  getMemorizationStatsSummary,
  getDueReviewAyahs,
  getStreakStats,
  StreakStats,
} from '../services/memorizationEngine';
import { ALL_114_SURAHS } from '../data/quranMetadata';
import { getUserPlan } from '../services/memorizationEngine';

export interface DashboardViewProps {
  onStartLesson: (surahNumber?: number, ayahNumber?: number) => void;
  onExploreSurah: (surahNumber: number) => void;
  onOpenAudio: (surahNumber?: number) => void;
  onNavigateToReview?: () => void;
  onNavigateToHifz?: () => void;
  onOpenSurahTest?: (surahNumber: number) => void;
  onOpenPlanModal?: () => void;
  onOpenGamesHub?: () => void;
  onStartExerciseSequence?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartLesson,
  onExploreSurah,
  onOpenAudio,
  onNavigateToReview,
  onNavigateToHifz,
  onOpenSurahTest,
  onOpenPlanModal,
  onOpenGamesHub,
  onStartExerciseSequence,
}) => {
  const [userName, setUserName] = useState('Salim');
  const [showWholeQuranInfo, setShowWholeQuranInfo] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [journeyViewMode, setJourneyViewMode] = useState<'verse-quest' | 'surah-landmarks'>('verse-quest');
  const [progression, setProgression] = useState(() => getUserProgression());
  const [stats, setStats] = useState(() => getMemorizationStatsSummary());
  const [dueAyahs, setDueAyahs] = useState(() => getDueReviewAyahs());
  const [userPlan, setUserPlan] = useState(() => getUserPlan());
  const [streakStats, setStreakStats] = useState<StreakStats>(() => getStreakStats());

  useEffect(() => {
    const refresh = () => {
      setProgression(getUserProgression());
      setStats(getMemorizationStatsSummary());
      setDueAyahs(getDueReviewAyahs());
      setUserPlan(getUserPlan());
      setStreakStats(getStreakStats());
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('hafiz_progress_updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('hafiz_progress_updated', refresh);
    };
  }, []);

  const currentSurahMeta = ALL_114_SURAHS.find((s) => s.number === progression.currentSurah) || ALL_114_SURAHS[0];

  return (
    <div className="w-full space-y-2.5 pb-2 overflow-x-hidden box-border animate-in fade-in duration-300">
      {/* 1. TOP GREETING & STATUS HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-0.5 pt-0.5">
        <div className="min-w-0 flex-1">
          <h1 className="font-black text-base sm:text-lg text-slate-900 tracking-tight leading-tight truncate">
            As-salamu alaykum, {userName}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span className="text-slate-300">•</span>
            <span className="truncate">3 Rabi' al-Awwal 1448 AH</span>
          </p>
        </div>

        {/* Top-Right Metric Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* XP Badge */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] font-bold shrink-0 shadow-2xs"
            title="Total XP Earned"
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
            <span>{progression.userXP} XP</span>
          </div>

          {/* Daily Streak Badge */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] font-bold shrink-0 shadow-2xs"
            title="Learning Streak"
          >
            <Flame className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
            <span>{progression.streakDays}d</span>
          </div>
        </div>
      </header>

      {/* 1.5 ACTIVE MEMORIZATION PLAN BANNER */}
      <section className="p-3 rounded-xl bg-white border border-amber-200/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-800 flex items-center justify-center font-bold shrink-0 border border-amber-500/20">
              <Target className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  {stats.planTitle}
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 shrink-0">
                  {userPlan.planType === 'full_quran'
                    ? "Whole Qur'an"
                    : userPlan.planType === 'single_surah'
                    ? 'Single Surah'
                    : userPlan.planType === 'package'
                    ? 'Package'
                    : 'Custom Multi-Surah'}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 font-medium truncate">
                {stats.planMemorizedAyahs} of {stats.planTotalAyahs} ayat memorized • {stats.planEstDaysRemaining} days remaining
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPlanModal}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 font-black text-[11px] transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            Change Plan
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-0.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, stats.planPercent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-400">
            <span>{stats.planPercent}% Complete</span>
            <span>Pace: {userPlan.dailyPace || 3} ayat/day</span>
          </div>
        </div>
      </section>

      {/* 2. KEEP LEARNING & REVIEW */}
      {/* 2. KEEP LEARNING (SABAQ) & REVIEW (SABQI/MANZIL) */}
      <section className="grid grid-cols-2 gap-2.5">
        {/* Keep Learning Card (Sabaq - Amber) */}
        <button
          onClick={() => onStartLesson(progression.currentSurah, progression.currentAyah)}
          className="group relative flex flex-col justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all text-left min-h-[90px] active:scale-[0.98] cursor-pointer min-w-0"
        >
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              New Sabaq
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <BookOpen className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 min-w-0">
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-tight truncate">
              {currentSurahMeta.transliteration}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
              Ayah {progression.currentAyah} of {currentSurahMeta.totalAyahs}
            </p>
          </div>
        </button>

        {/* Review Card (Sabqi/Manzil - Indigo) */}
        <button
          onClick={onNavigateToReview || (() => onStartLesson(progression.currentSurah, progression.currentAyah))}
          className="group relative flex flex-col justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all text-left min-h-[90px] active:scale-[0.98] cursor-pointer min-w-0"
        >
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Review
            </span>
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <RotateCcw className="w-3 h-3" />
            </div>
          </div>
          <div className="mt-1 min-w-0">
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight truncate">
              {dueAyahs.length} Due Today
            </h3>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5 flex items-center gap-1 truncate">
              <span>{dueAyahs.length > 0 ? 'Ready for recall' : 'Up to date'}</span>
              {dueAyahs.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />}
            </p>
          </div>
        </button>
      </section>

      {/* 3. DAILY ACTIVITY / AYAH GAMES ARCADE CARD */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 text-white p-3 sm:p-3.5 shadow-2xs border border-slate-800">
        <div className="relative z-10 grid grid-cols-[1fr_auto] items-center gap-2.5">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9.5px] font-bold tracking-wide uppercase border border-amber-400/20 flex items-center gap-1">
                <Gamepad2 className="w-2.5 h-2.5" /> Ayah Arcade
              </span>
              <span className="text-[10.5px] text-amber-300 font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Up to 2x XP
              </span>
            </div>
            <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-tight truncate">
              Ayah Games Hub
            </h3>
            <p className="text-[11px] text-slate-300 leading-snug line-clamp-1">
              Guess the Ayah, Continue the Ayah, & Catch the Ayat — light recall practice.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onStartExerciseSequence && (
              <button
                onClick={onStartExerciseSequence}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                title="Start Interactive Exercise Sequence"
              >
                <Sparkles className="w-3 h-3" />
                <span>Drill Sequence</span>
              </button>
            )}
            <button
              onClick={onOpenGamesHub || (() => onStartLesson(progression.currentSurah, progression.currentAyah))}
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-slate-950" />
              <span>Play Games</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. RESUME READING & 3-TIER HIFZ CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Resume Reading Card */}
        <div
          onClick={() => onExploreSurah(progression.currentSurah)}
          className="group flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer min-h-[50px]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-[11px] flex items-center justify-center border border-indigo-100/80 shrink-0">
              #{progression.currentSurah}
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                Surah {currentSurahMeta.name}
              </h4>
              <p className="text-[10.5px] text-slate-500 font-medium truncate">
                {currentSurahMeta.transliteration} • Ayah {progression.currentAyah} of {currentSurahMeta.totalAyahs}
              </p>
            </div>
          </div>

          <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-500 transition-colors shrink-0 ml-1">
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* 3-Tier Hifz Planner Card */}
        <div
          onClick={onNavigateToHifz || (() => onExploreSurah(1))}
          className="group flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-900 shadow-2xs hover:border-slate-300 transition-all cursor-pointer min-h-[50px]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200/80 shrink-0 group-hover:scale-105 transition-transform">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs text-slate-900 tracking-tight truncate">
                3-Tier Hifz Planner
              </h4>
              <p className="text-[10.5px] text-slate-500 font-medium truncate">
                Sabaq (New) • Sabqi (Recent) • Manzil (Cycle)
              </p>
            </div>
          </div>

          <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shrink-0 ml-1">
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </section>

      {/* 5. LEARNING STREAK TRACKER (Merged Options 1 & 2) */}
      <section
        onClick={() => setShowStreakModal(true)}
        className="group relative p-3 sm:p-3.5 rounded-2xl bg-[#FAF9F5] border border-amber-900/15 shadow-2xs hover:border-amber-400/80 hover:shadow-xs transition-all cursor-pointer space-y-2.5 active:scale-[0.995]"
        role="button"
        tabIndex={0}
        aria-label="View Learning Streak and Daily Target Stats"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  Learning Streak
                </h4>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-100/60 px-1.5 py-0.2 rounded-md hidden sm:inline">
                  Tap for stats
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 truncate">Practice daily to protect recall</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Option 2: Today's Practice Target Status Pill */}
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                streakStats.isTodayGoalMet
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}
            >
              {streakStats.isTodayGoalMet ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Goal Met</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                  <span>Today: {streakStats.todayPracticedAyahs}/{streakStats.dailyTarget}</span>
                </>
              )}
            </span>

            {/* Streak Day Badge */}
            <span className="text-[11px] font-black text-amber-950 bg-amber-200/80 border border-amber-300/80 px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-0.5 shadow-2xs group-hover:bg-amber-300 transition-colors">
              <Flame className="w-3 h-3 fill-amber-600 text-amber-600" />
              <span>Day {streakStats.currentStreak}</span>
            </span>
          </div>
        </div>

        {/* 7-Day Dots Indicator */}
        <div className="grid grid-cols-7 gap-1 pt-0.5">
          {streakStats.weeklyDays.map((d, idx) => (
            <div key={idx} className="flex flex-col items-center gap-0.5 min-w-0">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-[11px] font-bold transition-all ${
                  d.isCompleted
                    ? 'bg-amber-500 text-white shadow-2xs group-hover:bg-amber-600'
                    : d.isToday
                    ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400 font-black'
                    : 'bg-slate-200/70 text-slate-400'
                }`}
                title={`${d.dayName}: ${d.ayahCount} ayat`}
              >
                {d.isCompleted ? <Flame className="w-3.5 h-3.5 fill-white" /> : d.dayLabel}
              </div>
              <span className={`text-[9.5px] font-bold ${d.isToday ? 'text-amber-800 font-extrabold' : 'text-slate-400'}`}>
                {d.dayLabel}
              </span>
            </div>
          ))}
        </div>

        {/* Subtle Footer Affordance */}
        <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 pt-0.5 border-t border-amber-900/5">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>{streakStats.weeklyDays.filter((d) => d.isCompleted).length} of 7 days completed this week</span>
          </span>
          <span className="text-amber-800 font-bold group-hover:text-amber-900 flex items-center gap-0.5">
            <span>View streak stats</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </section>

      {/* Streak Details Modal (Option 1) */}
      <StreakDetailsModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakStats={streakStats}
        onStartLesson={() => onStartLesson(progression.currentSurah, progression.currentAyah)}
        onStartReview={onNavigateToReview}
      />


      {/* 6. THE WHOLE QURAN (Guided Map Road & Memorization Journey) */}
      <section className="space-y-2 pt-0.5">
        <div className="flex items-center justify-between px-0.5 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              The Whole Qur'an
            </h3>
            <button
              onClick={() => setShowWholeQuranInfo(!showWholeQuranInfo)}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer w-5 h-5 flex items-center justify-center"
              title="About the Guided Quran Path"
              aria-label="About the Guided Quran Path"
            >
              <Info className="w-3 h-3" />
            </button>
          </div>

          {/* View Mode Toggle: Verse Quest vs Surah Milestones */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/60 text-xs">
            <button
              onClick={() => setJourneyViewMode('verse-quest')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] transition-all cursor-pointer ${
                journeyViewMode === 'verse-quest'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              Verse Quest
            </button>
            <button
              onClick={() => setJourneyViewMode('surah-landmarks')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] transition-all cursor-pointer ${
                journeyViewMode === 'surah-landmarks'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              Surah Milestones
            </button>
          </div>
        </div>

        {showWholeQuranInfo && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-[11.5px] text-indigo-900 leading-relaxed animate-in fade-in">
            This structured path guides you through memorizing verses with game-style stepping stones and Surah landmarks. Tap any verse node to start the 6-step memorization flow or review spaced recall.
          </div>
        )}

        {/* Dynamic Journey Views */}
        {journeyViewMode === 'verse-quest' ? (
          <MemorizationJourney
            onStartLesson={onStartLesson}
            onExploreSurah={onExploreSurah}
            onOpenAudio={onOpenAudio}
            onNavigateToReview={onNavigateToReview}
            onOpenSurahTest={onOpenSurahTest}
            onOpenPlanModal={onOpenPlanModal}
          />
        ) : (
          <JourneyPath
            onStartLesson={onStartLesson}
            onExploreSurah={onExploreSurah}
            onOpenAudio={onOpenAudio}
            onNavigateToReview={onNavigateToReview}
          />
        )}
      </section>
    </div>
  );
};


