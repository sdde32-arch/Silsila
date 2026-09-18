import React, { useState, useEffect } from 'react';
import {
  Flame,
  Trophy,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StreakStats } from '../../services/memorizationEngine';

export interface VisualStreakCounterProps {
  streakStats: StreakStats;
  onOpenDetails: () => void;
}

// Recognized milestone levels (days) with custom titles, badges, and themes
const MILESTONES = [
  { days: 3, title: 'Seed of Consistency', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' },
  { days: 7, title: '1-Week Sincerity', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' },
  { days: 14, title: 'Fortnight Fortitude', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500' },
  { days: 30, title: '1-Month Hafiz Habit', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500' },
  { days: 40, title: 'Arba\'een Devotion', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500' },
  { days: 100, title: 'Century of Light', color: 'text-amber-500 dark:text-amber-300', bg: 'bg-amber-400' },
];

export const VisualStreakCounter: React.FC<VisualStreakCounterProps> = ({
  streakStats,
  onOpenDetails,
}) => {
  const currentDays = streakStats.currentStreak;
  const targetDays = streakStats.dailyTarget;
  const todayAyahs = streakStats.todayPracticedAyahs;
  const isGoalMet = streakStats.isTodayGoalMet;

  // Identify current and next milestones
  const nextMilestone = MILESTONES.find((m) => m.days > currentDays) || {
    days: currentDays + 10,
    title: 'Hafiz Guardian',
    color: 'text-amber-500',
    bg: 'bg-amber-500',
  };
  const prevMilestoneDays = [...MILESTONES].reverse().find((m) => m.days <= currentDays)?.days || 0;
  const progressToNext = Math.min(
    100,
    Math.max(
      8,
      Math.round(
        ((currentDays - prevMilestoneDays) / Math.max(1, nextMilestone.days - prevMilestoneDays)) * 100
      )
    )
  );

  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Trigger celebration confetti on mount if user reached or surpassed a milestone
  useEffect(() => {
    const isExactMilestone = MILESTONES.some((m) => m.days === currentDays);
    const lastCelebratedKey = `silsila_streak_celebrated_${currentDays}`;
    const alreadyCelebrated = localStorage.getItem(lastCelebratedKey) === 'true';

    if (isExactMilestone && !alreadyCelebrated && !hasCelebrated) {
      triggerStreakConfetti();
      localStorage.setItem(lastCelebratedKey, 'true');
      setHasCelebrated(true);
    }
  }, [currentDays, hasCelebrated]);

  const triggerStreakConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
        disableForReducedMotion: true,
      });
    } catch {
      // safe fallback
    }
  };

  return (
    <section
      onClick={onOpenDetails}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-indigo-500/10 dark:from-amber-950/30 dark:via-emerald-950/20 dark:to-indigo-950/30 border border-amber-300/70 dark:border-amber-700/50 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md hover:border-amber-400 cursor-pointer"
    >
      {/* Subtle glowing ambient accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-400/20 dark:bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-3.5">
        {/* Top row: Counter header, flame badge, and details CTA */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Visual Flame Icon Box */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 fill-amber-100 text-amber-100 animate-pulse" />
              {isGoalMet && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] text-white font-bold">
                  ✓
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                  {currentDays} Day{currentDays === 1 ? '' : 's'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 text-[10.5px] font-extrabold uppercase tracking-wide">
                  Consistency
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                {isGoalMet
                  ? 'Daily Sabaq completed for today'
                  : `${todayAyahs} of ${targetDays} Ayahs memorized today`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0">
            <span className="hidden sm:inline">Details</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Milestone Tracker Bar */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Next: {nextMilestone.days} Days ({nextMilestone.title})
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              {Math.max(0, nextMilestone.days - currentDays)}d away
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>

        {/* 7-Day Visual Pill Week Tracker */}
        <div className="pt-1 border-t border-amber-200/50 dark:border-slate-800/80 flex items-center justify-between gap-1.5 sm:gap-2">
          {streakStats.weeklyDays.map((day, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-1 text-center"
              title={`${day.dayName}: ${day.isCompleted ? 'Studied' : day.isToday ? 'Today' : 'Pending'}`}
            >
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {day.dayLabel}
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  day.isCompleted
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs'
                    : day.isToday
                    ? 'bg-amber-100 dark:bg-amber-950/70 border-2 border-amber-500 text-amber-900 dark:text-amber-300 ring-2 ring-amber-400/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600'
                }`}
              >
                {day.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                ) : day.isToday ? (
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ) : (
                  <span className="text-[10px] opacity-40">•</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
