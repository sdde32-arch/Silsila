import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Gamepad2,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Lock,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Zap,
  HelpCircle,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import {
  GameType,
  MemorizedAyahItem,
  GameSession,
} from '../../types';
import {
  getMemorizedAyahPool,
  getGameSessions,
  DEV_BYPASS_AYAH_POOL_FILTER,
} from '../../services/memorizationEngine';
import { MIN_MEMORIZED_POOL_SIZE } from '../../services/ayahGamesEngine';
import { GuessTheAyahGame } from './GuessTheAyahGame';
import { ContinueTheAyahGame } from './ContinueTheAyahGame';
import { CatchTheAyatGame } from './CatchTheAyatGame';
import { useScrollLock } from '../../hooks/useScrollLock';

interface AyahGamesHubModalProps {
  onClose: () => void;
  onStartLesson?: (surahNumber?: number, ayahNumber?: number) => void;
  onDrillConfusionPair?: (ayahId1: string, ayahId2: string) => void;
}

export const AyahGamesHubModal: React.FC<AyahGamesHubModalProps> = ({
  onClose,
  onStartLesson,
  onDrillConfusionPair,
}) => {
  useScrollLock(true);
  const [memorizedPool, setMemorizedPool] = useState<MemorizedAyahItem[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [activeGameType, setActiveGameType] = useState<GameType | null>(null);

  useEffect(() => {
    const pool = getMemorizedAyahPool();
    setMemorizedPool(pool);
    setSessions(getGameSessions());
  }, []);

  const totalArcadeXP = sessions.reduce((acc, s) => acc + (s.totalXP || 0), 0);
  const bestAllTimeStreak = sessions.reduce((max, s) => Math.max(max, s.bestStreak || 0), 0);
  const isPoolUnlocked = memorizedPool.length >= MIN_MEMORIZED_POOL_SIZE;

  // Active game mode launcher
  if (activeGameType === 'guess_the_ayah') {
    return (
      <GuessTheAyahGame
        pool={memorizedPool}
        onClose={() => {
          setActiveGameType(null);
          setSessions(getGameSessions());
        }}
        onDrillConfusionPair={(id1, id2) => {
          setActiveGameType(null);
          if (onDrillConfusionPair) onDrillConfusionPair(id1, id2);
        }}
      />
    );
  }

  if (activeGameType === 'continue_the_ayah') {
    return (
      <ContinueTheAyahGame
        pool={memorizedPool}
        onClose={() => {
          setActiveGameType(null);
          setSessions(getGameSessions());
        }}
        onDrillConfusionPair={(id1, id2) => {
          setActiveGameType(null);
          if (onDrillConfusionPair) onDrillConfusionPair(id1, id2);
        }}
      />
    );
  }

  if (activeGameType === 'catch_the_ayat') {
    return (
      <CatchTheAyatGame
        pool={memorizedPool}
        onClose={() => {
          setActiveGameType(null);
          setSessions(getGameSessions());
        }}
        onDrillConfusionPair={(id1, id2) => {
          setActiveGameType(null);
          if (onDrillConfusionPair) onDrillConfusionPair(id1, id2);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F5] flex flex-col overflow-y-auto animate-in fade-in duration-200 text-slate-900">
      {/* Top Persistent Sticky Navigation Bar */}
      <div className="sticky top-0 z-20 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 active:scale-95 border border-slate-300/80 text-slate-800 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-xs group"
          title="Return to Dashboard"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          title="Close Arcade"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-between p-3 sm:p-4 space-y-4">
        {/* Top Header Banner */}
        <header className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 p-4 sm:p-5 rounded-2xl text-white shrink-0 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                    Ayah Games Arcade
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[9.5px] uppercase tracking-wider border border-amber-400/30 shrink-0">
                    Recall Hub
                  </span>
                  {DEV_BYPASS_AYAH_POOL_FILTER && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-black text-[9px] uppercase tracking-wider border border-rose-400/40 shrink-0 animate-pulse">
                      TEST MODE ACTIVE (ALL AYAT UNLOCKED)
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
                  Light recall games for memorized verses (Sabqi & Manzil)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border border-white/20 shadow-2xs"
              title="Return"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-slate-800 text-center">
            <div className="py-1 px-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Memorized Pool
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-300">
                {memorizedPool.length} Ayat
              </span>
            </div>

            <div className="py-1 px-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Arcade XP
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-300">
                +{totalArcadeXP} XP
              </span>
            </div>

            <div className="py-1 px-2 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Best Streak
              </span>
              <span className="text-xs sm:text-sm font-black text-orange-300">
                {bestAllTimeStreak}x Streak
              </span>
            </div>
          </div>
        </header>

        {/* Body Content */}
        <div className="py-2.5 sm:py-3 space-y-2.5 flex-1 flex flex-col justify-start">
          {/* SECTION 2: EMPTY STATE IF POOL < 10 */}
          {!isPoolUnlocked ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-300 text-center space-y-2.5 my-auto shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>

              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Memorize a few more ayat to unlock games!
                </h3>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Ayah Games test long-term recall from your memorized pool (<span className="font-bold">Sabqi</span> & <span className="font-bold">Manzil</span>). You currently have{' '}
                  <span className="font-bold text-amber-800">{memorizedPool.length}</span> / {MIN_MEMORIZED_POOL_SIZE} required memorized ayat.
                </p>
              </div>

              {/* Progress Meter */}
              <div className="max-w-xs mx-auto space-y-1">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(5, (memorizedPool.length / MIN_MEMORIZED_POOL_SIZE) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>{memorizedPool.length} Memorized</span>
                  <span>Goal: {MIN_MEMORIZED_POOL_SIZE} to Unlock</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onStartLesson) onStartLesson();
                }}
                className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Start Sabaq Lesson Now</span>
              </button>
            </div>
          ) : (
            /* GAME MODES LIST */
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  Select Game Mode
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {memorizedPool.length} Ayat Available
                </span>
              </div>

              {/* Game 1: Guess the Ayah */}
              <div className="group relative p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between gap-2.5">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[9.5px] font-bold uppercase border border-amber-200">
                      Meaning Recall
                    </span>
                    <span className="text-[10.5px] text-amber-700 font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> 10 Rounds
                    </span>
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-amber-700 transition-colors truncate">
                    Guess the Ayah
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                    Read the English translation and identify the Surah & Ayah reference.
                  </p>
                </div>

                <button
                  onClick={() => setActiveGameType('guess_the_ayah')}
                  className="py-1.5 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow-2xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-slate-950" />
                  <span>Play</span>
                </button>
              </div>

              {/* Game 2: Continue the Ayah */}
              <div className="group relative p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-teal-400 hover:shadow-xs transition-all flex items-center justify-between gap-2.5">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 text-[9.5px] font-bold uppercase border border-teal-200">
                      Speed Drill
                    </span>
                    <span className="text-[10.5px] text-teal-700 font-bold flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" /> 10s Clock
                    </span>
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                    Continue the Ayah
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                    Tap the correct Arabic continuation before the timer expires.
                  </p>
                </div>

                <button
                  onClick={() => setActiveGameType('continue_the_ayah')}
                  className="py-1.5 px-3.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-black text-xs flex items-center justify-center gap-1 shadow-2xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Play</span>
                </button>
              </div>

              {/* Game 3: Catch the Ayat */}
              <div className="group relative p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-purple-400 hover:shadow-xs transition-all flex items-center justify-between gap-2.5">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 text-[9.5px] font-bold uppercase border border-purple-200">
                      Arcade Reflexes
                    </span>
                    <span className="text-[10.5px] text-purple-700 font-bold flex items-center gap-1">
                      <Trophy className="w-2.5 h-2.5" /> 3 Hearts
                    </span>
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                    Catch the Ayat
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                    Tap the falling Arabic words in sequence while dodging distractors.
                  </p>
                </div>

                <button
                  onClick={() => setActiveGameType('catch_the_ayat')}
                  className="py-1.5 px-3.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-1 shadow-2xs hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Play</span>
                </button>
              </div>
            </div>
          )}

          {/* Pedagogy Note & Retention Independence Notice (Section 1) */}
          <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/60 text-[10.5px] text-slate-600 space-y-0.5 shrink-0">
            <span className="font-extrabold text-slate-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              Retention Engine Protection
            </span>
            <p className="leading-tight text-slate-500">
              Games are designed purely for light reinforcement. Game scores never modify SM-2 ease factors, review intervals, or Sabaq promotions.
            </p>
          </div>

          {/* Primary Return to Dashboard Action */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
