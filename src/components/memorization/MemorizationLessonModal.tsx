import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Eye,
  EyeOff,
  Flame,
  Star,
  Layers,
  Award,
  ChevronRight,
  Play,
  Pause,
  Repeat,
  CheckCircle2,
  HelpCircle,
  Trophy,
  Shuffle,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  LessonStep,
  generateAyahLesson,
  generateFillBlankExercise,
  FillBlankExercise,
  recordRecallAttempt,
  saveCurrentStudyPosition,
  SELF_SCORE_OPTIONS,
  ErrorType,
  RecallMechanic,
  getTodaysQueue,
  getUserProgression,
  AyahRetentionRecord,
  getAyahId,
  getRetentionDatabase,
} from '../../services/memorizationEngine';
import { ALL_114_SURAHS, SurahMeta } from '../../data/quranMetadata';
import {
  getAyahWordsData,
  WordDetailData,
  QURAN_RECITERS,
  ReciterProfile,
  quranAudioPreloader,
} from '../../services/quranAudioEngine';
import { WordPronunciationModal } from './WordPronunciationModal';
import { AyahNumberBadge } from '../ui/AyahNumberBadge';
import { useScrollLock } from '../../hooks/useScrollLock';

interface MemorizationLessonModalProps {
  surahNumber: number;
  ayahNumber: number;
  onClose: () => void;
  onLessonComplete?: (record: AyahRetentionRecord) => void;
  onOpenSurahTest?: (surahNumber: number) => void;
}

