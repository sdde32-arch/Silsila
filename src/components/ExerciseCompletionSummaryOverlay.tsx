import React, { useEffect, useState, useRef } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Volume2,
  Pause,
  Layers,
  Star,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playFullAyahPronunciation } from '../services/quranAudioEngine';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useScrollLock } from '../hooks/useScrollLock';

export interface ExerciseStepRecord {
  stepNumber: number;
  title: string;
  type: string;
  ayahReference?: string;
  promptSnippet?: string;
  isCorrect: boolean;
  xpEarned: number;
}

export interface ExerciseCompletionSummaryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onReturnToDashboard: () => void;
  onOpenSurahTest?: (surahNumber: number) => void;
  surahNumber?: number;
  surahName?: string;
  totalExercises: number;
  correctCount: number;
  totalXP: number;
  streakDays?: number;
  exerciseHistory?: ExerciseStepRecord[];
  fullArabicRecitationSnippet?: string;
}

export const ExerciseCompletionSummaryOverlay: React.FC<ExerciseCompletionSummaryOverlayProps> = ({
  isOpen,
  onClose,
  onRestart,
  onReturnToDashboard,
  onOpenSurahTest,
  surahNumber = 67,
  surahName = 'Surah Al-Mulk',
  totalExercises = 6,
  correctCount = 6,
  totalXP = 90,
  streakDays = 12,
  exerciseHistory = [],
  fullArabicRecitationSnippet = 'أَوَلَمْ يَرَوْا۟ إِلَى ٱلطَّيْرِ فَوْقَهُمْ صَـٰٓفَّـٰتٍ وَيَقْبِضْنَ ۚ مَا يُمْسِكُهُنَّ إِلَّا ٱلرَّحْمَـٰنُ ۚ إِنَّهُۥ بِكُلِّ شَىْءٍۭ بَصِيرٌ',
}) => {
  useScrollLock(isOpen);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const audioStopRef = useRef<(() => void) | null>(null);

  const accuracyPercent =
    totalExercises > 0 ? Math.round((correctCount / totalExercises) * 100) : 100;

  // Multi-burst Confetti Celebration Animation on Load
  useEffect(() => {
    if (!isOpen) return;

    // Trigger initial celebration fireworks
    const duration = 2.4 * 1000;
    const end = Date.now() + duration;

    // First burst
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#38BDF8'],
      });
    } catch {
      // Confetti fallback
    }

    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      try {
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: {
            x: Math.random() * 0.4 + 0.3,
            y: Math.random() * 0.3 + 0.3,
          },
          colors: ['#F59E0B', '#10B981', '#6366F1', '#E11D48'],
          shapes: ['circle', 'square'],
        });
      } catch {
        // Fallback
      }
    }, 450);

    return () => {
      clearInterval(interval);
      if (audioStopRef.current) {
        audioStopRef.current();
        audioStopRef.current = null;
      }
    };
  }, [isOpen]);

  // Audio Playback for the practiced verses
  const handleToggleRecitationAudio = async () => {
    if (isPlayingAudio) {
      if (audioStopRef.current) {
        audioStopRef.current();
        audioStopRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);

    try {
      const result = await playFullAyahPronunciation({
        arabicText: fullArabicRecitationSnippet,
        surahNumber: surahNumber || 67,
        ayahNumber: 19,
        reciterSubfolder: 'Alafasy_128kbps',
        playbackSpeed: 1.0,
        onAudioStart: () => setIsPlayingAudio(true),
        onAudioEnded: () => {
          setIsPlayingAudio(false);
          audioStopRef.current = null;
        },
        onError: () => {
          setIsPlayingAudio(false);
          audioStopRef.current = null;
        },
      });

      audioStopRef.current = result.stop;
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleShareAchievement = () => {
    const text = `Alhamdulillah! Completed ${surahName} exercise drill sequence on Silsila with ${accuracyPercent}% accuracy and earned +${totalXP} XP! 🌟`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="exercise-completion-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-300">
        {/* Top Hero Banner */}
        <div className="relative bg-gradient-to-br from-slate-900 via-[#131C31] to-[#1E1B4B] p-6 sm:p-7 text-white text-center overflow-hidden shrink-0">
          {/* Subtle Ambient Decorative Rings */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-indigo-500/15 blur-xl pointer-events-none" />

          {/* Celebratory Emblem */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 ring-4 ring-amber-300/30 animate-bounce [animation-duration:2s]">
              <Trophy className="w-9 h-9 sm:w-10 sm:h-10 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs ring-2 ring-slate-900">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          {/* Arabic Blessing */}
          <p
            className="text-amber-300 font-bold text-sm sm:text-base tracking-wide font-amiri mb-1 opacity-90"
            dir="rtl"
          >
            مَا شَاءَ ٱللَّٰهُ تَبَارَكَ ٱللَّٰهُ
          </p>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wide uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5" /> Exercise Sequence Complete
          </span>

          <h2
            id="completion-title"
            className="text-2xl sm:text-3xl font-black text-white mt-2.5 tracking-tight leading-tight"
          >
            {accuracyPercent === 100
              ? 'Flawless Verse Mastery!'
              : accuracyPercent >= 80
              ? 'Masha’Allah, Excellent Recall!'
              : 'Great Practice Session!'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto font-medium">
            You successfully completed all {totalExercises} interactive drill steps for{' '}
            <span className="text-amber-300 font-bold">{surahName}</span>.
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
            {/* XP Earned */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col items-center justify-center space-y-0.5 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] font-black uppercase text-amber-800 tracking-wider">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>XP Earned</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-950">+{totalXP}</p>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-200/60 px-1.5 py-0.5 rounded-md">
                +30 Bonus
              </span>
            </div>

            {/* Accuracy */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col items-center justify-center space-y-0.5 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] font-black uppercase text-emerald-800 tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Accuracy</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-950">{accuracyPercent}%</p>
              <span className="text-[10px] text-emerald-700 font-bold">
                {correctCount}/{totalExercises} Correct
              </span>
            </div>

            {/* Streak */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-orange-50 border border-orange-200/80 flex flex-col items-center justify-center space-y-0.5 shadow-2xs">
              <div className="flex items-center gap-1 text-[11px] font-black uppercase text-orange-800 tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                <span>Streak</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-orange-950">{streakDays}d</p>
              <span className="text-[10px] text-orange-700 font-bold">Maintained 🔥</span>
            </div>
          </div>

          {/* Retention Engine Impact Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-start gap-3 shadow-md">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-extrabold text-white">
                  Spaced Repetition (SM-2) Updated
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  +3 Days Interval
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Your recall strength for these verses was logged. Next review will be triggered at
                the optimal memory decay threshold.
              </p>
            </div>
          </div>

          {/* Passage Recitation Quick Player */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF9F5] border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-indigo-600" /> Listen to Complete Ayah Recitation
              </span>
              <span className="text-[10px] font-semibold text-slate-500">Mishary Alafasy</span>
            </div>

            <div
              className="p-3 rounded-xl bg-white border border-slate-200/80 text-right font-amiri text-lg sm:text-xl text-slate-900 leading-loose dark:text-slate-100"
              dir="rtl"
            >
              {fullArabicRecitationSnippet}
            </div>

            <button
              type="button"
              onClick={handleToggleRecitationAudio}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                isPlayingAudio
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 animate-pulse'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Recitation Chanting</span>
                  <div className="flex items-center gap-0.5 ml-1">
                    <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-2 bg-white rounded-full animate-bounce"></span>
                  </div>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Play Full Ayah Recitation (Audio Audio)</span>
                </>
              )}
            </button>
          </div>

          {/* Exercise Step-by-Step Breakdown Accordion */}
          {exerciseHistory.length > 0 && (
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                className="w-full px-4 py-3 bg-[#FAF9F5] flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span>View Step-by-Step Drill Breakdown ({exerciseHistory.length} Steps)</span>
                </div>
                {showDetailedBreakdown ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showDetailedBreakdown && (
                <div className="p-3 space-y-2 divide-y divide-slate-100 bg-white">
                  {exerciseHistory.map((step, idx) => (
                    <div
                      key={`hist-step-${step.stepNumber || idx}`}
                      className="pt-2 first:pt-0 flex items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {step.isCorrect ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                            <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        )}
                        <div className="min-w-0 truncate">
                          <span className="font-bold text-slate-900 block truncate">
                            Step {step.stepNumber}: {step.title}
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block">
                            {step.ayahReference || `Step ${idx + 1}`} • {step.type}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-black shrink-0 px-2 py-0.5 rounded-md ${
                          step.isCorrect
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {step.isCorrect ? `+${step.xpEarned} XP` : '0 XP'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions Dock */}
        <div className="p-4 sm:p-5 bg-[#FAF9F5] border-t border-slate-200/90 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={onRestart}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="w-full sm:w-auto shrink-0 shadow-2xs font-bold text-xs"
          >
            Practice Again
          </Button>

          <button
            type="button"
            onClick={handleShareAchievement}
            className="w-full sm:w-auto py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Copy achievement text"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </>
            )}
          </button>

          <Button
            variant="primary"
            size="lg"
            onClick={onReturnToDashboard}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full flex-1 shadow-md font-black text-sm"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
