import React, { useState, useEffect } from 'react';
import {
  Flame,
  Star,
  RotateCcw,
  Calendar,
  Clock,
  Trophy,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Award,
  Lock,
  Play,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  getMemorizationStatsSummary,
  getDueReviewAyahs,
  getWeakAyahs,
  getMasteredAyahs,
  AyahRetentionRecord,
} from '../services/memorizationEngine';
import { Card } from './ui/Card';
import { ProgressBar } from './ui/ProgressBar';
import { useScrollLock } from '../hooks/useScrollLock';

interface RetentionAnalyticsViewProps {
  onStartReviewSession: (surahNumber?: number, ayahNumber?: number) => void;
  onOpenSpacedDeck?: () => void;
}

export const RetentionAnalyticsView: React.FC<RetentionAnalyticsViewProps> = ({
  onStartReviewSession,
  onOpenSpacedDeck,
}) => {
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  useScrollLock(showLeaderboardModal);
  const [stats, setStats] = useState(() => getMemorizationStatsSummary());
  const [dueAyahs, setDueAyahs] = useState<AyahRetentionRecord[]>(() => getDueReviewAyahs());
  const [weakAyahs, setWeakAyahs] = useState<AyahRetentionRecord[]>(() => getWeakAyahs());

  useEffect(() => {
    setStats(getMemorizationStatsSummary());
    setDueAyahs(getDueReviewAyahs());
    setWeakAyahs(getWeakAyahs());
  }, []);

  const memorizedVersesCount = stats.masteredCount;
  const totalQuranVerses = 6236;
  const memorizedSurahsCount = 3;
  const totalQuranSurahs = 114;
  const quranPercentage = ((memorizedVersesCount / totalQuranVerses) * 100).toFixed(1);

  const leaderboardUsers = [
    { rank: 1, name: 'Zaid A.', time: '4h 12m', xp: 480, avatar: 'Z' },
    { rank: 2, name: 'Maryam K.', time: '3h 45m', xp: 390, avatar: 'M' },
    { rank: 3, name: 'Salim (You)', time: '28m', xp: 60, avatar: 'S', isUser: true },
    { rank: 4, name: 'Ibrahim H.', time: '24m', xp: 55, avatar: 'I' },
    { rank: 5, name: 'Fatima N.', time: '18m', xp: 40, avatar: 'F' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto pb-2 space-y-5 animate-in fade-in duration-300">
      {/* 1. HEADER */}
      <header className="flex items-center justify-between px-1 pt-1 pb-1">
        <div>
          <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight leading-tight">
            Retention & Spaced Repetition
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            SuperMemo SM-2 Interval Schedules & Ayah Mastery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF9F5] border border-amber-900/15 text-amber-700 text-xs font-black shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>60 XP</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF9F5] border border-amber-900/15 text-slate-800 text-xs font-black shadow-2xs">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>12d</span>
          </div>
        </div>
      </header>

      {/* 2. SPUR REVIEW CALLOUT BANNER */}
      {dueAyahs.length > 0 && (
        <section className="p-4 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-md flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-black text-[10px] uppercase tracking-wider">
              {dueAyahs.length} Due Today
            </span>
            <h4 className="font-black text-sm text-slate-950">
              Spaced Review Ready
            </h4>
            <p className="text-xs text-slate-900/90 font-medium">
              Maintain high retention before memory decay occurs.
            </p>
          </div>

          <button
            onClick={() => onOpenSpacedDeck ? onOpenSpacedDeck() : onStartReviewSession(dueAyahs[0]?.surahNumber, dueAyahs[0]?.ayahNumber)}
            className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>Review Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* 3. YOUR STATS (2x2 Grid) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Hifz Retention Analytics
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">SM-2 Algorithm</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Mastered Verses */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-700">{stats.masteredCount}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-700">Mastered Verses</p>
            <p className="text-[10px] text-slate-400 font-medium">≥90% verified recall</p>
          </div>

          {/* Active Recall Stage */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-indigo-600">{stats.recallingCount + stats.practicingCount}</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-700">In Active Practice</p>
            <p className="text-[10px] text-slate-400 font-medium">Drills & fading stages</p>
          </div>

          {/* Average Retention */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">{stats.averageRetention}%</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Star className="w-4 h-4 fill-purple-400" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-700">Retention Strength</p>
            <p className="text-[10px] text-slate-400 font-medium">Memory stability</p>
          </div>

          {/* Due for Review */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-amber-600">{dueAyahs.length}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-700">Due for Review</p>
            <p className="text-[10px] text-amber-600 font-bold">Scheduled queue</p>
          </div>
        </div>
      </section>

      {/* 4. DUE & WEAK VERSES LIST */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Current Retention Deck
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">Scheduled Reviews</span>
        </div>

        <div className="space-y-2">
          {dueAyahs.length === 0 && weakAyahs.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="font-extrabold text-xs text-slate-800">All Scheduled Ayahs are Current!</p>
              <p className="text-[11px] text-slate-500">Your spaced repetition queue is clear for today.</p>
            </div>
          ) : (
            dueAyahs.map((rec) => (
              <div
                key={`${rec.surahNumber}:${rec.ayahNumber}`}
                className="p-3.5 rounded-2xl bg-white border border-amber-200/80 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 font-black text-xs flex items-center justify-center shrink-0 border border-amber-200">
                    {rec.ayahNumber}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900">
                      Surah {rec.surahName} [{rec.surahNumber}:{rec.ayahNumber}]
                    </h5>
                    <p className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Interval: {rec.intervalDays}d • Ease: {rec.easeFactor}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onStartReviewSession(rec.surahNumber, rec.ayahNumber)}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  Review
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. LEADERBOARD BANNER */}
      <section>
        <button
          onClick={() => setShowLeaderboardModal(true)}
          className="w-full group flex items-center justify-between p-4 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all text-left shadow-[0_2px_12px_rgba(0,0,0,0.02)] cursor-pointer min-h-[64px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF7DA] text-[#D97706] flex items-center justify-center shrink-0 shadow-2xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#6366F1] transition-colors">
                Time & Retention Leaderboard
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                You've spent 28m practicing — see how you rank #3
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
        </button>
      </section>

      {/* 6. YOUR RANGE / RANK */}
      <section className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">Your Rank</h4>
              <p className="text-[11px] text-slate-500">Consistent Reciter (Tier II)</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-black border border-purple-200">
            5% to Next Tier
          </span>
        </div>

        <ProgressBar value={35} max={100} variant="indigo" size="md" />

        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-0.5">
          <span className="text-slate-900">New Reciter</span>
          <span className="text-purple-700 font-black">Consistent Reciter</span>
          <span>Advanced Hafiz</span>
          <span>Hāfiẓ</span>
        </div>
      </section>

      {/* 7. QUR'AN PROGRESS (Whole Quran) */}
      <section className="p-5 rounded-3xl bg-gradient-to-b from-[#FAF9F5] to-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Overall Progress
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {quranPercentage}% of the Qur'an memorized
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {memorizedVersesCount} of {totalQuranVerses} verses • {memorizedSurahsCount} of {totalQuranSurahs} Surahs
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center font-black text-sm border border-indigo-100 shadow-2xs">
            {quranPercentage}%
          </div>
        </div>

        <ProgressBar value={parseFloat(quranPercentage)} max={100} variant="emerald" size="lg" />

        <div className="grid grid-cols-2 gap-2 pt-1 text-center">
          <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs">
            <span className="text-lg font-black text-emerald-700">{memorizedVersesCount}</span>
            <p className="text-[10px] font-bold text-slate-500">Verses Memorized</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs">
            <span className="text-lg font-black text-indigo-700">{memorizedSurahsCount}</span>
            <p className="text-[10px] font-bold text-slate-500">Surahs Completed</p>
          </div>
        </div>
      </section>

      {/* 8. GENERAL KNOWLEDGE QUIZZES */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            General Knowledge
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">Structure & Terms</span>
        </div>

        <p className="text-xs text-slate-500 px-1 leading-relaxed">
          Test your knowledge of the Qur'an itself — its structure, history, and terms. Pass all three levels to earn the Qur'an Knowledge Verification badge.
        </p>

        <div className="space-y-2 pt-1">
          {/* Easy Level */}
          <button
            onClick={() => onStartReviewSession(1, 1)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-all text-left shadow-2xs cursor-pointer min-h-[52px]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Easy Level</h5>
                <p className="text-[10px] text-slate-500">20 questions • 80% to pass</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#6366F1]">
              <span>Start</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </section>

      {/* LEADERBOARD MODAL */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Weekly Practice Leaderboard
                </h3>
              </div>
              <button
                onClick={() => setShowLeaderboardModal(false)}
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {leaderboardUsers.map((u) => (
                <div
                  key={u.rank}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                    u.isUser
                      ? 'bg-[#EEF2FF] border-2 border-[#6366F1]'
                      : 'bg-[#FAF9F5] border border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        u.rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : u.rank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : u.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {u.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                      {u.avatar}
                    </div>
                    <span className="font-extrabold text-xs text-slate-900">{u.name}</span>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-xs text-slate-900">{u.time}</p>
                    <p className="text-[10px] text-amber-600 font-bold">{u.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