export const MemorizationLessonModal: React.FC<MemorizationLessonModalProps> = ({
  surahNumber,
  ayahNumber,
  onClose,
  onLessonComplete,
  onOpenSurahTest,
}) => {
  useScrollLock(true);
  // Reciter selection
  const [selectedReciter, setSelectedReciter] = useState<ReciterProfile>(QURAN_RECITERS[0]);
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  // Lesson data (6 steps)
  const [lessonData, setLessonData] = useState(() =>
    generateAyahLesson(surahNumber, ayahNumber, selectedReciter.subfolder)
  );
  const [currentStepIdx, setCurrentStepIdx] = useState(() => {
    const prog = getUserProgression();
    if (
      prog.activeStudyPosition &&
      prog.activeStudyPosition.surahNumber === surahNumber &&
      prog.activeStudyPosition.ayahNumber === ayahNumber &&
      typeof prog.activeStudyPosition.stepNumber === 'number'
    ) {
      return Math.max(0, Math.min(5, prog.activeStudyPosition.stepNumber - 1));
    }
    return 0;
  });

  // Audio Playback state (Reference Reciter only)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<0.75 | 1.0 | 1.25>(1.0);
  const [repeatCount, setRepeatCount] = useState<1 | 3 | 5 | 10>(1);
  const [currentRepeat, setCurrentRepeat] = useState(1);
  const [audioProgressPercent, setAudioProgressPercent] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Word-by-word data
  const [wordsData, setWordsData] = useState<WordDetailData[]>(() => {
    return getAyahWordsData(
      surahNumber,
      ayahNumber,
      lessonData.ayah.arabic,
      lessonData.ayah.translation
    );
  });
  const [selectedWordForDrill, setSelectedWordForDrill] = useState<WordDetailData | null>(null);
  const [highlightedWordIdx, setHighlightedWordIdx] = useState<number | null>(null);

  // Step 3 (Shadowing) Counter
  const [shadowingRoundsDone, setShadowingRoundsDone] = useState(0);

  // Step 4 (Self-Recitation Checkpoint) State
  const [hasSelfRecited, setHasSelfRecited] = useState(false);

  // Step 5 (Blind Active Recall) States
  // Fill-in-the-blank / 2-3 Letters
  const [customFillBlankData, setCustomFillBlankData] = useState<FillBlankExercise | null>(null);
  const [filledBlanks, setFilledBlanks] = useState<Record<number, string>>({});
  const [usedBankWords, setUsedBankWords] = useState<number[]>([]);
  // Next word
  const [selectedNextWordOption, setSelectedNextWordOption] = useState<string | null>(null);
  // Word order
  const [orderedWordIds, setOrderedWordIds] = useState<number[]>([]);
  // Full blind
  const [isFullBlindRevealed, setIsFullBlindRevealed] = useState(false);

  // Step 6 (Self-Scoring) State
  const [selectedScoreOption, setSelectedScoreOption] = useState<typeof SELF_SCORE_OPTIONS[0] | null>(null);
  const [selectedConfusionAyah, setSelectedConfusionAyah] = useState<string>('');
  const [isLessonSubmitted, setIsLessonSubmitted] = useState(false);
  const [completionRecord, setCompletionRecord] = useState<AyahRetentionRecord | null>(null);
  const [promotionResult, setPromotionResult] = useState<{ promoted: boolean; nextStage?: string }>({
    promoted: false,
  });

  const currentStep: LessonStep = lessonData.steps[currentStepIdx] || lessonData.steps[0];
  const totalSteps = lessonData.steps.length;
  const surahMeta: SurahMeta | undefined = ALL_114_SURAHS.find((s) => s.number === surahNumber);

  const activeFillBlankData = customFillBlankData || currentStep.fillBlankData;

  // Preload upcoming audio
  useEffect(() => {
    quranAudioPreloader.preloadNextAyahs(surahNumber, ayahNumber, 2);
  }, [surahNumber, ayahNumber]);

  // Step transitions
  useEffect(() => {
    setIsPlayingAudio(false);
    setHighlightedWordIdx(null);
    setAudioProgressPercent(0);
    setCurrentRepeat(1);
    setIsFullBlindRevealed(false);

    // Save exact position for synchronization
    saveCurrentStudyPosition(surahNumber, ayahNumber, currentStepIdx + 1);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = currentStep.audioUrl;
      audioRef.current.playbackRate = audioSpeed;
    }
  }, [currentStepIdx, surahNumber, ayahNumber]);

  const handleToggleSpeed = () => {
    const nextSpeed = audioSpeed === 1.0 ? 0.75 : audioSpeed === 0.75 ? 1.25 : 1.0;
    setAudioSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleToggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      setHighlightedWordIdx(null);
    } else {
      audioRef.current.currentTime = 0;
      setAudioProgressPercent(0);
      setHighlightedWordIdx(0);
      audioRef.current
        .play()
        .then(() => {
          setIsPlayingAudio(true);
        })
        .catch(() => {
          setIsPlayingAudio(false);
          setHighlightedWordIdx(null);
        });
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const dur = audioRef.current.duration;
      const cur = audioRef.current.currentTime;
      const progress = Math.min(1, Math.max(0, cur / dur));
      setAudioProgressPercent(progress * 100);

      const count = wordsData.length;
      if (count > 0) {
        const wordIdx = Math.min(count - 1, Math.floor(progress * count));
        setHighlightedWordIdx(wordIdx);
      }
    }
  };

  const handleAudioEnded = () => {
    if (currentRepeat < repeatCount) {
      setCurrentRepeat((prev) => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      setIsPlayingAudio(false);
      setHighlightedWordIdx(null);
      if (currentStep.stepType === 'shadowing') {
        setShadowingRoundsDone((prev) => prev + 1);
      }
    }
  };

  // Step 5: Fill blank word / letter selection
  const handleSelectBankWordForBlank = (word: string, bankIdx: number) => {
    if (!activeFillBlankData) return;
    const blankIndices = activeFillBlankData.blankIndices;
    // Find first unfilled blank
    const targetBlankIdx = blankIndices.find((idx) => !filledBlanks[idx]);
    if (targetBlankIdx !== undefined) {
      setFilledBlanks((prev) => ({ ...prev, [targetBlankIdx]: word }));
      setUsedBankWords((prev) => [...prev, bankIdx]);
    }
  };

  const handleRemoveFilledBlank = (blankIdx: number) => {
    const removedWord = filledBlanks[blankIdx];
    if (!removedWord || !activeFillBlankData) return;
    const bankIdx = activeFillBlankData.wordBank.indexOf(removedWord);
    setFilledBlanks((prev) => {
      const copy = { ...prev };
      delete copy[blankIdx];
      return copy;
    });
    if (bankIdx !== -1) {
      setUsedBankWords((prev) => prev.filter((i) => i !== bankIdx));
    }
  };

  // Re-shuffle blanks at random (random missing words or 2-3 letters)
  const handleReshuffleBlanks = (forceMode?: 'words' | 'letters') => {
    const nextEx = generateFillBlankExercise(
      lessonData.ayah.arabic,
      activeFillBlankData?.lastPattern || [],
      forceMode
    );
    setCustomFillBlankData(nextEx);
    setFilledBlanks({});
    setUsedBankWords([]);
  };

  // Step 5: Word order selection
  const handleTapScrambledWord = (id: number) => {
    if (orderedWordIds.includes(id)) {
      setOrderedWordIds((prev) => prev.filter((item) => item !== id));
    } else {
      setOrderedWordIds((prev) => [...prev, id]);
    }
  };

  // Step 6: Submit recall score
  const handleSubmitSelfScore = (option: typeof SELF_SCORE_OPTIONS[0]) => {
    setSelectedScoreOption(option);
    try {
      const mechanic: RecallMechanic = currentStep.mechanic || 'full_blind';

      const result = recordRecallAttempt(
        surahNumber,
        ayahNumber,
        mechanic,
        option.selfScore,
        option.errorType,
        selectedConfusionAyah || undefined
      );

      setCompletionRecord(result.record);
      setPromotionResult({ promoted: result.promoted, nextStage: result.nextStage });
      setIsLessonSubmitted(true);

      if (option.selfScore >= 4) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err) {
      console.error('Error recording recall score:', err);
      setIsLessonSubmitted(true);
    }
  };

  // Navigation between steps
  const handleNextStep = () => {
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const canProceedFromStep = (): boolean => {
    switch (currentStep.stepType) {
      case 'listen':
      case 'word-breakdown':
        return true;
      case 'shadowing':
        return shadowingRoundsDone >= 1;
      case 'self-recitation':
        return hasSelfRecited;
      case 'active-recall':
        if (currentStep.mechanic === 'fill_blank' && activeFillBlankData) {
          return activeFillBlankData.blankIndices.every((i) => !!filledBlanks[i]);
        }
        if (currentStep.mechanic === 'next_word') {
          return selectedNextWordOption !== null;
        }
        if (currentStep.mechanic === 'word_order' && currentStep.wordOrderData) {
          return orderedWordIds.length === currentStep.wordOrderData.scrambledWords.length;
        }
        if (currentStep.mechanic === 'full_blind') {
          return isFullBlindRevealed;
        }
        return true;
      case 'self-scoring':
        return true;
      default:
        return true;
    }
  };

  // Surahs for confusion pair dropdown
  const allSurahs = ALL_114_SURAHS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        preload="auto"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] box-border">
        {/* Top Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-[#FAF9F5] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
              title="Return back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return back</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                  Surah {surahMeta?.name} ({surahMeta?.arabicName})
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] uppercase tracking-wider shrink-0">
                  Ayah {ayahNumber} of {surahMeta?.totalAyahs}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Step {currentStepIdx + 1} of 6: {currentStep.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Arabic Audio</span>
            </div>
          </div>
        </div>

        {/* 6-Step Visual Progress Bar */}
        <div className="grid grid-cols-6 gap-1 px-4 pt-2.5 pb-1.5 bg-[#FAF9F5]">
          {lessonData.steps.map((step, idx) => (
            <button
              key={step.stepNumber}
              onClick={() => setCurrentStepIdx(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStepIdx
                  ? 'bg-amber-500'
                  : idx < currentStepIdx
                  ? 'bg-emerald-500'
                  : 'bg-slate-200'
              }`}
              title={`Step ${idx + 1}: ${step.title}`}
            />
          ))}
        </div>

        {/* Modal Main Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: LISTEN & FAMILIARIZE */}
          {currentStep.stepType === 'listen' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center space-y-1">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider border border-indigo-100">
                  Step 1 • Listen & Familiarize
                </span>
                <h3 className="font-extrabold text-lg text-slate-900">Reference Recitation</h3>
                <p className="text-xs text-slate-500">
                  Listen attentively to the authentic Arabic pronunciation and intonation.
                </p>
              </div>

              {/* Quran Calligraphy Display */}
              <div className="p-6 rounded-3xl bg-amber-50/40 border border-amber-200/80 text-center space-y-4">
                <p className="font-quran text-2xl sm:text-3xl text-slate-900 leading-loose text-right dark:text-slate-100" dir="rtl">
                  {wordsData.map((w, idx) => (
                    <span
                      key={idx}
                      onClick={() => setSelectedWordForDrill(w)}
                      className={`inline-block px-1 rounded-lg transition-all cursor-pointer hover:bg-amber-200/60 ${
                        highlightedWordIdx === idx ? 'bg-amber-300/80 text-indigo-950 font-bold scale-105' : ''
                      }`}
                      title={`${w.transliteration} — ${w.translation}`}
                    >
                      {w.arabic}
                    </span>
                  ))}{' '}
                  <AyahNumberBadge number={ayahNumber} />
                </p>

                <p className="text-sm text-slate-600 italic font-medium">
                  "{lessonData.ayah.translation}"
                </p>
              </div>

              {/* Reference Audio Player Controls */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleAudio}
                    className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <div>
                    <span className="font-bold text-xs text-slate-800 block">
                      {isPlayingAudio ? 'Playing Arabic Audio...' : 'Tap Play to Listen'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Arabic Audio Recitation
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Speed Button */}
                  <button
                    onClick={handleToggleSpeed}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    title="Change Audio Speed"
                  >
                    {audioSpeed}x
                  </button>

                  {/* Repeat Loop */}
                  <button
                    onClick={() => setRepeatCount((prev) => (prev === 1 ? 3 : prev === 3 ? 5 : 1))}
                    className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer ${
                      repeatCount > 1 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'
                    }`}
                    title="Loop Count"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>{repeatCount}x</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: WORD-BY-WORD BREAKDOWN */}
          {currentStep.stepType === 'word-breakdown' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center space-y-1">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-100">
                  Step 2 • Vocabulary & Roots
                </span>
                <h3 className="font-extrabold text-lg text-slate-900">Word-by-Word Breakdown</h3>
                <p className="text-xs text-slate-500">
                  Tap any word to inspect Arabic letters (RTL), root origins, and phonetics.
                </p>
              </div>

              {/* Grid of Word Tiles in RTL Order */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" dir="rtl">
                {wordsData.map((w, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedWordForDrill(w)}
                    className="p-3.5 rounded-2xl bg-white border-2 border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer text-center space-y-1"
                  >
                    <span className="font-quran text-xl text-slate-900 block dark:text-slate-100">{w.arabic}</span>
                    <span className="text-xs text-indigo-700 font-bold block" dir="ltr">
                      {w.transliteration}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block" dir="ltr">
                      {w.translation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SHADOWING PRACTICE */}
          {currentStep.stepType === 'shadowing' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center space-y-1">
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-extrabold text-[10px] uppercase tracking-wider border border-amber-200">
                  Step 3 • Shadowing Practice (Unrecorded)
                </span>
                <h3 className="font-extrabold text-lg text-slate-900">Listen & Repeat Aloud</h3>
                <p className="text-xs text-slate-500">
                  Repeat aloud along with the reciter. Practice at least once to reinforce vocal muscle memory.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-amber-50/40 border border-amber-200 text-center space-y-3">
                <p className="font-quran text-2xl sm:text-3xl text-slate-900 leading-loose text-right dark:text-slate-100" dir="rtl">
                  {lessonData.ayah.arabic} <AyahNumberBadge number={ayahNumber} />
                </p>
                <p className="text-xs text-slate-600 italic">"{lessonData.ayah.translation}"</p>
              </div>

              {/* Shadowing Practice Audio Controller */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 overflow-hidden">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={handleToggleAudio}
                    className="w-12 h-12 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-800 block truncate">
                      {isPlayingAudio ? 'Recite aloud now...' : 'Tap Play to Shadow'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Rounds practiced: <strong className="text-amber-700">{shadowingRoundsDone}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShadowingRoundsDone((prev) => prev + 1)}
                  className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-1 cursor-pointer hover:bg-emerald-100 shrink-0 whitespace-nowrap ml-auto"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Practiced</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SELF-RECITATION CHECKPOINT */}
          {currentStep.stepType === 'self-recitation' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center space-y-1">
                <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-extrabold text-[10px] uppercase tracking-wider border border-purple-100">
                  Step 4 • Self-Recitation Checkpoint
                </span>
                <h3 className="font-extrabold text-lg text-slate-900">Silent / Self-Guided Checkpoint</h3>
                <p className="text-xs text-slate-500">
                  Recite the verse independently at your own pace before proceeding to active recall testing.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-purple-50/30 border border-purple-200 text-center space-y-4">
                <p className="font-quran text-2xl sm:text-3xl text-slate-900 leading-loose text-right dark:text-slate-100" dir="rtl">
                  {lessonData.ayah.arabic} <AyahNumberBadge number={ayahNumber} />
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setHasSelfRecited(true)}
                    className={`px-5 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer flex items-center gap-2 mx-auto ${
                      hasSelfRecited
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md active:scale-95'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{hasSelfRecited ? 'Checkpoint Confirmed' : 'I have recited this verse'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: BLIND ACTIVE RECALL */}
          {currentStep.stepType === 'active-recall' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center space-y-1">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider border border-indigo-100">
                  Step 5 • Blind Active Recall
                </span>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {currentStep.mechanic === 'fill_blank' && 'Fill in the Missing Words'}
                  {currentStep.mechanic === 'next_word' && 'Supply the Next Word'}
                  {currentStep.mechanic === 'word_order' && 'Order Scrambled Tiles'}
                  {currentStep.mechanic === 'full_blind' && 'Recite from Memory'}
                </h3>
                <p className="text-xs text-slate-500">
                  {currentStep.mechanic === 'fill_blank' && 'Tap words from the bank to complete the blanks.'}
                  {currentStep.mechanic === 'next_word' && 'Choose the correct word that follows.'}
                  {currentStep.mechanic === 'word_order' && 'Tap the Arabic word tiles in proper right-to-left sequence.'}
                  {currentStep.mechanic === 'full_blind' && 'Recite the full verse without looking, then reveal to verify.'}
                </p>
              </div>

              {/* MECHANIC 1: FILL IN THE BLANK / 2-3 LETTERS CHALLENGE */}
              {currentStep.mechanic === 'fill_blank' && activeFillBlankData && (
                <div className="space-y-4">
                  {/* Header Controls: Mode Badge, Mode Toggle & Re-shuffle */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 ${
                      activeFillBlankData.challengeType === 'letters'
                        ? 'bg-purple-50 text-purple-900 border border-purple-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}>
                      {activeFillBlankData.challengeType === 'letters' ? (
                        <span>🔤 {activeFillBlankData.blankCountDescription || '2-3 Letters Challenge'}</span>
                      ) : (
                        <span>🎲 {activeFillBlankData.blankCountDescription || 'Random Missing Words'}</span>
                      )}
                    </span>

                    <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                      {/* Mode toggles */}
                      <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold">
                        <button
                          onClick={() => handleReshuffleBlanks('words')}
                          className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                            activeFillBlankData.challengeType === 'words'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                          title="Test with randomized missing words"
                        >
                          Words
                        </button>
                        <button
                          onClick={() => handleReshuffleBlanks('letters')}
                          className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                            activeFillBlankData.challengeType === 'letters'
                              ? 'bg-white text-purple-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                          title="Test with 2 or 3 missing letters"
                        >
                          2-3 Letters
                        </button>
                      </div>

                      {/* Re-shuffle Blanks Button */}
                      <button
                        onClick={() => handleReshuffleBlanks(activeFillBlankData.challengeType)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-2xs"
                        title="Shuffle missing words / letters at random"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Shuffle</span>
                      </button>
                    </div>
                  </div>

                  {/* Ayah with interactive blank slots or 2-3 letters fragment */}
                  <div className="p-6 rounded-3xl bg-white border-2 border-indigo-100 shadow-xs text-right leading-loose font-quran text-2xl min-h-[90px] flex flex-wrap items-center justify-end" dir="rtl">
                    {activeFillBlankData.challengeType === 'letters' && activeFillBlankData.letterChallenge ? (
                      // 2-3 Letters challenge
                      activeFillBlankData.arabicWords.map((token, idx) => {
                        const isTargetWord = idx === activeFillBlankData.letterChallenge?.wordIndex;
                        const letterCh = activeFillBlankData.letterChallenge!;
                        const filled = filledBlanks[idx];

                        if (!isTargetWord) {
                          return <span key={idx} className="inline-block mx-1 text-slate-800">{token}</span>;
                        }

                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 mx-1.5 rounded-2xl bg-purple-50/90 border-2 border-purple-300 shadow-xs gap-0.5 align-middle"
                          >
                            {letterCh.prefix && (
                              <span className="text-slate-900 font-bold">{letterCh.prefix}</span>
                            )}
                            <button
                              onClick={() => filled && handleRemoveFilledBlank(idx)}
                              className={`inline-flex items-center justify-center px-2.5 py-0.5 mx-0.5 rounded-xl font-bold cursor-pointer transition-all border-2 text-xl ${
                                filled
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-500 shadow-xs'
                                  : 'bg-white border-dashed border-purple-400 text-purple-700 min-w-[56px] text-center'
                              }`}
                              title={filled ? 'Click to remove and re-choose' : `Tap missing ${letterCh.letterCount} letters from the bank below`}
                            >
                              {filled || '____'}
                            </button>
                            {letterCh.suffix && (
                              <span className="text-slate-900 font-bold">{letterCh.suffix}</span>
                            )}
                          </span>
                        );
                      })
                    ) : (
                      // Missing Words challenge
                      activeFillBlankData.arabicWords.map((word, idx) => {
                        const isBlank = activeFillBlankData.blankIndices.includes(idx);
                        const filled = filledBlanks[idx];

                        if (!isBlank) {
                          return (
                            <span key={idx} className="inline-block mx-1 text-slate-800">
                              {word}
                            </span>
                          );
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => filled && handleRemoveFilledBlank(idx)}
                            className={`inline-flex items-center justify-center min-w-[70px] h-10 px-2 mx-1 rounded-xl text-lg font-bold border-2 transition-all cursor-pointer ${
                              filled
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                                : 'bg-slate-100 border-dashed border-slate-300 text-slate-400'
                            }`}
                          >
                            {filled || '____'}
                          </button>
                        );
                      })
                    )}{' '}
                    <AyahNumberBadge number={ayahNumber} />
                  </div>

                  {/* Word / Letter Bank */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block text-center">
                      {activeFillBlankData.challengeType === 'letters'
                        ? `Letter Bank (Select the missing ${activeFillBlankData.letterChallenge?.letterCount || '2-3'} letters)`
                        : 'Word Bank (Tap to fill)'}
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2" dir="rtl">
                      {activeFillBlankData.wordBank.map((item, bIdx) => {
                        const isUsed = usedBankWords.includes(bIdx) || Object.values(filledBlanks).includes(item);
                        return (
                          <button
                            key={bIdx}
                            disabled={isUsed}
                            onClick={() => handleSelectBankWordForBlank(item, bIdx)}
                            className={`px-4 py-2 rounded-xl font-quran text-lg border transition-all cursor-pointer ${
                              isUsed
                                ? 'opacity-30 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                : activeFillBlankData.challengeType === 'letters'
                                ? 'bg-white hover:bg-purple-50 border-purple-200 text-slate-900 shadow-2xs hover:border-purple-400'
                                : 'bg-white hover:bg-indigo-50 border-slate-200 text-slate-800 shadow-2xs hover:border-indigo-300'
                            } dark:text-slate-100`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* MECHANIC 2: NEXT WORD */}
              {currentStep.mechanic === 'next_word' && currentStep.nextWordData && (
                <div className="space-y-4">
                  <div className="p-6 rounded-3xl bg-white border-2 border-indigo-100 shadow-xs text-right leading-loose font-quran text-2xl" dir="rtl">
                    <span className="text-slate-800">
                      {currentStep.nextWordData.prefixWords.join(' ')}
                    </span>{' '}
                    <span className="inline-block px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border-2 border-amber-300 font-bold">
                      {selectedNextWordOption || '❓ [Next Word]'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2" dir="rtl">
                    {currentStep.nextWordData.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedNextWordOption(opt)}
                        className={`p-3 rounded-2xl font-quran text-xl border-2 transition-all cursor-pointer ${
                          selectedNextWordOption === opt
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-md'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                        } dark:text-slate-100`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MECHANIC 3: WORD ORDER */}
              {currentStep.mechanic === 'word_order' && currentStep.wordOrderData && (
                <div className="space-y-4">
                  {/* Selected Words Tray */}
                  <div className="p-5 rounded-3xl bg-white border-2 border-dashed border-indigo-200 min-h-[80px] text-right font-quran text-2xl flex flex-wrap gap-2 items-center justify-end" dir="rtl">
                    {orderedWordIds.length === 0 ? (
                      <span className="text-slate-400 text-sm font-sans">Tap the word tiles below in order...</span>
                    ) : (
                      orderedWordIds.map((id) => {
                        const item = currentStep.wordOrderData!.scrambledWords.find((w) => w.id === id);
                        return (
                          <button
                            key={id}
                            onClick={() => handleTapScrambledWord(id)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-900 shadow-xs cursor-pointer"
                          >
                            {item?.text}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Scrambled Word Bank */}
                  <div className="flex flex-wrap items-center justify-center gap-2" dir="rtl">
                    {currentStep.wordOrderData.scrambledWords.map((item) => {
                      const isSelected = orderedWordIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          disabled={isSelected}
                          onClick={() => handleTapScrambledWord(item.id)}
                          className={`px-4 py-2 rounded-xl font-quran text-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'opacity-30 bg-slate-100 border-slate-200 cursor-not-allowed'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                          } dark:text-slate-100`}
                        >
                          {item.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MECHANIC 4: FULL BLIND RECALL */}
              {currentStep.mechanic === 'full_blind' && (
                <div className="space-y-4">
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center mx-auto text-xl">
                      📖
                    </div>
                    <h4 className="font-extrabold text-base">Recite Surah {surahMeta?.name} [{ayahNumber}] from Memory</h4>
                    <p className="text-xs text-slate-300 italic">
                      "{lessonData.ayah.translation}"
                    </p>

                    {isFullBlindRevealed ? (
                      <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-right font-quran text-2xl leading-loose" dir="rtl">
                        {lessonData.ayah.arabic} <AyahNumberBadge number={ayahNumber} />
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsFullBlindRevealed(true)}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md"
                      >
                        Reveal Ayah to Check
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: SELF-SCORING ASSESSMENT (SECTION 7 OF SPEC) */}
          {currentStep.stepType === 'self-scoring' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center space-y-1">
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-extrabold text-[10px] uppercase tracking-wider border border-amber-200">
                  Step 6 • Self-Scoring Assessment
                </span>
                <h3 className="font-extrabold text-lg text-slate-900">How was your recall?</h3>
                <p className="text-xs text-slate-500">
                  Select the option that matches your attempt to update your spaced review schedule.
                </p>
              </div>

              {/* 4 Clean Tap Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SELF_SCORE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSubmitSelfScore(opt)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      selectedScoreOption?.id === opt.id
                        ? 'border-indigo-600 ring-2 ring-indigo-400 shadow-md bg-indigo-50/50'
                        : opt.badgeColor
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{opt.label}</h4>
                        <p className="text-[11px] text-slate-600 font-medium">{opt.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Confusion Pair Selector if "Mixed up with another ayah" chosen */}
              {selectedScoreOption?.id === 'confused' && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                    <Shuffle className="w-4 h-4 text-purple-700" />
                    <span>Which Ayah did you confuse this with?</span>
                  </div>
                  <select
                    value={selectedConfusionAyah}
                    onChange={(e) => {
                      setSelectedConfusionAyah(e.target.value);
                      if (selectedScoreOption) handleSubmitSelfScore(selectedScoreOption);
                    }}
                    className="w-full p-2.5 rounded-xl bg-white border border-purple-200 text-xs font-bold text-slate-800"
                  >
                    <option value="">Select confusing Surah / Ayah...</option>
                    {allSurahs.map((s) => (
                      <option key={s.number} value={`${s.number}:1`}>
                        Surah #{s.number} {s.name} ({s.arabicName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Promotion / Completion Feedback */}
              {isLessonSubmitted && completionRecord && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Recall Recorded Successfully</span>
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-200/80">
                      +60 XP
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium">
                    Current Stage:{' '}
                    <strong className="uppercase font-black">{completionRecord.stage}</strong> • Next Review in{' '}
                    <strong>{completionRecord.intervalDays} day(s)</strong>
                  </p>
                  {promotionResult.promoted && (
                    <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs text-center shadow-xs animate-bounce">
                      🎉 Promoted from Sabaq to Sabqi! Linear progression advanced.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Navigation */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-[#FAF9F5] flex items-center justify-between gap-3">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIdx === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentStepIdx === 0
                ? 'opacity-40 text-slate-400 cursor-not-allowed'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentStepIdx < totalSteps - 1 ? (
            <button
              onClick={handleNextStep}
              disabled={!canProceedFromStep()}
              className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                canProceedFromStep()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                let finalRecord = completionRecord;
                if (!finalRecord) {
                  const targetOption = selectedScoreOption || SELF_SCORE_OPTIONS[3]; // default to 'Nailed it'
                  try {
                    const result = recordRecallAttempt(
                      surahNumber,
                      ayahNumber,
                      currentStep.mechanic || 'full_blind',
                      targetOption.selfScore,
                      targetOption.errorType,
                      selectedConfusionAyah || undefined
                    );
                    finalRecord = result.record;
                  } catch (e) {
                    console.error('Error finishing lesson', e);
                  }
                }
                if (finalRecord && onLessonComplete) {
                  onLessonComplete(finalRecord);
                }
                onClose();
              }}
              className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
                selectedScoreOption || isLessonSubmitted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Finish Lesson</span>
            </button>
          )}
        </div>
      </div>

      {/* Word-level Pronunciation Drill Modal */}
      {selectedWordForDrill && (
        <WordPronunciationModal
          word={selectedWordForDrill}
          allAyahWords={wordsData}
          surahNumber={surahNumber}
          ayahNumber={ayahNumber}
          surahName={surahMeta?.name || 'Al-Fatihah'}
          activeReciter={selectedReciter}
          onSelectReciter={(r) => setSelectedReciter(r)}
          onSelectWord={(newW) => setSelectedWordForDrill(newW)}
          onClose={() => setSelectedWordForDrill(null)}
          onContinue={() => setSelectedWordForDrill(null)}
        />
      )}
    </div>
  );
};
