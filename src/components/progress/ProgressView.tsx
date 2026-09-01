import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Trophy,
  Flame,
  Star,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  ChevronRight,
  AlertCircle,
  Play,
  Layers,
  Sparkles,
  Award,
  Check,
  X,
  Target,
  Map,
  Grid,
} from 'lucide-react';
import { ALL_114_SURAHS, SurahMeta } from '../../data/quranMetadata';
import {
  getUserProgression,
  getMemorizationStatsSummary,
  getRetentionDatabase,
  getDueReviewAyahs,
  getWeakAyahs,
  getStreakStats,
  getSurahMemorizationStats,
  StreakStats,
  AyahRetentionRecord,
} from '../../services/memorizationEngine';
import { MemorizationJourney } from '../memorization/MemorizationJourney';
import { JourneyPath } from '../journey/JourneyPath';
import { useScrollLock } from '../../hooks/useScrollLock';
import { getStoredExamResults, ExamResult } from '../../services/examService';

export interface ProgressViewProps {
  onStartLesson: (surahNumber: number, ayahNumber?: number) => void;
  onOpenSurahTest: (surahNumber: number) => void;
  onStartReviewSession: (surahNumber?: number, ayahNumber?: number) => void;
  onOpenSpacedDeck: () => void;
  onExploreSurah?: (surahNumber: number) => void;
  onOpenPlanModal?: () => void;
  initialSubTab?: 'hifz-map' | 'mastery-exams' | 'analytics';
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  onStartLesson,
  onOpenSurahTest,
  onStartReviewSession,
  onOpenSpacedDeck,
  onExploreSurah,
  onOpenPlanModal,
  initialSubTab = 'hifz-map',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hifz-map' | 'mastery-exams' | 'analytics'>(initialSubTab);
  const [hifzViewMode, setHifzViewMode] = useState<'stepping-stones' | 'landmark-road' | 'matrix'>('stepping-stones');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [selectedSurahModal, setSelectedSurahModal] = useState<SurahMeta | null>(null);
  useScrollLock(!!selectedSurahModal);
  const [progression, setProgression] = useState(() => getUserProgression());
  const [stats, setStats] = useState(() => getMemorizationStatsSummary());
  const [streakStats, setStreakStats] = useState<StreakStats>(() => getStreakStats());
  const [dueAyahs, setDueAyahs] = useState<AyahRetentionRecord[]>(() => getDueReviewAyahs());
  const [weakAyahs, setWeakAyahs] = useState<AyahRetentionRecord[]>(() => getWeakAyahs());

  const [masteryExamHistory, setMasteryExamHistory] = useState<ExamResult[]>(() => getStoredExamResults());

  const refresh = () => {
    setProgression(getUserProgression());
    setStats(getMemorizationStatsSummary());
    setStreakStats(getStreakStats());
    setDueAyahs(getDueReviewAyahs());
    setWeakAyahs(getWeakAyahs());
    setMasteryExamHistory(getStoredExamResults());
  };

  useEffect(() => {
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('hafiz_progress_updated', refresh);
    window.addEventListener('hafiz_exams_updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('hafiz_progress_updated', refresh);
      window.removeEventListener('hafiz_exams_updated', refresh);
    };
  }, []);

  // Total Verses Calculation
  const totalVerses = 6236;
  const inProgressCount = (stats.sabqiCount || 0) + (stats.sabaqCount || 0);
  const memorizedCount = stats.memorizedCount || (stats.masteredCount || 0);
  const overallPercentage = stats.overallPercent || ((memorizedCount / totalVerses) * 100).toFixed(1);

