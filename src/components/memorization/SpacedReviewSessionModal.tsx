import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Star,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  BookOpen,
  HelpCircle,
  Eye,
  EyeOff,
  Shuffle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getDueReviewAyahs,
  recordRecallAttempt,
  SELF_SCORE_OPTIONS,
  AyahRetentionRecord,
} from '../../services/memorizationEngine';
import { SURAH_CONTENT_DB, AyahDetail } from '../../data/quranVerses';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { getAyahAudioUrl } from '../../services/quranDataService';
import { AyahNumberBadge } from '../ui/AyahNumberBadge';
import { useScrollLock } from '../../hooks/useScrollLock';

interface SpacedReviewSessionModalProps {
  onClose: () => void;
  onSessionComplete?: () => void;
}

export const SpacedReviewSessionModal: React.FC<SpacedReviewSessionModalProps> = ({
  onClose,
  onSessionComplete,
}) => {
  useScrollLock(true);
  const [dueQueue, setDueQueue] = useState<AyahRetentionRecord[]>(() => {
    const due = getDueReviewAyahs();
    if (due.length > 0) return due;
    // Fallback demo queue if none due
    return [
      {
        surahId: 1,
        ayahNumber: 1,
        globalOrder: 1,
        stage: 'sabqi',
        stageEnteredAt: Date.now() - 86400000 * 2,
        easeFactor: 2.5,
        intervalDays: 1,
        repetitions: 1,
        nextReviewAt: Date.now(),
        recallHistory: [],
        confusionPairs: [],
        consecutiveCorrectBlindRecalls: 2,
        lastBlankPattern: [],
      },
    ];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [reviewsCompleted, setReviewsCompleted] = useState(0);
  const [selectedConfusionAyah, setSelectedConfusionAyah] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentRecord = dueQueue[currentIndex];
  const surahMeta = currentRecord ? ALL_114_SURAHS.find((s) => s.number === currentRecord.surahId) : null;
  const surahData = currentRecord ? SURAH_CONTENT_DB[currentRecord.surahId] || SURAH_CONTENT_DB[1] : null;
  const ayahData: AyahDetail | undefined =
    surahData?.ayahs.find((a) => a.number === currentRecord?.ayahNumber) || surahData?.ayahs[0];
  const audioUrl = currentRecord && ayahData ? getAyahAudioUrl(currentRecord.surahId, ayahData.number) : '';

  useEffect(() => {
    setIsRevealed(false);
    setIsPlayingAudio(false);
    setSelectedConfusionAyah('');
  }, [currentIndex]);

  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false));
    }
  };

  const handleSelectScore = (option: typeof SELF_SCORE_OPTIONS[0]) => {
    if (!currentRecord) return;

    recordRecallAttempt(
      currentRecord.surahId,
      currentRecord.ayahNumber,
      'full_blind',
      option.selfScore,
      option.errorType,
      selectedConfusionAyah || undefined
    );

    setReviewsCompleted((prev) => prev + 1);

    if (currentIndex < dueQueue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionFinished(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#6366F1'],
      });
    }
  };

  if (sessionFinished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-[#FAF9F5] rounded-3xl border border-slate-200/90 shadow-2xl p-6 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="font-extrabold text-xl text-slate-900 tracking-tight">
              Spaced Review Complete!
            </h2>
            <p className="text-xs text-slate-600">
              You reviewed {reviewsCompleted} verses and strengthened your retention intervals.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-2xl font-black text-amber-600">+{reviewsCompleted * 25}</span>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">XP Earned</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-2xl font-black text-indigo-600">100%</span>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">Queue Cleared</p>
            </div>
          </div>

          <button
            onClick={() => {
              onSessionComplete?.();
              onClose();
            }}
            className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            Back to Journey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlayingAudio(false)}
          onError={() => setIsPlayingAudio(false)}
        />
      )}

      <div className="w-full max-w-lg bg-[#FAF9F5] rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col justify-between max-h-[92vh]">
        {/* Top Header */}
        <div className="p-3.5 sm:px-6 py-3 flex items-center justify-between gap-3 border-b border-slate-100 bg-[#FAF9F5]">
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Return back"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Return back</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
            <span>
              REVIEW {currentIndex + 1} OF {dueQueue.length}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:px-6 py-4 space-y-4 overflow-y-auto">
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            {/* Title & Surah Reference */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  RECALL FROM MEMORY ({currentRecord?.stage.toUpperCase()})
                </span>
                <h3 className="font-extrabold text-base text-slate-900">
                  Surah {surahMeta?.name} [{currentRecord?.surahId}:{currentRecord?.ayahNumber}]
                </h3>
              </div>

              <button
                onClick={handleToggleAudio}
                className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300'
                }`}
                title="Hear reference recitation"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Translation Prompt */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <p className="text-xs sm:text-sm text-slate-600 font-serif italic">
                "{ayahData?.translation}"
              </p>
            </div>

            {/* Arabic Script: Hidden vs Revealed */}
            {isRevealed ? (
              <div className="space-y-3">
                <div
                  dir="rtl"
                  className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/40 to-slate-50 border border-indigo-100 text-center leading-[2.6] animate-in fade-in duration-200"
                >
                  <p className="font-quran text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {ayahData?.arabic}
                  </p>
                </div>
                {ayahData?.transliteration && (
                  <p className="text-xs sm:text-sm text-amber-900/90 font-serif italic text-center px-2">
                    {ayahData.transliteration}
                  </p>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <button
                  onClick={() => setIsRevealed(true)}
                  className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Reveal Ayah to Check</span>
                </button>
              </div>
            )}
          </div>

          {/* Self Scoring Buttons (4 Options from Spec) */}
          {isRevealed && (
            <div className="space-y-3 animate-in fade-in">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block text-center">
                Rate your recall fidelity:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SELF_SCORE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectScore(opt)}
                    className={`min-h-[52px] p-3 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-2xs hover:scale-[1.01] active:scale-98 flex items-center gap-3 ${opt.badgeColor}`}
                  >
                    <span className="text-2xl shrink-0">{opt.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-black text-xs text-slate-900">{opt.label}</h4>
                        <span className="text-[9.5px] font-bold opacity-75 shrink-0">
                          {opt.id === 'blanked' ? '1 Day' : opt.id === 'hesitated' ? '2 Days' : opt.id === 'confused' ? 'Mutashabih' : '+2.5x'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium leading-snug mt-0.5">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
