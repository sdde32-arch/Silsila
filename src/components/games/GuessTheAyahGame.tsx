import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  BookOpen,
  Heart,
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
  generateGuessTheAyahRound,
  GuessTheAyahRoundData,
  GuessOption,
  calculateGameXP,
} from '../../services/ayahGamesEngine';
import {
  softLogGameConfusion,
  saveGameSession,
  DEV_BYPASS_AYAH_POOL_FILTER,
} from '../../services/memorizationEngine';
import { GameSessionSummaryModal } from './GameSessionSummaryModal';

interface GuessTheAyahGameProps {
  pool: MemorizedAyahItem[];
  onClose: () => void;
  onDrillConfusionPair?: (ayahId1: string, ayahId2: string) => void;
}

const TOTAL_ROUNDS = 10;

export const GuessTheAyahGame: React.FC<GuessTheAyahGameProps> = ({
  pool,
  onClose,
  onDrillConfusionPair,
}) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [roundData, setRoundData] = useState<GuessTheAyahRoundData | null>(null);
  const [usedAyahIds, setUsedAyahIds] = useState<Set<string>>(new Set());

  // Session stats
  const [sessionRounds, setSessionRounds] = useState<GameRound[]>([]);
  const [sessionXP, setSessionXP] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [roundStartTime, setRoundStartTime] = useState<number>(Date.now());

  // Selection & Feedback state
  const [selectedOption, setSelectedOption] = useState<GuessOption | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [lastRoundXP, setLastRoundXP] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finishedSession, setFinishedSession] = useState<GameSession | null>(null);

  // Load new round
  const loadNextRound = (
    currentUsed: Set<string>,
    nextRoundIdx: number,
    streak: number,
    currLives: number
  ) => {
    if (nextRoundIdx >= TOTAL_ROUNDS || currLives <= 0) {
      finishGame(sessionRounds, sessionXP, bestStreak);
      return;
    }

    const next = generateGuessTheAyahRound(pool, currentUsed);
    if (!next) {
      finishGame(sessionRounds, sessionXP, bestStreak);
      return;
    }

    setRoundData(next);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setLastRoundXP(null);
    setRoundStartTime(Date.now());
    setCurrentRoundIndex(nextRoundIdx);

    const updatedUsed = new Set(currentUsed);
    updatedUsed.add(next.targetAyah.ayahId);
    setUsedAyahIds(updatedUsed);
  };

  // Initial round
  useEffect(() => {
    setStartTime(Date.now());
    loadNextRound(new Set(), 0, 0, 3);
  }, [pool]);

  const handleSelectOption = (option: GuessOption) => {
    if (isAnswerSubmitted || !roundData) return;

    const responseTimeMs = Date.now() - roundStartTime;
    const isCorrect = option.isCorrect;
    setIsAnswerSubmitted(true);
    setSelectedOption(option);

    // Calculate XP and streak
    const { xpEarned, newStreak, multiplier } = calculateGameXP(
      isCorrect,
      currentStreak,
      responseTimeMs,
      false
    );

    const newBest = Math.max(bestStreak, newStreak);
    setCurrentStreak(newStreak);
    setBestStreak(newBest);
    setSessionXP((prev) => prev + xpEarned);
    setLastRoundXP(xpEarned);

    let nextLives = lives;
    let wasKnownConfusion = false;

    if (!isCorrect) {
      nextLives = Math.max(0, lives - 1);
      setLives(nextLives);

      // Soft log confusion without touching SM-2 metrics
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

    // Automatically transition to next round after feedback
    setTimeout(() => {
      loadNextRound(usedAyahIds, currentRoundIndex + 1, newStreak, nextLives);
    }, isCorrect ? 1000 : 1800);
  };

  const finishGame = (rounds: GameRound[], totalXP: number, maxStreak: number) => {
    const finalSession: GameSession = {
      id: `session_${Date.now()}`,
      gameType: 'guess_the_ayah',
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
    loadNextRound(new Set(), 0, 0, 3);
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF9F5] text-slate-900 animate-in fade-in duration-200 overflow-hidden">
      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-between p-3 sm:p-4">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between pb-2 border-b border-slate-200/80 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Return to Arcade"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to Arcade</span>
          </button>

          <div className="text-center flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                Guess the Ayah
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
                  ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-2xs'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
              title={showTransliteration ? 'Transliteration visible (Tap to hide)' : 'Transliteration hidden (Tap to show)'}
            >
              <Languages className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline text-[11px]">Translit</span>
            </button>

            {/* Lives Indicator */}
            <div className="flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-full border border-rose-200/80">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-3.5 h-3.5 transition-transform ${
                    i < lives
                      ? 'text-rose-500 fill-rose-500 scale-100'
                      : 'text-slate-300 fill-slate-200 scale-90 opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        {/* Score & Streak Strip */}
        <section className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 my-1.5 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-3 h-3" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Session XP</span>
              <span className="font-black text-xs sm:text-sm text-slate-900">+{sessionXP} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {currentStreak >= 2 && (
              <span className="text-[9.5px] font-black text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200 animate-pulse">
                {currentStreak >= 5 ? '2.0x XP' : '1.5x XP'}
              </span>
            )}
            <div className="flex items-center gap-1 text-orange-600 font-extrabold text-xs bg-orange-50 px-2 py-1 rounded-lg border border-orange-200">
              <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
              <span>{currentStreak} Streak</span>
            </div>
          </div>
        </section>

        {/* Round Progress Dots */}
        <div className="flex items-center justify-center gap-1 py-0.5 shrink-0">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, idx) => {
            const roundRes = sessionRounds[idx];
            return (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentRoundIndex
                    ? 'w-5 bg-amber-500'
                    : roundRes
                    ? roundRes.correct
                      ? 'w-1.5 bg-emerald-500'
                      : 'w-1.5 bg-rose-400'
                    : 'w-1.5 bg-slate-200'
                }`}
              />
            );
          })}
        </div>

        {/* Prompt Card: English Translation & Transliteration */}
        <main className="flex-1 flex flex-col justify-center py-2 min-h-0">
          {roundData ? (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-amber-900/10 shadow-2xs text-center space-y-2 relative overflow-hidden my-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Identify the verse by its translation:
              </span>

              <blockquote className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed italic px-1">
                "{roundData.targetAyah.translation}"
              </blockquote>

              {/* Transliteration hint/preview if toggled */}
              {showTransliteration && roundData.targetAyah.transliteration && (
                <div className="px-2 pt-1 border-t border-slate-100" dir="ltr">
                  <p className="text-[11px] sm:text-xs font-medium text-amber-800 italic">
                    Transliteration: "{roundData.targetAyah.transliteration}"
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
                        <span>Correct! +{lastRoundXP} XP</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>Incorrect! Was {roundData.targetAyah.surahName} ({roundData.targetAyah.surahId}:{roundData.targetAyah.ayahNumber})</span>
                      </>
                    )}
                  </div>

                  {/* Arabic and Full Reference text reveal */}
                  <div className="text-right py-0.5" dir="rtl">
                    <p className="font-quran font-extrabold text-sm sm:text-base text-black dark:text-slate-100" style={{   }}>
                      {roundData.targetAyah.arabic}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">Loading round...</div>
          )}
        </main>

        {/* Answer Zone: 4 Multiple Choice Reference Options */}
        <footer className="space-y-1.5 pt-1 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {roundData?.options.map((option, idx) => {
              const isSelected = selectedOption?.ayahId === option.ayahId;
              let btnClass = 'bg-white border-slate-200 hover:border-amber-400 text-slate-800 hover:bg-amber-50/50 shadow-2xs';

              if (isAnswerSubmitted) {
                if (option.isCorrect) {
                  btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs font-black';
                } else if (isSelected && !option.isCorrect) {
                  btnClass = 'bg-rose-50 border-rose-500 text-rose-900 font-black';
                } else {
                  btnClass = 'opacity-40 bg-slate-100 border-slate-200 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(option)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-left cursor-pointer min-h-[44px] active:scale-[0.98] ${btnClass}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-bold text-xs truncate">
                      {option.label}
                    </span>
                  </div>

                  {isAnswerSubmitted && option.isCorrect && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                  )}
                  {isAnswerSubmitted && isSelected && !option.isCorrect && (
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 ml-1" />
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
