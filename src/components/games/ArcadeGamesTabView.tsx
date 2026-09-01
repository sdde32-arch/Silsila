import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Sparkles,
  Flame,
  Trophy,
  Zap,
  Map,
  BookOpen,
  RotateCcw,
  ArrowRight,
  Play,
  Award,
  Swords,
  Timer,
  CheckCircle2,
  ChevronRight,
  Star,
  Target,
  Crown,
  Layers,
  HelpCircle,
  Volume2,
} from 'lucide-react';
import {
  GameType,
  MemorizedAyahItem,
  GameSession,
} from '../../types';
import {
  getMemorizedAyahPool,
  getGameSessions,
  getUserProgression,
  getStreakStats,
  DEV_BYPASS_AYAH_POOL_FILTER,
} from '../../services/memorizationEngine';
import { MIN_MEMORIZED_POOL_SIZE } from '../../services/ayahGamesEngine';
import { GuessTheAyahGame } from './GuessTheAyahGame';
import { ContinueTheAyahGame } from './ContinueTheAyahGame';
import { CatchTheAyatGame } from './CatchTheAyatGame';
import { CoachMarkOverlay } from '../tour/CoachMarkOverlay';

export interface ArcadeGamesTabViewProps {
  onStartLesson: (surahNumber?: number, ayahNumber?: number) => void;
  onExploreSurah: (surahNumber?: number) => void;
  onOpenSpacedDeck: () => void;
  onNavigateToProgress: (subTab?: 'hifz-map' | 'mastery-exams' | 'analytics') => void;
  onOpenSurahTest: (surahNumber?: number) => void;
}

