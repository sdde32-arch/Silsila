import React, { useEffect } from 'react';
import {
  Award,
  Sparkles,
  Flame,
  RotateCcw,
  ChevronRight,
  HelpCircle,
  AlertCircle,
  Trophy,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameSession } from '../../types';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { useScrollLock } from '../../hooks/useScrollLock';

interface GameSessionSummaryModalProps {
  session: GameSession;
  onPlayAgain: () => void;
  onClose: () => void;
  onDrillConfusionPair?: (ayahId1: string, ayahId2: string) => void;
}

export const GameSessionSummaryModal: React.FC<GameSessionSummaryModalProps> = ({
  session,
  onPlayAgain,
  onClose,
  onDrillConfusionPair,
}) => {
  useScrollLock(true);
  const totalRounds = session.rounds.length;
  const correctRounds = session.rounds.filter((r) => r.correct).length;
  const accuracyPercent = totalRounds > 0 ? Math.round((correctRounds / totalRounds) * 100) : 0;

  // Find any round that resulted in a known confusion pair
  const confusionRound = session.rounds.find(
    (r) => !r.correct && r.selectedWrongAyahId && (r.wasKnownConfusionPair || r.selectedWrongAyahId)
  );

  useEffect(() => {
    if (accuracyPercent >= 70) {
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
        });
      } catch (e) {
        // Confetti canvas fallback
      }
    }
  }, [accuracyPercent]);

  const formatAyahLabel = (ayahId: string) => {
    const [s, a] = ayahId.split(':').map((v) => parseInt(v, 10));
    const meta = ALL_114_SURAHS.find((m) => m.number === s);
    return `${meta?.transliteration || `Surah ${s}`} ${s}:${a}`;
  };

  const getGameTitle = () => {
    switch (session.gameType) {
      case 'guess_the_ayah':
        return 'Guess the Ayah';
      case 'continue_the_ayah':
        return 'Continue the Ayah';
      case 'catch_the_ayat':
        return 'Catch the Ayat';
      default:
        return 'Ayah Arcade';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 p-6 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
            {accuracyPercent >= 80 ? (
              <Trophy className="w-8 h-8 text-amber-300 animate-bounce" />
            ) : (
              <Award className="w-8 h-8 text-amber-300" />
            )}
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
            {getGameTitle()} Complete
          </span>
          <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
            {accuracyPercent === 100
              ? 'Flawless Recall!'
              : accuracyPercent >= 70
              ? 'Great Retention!'
              : 'Good Practice!'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Reinforcing your memorized verses without impacting SM-2 schedules
          </p>
        </div>

        {/* Core Stats Row */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2.5 text-center">
            {/* XP Earned */}
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-0.5">
              <span className="text-[10.5px] font-black uppercase text-amber-700 tracking-wider flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> XP Earned
              </span>
              <p className="text-xl font-black text-amber-900">+{session.totalXP}</p>
              <span className="text-[10px] text-amber-600 font-bold">Added to Profile</span>
            </div>

            {/* Accuracy */}
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-0.5">
              <span className="text-[10.5px] font-black uppercase text-emerald-700 tracking-wider flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Accuracy
              </span>
              <p className="text-xl font-black text-emerald-900">{accuracyPercent}%</p>
              <span className="text-[10px] text-emerald-600 font-bold">
                {correctRounds}/{totalRounds} Correct
              </span>
            </div>

            {/* Best Streak */}
            <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200/80 space-y-0.5">
              <span className="text-[10.5px] font-black uppercase text-orange-700 tracking-wider flex items-center justify-center gap-1">
                <Flame className="w-3 h-3" /> Best Streak
              </span>
              <p className="text-xl font-black text-orange-900">{session.bestStreak}x</p>
              <span className="text-[10px] text-orange-600 font-bold">In a row</span>
            </div>
          </div>

          {/* Section 7 Confusion-Pair Smart Alert */}
          {confusionRound && confusionRound.selectedWrongAyahId && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-amber-900">
                    Confusion Opportunity Detected
                  </h4>
                  <p className="text-[11.5px] text-amber-800 leading-snug mt-0.5">
                    You mixed up <span className="font-bold">{formatAyahLabel(confusionRound.ayahId)}</span> with{' '}
                    <span className="font-bold">{formatAyahLabel(confusionRound.selectedWrongAyahId)}</span>.
                  </p>
                </div>
              </div>

              {onDrillConfusionPair && (
                <button
                  onClick={() => {
                    if (confusionRound.selectedWrongAyahId) {
                      onDrillConfusionPair(confusionRound.ayahId, confusionRound.selectedWrongAyahId);
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Drill This Confusion Pair Now</span>
                </button>
              )}
            </div>
          )}

          {/* Pedagogy Note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700">Arcade Guarantee:</span> Mini-games are designed for fun recall. Your SM-2 spaced repetition intervals, ease factors, and promotion gates remain untouched.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2.5">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
