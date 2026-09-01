import React, { useState, useEffect } from 'react';
import {
  Flame,
  Star,
  Sparkles,
  BookOpen,
  RotateCcw,
  Play,
  ChevronRight,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Target,
  Bookmark,
  Gamepad2,
  Check,
  ShieldCheck,
  Compass,
  MapPin,
  Map,
  Trophy,
  Award,
  Volume2,
  Search,
  ArrowUpRight,
  BarChart3,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  X,
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
  getNextSabaqAyah,
  isAyahMemorized,
} from '../../services/memorizationEngine';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { SURAH_CONTENT_DB, AyahDetail } from '../../data/quranVerses';
import { getSurahCompleteData } from '../../services/quranDataService';
import { useScrollLock } from '../../hooks/useScrollLock';
import { SilsilaLogo, SilsilaEmblem } from '../ui/SilsilaLogo';

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
  const [userName, setUserName] = useState('Salim');
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showQuickAccessPopup, setShowQuickAccessPopup] = useState(false);
  useScrollLock(showStreakModal || showQuickAccessPopup);
  const [progression, setProgression] = useState(() => getUserProgression());
  const [stats, setStats] = useState(() => getMemorizationStatsSummary());
  const [dailyQueue, setDailyQueue] = useState<DailyQueue>(() => getTodaysQueue());
  const [streakStats, setStreakStats] = useState<StreakStats>(() => getStreakStats());
  const [userPlan, setUserPlan] = useState(() => getUserPlan());
  const [sabaqAyahDetail, setSabaqAyahDetail] = useState<AyahDetail | null>(null);

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
    const existing = SURAH_CONTENT_DB[targetSurah]?.ayahs.find((a) => a.number === targetAyahNum);
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
  const allDailyComplete = isSabaqDoneToday && sabqiCount === 0 && manzilCount === 0;

  // Active study step if user stopped mid-way
  const activeStep = progression.activeStudyPosition?.surahNumber === dailyQueue.sabaq.surahId &&
    progression.activeStudyPosition?.ayahNumber === dailyQueue.sabaq.ayahNumber
      ? progression.activeStudyPosition.stepNumber || 1
      : 1;

  // Dashboard Features Alignment Array with richer, vibrant pastel shades (50% deeper tone)
  const quickFeatures = [
    {
      id: 'sabaq',
      title: "Today's Sabaq",
      subtitle: `Surah ${sabaqSurahMeta.name} • Ayah ${dailyQueue.sabaq.ayahNumber} of ${sabaqSurahMeta.totalAyahs}`,
      icon: Zap,
      cardBg: 'bg-amber-100/90 dark:bg-amber-950/40 hover:bg-amber-200/90 dark:hover:bg-amber-900/50 border-amber-300 dark:border-amber-800/80 hover:border-amber-400 dark:hover:border-amber-700',
      iconBg: 'bg-amber-500/25 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-400/80 dark:border-amber-700/80',
      action: () => onStartLesson(dailyQueue.sabaq.surahId, dailyQueue.sabaq.ayahNumber),
      badge: activeStep > 1 ? `Drill Step ${activeStep}/5` : 'New Verse',
      badgeColor: 'bg-white dark:bg-slate-900 text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-2xs font-extrabold',
      titleHover: 'group-hover:text-amber-950 dark:group-hover:text-amber-300',
      subtitleColor: 'text-amber-900 dark:text-amber-300/90 font-semibold',
    },
    {
      id: 'review',
      title: 'Spaced Review',
      subtitle: `${sabqiCount + manzilCount} Due (Sabqi & Manzil)`,
      icon: RotateCcw,
      cardBg: 'bg-indigo-100/90 dark:bg-indigo-950/40 hover:bg-indigo-200/90 dark:hover:bg-indigo-900/50 border-indigo-300 dark:border-indigo-800/80 hover:border-indigo-400 dark:hover:border-indigo-700',
      iconBg: 'bg-indigo-500/25 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border-indigo-400/80 dark:border-indigo-700/80',
      action: onOpenSpacedDeck,
      badge: sabqiCount + manzilCount > 0 ? `${sabqiCount + manzilCount} Due` : 'Up to Date',
      badgeColor: sabqiCount + manzilCount > 0 ? 'bg-white dark:bg-slate-900 text-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 shadow-2xs font-extrabold' : 'bg-white dark:bg-slate-900 text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-2xs font-extrabold',
      titleHover: 'group-hover:text-indigo-950 dark:group-hover:text-indigo-300',
      subtitleColor: 'text-indigo-900 dark:text-indigo-300/90 font-semibold',
    },
    {
      id: 'map',
      title: 'Hifz Journey Map',
      subtitle: `Juz ${sabaqSurahMeta.juzNumber} • 114 Surahs`,
      icon: Map,
      cardBg: 'bg-emerald-100/90 dark:bg-emerald-950/40 hover:bg-emerald-200/90 dark:hover:bg-emerald-900/50 border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-400 dark:hover:border-emerald-700',
      iconBg: 'bg-emerald-500/25 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border-emerald-400/80 dark:border-emerald-700/80',
      action: () => {
        if (onNavigateToProgress) onNavigateToProgress('hifz-map');
        else onNavigateToExplore(sabaqSurahMeta.number);
      },
      badge: 'Roadmap',
      badgeColor: 'bg-white dark:bg-slate-900 text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-2xs font-extrabold',
      titleHover: 'group-hover:text-emerald-950 dark:group-hover:text-emerald-300',
      subtitleColor: 'text-emerald-900 dark:text-emerald-300/90 font-semibold',
    },
    {
      id: 'games',
      title: 'Ayah Arcade',
      subtitle: '3 Active Recall Games',
      icon: Gamepad2,
      cardBg: 'bg-orange-100/90 dark:bg-orange-950/40 hover:bg-orange-200/90 dark:hover:bg-orange-900/50 border-orange-300 dark:border-orange-800/80 hover:border-orange-400 dark:hover:border-orange-700',
      iconBg: 'bg-orange-500/25 dark:bg-orange-500/20 text-orange-900 dark:text-orange-300 border-orange-400/80 dark:border-orange-700/80',
      action: onOpenGamesHub,
      badge: 'Earn XP',
      badgeColor: 'bg-white dark:bg-slate-900 text-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-800 shadow-2xs font-extrabold',
      titleHover: 'group-hover:text-orange-950 dark:group-hover:text-orange-300',
      subtitleColor: 'text-orange-900 dark:text-orange-300/90 font-semibold',
    },
    {
      id: 'study',
      title: 'Mushaf & Tafsir',
      subtitle: '114 Surahs & 12 Qaris',
      icon: BookOpen,
      cardBg: 'bg-teal-100/90 dark:bg-teal-950/40 hover:bg-teal-200/90 dark:hover:bg-teal-900/50 border-teal-300 dark:border-teal-800/80 hover:border-teal-400 dark:hover:border-teal-700',
      iconBg: 'bg-teal-500/25 dark:bg-teal-500/20 text-teal-900 dark:text-teal-300 border-teal-400/80 dark:border-teal-700/80',
      action: () => onNavigateToExplore(sabaqSurahMeta.number),
      badge: 'Word Study',
      badgeColor: 'bg-white dark:bg-slate-900 text-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-800 shadow-2xs font-extrabold',
      titleHover: 'group-hover:text-teal-950 dark:group-hover:text-teal-300',
      subtitleColor: 'text-teal-900 dark:text-teal-300/90 font-semibold',
    },
    {
      id: 'exams',
      title: 'Mastery Exams',
      subtitle: 'Surah Verification Tests',
      icon: Trophy,
      cardBg: 'bg-purple-100/90 dark:bg-purple-950/40 hover:bg-purple-200/90 dark:hover:bg-purple-900/50 border-purple-300 dark:border-purple-800/80 hover:border-purple-400 dark:hover:border-purple-700',
      iconBg: 'bg-purple-500/25 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 border-purple-400/80 dark:border-purple-700/80',
      action: () => {
        if (onOpenSurahTest) onOpenSurahTest(sabaqSurahMeta.number);
        else if (onNavigateToProgress) onNavigateToProgress('mastery-exams');
      },
      badge: 'Certify',
      badgeColor: 'bg-white dark:bg-slate-900 text-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800 shadow-2xs font-extrabold',
      titleHover: 'group-hover:text-purple-950 dark:group-hover:text-purple-300',
      subtitleColor: 'text-purple-900 dark:text-purple-300/90 font-semibold',
    },
  ];

  return (
    <div className="w-full space-y-3.5 pb-2 overflow-x-hidden box-border animate-in fade-in duration-300">
      {/* 1. GREETING & DATE HEADER */}
      <header className="flex items-center justify-between gap-2.5 px-0.5 pt-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/80 p-1 flex items-center justify-center shrink-0 shadow-2xs">
            <SilsilaEmblem className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-50 tracking-tight leading-tight truncate">
              As-salamu alaykum, {userName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-700 dark:text-slate-300">Today</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-emerald-800 dark:text-emerald-400 font-semibold">7 Safar 1448 AH</span>
            </p>
          </div>
        </div>

        {/* Top-Right Pills: Hifz Points & Consistency / Grace */}
        <div id="tour-hifz-points" data-tour="hifz-points" className="flex items-center gap-1.5 shrink-0">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 text-xs font-bold shrink-0 shadow-2xs"
            title={`Hifz Points: ${progression.hifzPoints ?? 15} pts (Need min 5 pts to unlock new Ayahs. +10 for new Ayah drill, +1 for revision, -1 for lesson error, -3 for exam error)`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{progression.hifzPoints ?? 15} pts</span>
          </div>

          <button
            onClick={() => setShowStreakModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 hover:bg-amber-500/20 dark:hover:bg-amber-500/30 border border-amber-500/20 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs font-bold shrink-0 shadow-2xs transition-all cursor-pointer active:scale-95"
            title="Daily Consistency & Grace System"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
            <span>{streakStats.currentStreak}d Consistency</span>
          </button>
        </div>
      </header>

      {/* 2. FEATURES & QUICK ACCESS ACCORDION EXTENSION (DROPS DOWN IN-LINE ON THE PAGE) */}
      <section className="rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/90 dark:border-zinc-800/80 shadow-2xs overflow-hidden transition-all duration-200">
        {/* Dropdown Header Trigger */}
        <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2">
          {/* Tappable Icon & Label to Toggle Dropdown */}
          <button
            onClick={() => setShowQuickAccessPopup((prev) => !prev)}
            className="flex items-center gap-2.5 group cursor-pointer text-left active:scale-[0.99] transition-all min-w-0 flex-1"
            title={showQuickAccessPopup ? 'Tap to collapse Features & Quick Access' : 'Tap to expand Features & Quick Access'}
          >
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all shrink-0 shadow-2xs ${
              showQuickAccessPopup
                ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 shadow-indigo-500/20'
                : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200/90 dark:border-indigo-800/90 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60'
            }`}>
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className={`text-xs font-extrabold uppercase tracking-wider transition-colors truncate ${
                  showQuickAccessPopup
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                }`}>
                  Features & Quick Access
                </h3>
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {showQuickAccessPopup ? 'Tap to collapse 6 core modules' : 'Tap icon to expand 6 core modules'}
              </p>
            </div>
          </button>

          {/* Expand / Collapse Pill Button */}
          <button
            onClick={() => setShowQuickAccessPopup((prev) => !prev)}
            className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer active:scale-95 shadow-2xs ${
              showQuickAccessPopup
                ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
            }`}
            title={showQuickAccessPopup ? 'Collapse 6 core modules' : 'Expand 6 core modules'}
          >
            <span>{showQuickAccessPopup ? 'Close' : '6 Modules'}</span>
            {showQuickAccessPopup ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Dropdown Extension Content (Drops down right on the page) */}
        {showQuickAccessPopup && (
          <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 border-t border-slate-100 dark:border-zinc-800/80 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {quickFeatures.map((feat) => {
                const IconComp = feat.icon;
                return (
                  <button
                    key={feat.id}
                    onClick={() => {
                      feat.action();
                    }}
                    className={`group relative p-3 rounded-2xl ${feat.cardBg} border shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-[0.98] text-left flex flex-col justify-between min-h-[84px] cursor-pointer`}
                  >
                    <div className="flex items-start justify-between gap-1.5 w-full">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${feat.iconBg}`}>
                        <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className={`text-[9px] sm:text-[9.5px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${feat.badgeColor}`}>
                        {feat.badge}
                      </span>
                    </div>

                    <div className="mt-2 min-w-0">
                      <span className={`font-extrabold text-xs text-slate-900 dark:text-slate-100 block truncate ${feat.titleHover} transition-colors`}>
                        {feat.title}
                      </span>
                      <span className={`text-[10px] sm:text-[10.5px] ${feat.subtitleColor} font-medium block truncate mt-0.5`}>
                        {feat.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 3. TODAY'S SABAQ (NEW MEMORIZATION DUE) — AMBER ACCENT & SINGLE CTA */}
      <section id="tour-sabaq-card" data-tour="sabaq-card" className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-300/80 dark:border-amber-700/80 border-l-4 border-l-[#D97706] shadow-xs relative overflow-hidden space-y-3">
        {/* Subtle decorative background accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/40 dark:bg-amber-900/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300/70 dark:border-amber-800 text-amber-950 dark:text-amber-300 font-black text-xs uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600 dark:text-amber-400" />
              <span>Today's Sabaq</span>
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              New Memorization
            </span>
          </div>

          <span className="text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
            {activeStep > 1 ? `Drill Step ${activeStep}/5 in Progress` : '5-Step Drill (~3-5 mins)'}
          </span>
        </div>

        {/* Surah & Ayah Identifiers */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Surah {sabaqSurahMeta.name}{' '}
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400 font-amiri">
                ({sabaqSurahMeta.arabicName})
              </span>
            </h2>
            <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-800">
              Ayah {dailyQueue.sabaq.ayahNumber} of {sabaqSurahMeta.totalAyahs}
            </span>
          </div>
          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Juz {sabaqSurahMeta.juzNumber} • {sabaqSurahMeta.revelationType} • Next in {userPlan.title}
          </p>
        </div>

        {/* Arabic Verse Preview Box */}
        <div className="py-2.5 px-3.5 bg-amber-50/40 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-800/60 space-y-1.5">
          <p className="font-quran text-lg sm:text-xl font-bold text-slate-950 dark:text-white leading-[2.1] text-right" dir="rtl">
            {sabaqAyahDetail?.arabic || 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'}
          </p>
          {sabaqAyahDetail?.translation && (
            <p className="text-xs text-slate-600 dark:text-slate-300 italic font-medium pt-1 border-t border-amber-100 dark:border-amber-900/60">
              "{sabaqAyahDetail.translation}"
            </p>
          )}
        </div>

        {/* Single Primary Action Button */}
        <button
          onClick={() => onStartLesson(dailyQueue.sabaq.surahId, dailyQueue.sabaq.ayahNumber)}
          className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-[#D97706] hover:bg-[#B45309] active:scale-[0.99] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>
            {activeStep > 1
              ? `Continue Ayah ${dailyQueue.sabaq.ayahNumber} (Step ${activeStep}/5)`
              : `Start Ayah ${dailyQueue.sabaq.ayahNumber} Drill (${sabaqSurahMeta.name})`}
          </span>
        </button>
      </section>

      {/* 4. CLEAR IDENTIFICATION OF THE HIFZ JOURNEY MAP ON THE DASHBOARD */}
      <section
        onClick={() => {
          if (onNavigateToProgress) onNavigateToProgress('hifz-map');
          else onNavigateToExplore(sabaqSurahMeta.number);
        }}
        className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/90 dark:border-emerald-800/90 border-l-4 border-l-emerald-600 shadow-2xs space-y-3 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xs transition-all active:scale-[0.995]"
        role="button"
        tabIndex={0}
        aria-label="Open Quran Hifz Journey Map"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
              <Map className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                  Quran Hifz Journey Map
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 shrink-0">
                  Roadmap
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Visual Stepping Stones & 114 Surah Milestone Path
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onNavigateToProgress) onNavigateToProgress('hifz-map');
              else onNavigateToExplore(sabaqSurahMeta.number);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
          >
            <span>Open Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current Active Location & Stepping Stone Node Ribbon */}
        <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
          {/* Top meta row: Current Target & Juz Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400">Current Position:</span>
            </div>
            <span className="text-[10.5px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 shrink-0 whitespace-nowrap">
              Juz {sabaqSurahMeta.juzNumber}
            </span>
          </div>

          {/* Surah Name & Ayah Number Line */}
          <div className="flex items-baseline justify-between gap-2 pt-0.5">
            <div className="font-black text-sm text-slate-900 dark:text-slate-100 truncate">
              Surah {sabaqSurahMeta.name}{' '}
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-amiri">
                ({sabaqSurahMeta.arabicName})
              </span>
            </div>
            <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800 shrink-0 whitespace-nowrap">
              Ayah {dailyQueue.sabaq.ayahNumber} of {sabaqSurahMeta.totalAyahs}
            </div>
          </div>

          {/* Stepping Stones Milestone Preview */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Prev completed node */}
              <div
                className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-700 shadow-2xs"
                title="Previous Ayah completed"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="w-3 sm:w-4 h-0.5 bg-emerald-300 dark:bg-emerald-700 shrink-0" />

              {/* Active current node */}
              <div className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 font-black text-[11px] shrink-0 shadow-2xs animate-pulse border border-amber-500">
                <Target className="w-3 h-3" />
                <span>Ayah {dailyQueue.sabaq.ayahNumber}</span>
              </div>
              <div className="w-3 sm:w-4 h-0.5 bg-slate-300 dark:bg-slate-700 shrink-0" />

              {/* Next upcoming node */}
              <div
                className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-200 dark:border-slate-700"
                title="Next Ayah"
              >
                {Math.min(sabaqSurahMeta.totalAyahs, dailyQueue.sabaq.ayahNumber + 1)}
              </div>
            </div>

            <div className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 text-right truncate">
              <span>{stats.planMemorizedAyahs}/{stats.planTotalAyahs}</span>{' '}
              <span className="text-emerald-700 dark:text-emerald-400">({stats.planPercent}%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 & 6. REVIEW SECTIONS WRAPPER (SABQI & MANZIL) */}
      <div id="tour-review-cards" data-tour="review-cards" className="space-y-3.5">
        {/* 5. TODAY'S SABQI (SHORT-TERM REVIEW DUE) — INDIGO ACCENT */}
        <section className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200/90 dark:border-indigo-800/90 border-l-4 border-l-[#6366F1] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                <RotateCcw className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  Today's Sabqi
                </h3>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                  Fragile 7-Day Rolling Retention
                </p>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              sabqiCount > 0
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}>
              {sabqiCount > 0 ? `${sabqiCount} Due` : 'Current'}
            </span>
          </div>

          {sabqiCount > 0 ? (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Reinforce recently learned verses before they fade from memory.
              </p>
              <button
                onClick={() => onOpenSpacedDeck()}
                className="px-3 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all"
              >
                <span>Review ({sabqiCount})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>All short-term Sabqi verses are up to date for today.</span>
            </div>
          )}
        </section>

        {/* 6. TODAY'S MANZIL (LONG-TERM SPACED REVIEW DUE) — INDIGO REVIEW TOKEN */}
        <section className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200/90 dark:border-indigo-800/90 border-l-4 border-l-[#6366F1] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  Today's Manzil
                </h3>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">
                  Long-Term Spaced Memory Anchor
                </p>
              </div>
            </div>

            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              manzilCount > 0
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}>
              {manzilCount > 0 ? `${manzilCount} Due` : 'Solid'}
            </span>
          </div>

          {manzilCount > 0 ? (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Spaced repetition review to prevent decay across mastered Surahs.
              </p>
              <button
                onClick={() => onOpenSpacedDeck()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all"
              >
                <span>Review ({manzilCount})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>All previously mastered Manzil verses are securely anchored.</span>
            </div>
          )}
        </section>
      </div>

      {/* 7. SLIM CONSISTENCY STRIP (ETHICAL HABIT DESIGN: GRACE DAYS, NOT BROKEN STREAKS) */}
      <section className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
              Weekly Consistency
            </h4>
            <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
              Grace Protected
            </span>
          </div>

          <button
            onClick={() => setShowStreakModal(true)}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
          >
            <span>Details</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* 7-Day Visual Row */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1">
          {streakStats.weeklyDays.map((day, idx) => {
            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                  day.isToday
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-300 font-black ring-1 ring-amber-300 dark:ring-amber-700'
                    : day.isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold'
                    : day.isFuture
                    ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600'
                    : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium' // Grace day
                }`}
              >
                <span className="text-[10px] uppercase font-mono">{day.dayLabel}</span>
                <div className="w-5 h-5 rounded-full flex items-center justify-center mt-1">
                  {day.isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                  ) : day.isToday ? (
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ) : day.isFuture ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                  ) : (
                    // Grace icon (Shield/calm) instead of red X or broken streak
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" title="Grace day protected" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium text-center">
          🌱 Missed days are safeguarded by calm grace protections rather than punitively reset.
        </p>
      </section>

      {/* Streak & Consistency Details Modal */}
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

