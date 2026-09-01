import React from 'react';
import {
  Flame,
  X,
  Trophy,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  Zap,
} from 'lucide-react';
import { StreakStats } from '../../services/memorizationEngine';
import { useScrollLock } from '../../hooks/useScrollLock';

export interface StreakDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakStats: StreakStats;
  onStartLesson?: () => void;
  onStartReview?: () => void;
}

export const StreakDetailsModal: React.FC<StreakDetailsModalProps> = ({
  isOpen,
  onClose,
  streakStats,
  onStartLesson,
  onStartReview,
}) => {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const targetPercent = Math.min(
    100,
    Math.round((streakStats.todayPracticedAyahs / Math.max(1, streakStats.dailyTarget)) * 100)
  );

  const completedDaysCount = streakStats.weeklyDays.filter((d) => d.isCompleted).length;
  const consistencyPercent = Math.round((completedDaysCount / 7) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full border border-amber-900/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <header className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                Learning Streak & Habit
              </h2>
              <p className="text-xs text-slate-500 font-medium">Daily Quran retention insights</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close streak details"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto min-h-0">
          {/* Main Streak Hero */}
          <div className="text-center p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/40 border border-amber-200/80 space-y-1.5 relative overflow-hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-amber-500 text-white shadow-md mb-1 animate-pulse">
              <Flame className="w-8 h-8 fill-white" />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-amber-950 tracking-tight">
                {streakStats.currentStreak}
              </span>
              <span className="text-base sm:text-lg font-bold text-amber-800">Days Active</span>
            </div>
            <p className="text-xs text-amber-900 font-medium max-w-xs mx-auto">
              {streakStats.isTodayGoalMet
                ? "Goal accomplished for today! You've protected your Quranic retention."
                : 'Practice at least 1 ayah today to extend your streak and lock in recall.'}
            </p>
          </div>

          {/* Today's Target Status Card (Option 2 Merged) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Today's Daily Target</h4>
                  <p className="text-[10.5px] text-slate-500">
                    Goal: {streakStats.dailyTarget} ayat/day
                  </p>
                </div>
              </div>

              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap inline-flex items-center gap-1 shrink-0 ${
                  streakStats.isTodayGoalMet
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {streakStats.isTodayGoalMet ? 'Target Met' : `${streakStats.todayPracticedAyahs}/${streakStats.dailyTarget} Ayat`}
              </span>
            </div>

            {/* Target Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    streakStats.isTodayGoalMet
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600'
                  }`}
                  style={{ width: `${Math.max(8, targetPercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>{targetPercent}% Completed</span>
                <span>
                  {streakStats.isTodayGoalMet
                    ? '100% of daily commitment'
                    : `${Math.max(0, streakStats.dailyTarget - streakStats.todayPracticedAyahs)} ayat remaining`}
                </span>
              </div>
            </div>
          </div>

          {/* 4-Metric Grid (Option 1 Mini Stats) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Longest Streak */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-700">
                <Trophy className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Best Streak
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">
                  {streakStats.longestStreak}
                </span>
                <span className="text-xs font-semibold text-slate-500">days</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Personal best record</p>
            </div>

            {/* Total Practice Days */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-700">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total Active
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">
                  {streakStats.totalActiveDays}
                </span>
                <span className="text-xs font-semibold text-slate-500">days</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">All-time practice logged</p>
            </div>

            {/* Consistency % */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Consistency
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">
                  {consistencyPercent}%
                </span>
                <span className="text-xs font-semibold text-slate-500">this week</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{completedDaysCount} of 7 days active</p>
            </div>

            {/* Streak Freeze Shield */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-sky-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Streak Shield
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">
                  {streakStats.freezeCount}
                </span>
                <span className="text-xs font-semibold text-emerald-600 font-bold">Active</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Protects 1 missed day</p>
            </div>
          </div>

          {/* 7-Day Weekly Breakdown */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900">This Week's Activity</h4>
              <span className="text-[10.5px] font-bold text-amber-700">
                {completedDaysCount}/7 Days Completed
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 pt-0.5">
              {streakStats.weeklyDays.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 min-w-0 text-center">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      d.isCompleted
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : d.isToday
                        ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400 ring-offset-1 font-black'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                    title={`${d.dayName}: ${d.ayahCount} ayat`}
                  >
                    {d.isCompleted ? (
                      <Flame className="w-4 h-4 fill-white" />
                    ) : (
                      <span>{d.dayLabel}</span>
                    )}
                  </div>
                  <span
                    className={`text-[9.5px] font-bold ${
                      d.isToday ? 'text-amber-800' : 'text-slate-400'
                    }`}
                  >
                    {d.dayLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Micro Pedagogical Tip */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-slate-700">
            <Brain className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-slate-600">
              <strong className="text-slate-900 font-bold">Why daily consistency matters:</strong> Regular 10-minute micro-recalls protect 80%+ of recall against the forgetting curve compared to sporadic long weekend sessions.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
          {onStartLesson && (
            <button
              onClick={() => {
                onClose();
                onStartLesson();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-98"
            >
              <span>Practice Today's Sabaq</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};
