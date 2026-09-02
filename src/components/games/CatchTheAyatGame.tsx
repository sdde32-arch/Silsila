import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  Heart,
  RotateCcw,
  Award,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import {
  MemorizedAyahItem,
  GameRound,
  GameSession,
} from '../../types';
import {
  generateCatchTheAyatRound,
  CatchTheAyatRoundData,
  calculateGameXP,
} from '../../services/ayahGamesEngine';
import {
  softLogGameConfusion,
  saveGameSession,
  DEV_BYPASS_AYAH_POOL_FILTER,
} from '../../services/memorizationEngine';
import { GameSessionSummaryModal } from './GameSessionSummaryModal';

interface CatchTheAyatGameProps {
  pool: MemorizedAyahItem[];
  onClose: () => void;
  onDrillConfusionPair?: (ayahId1: string, ayahId2: string) => void;
}

interface FallingWordItem {
  id: string;
  word: string;
  isTarget: boolean;
  topPercent: number; // 0..90%
  leftPercent: number; // 5..85%
  speed: number;
}

const TOTAL_AYAT_ROUNDS = 5;

export const CatchTheAyatGame: React.FC<CatchTheAyatGameProps> = ({
  pool,
  onClose,
  onDrillConfusionPair,
}) => {
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [roundData, setRoundData] = useState<CatchTheAyatRoundData | null>(null);
  const [usedAyahIds, setUsedAyahIds] = useState<Set<string>>(new Set());

  // Game state
  const [caughtIndices, setCaughtIndices] = useState<number[]>([]);
  const [fallingWords, setFallingWords] = useState<FallingWordItem[]>([]);
  const [lives, setLives] = useState(3);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionRounds, setSessionRounds] = useState<GameRound[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [roundStartTime, setRoundStartTime] = useState<number>(Date.now());

  const [isGameOver, setIsGameOver] = useState(false);
  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load next Ayah round
  const loadNextAyahRound = (
    currentUsed: Set<string>,
    ayahIdx: number,
    streak: number,
    currLives: number
  ) => {
    if (ayahIdx >= TOTAL_AYAT_ROUNDS || currLives <= 0) {
      finishGame(sessionRounds, sessionXP, bestStreak);
      return;
    }

    const next = generateCatchTheAyatRound(pool, currentUsed);
    if (!next) {
      finishGame(sessionRounds, sessionXP, bestStreak);
      return;
    }

    setRoundData(next);
    setCaughtIndices([]);
    setFallingWords([]);
    setRoundStartTime(Date.now());
    setCurrentAyahIndex(ayahIdx);

    const updatedUsed = new Set(currentUsed);
    updatedUsed.add(next.targetAyah.ayahId);
    setUsedAyahIds(updatedUsed);
  };

  useEffect(() => {
    setStartTime(Date.now());
    loadNextAyahRound(new Set(), 0, 0, 3);
  }, [pool]);

  // Spawning falling words
  useEffect(() => {
    if (!roundData || isGameOver || lives <= 0) return;

    const spawnWord = () => {
      setFallingWords((prev) => {
        if (prev.length >= 6) return prev; // Limit max concurrent items on screen

        // Next expected target word
        const nextTargetIndex = caughtIndices.length;
        const nextExpectedWord = roundData.targetSequence[nextTargetIndex];

        // 60% chance to spawn next target word, 40% decoy word
        const shouldSpawnTarget = Math.random() < 0.6 && nextExpectedWord;
        const chosenWord =
          shouldSpawnTarget && nextExpectedWord
            ? nextExpectedWord
            : roundData.decoyWords[Math.floor(Math.random() * roundData.decoyWords.length)] ||
              roundData.allWordsPool[Math.floor(Math.random() * roundData.allWordsPool.length)];

        if (!chosenWord) return prev;

        const newWordItem: FallingWordItem = {
          id: `fw_${Date.now()}_${Math.random()}`,
          word: chosenWord,
          isTarget: chosenWord === nextExpectedWord,
          topPercent: 0,
          leftPercent: Math.floor(Math.random() * 70) + 10, // 10% to 80% horizontal
          speed: 0.35 + Math.random() * 0.25, // speed factor
        };

        return [...prev, newWordItem];
      });
    };

    spawnTimerRef.current = setInterval(spawnWord, 1400);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [roundData, caughtIndices, isGameOver, lives]);

  // Physics animation loop
  useEffect(() => {
    if (!roundData || isGameOver || lives <= 0) return;

    let lastTimestamp = performance.now();

    const updatePhysics = (now: number) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      setFallingWords((prev) => {
        const updated: FallingWordItem[] = [];
        for (const item of prev) {
          const nextTop = item.topPercent + item.speed * 28 * delta;
          if (nextTop < 95) {
            updated.push({ ...item, topPercent: nextTop });
          }
        }
        return updated;
      });

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [roundData, isGameOver, lives]);

  // Word tap handler
  const handleTapWord = (item: FallingWordItem) => {
    if (!roundData || isGameOver) return;

    // Remove tapped word from screen immediately
    setFallingWords((prev) => prev.filter((w) => w.id !== item.id));

    const nextTargetIndex = caughtIndices.length;
    const expectedWord = roundData.targetSequence[nextTargetIndex];
    const isCorrect = item.word === expectedWord;
    const responseTimeMs = Date.now() - roundStartTime;

    const { xpEarned, newStreak } = calculateGameXP(
      isCorrect,
      currentStreak,
      responseTimeMs,
      false
    );

    const newBest = Math.max(bestStreak, newStreak);
    setCurrentStreak(newStreak);
    setBestStreak(newBest);
    setSessionXP((prev) => prev + xpEarned);

    if (isCorrect) {
      const nextCaught = [...caughtIndices, nextTargetIndex];
      setCaughtIndices(nextCaught);

      // Check if entire verse completed!
      if (nextCaught.length >= roundData.targetSequence.length) {
        // Round completion bonus
        setSessionXP((prev) => prev + 15);

        const roundResult: GameRound = {
          ayahId: roundData.targetAyah.ayahId,
          correct: true,
          responseTimeMs,
          xpEarned: xpEarned + 15,
          wasKnownConfusionPair: false,
        };

        const updatedRounds = [...sessionRounds, roundResult];
        setSessionRounds(updatedRounds);

        setTimeout(() => {
          loadNextAyahRound(usedAyahIds, currentAyahIndex + 1, newStreak, lives);
        }, 800);
      }
    } else {
      // Wrong word tapped
      const nextLives = Math.max(0, lives - 1);
      setLives(nextLives);

      if (nextLives <= 0) {
        const roundResult: GameRound = {
          ayahId: roundData.targetAyah.ayahId,
          correct: false,
          responseTimeMs,
          xpEarned: 0,
          wasKnownConfusionPair: false,
        };
        finishGame([...sessionRounds, roundResult], sessionXP, newBest);
      }
    }
  };

  const finishGame = (rounds: GameRound[], totalXP: number, maxStreak: number) => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const finalSession: GameSession = {
      id: `session_${Date.now()}`,
      gameType: 'catch_the_ayat',
      startedAt: startTime,
      endedAt: Date.now(),
      rounds,
      totalXP,
      bestStreak: maxStreak,
    };

    saveGameSession(finalSession);
    setFinishedSession(finalSession);
    setIsGameOver(true);
  };

  const handlePlayAgain = () => {
    setIsGameOver(false);
    setFinishedSession(null);
    setSessionRounds([]);
    setSessionXP(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setLives(3);
    setStartTime(Date.now());
    loadNextAyahRound(new Set(), 0, 0, 3);
  };

  if (isGameOver && finishedSession) {
    return (
      <GameSessionSummaryModal
        session={finishedSession}
        onPlayAgain={handlePlayAgain}
        onClose={onClose}
        onDrillConfusionPair={onDrillConfusionPair}
      />
    );
  }

  const nextTargetWord = roundData?.targetSequence[caughtIndices.length];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF9F5] text-slate-900 animate-in fade-in duration-200 overflow-hidden">
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-between p-3 sm:p-4">
        {/* Top Header */}
        <header className="flex items-center justify-between pb-2 border-b border-slate-200/80 shrink-0">
          <button
            onClick={() => {
              if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
              if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Return to Arcade"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to Arcade</span>
          </button>

          <div className="text-center flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/80">
                Catch the Ayat
              </span>
              {DEV_BYPASS_AYAH_POOL_FILTER && (
                <span className="text-[8.5px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200 animate-pulse">
                  TEST MODE
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-xs text-slate-900 mt-0.5">
              Verse {Math.min(TOTAL_AYAT_ROUNDS, currentAyahIndex + 1)} of {TOTAL_AYAT_ROUNDS}
            </h3>
          </div>

          {/* Hearts / Lives */}
          <div className="flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-full border border-rose-200/80">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < lives
                    ? 'text-rose-500 fill-rose-500 scale-100'
                    : 'text-slate-300 fill-slate-200 scale-90 opacity-40'
                }`}
              />
            ))}
          </div>
        </header>

        {/* Score & Streak Strip */}
        <section className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 my-1.5 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-3 h-3" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Session XP</span>
              <span className="font-black text-xs sm:text-sm text-slate-900">+{sessionXP} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 text-orange-600 font-extrabold text-xs bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
              <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
              <span>{currentStreak} Streak</span>
            </div>
          </div>
        </section>

        {/* Target Verse Sequence Progress Bar */}
        {roundData && (
          <div className="p-2.5 rounded-xl bg-white border border-amber-900/10 space-y-1 text-center shadow-2xs shrink-0">
            <div className="flex items-center justify-between text-[9.5px] font-black uppercase text-slate-400">
              <span>{roundData.targetAyah.surahName} {roundData.targetAyah.ayahNumber}</span>
              <span className="text-amber-700 font-bold">
                Tap next: <span className="font-quran text-xs sm:text-sm font-extrabold text-black dark:text-slate-100" dir="rtl" style={{   }}>{nextTargetWord || 'Done!'}</span>
              </span>
            </div>

            {/* Word sequence pill progress */}
            <div className="flex items-center justify-center gap-1 flex-wrap pt-0.5" dir="rtl">
              {roundData.targetSequence.map((w, idx) => {
                const isCaught = caughtIndices.includes(idx);
                const isNext = idx === caughtIndices.length;
                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-lg text-xs font-quran font-bold transition-all ${
                      isCaught
                        ? 'bg-emerald-100 text-emerald-950 border border-emerald-400 shadow-2xs'
                        : isNext
                        ? 'bg-amber-100 text-amber-950 border border-dashed border-amber-500 animate-pulse'
                        : 'bg-slate-50 text-slate-500 dark:text-slate-300 border border-slate-200'
                    }`}
                  >
                    {isCaught ? w : isNext ? w : '...'}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Interactive Falling Word Stage */}
        <main className="relative flex-1 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 my-1.5 overflow-hidden shadow-inner select-none min-h-[220px]">
          {/* Subtle grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

          {/* Falling Word Items */}
          {fallingWords.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTapWord(item)}
              className="absolute transform -translate-x-1/2 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-300 text-black border border-amber-400 shadow-md active:scale-90 transition-transform cursor-pointer font-quran text-base sm:text-lg font-extrabold backdrop-blur-xs flex items-center justify-center min-w-[60px] dark:text-slate-100"
              style={{
                top: `${item.topPercent}%`,
                left: `${item.leftPercent}%`,
                
              }}
              dir="rtl"
            >
              {item.word}
            </button>
          ))}

          {/* Bottom Catcher Base */}
          <div className="absolute bottom-0 inset-x-0 h-7 bg-gradient-to-t from-purple-950/60 to-transparent flex items-center justify-center pointer-events-none">
            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">
              Tap matching words in sequence before reaching the bottom
            </span>
          </div>
        </main>
      </div>
    </div>
  );
};