  return (
    <div className="w-full space-y-4 pb-2 animate-in fade-in duration-300">
      {/* 1. TOP HEADER & HIGH-LEVEL STATS */}
      <header className="flex items-center justify-between px-0.5 pt-1">
        <div>
          <h1 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Progress & Mastery
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Hifz Journey Map, Surah Mastery Exams & Retention
          </p>
        </div>

        {/* Total Ayahs Retained Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-bold shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{memorizedCount} Ayahs Retained</span>
        </div>
      </header>

      {/* 2. SUB-NAVIGATION PILLS */}
      <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('hifz-map')}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'hifz-map'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Hifz Map (114)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mastery-exams')}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'mastery-exams'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Mastery Exams</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'analytics'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>SM-2 Retention</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* SUB-VIEW 1: HIFZ JOURNEY MAP (STEPPING STONES & 114 SURAHS MATRIX)   */}
      {/* ===================================================================== */}
      {activeSubTab === 'hifz-map' && (
        <div id="tour-progress-map" data-tour="progress-map" className="space-y-4">
          {/* Map View Toggle Segment */}
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-1.5 px-2">
              <Map className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">Journey Display:</span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setHifzViewMode('stepping-stones')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  hifzViewMode === 'stepping-stones'
                    ? 'bg-emerald-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Stepping Stones</span>
              </button>

              <button
                type="button"
                onClick={() => setHifzViewMode('landmark-road')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  hifzViewMode === 'landmark-road'
                    ? 'bg-emerald-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mountain Road</span>
              </button>

              <button
                type="button"
                onClick={() => setHifzViewMode('matrix')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  hifzViewMode === 'matrix'
                    ? 'bg-emerald-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>114 Matrix</span>
              </button>
            </div>
          </div>

          {/* Stepping Stones Mode */}
          {hifzViewMode === 'stepping-stones' && (
            <div className="w-full">
              <MemorizationJourney
                onStartLesson={onStartLesson}
                onExploreSurah={onExploreSurah || (() => {})}
                onOpenSurahTest={onOpenSurahTest}
                onNavigateToReview={onStartReviewSession}
                onOpenPlanModal={onOpenPlanModal}
              />
            </div>
          )}

          {/* Landmark Scenic Mountain Road Mode */}
          {hifzViewMode === 'landmark-road' && (
            <div className="w-full">
              <JourneyPath
                onStartLesson={onStartLesson}
                onExploreSurah={onExploreSurah || (() => {})}
                onNavigateToReview={onStartReviewSession}
              />
            </div>
          )}

          {/* 114 Surah Matrix Grid Mode */}
          {hifzViewMode === 'matrix' && (
            /* 114 Surah Matrix Grid Mode */
            <div className="space-y-3.5">
              {/* Summary Progress Card */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Whole Quran Completion</span>
                  <span className="font-mono font-black text-indigo-700 dark:text-indigo-400">{overallPercentage}%</span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#10B981] transition-all duration-500"
                    style={{ width: `${(stats.masteredCount / totalVerses) * 100}%` }}
                    title={`${stats.masteredCount} Mastered`}
                  />
                  <div
                    className="h-full bg-[#6366F1] transition-all duration-500"
                    style={{ width: `${(inProgressCount / totalVerses) * 100}%` }}
                    title={`${inProgressCount} In Review`}
                  />
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300">Mastered ({stats.masteredCount || stats.memorizedCount || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                    <span className="font-semibold text-indigo-900 dark:text-indigo-300">In Review ({inProgressCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>Not Started ({totalVerses - memorizedCount})</span>
                  </div>
                </div>
              </div>

              {/* 114 Surah Interactive Grid */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                    Surah Matrix (1–114)
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Tap any Surah to inspect</span>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                  {ALL_114_SURAHS.map((surah) => {
                    const sStats = getSurahMemorizationStats(surah.number);
                    const isMastered = sStats.isComplete;
                    const isInProgress = sStats.memorizedCount > 0 && !isMastered;
                    const isCurrent = progression.currentSurah === surah.number;

                    return (
                      <button
                        key={surah.number}
                        onClick={() => setSelectedSurahModal(surah)}
                        className={`aspect-square p-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative active:scale-95 border ${
                          isMastered
                            ? 'bg-[#10B981] text-white border-[#059669] shadow-2xs'
                            : isInProgress
                            ? 'bg-[#6366F1] text-white border-[#4F46E5] font-bold shadow-2xs'
                            : isCurrent
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border-amber-400 dark:border-amber-600 font-extrabold ring-2 ring-[#D97706]'
                            : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                        title={`Surah ${surah.number}: ${surah.name} (${sStats.percent}% memorized)`}
                      >
                        <span className="text-[11px] font-mono font-bold leading-none">
                          {surah.number}
                        </span>
                        <span className="text-[8px] truncate max-w-full leading-tight mt-0.5 opacity-90">
                          {surah.name.slice(0, 5)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VIEW 2: SURAH MASTERY EXAM HISTORY & RETRIES                      */}
      {/* ===================================================================== */}
      {activeSubTab === 'mastery-exams' && (
        <div className="space-y-3.5">
          {/* Exam Trigger Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10.5px] font-black uppercase tracking-wider border border-indigo-400/30">
                Surah Mastery Verification
              </span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Comprehensive Mastery Exam
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Tests random blanks, mutashabihat discrimination, and full blind recall across entire Surahs.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onOpenSurahTest(1)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Test Surah Al-Fatihah</span>
              </button>

              <button
                onClick={() => onOpenSurahTest(114)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Test Surah An-Nas</span>
              </button>
            </div>
          </div>

          {/* Exam History Records */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
              Exam Record Log
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {masteryExamHistory.map((exam, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      exam.passed ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {exam.score}%
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                        Surah {exam.surahName} (#{exam.surahNumber})
                      </h4>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        {exam.date} • {exam.correctQuestions}/{exam.totalQuestions} Questions Correct
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenSurahTest(exam.surahNumber)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {exam.passed ? 'Retest' : 'Retry Exam'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-VIEW 3: SM-2 RETENTION ANALYTICS & WEAK VERSES                    */}
      {/* ===================================================================== */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-3.5">
          {/* Consistency & Grace Shield Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                Ethical Habit & Consistency Metrics
              </h3>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Grace Enabled
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-base font-black text-amber-600 dark:text-amber-400 block">
                  {streakStats.currentStreak}d
                </span>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Current Streak</span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400 block">
                  {streakStats.longestStreak}d
                </span>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Best Streak</span>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                  {streakStats.totalActiveDays}d
                </span>
                <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Total Days</span>
              </div>
            </div>
          </div>

          {/* SM-2 Retention Schedule Intervals */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                Memory Decay Prevention (SM-2)
              </h3>
              <button
                onClick={onOpenSpacedDeck}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                Open Review Deck
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-slate-900 dark:text-slate-100">
                <span className="font-bold text-amber-950 dark:text-amber-300">Due Today (Urgent)</span>
                <span className="font-mono font-black text-amber-900 dark:text-amber-200">{dueAyahs.length} ayahs</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span className="font-medium">Due in 3 Days</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">4 ayahs</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span className="font-medium">Due in 7 Days</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">7 ayahs</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <span className="font-medium">Solid Retention (&gt;30 Days)</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">13 ayahs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surah Detail Modal From Grid Tap */}
      {selectedSurahModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  Surah {selectedSurahModal.name} (#{selectedSurahModal.number})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedSurahModal.transliteration} • {selectedSurahModal.totalAyahs} Ayahs
                </p>
              </div>
              <button
                onClick={() => setSelectedSurahModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stats for this Surah */}
            {(() => {
              const sStats = getSurahMemorizationStats(selectedSurahModal.number);
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Memorization Progress</span>
                    <span className="text-indigo-700 dark:text-indigo-400 font-mono">{sStats.percent}% ({sStats.memorizedCount}/{sStats.totalAyahs})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${sStats.percent}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  const sNum = selectedSurahModal.number;
                  setSelectedSurahModal(null);
                  onStartLesson(sNum, 1);
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Practice Verses</span>
              </button>

              <button
                onClick={() => {
                  const sNum = selectedSurahModal.number;
                  setSelectedSurahModal(null);
                  onOpenSurahTest(sNum);
                }}
                className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Mastery Exam</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
