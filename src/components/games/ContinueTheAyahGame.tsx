import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  Timer,
  Award,
  Zap,
  Volume2,
  Languages,
  ArrowLeft,
} from 'lucide-react';
import {
  MemorizedAyahItem,
  GameRound,
  GameSession,
} from '../../types';
import {
  generateContinueTheAyahRound,
  ContinueTheAyahRoundData,
  ContinueOption,
  calculateGameXP,
} from '../../services/ayahGamesEngine';
import {
  softLogGameConfusion,
  saveGameSession,
  DEV_BYPASS_AYAH_POOL_FILTER,
} from '../../services/memorizationEngine';
import { GameSessionSummaryModal } from './GameSessionSummaryModal';

interface ContinueTheAyahGameProps {
  pool: MemorizedAyahItem[];
  onClose: () => void;
  onDrillConfusionPair?: (ayahId1: string, ayahId2: string) => void;
}

const TOTAL_ROUNDS = 10;
const ROUND_TIME_LIMIT_SEC = 10;

export const ContinueTheAyahGame: React.FC<ContinueTheAyahGameProps> = ({
  pool,
  onClose,
  onDrillConfusionPair,
}) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [roundData, setRoundData] = useState<ContinueTheAyahRoundData | null>(null);
  const [usedAyahIds, setUsedAyahIds] = useState<Set<string>>(new Set());
  const [showTransliteration, setShowTransliteration] = useState(true);

  // Session stats
  const [sessionRounds, setSessionRounds] = useState<GameRound[]>([]);
  const [sessionXP, setSessionXP] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [roundStartTime, setRoundStartTime] = useState<number>(Date.now());

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(ROUND_TIME_LIMIT_SEC);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Selection state
  const [selectedOption, setSelectedOption] = useState<ContinueOption | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [lastRoundXP, setLastRoundXP] = useState<number | null>(null);
  const [isSpeedBonusAwarded, setIsSpeedBonusAwarded] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);

  // Clear timer
  const clearRoundTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Load next round
  const loadNextRound = (
    currentUsed: Set<string>,
    nextRoundIdx: number,
    streak: number
  ) => {
    clearRoundTimer();

    if (nextRoundIdx >= TOTAL_ROUNDS) {
      finishGame(sessionRounds, sessionXP, bestStreak);
      return;
    }

    const next = generateContinueTheAyahRound(pool, currentUsed);
    if (!next) {
      finishGame(sessionRounds, sessionXP, bestStreak);
      return;
    }

    setRoundData(next);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setLastRoundXP(null);
    setIsSpeedBonusAwarded(false);
    setTimeLeft(ROUND_TIME_LIMIT_SEC);
    setRoundStartTime(Date.now());
    setCurrentRoundIndex(nextRoundIdx);

    const updatedUsed = new Set(currentUsed);
    updatedUsed.add(next.targetAyah.ayahId);
    setUsedAyahIds(updatedUsed);

    // Start 10s countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearRoundTimer();
          handleTimeout(next, updatedUsed, nextRoundIdx, streak);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle round timeout
  const handleTimeout = (
    currentRound: ContinueTheAyahRoundData,
    currentUsed: Set<string>,
    roundIdx: number,
    streak: number
  ) => {
    setIsAnswerSubmitted(true);
    setCurrentStreak(0);
    setLastRoundXP(0);

    const roundResult: GameRound = {
      ayahId: currentRound.targetAyah.ayahId,
      correct: false,
      selectedWrongAyahId: undefined,
      wasKnownConfusionPair: false,
      responseTimeMs: ROUND_TIME_LIMIT_SEC * 1000,
      xpEarned: 0,
    };

    const updated = [...sessionRounds, roundResult];
    setSessionRounds(updated);

    setTimeout(() => {
      loadNextRound(currentUsed, roundIdx + 1, 0);
    }, 1800);
  };

  useEffect(() => {
    setStartTime(Date.now());
    loadNextRound(new Set(), 0, 0);
    return () => clearRoundTimer();
  }, [pool]);

  const handleSelectOption = (option: ContinueOption) => {
    if (isAnswerSubmitted || !roundData) return;

    clearRoundTimer();
    const responseTimeMs = Date.now() - roundStartTime;
    const isCorrect = option.isCorrect;
    setIsAnswerSubmitted(true);
    setSelectedOption(option);

    const { xpEarned, newStreak, speedBonus } = calculateGameXP(
      isCorrect,
      currentStreak,
      responseTimeMs,
      true
    );

    const newBest = Math.max(bestStreak, newStreak);
    setCurrentStreak(newStreak);
    setBestStreak(newBest);
    setSessionXP((prev) => prev + xpEarned);
    setLastRoundXP(xpEarned);
    setIsSpeedBonusAwarded(speedBonus > 0);

    let wasKnownConfusion = false;
    if (!isCorrect) {
      wasKnownConfusion = softLogGameConfusion(roundData.targetAyah.ayahId, option.ayahId);
    }

    const roundResult: GameRound = {
      ayahId: roundData.targetAyah.ayahId,
      correct: isCorrect,
      selectedWrongAyahId: isCorrect ? undefined : option.ayahId,
      wasKnownConfusionPair: wasKnownConfusion,
      responseTimeMs,
      xpEarned,
    };

    const updatedRounds = [...sessionRounds, roundResult];
    setSessionRounds(updatedRounds);

    setTimeout(() => {
      loadNextRound(usedAyahIds, currentRoundIndex + 1, newStreak);
    }, isCorrect ? 1000 : 1800);
  };

  const finishGame = (rounds: GameRound[], totalXP: number, maxStreak: number) => {
    clearRoundTimer();
    const finalSession: GameSession = {
      id: `session_${Date.now()}`,
      gameType: 'continue_the_ayah',
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
    setStartTime(Date.now());
    loadNextRound(new Set(), 0, 0);
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

  const timerPercent = (timeLeft / ROUND_TIME_LIMIT_SEC) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF9F5] text-slate-900 animate-in fade-in duration-200 overflow-hidden">
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-between p-3 sm:p-4">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between pb-2 border-b border-slate-200/80 shrink-0">
          <button
            onClick={() => {
              clearRoundTimer();
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
              <span className="text-[9.5px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/80">
                Continue the Ayah
              </span>
              {DEV_BYPASS_AYAH_POOL_FILTER && (
                <span className="text-[8.5px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200 animate-pulse">
                  TEST MODE
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-xs text-slate-900 mt-0.5">
              Round {Math.min(TOTAL_ROUNDS, currentRoundIndex + 1)} of {TOTAL_ROUNDS}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Transliteration Toggle Button */}
            <button
              onClick={() => setShowTransliteration((prev) => !prev)}
              className={`p-1.5 sm:px-2 sm:py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                showTransliteration
                  ? 'bg-teal-50 text-teal-800 border-teal-200 shadow-2xs'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
              title={showTransliteration ? 'Transliteration visible (Tap to hide)' : 'Transliteration hidden (Tap to show)'}
            >
              <Languages className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline text-[11px]">Translit</span>
            </button>

            {/* Timer Display */}
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80 text-amber-900 font-extrabold text-xs">
              <Timer className={`w-3.5 h-3.5 ${timeLeft <= 3 ? 'text-rose-500 animate-spin' : 'text-amber-700'}`} />
              <span>{timeLeft}s</span>
            </div>
          </div>
        </header>

        {/* Animated Timer Bar */}
        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1.5 shrink-0">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              timeLeft <= 3 ? 'bg-rose-500' : 'bg-teal-500'
            }`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Score & Streak Strip */}
        <section className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 my-1.5 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-3 h-3" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Session XP</span>
              <span className="font-black text-xs sm:text-sm text-slate-900">+{sessionXP} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-orange-600 font-extrabold text-xs bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
              <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
              <span>{currentStreak} Streak</span>
            </div>
          </div>
        </section>

        {/* Prompt Card: Arabic Opening Words */}
        <main className="flex-1 flex flex-col justify-center py-1 min-h-0">
          {roundData ? (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-teal-900/10 shadow-2xs text-center space-y-1.5 relative overflow-hidden my-auto">
              <div className="flex items-center justify-between gap-1 flex-wrap text-[9.5px] font-black uppercase tracking-wider text-slate-400">
                <span>Opening verse snippet (Complete what comes next):</span>
                <span className="text-teal-850 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80 font-bold">
                  Surah {roundData.targetAyah.surahName} {roundData.targetAyah.surahId}:{roundData.targetAyah.ayahNumber}
                </span>
              </div>

              {/* Arabic Opening */}
              <div className="py-1" dir="rtl">
                <p className="font-quran text-2xl sm:text-3xl font-extrabold text-black leading-relaxed dark:text-slate-100" style={{   }}>
                  {roundData.prefixSnippet} ...
                </p>
              </div>

              {/* Transliteration of Opening Snippet */}
              {showTransliteration && (roundData.prefixTransliteration || roundData.targetAyah.transliteration) && (
                <div className="px-2" dir="ltr">
                  <p className="text-xs sm:text-sm font-medium text-teal-800 italic">
                    "{roundData.prefixTransliteration || roundData.targetAyah.transliteration} ..."
                  </p>
                </div>
              )}

              {isAnswerSubmitted && lastRoundXP !== null && (
                <div
                  className={`inline-flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-bold animate-in zoom-in-50 duration-200 ${
                    selectedOption?.isCorrect
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border border-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1 font-black">
                    {selectedOption?.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Correct! +{lastRoundXP} XP {isSpeedBonusAwarded && '⚡ Speed Bonus!'}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>
                          {timeLeft === 0 ? "Time's Up!" : 'Incorrect!'} Continuation was:
                        </span>
                      </>
                    )}
                  </div>

                  {/* Continuation Arabic & Transliteration Reveal */}
                  <div className="flex items-center gap-2 flex-wrap justify-center text-xs">
                    <span className="font-quran font-extrabold text-sm sm:text-base text-black dark:text-slate-100" dir="rtl" style={{   }}>
                      {roundData.correctContinuation}
                    </span>
                    {roundData.correctContinuationTransliteration && (
                      <span className="text-[11px] font-medium text-slate-600 italic" dir="ltr">
                        ("{roundData.correctContinuationTransliteration}")
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">Loading round...</div>
          )}
        </main>

        {/* Answer Zone: Arabic Continuation Options */}
        <footer className="space-y-1 pt-1 shrink-0">
          <div className="grid grid-cols-1 gap-1.5">
            {roundData?.options.map((option, idx) => {
              const isSelected = selectedOption?.id === option.id;
              let btnClass = 'bg-white border-slate-300 hover:border-teal-400 text-black hover:bg-teal-50/40 shadow-2xs';

              if (isAnswerSubmitted) {
                if (option.isCorrect) {
                  btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black shadow-2xs';
                } else if (isSelected && !option.isCorrect) {
                  btnClass = 'bg-rose-50 border-rose-500 text-rose-950 font-black';
                } else {
                  btnClass = 'opacity-35 bg-slate-100 border-slate-200 text-slate-400';
                }
              }

              return (
                <button
                  key={option.id}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(option)}
                  className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between text-right cursor-pointer min-h-[48px] active:scale-[0.98] ${btnClass}`}
                  dir="rtl"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-500 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1 text-right">
                      {/* Arabic Continuation Text */}
                      <span className="font-quran text-base sm:text-lg font-bold text-black truncate dark:text-slate-100" style={{   }}>
                        {option.arabicSnippet}
                      </span>
                      {/* Transliteration for Continuation */}
                      {showTransliteration && option.transliterationSnippet && (
                        <span
                          className={`text-[11px] sm:text-xs font-medium italic mt-0.5 truncate text-right ${
                            isAnswerSubmitted && option.isCorrect
                              ? 'text-emerald-800 font-semibold'
                              : isAnswerSubmitted && isSelected && !option.isCorrect
                              ? 'text-rose-800'
                              : 'text-slate-500'
                          }`}
                          dir="ltr"
                        >
                          "{option.transliterationSnippet}"
                        </span>
                      )}
                    </div>
                  </div>

                  {isAnswerSubmitted && option.isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mr-1.5" />
                  )}
                  {isAnswerSubmitted && isSelected && !option.isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mr-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        </footer>
      </div>
    </div>
  );
};