export const ArcadeGamesTabView: React.FC<ArcadeGamesTabViewProps> = ({
  onStartLesson,
  onExploreSurah,
  onOpenSpacedDeck,
  onNavigateToProgress,
  onOpenSurahTest,
}) => {
  const [memorizedPool, setMemorizedPool] = useState<MemorizedAyahItem[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [activeGameType, setActiveGameType] = useState<GameType | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'arcade' | 'study' | 'quests'>('all');

  const progression = getUserProgression();
  const streakStats = getStreakStats();

  useEffect(() => {
    setMemorizedPool(getMemorizedAyahPool());
    setSessions(getGameSessions());
  }, []);

  const totalArcadeXP = sessions.reduce((acc, s) => acc + (s.totalXP || 0), 0);
  const bestAllTimeStreak = sessions.reduce((max, s) => Math.max(max, s.bestStreak || 0), 0);
  const gamesPlayedCount = sessions.length;
  const isPoolUnlocked = memorizedPool.length >= MIN_MEMORIZED_POOL_SIZE || DEV_BYPASS_AYAH_POOL_FILTER;

  // Level calculation based on XP
  const userLevel = Math.max(1, Math.floor(totalArcadeXP / 100) + 1);
  const xpCurrentLevel = totalArcadeXP % 100;

  // Render Full Screen Active Game when launched
  if (activeGameType === 'guess_the_ayah') {
    return (
      <GuessTheAyahGame
        pool={memorizedPool}
        onClose={() => {
          setActiveGameType(null);
          setSessions(getGameSessions());
        }}
        onDrillConfusionPair={(id1) => {
          setActiveGameType(null);
          const [s, a] = id1.split(':').map((v) => parseInt(v, 10));
          onStartLesson(s || 1, a || 1);
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
        onDrillConfusionPair={(id1) => {
          setActiveGameType(null);
          const [s, a] = id1.split(':').map((v) => parseInt(v, 10));
          onStartLesson(s || 1, a || 1);
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
        onDrillConfusionPair={(id1) => {
          setActiveGameType(null);
          const [s, a] = id1.split(':').map((v) => parseInt(v, 10));
          onStartLesson(s || 1, a || 1);
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto pb-24 pt-3 px-3.5 sm:px-4 space-y-4 animate-in fade-in duration-150 text-slate-900 dark:text-slate-100">
      {/* 1. ARCADE PLAYER HUD & GAMIFIED HEADER */}
      <header className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-[#0B0F19] to-indigo-950 border border-indigo-500/20 text-white p-4 sm:p-5 shadow-xl overflow-hidden">
        {/* Glow ambient background orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-3.5">
          {/* Top Bar: Title & Level Badge */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/25 shrink-0">
                <Gamepad2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                    Quran Ayah Arcade
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider shrink-0">
                    Game Arena
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-300 font-medium truncate">
                  Sharpen active recall through fast, interactive Quran challenges
                </p>
              </div>
            </div>

            {/* Level Badge */}
            <div className="shrink-0 flex flex-col items-end">
              <div className="px-2.5 py-1 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center gap-1.5 shadow-xs">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-black">Lvl {userLevel}</span>
              </div>
            </div>
          </div>

          {/* Player XP Level Progress Bar */}
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Level {userLevel} Reciter</span>
              </span>
              <span className="text-amber-300 font-mono">
                {xpCurrentLevel}/100 XP to Lvl {userLevel + 1}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(8, xpCurrentLevel))}%` }}
              />
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-black">
                <Zap className="w-3.5 h-3.5" />
                <span>{totalArcadeXP}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total XP
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1 text-orange-400 text-xs font-black">
                <Flame className="w-3.5 h-3.5" />
                <span>{bestAllTimeStreak}x</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Best Combo
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-black">
                <Trophy className="w-3.5 h-3.5" />
                <span>{memorizedPool.length}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Ayat Pool
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. THE CORE SHOWCASE SECTION: KEEP BUILDING YOUR CONNECTION */}
      <section className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white shadow-lg border border-slate-800 space-y-4 relative overflow-hidden">
        {/* Ambient accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shadow-inner">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="font-black text-sm sm:text-base text-white tracking-tight">
                Keep Building Your Connection
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Deepen your Quranic relationship through active recall games, rich tafsir, and visual milestones.
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0 shadow-xs">
            Featured
          </span>
        </div>

        {/* 4 Interactive Hub Cards from User Specification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Card 1: Ayah Games Arcade */}
          <div
            data-coach="arcade-hub"
            onClick={() => setActiveGameType('guess_the_ayah')}
            className="group relative p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-amber-400/60 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 backdrop-blur-xs active:scale-[0.98]"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <Gamepad2 className="w-4.5 h-4.5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[9.5px] uppercase tracking-wider border border-amber-400/30">
                  🎮 Arcade Recall
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                  Ayah Games Arcade
                </h3>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                  Play interactive mini-games to sharpen your active recall across memorized verses.
                </p>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-amber-200 text-[10px] font-bold border border-amber-400/20">
                  🎯 Guess the Ayah
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-amber-200 text-[10px] font-bold border border-amber-400/20">
                  ⚡ 10s Speed Drill
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-amber-200 text-[10px] font-bold border border-amber-400/20">
                  🏆 Catch the Ayat
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-black text-amber-300 group-hover:text-amber-200">
              <span className="flex items-center gap-1">
                <Play className="w-3.5 h-3.5 fill-current" />
                Play Arcade Games
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Interactive Quran Hifz Map */}
          <div
            onClick={() => onNavigateToProgress('hifz-map')}
            className="group relative p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-emerald-400/60 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 backdrop-blur-xs active:scale-[0.98]"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <Map className="w-4.5 h-4.5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-black text-[9.5px] uppercase tracking-wider border border-emerald-400/30">
                  🗺️ 114 Surah Map
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-300 transition-colors">
                  Quran Memorization Map
                </h3>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                  Follow visual stepping stones across all 30 Juz and track completed Surah milestones.
                </p>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-emerald-200 text-[10px] font-bold border border-emerald-400/20">
                  📍 Verse Stepping Stones
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-emerald-200 text-[10px] font-bold border border-emerald-400/20">
                  🏅 Mastery Gates
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-emerald-200 text-[10px] font-bold border border-emerald-400/20">
                  📊 30 Juz Overview
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-black text-emerald-300 group-hover:text-emerald-200">
              <span>Explore Hifz Map</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Deep Tafsir & Explorer */}
          <div
            onClick={() => onExploreSurah(progression.currentSurah || 1)}
            className="group relative p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-indigo-400/60 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 backdrop-blur-xs active:scale-[0.98]"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-400/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 font-black text-[9.5px] uppercase tracking-wider border border-indigo-400/30">
                  📖 Meaning & Tafsir
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition-colors">
                  Study Surahs & Meaning
                </h3>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                  Read translations, listen to 12 authentic Qaris, and study Arabic word morphology.
                </p>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-indigo-200 text-[10px] font-bold border border-indigo-400/20">
                  🔍 Word Breakdown
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-indigo-200 text-[10px] font-bold border border-indigo-400/20">
                  🎧 Crystal Audio
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-indigo-200 text-[10px] font-bold border border-indigo-400/20">
                  💡 Tajweed Tips
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-black text-indigo-300 group-hover:text-indigo-200">
              <span>Study Surahs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Spaced Flashcard Deck */}
          <div
            onClick={onOpenSpacedDeck}
            className="group relative p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-purple-400/60 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 backdrop-blur-xs active:scale-[0.98]"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-400/20 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <RotateCcw className="w-4.5 h-4.5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-300 font-black text-[9.5px] uppercase tracking-wider border border-purple-400/30">
                  🧠 Spaced Deck
                </span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors">
                  Spaced Retention Flashcards
                </h3>
                <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                  Scientifically scheduled flashcard reviews to strengthen fragile verses before they fade.
                </p>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-purple-200 text-[10px] font-bold border border-purple-400/20">
                  📈 SM-2 Retention
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-purple-200 text-[10px] font-bold border border-purple-400/20">
                  ⚡ Smart Intervals
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-black/40 text-purple-200 text-[10px] font-bold border border-purple-400/20">
                  🎯 Zero Cramming
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-black text-purple-300 group-hover:text-purple-200">
              <span>Launch Spaced Review</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3 DISTINCT PLAYABLE MINI-GAMES SELECTOR */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Select Arcade Game Mode
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            3 Active Mini-Games
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Game Mode 1: Guess The Ayah */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/90 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300/80 dark:border-amber-700/80 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                <Target className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                    Guess the Ayah
                  </h3>
                  <span className="px-2 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold text-[9.5px]">
                    4 Choices
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  Listen or read the cue, identify the exact matching verse
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveGameType('guess_the_ayah')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play</span>
            </button>
          </div>

          {/* Game Mode 2: Continue The Ayah (Speed Drill) */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/90 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 border border-indigo-300/80 dark:border-indigo-700/80 text-indigo-800 dark:text-indigo-300 flex items-center justify-center shrink-0 shadow-2xs">
                <Timer className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                    10s Speed Drill
                  </h3>
                  <span className="px-2 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 font-bold text-[9.5px]">
                    Sequence Recall
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  Recall what verse comes directly next before the countdown ends
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveGameType('continue_the_ayah')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Drill</span>
            </button>
          </div>

          {/* Game Mode 3: Catch The Ayat */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/90 dark:border-zinc-800/80 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300/80 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-2xs">
                <Flame className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                    Catch the Ayat
                  </h3>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-[9.5px]">
                    Reflex Arcade
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  Catch falling Arabic verses in order while avoiding distractors
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveGameType('catch_the_ayat')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Catch</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. DAILY ARCADE QUESTS & MISSIONS */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#0E121B] border border-slate-200/90 dark:border-zinc-800/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Daily Arcade Quests
            </h3>
          </div>
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
            +105 Bonus XP
          </span>
        </div>

        <div className="space-y-2">
          {/* Quest 1 */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  Score 3 correct in Guess the Ayah
                </p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Sharpens Surah context recognition
                </span>
              </div>
            </div>
            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 shrink-0">
              +30 XP
            </span>
          </div>

          {/* Quest 2 */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  Achieve a 5x combo in Speed Drill
                </p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Builds automatic recall reflexes
                </span>
              </div>
            </div>
            <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 shrink-0">
              +50 XP
            </span>
          </div>

          {/* Quest 3 */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  Review 5 Spaced Flashcards
                </p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Solidifies long-term retention
                </span>
              </div>
            </div>
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 shrink-0">
              +25 XP
            </span>
          </div>
        </div>
      </section>

      {/* 5. SURAH MASTERY BOSS EXAM BANNER */}
      <section className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-500/30 text-white shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-purple-400/20 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-xs sm:text-sm text-white truncate">
                Surah Mastery Verification
              </h3>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-400/20 text-purple-300 text-[9px] font-extrabold uppercase">
                Exam
              </span>
            </div>
            <p className="text-[11px] text-purple-200 truncate mt-0.5">
              Validate your whole Surah with comprehensive testing
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenSurahTest(progression.currentSurah || 1)}
          className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 active:scale-95 text-white font-black text-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-xs"
        >
          <span>Take Test</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </section>

      <CoachMarkOverlay
        featureKey="ayah_arcade"
        targetSelector='[data-coach="arcade-hub"]'
        badge="Ayah Arcade"
        title="Active Recall Verse Arcade"
        description="Strengthen your Quranic verse retention with interactive games like Next Ayah Rush, Missing Word, and Surah Order sorting."
        icon={Trophy}
      />
    </div>
  );
};
