import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  Sparkles,
  Check,
  RotateCcw,
  BookOpen,
  Eye,
  EyeOff,
  Flame,
  Star,
  Award,
  ChevronRight,
  Play,
  Pause,
  Repeat,
  CheckCircle2,
  Trophy,
  Layers,
  HelpCircle,
  Shuffle,
  Shield,
  BookMarked,
  LayoutList,
  Sliders,
  Lock,
  Calendar,
  Clock,
  Milestone,
  CheckCheck,
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
  getUserProgression,
  AyahRetentionRecord,
  getRetentionDatabase,
  isAyahMemorized,
  markAyahAsMemorized,
  getSurahMemorizationStats,
  isAyahLockedForSabaq,
  adjustHifzPoints,
  getUserPlan,
} from '../../services/memorizationEngine';
import { ALL_114_SURAHS, SurahMeta } from '../../data/quranMetadata';
import { SURAH_CONTENT_DB, AyahDetail, SurahContent } from '../../data/quranVerses';
import {
  getAyahWordsData,
  WordDetailData,
  QURAN_RECITERS,
  ReciterProfile,
  quranAudioPreloader,
  globalAudioManager,
} from '../../services/quranAudioEngine';
import { getStoredReaderSettings, saveStoredReaderSettings, getSurahCompleteData } from '../../services/quranDataService';
import { WordPronunciationModal } from './WordPronunciationModal';
import { AyahNumberBadge } from '../ui/AyahNumberBadge';
import { InteractiveTajweedAyah } from '../InteractiveTajweedAyah';

export interface MemorizationLessonPageProps {
  surahNumber: number;
  ayahNumber: number;
  onClose: () => void;
  onNavigateToAyah?: (surahNumber: number, ayahNumber: number) => void;
  onOpenSurahTest?: (surahNumber: number) => void;
}

export const MemorizationLessonPage: React.FC<MemorizationLessonPageProps> = ({
  surahNumber: propSurahNumber,
  ayahNumber: propAyahNumber,
  onClose,
  onNavigateToAyah,
  onOpenSurahTest,
}) => {
  // Current active Surah and Ayah being studied
  const [activeSurahNumber, setActiveSurahNumber] = useState<number>(propSurahNumber || 1);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number>(propAyahNumber || 1);

  // View Mode: 'step-lesson' (5-step focused drill) vs 'ayah-completion' (Ayah Tajweed & Monthly Roadmap) vs 'surah-overview'
  const [viewMode, setViewMode] = useState<'step-lesson' | 'ayah-completion' | 'surah-overview'>('step-lesson');

  // Reciter selection
  const [selectedReciter, setSelectedReciter] = useState<ReciterProfile>(QURAN_RECITERS[0]);
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  // Retention & Progression dynamic snapshot
  const [retentionDb, setRetentionDb] = useState(getRetentionDatabase());
  const [surahStats, setSurahStats] = useState(() => getSurahMemorizationStats(activeSurahNumber));

  // Lesson data (6 steps)
  const [lessonData, setLessonData] = useState(() =>
    generateAyahLesson(activeSurahNumber, activeAyahNumber, selectedReciter.subfolder)
  );

  // Current Step Index (0 to 4 for steps 1 to 5)
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(() => {
    const prog = getUserProgression();
    if (
      prog.activeStudyPosition &&
      prog.activeStudyPosition.surahNumber === activeSurahNumber &&
      prog.activeStudyPosition.ayahNumber === activeAyahNumber &&
      typeof prog.activeStudyPosition.stepNumber === 'number'
    ) {
      return Math.max(0, Math.min(4, prog.activeStudyPosition.stepNumber - 1));
    }
    return 0;
  });

  // Audio Playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<0.75 | 1.0 | 1.25>(1.0);
  const [repeatCount, setRepeatCount] = useState<1 | 3 | 5 | 10>(1);
  const [currentRepeat, setCurrentRepeat] = useState(1);
  const [audioProgressPercent, setAudioProgressPercent] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Surah overview verse audio player
  const [playingSurahAudioAyah, setPlayingSurahAudioAyah] = useState<number | null>(null);
  const surahAudioRef = useRef<HTMLAudioElement | null>(null);

  // Word-by-word data
  const [wordsData, setWordsData] = useState<WordDetailData[]>(() => {
    return getAyahWordsData(
      activeSurahNumber,
      activeAyahNumber,
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
  const [isPeekRevealed, setIsPeekRevealed] = useState(false);

  // Step 5 (Blind Active Recall) States
  const [customFillBlankData, setCustomFillBlankData] = useState<FillBlankExercise | null>(null);
  const [filledBlanks, setFilledBlanks] = useState<Record<number, string>>({});
  const [selectedNextWordOption, setSelectedNextWordOption] = useState<string | null>(null);
  const [orderedWordIds, setOrderedWordIds] = useState<number[]>([]);
  const [isFullBlindRevealed, setIsFullBlindRevealed] = useState(false);

  // Step 6 (Self-Scoring) State
  const [selectedScoreOption, setSelectedScoreOption] = useState<typeof SELF_SCORE_OPTIONS[0] | null>(null);
  const [selectedConfusionAyah, setSelectedConfusionAyah] = useState<string>('');
  const [isLessonSubmitted, setIsLessonSubmitted] = useState(false);
  const [completionRecord, setCompletionRecord] = useState<AyahRetentionRecord | null>(null);
  const [wasPromoted, setWasPromoted] = useState(false);

  // Transition / Ayah Completion Summary Info
  const [completedAyahInfo, setCompletedAyahInfo] = useState<{
    surahNumber: number;
    ayahNumber: number;
    arabic: string;
    translation: string;
    transliteration: string;
  } | null>(null);
  const [isCompletionAudioPlaying, setIsCompletionAudioPlaying] = useState(false);
  const completionAudioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic Arabic Font Sizing State
  const [arabicFontSizePx, setArabicFontSizePx] = useState<number>(() => {
    return getStoredReaderSettings().customArabicFontSizePx || 34;
  });

  const handleStepFontSize = (delta: number) => {
    setArabicFontSizePx((prev) => {
      const next = Math.min(60, Math.max(20, prev + delta));
      const current = getStoredReaderSettings();
      saveStoredReaderSettings({ ...current, customArabicFontSizePx: next });
      return next;
    });
  };

  const [fetchedSurahContent, setFetchedSurahContent] = useState<SurahContent | null>(null);

  const currentStep: LessonStep = lessonData.steps[currentStepIdx] || lessonData.steps[0];
  const totalSteps = lessonData.steps.length;
  const surahMeta: SurahMeta = ALL_114_SURAHS.find((s) => s.number === activeSurahNumber) || ALL_114_SURAHS[0];
  const surahContent: SurahContent | undefined = fetchedSurahContent || SURAH_CONTENT_DB[activeSurahNumber] || SURAH_CONTENT_DB[1];

  // Monthly Roadmap & Timeline Projections
  const timelineMilestones = useMemo(() => {
    const plan = getUserPlan();
    const pace = plan.dailyPace || 3;
    const monthlyPace = pace * 30; // Approx 90 verses per month
    const allRecords = getRetentionDatabase();
    const memorizedAyahs = Object.values(allRecords).filter(
      (r) => r && (r.stage === 'sabqi' || r.stage === 'manzil')
    ).length;

    const totalPlanAyahs = plan.orderedAyahSequence?.length || 6236;
    const remainingAyahs = Math.max(0, totalPlanAyahs - memorizedAyahs);
    const estMonthsRemaining = Math.max(1, Math.ceil(remainingAyahs / monthlyPace));
    const totalEstMonths = Math.max(estMonthsRemaining, Math.ceil(totalPlanAyahs / monthlyPace));

    // Target completion date calculation
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Math.ceil(remainingAyahs / pace));
    const formattedTargetDate = targetDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    const surahNames = [
      surahMeta.name,
      'Al-Baqarah',
      "Ali 'Imran",
      'An-Nisa',
      "Al-Ma'idah",
      "Al-An'am",
    ];

    const months = [];
    const maxMonthsToShow = Math.min(6, Math.max(4, totalEstMonths));
    for (let m = 1; m <= maxMonthsToShow; m++) {
      const isCurrent = m === 1;
      const isRemaining = m > 1;
      const targetSurah = surahNames[m - 1] || `Juz ${Math.min(30, m * 2)}`;

      months.push({
        monthNumber: m,
        title: `Month ${m}`,
        isCurrent,
        isRemaining,
        targetSurah,
        targetAyahs: isCurrent ? `Current: Surah ${surahMeta.name}` : `Projected: Surah ${targetSurah}`,
        statusLabel: isCurrent ? 'Active Focus' : `Remaining`,
      });
    }

    return {
      pace,
      memorizedAyahs,
      totalPlanAyahs,
      remainingAyahs,
      estMonthsRemaining,
      formattedTargetDate,
      months,
    };
  }, [activeSurahNumber, activeAyahNumber, retentionDb, surahMeta.name]);

  // Dynamically load standard Quran data for any Surah
  useEffect(() => {
    let isCancelled = false;
    getSurahCompleteData(activeSurahNumber, selectedReciter.subfolder).then((sData) => {
      if (isCancelled || !sData) return;
      setFetchedSurahContent(sData);
      const exactAyah = sData.ayahs?.find((a) => a.number === activeAyahNumber);
      if (exactAyah) {
        const newLesson = generateAyahLesson(activeSurahNumber, activeAyahNumber, selectedReciter.subfolder, exactAyah);
        setLessonData(newLesson);
        setWordsData(getAyahWordsData(activeSurahNumber, activeAyahNumber, exactAyah.arabic, exactAyah.translation));
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [activeSurahNumber, activeAyahNumber, selectedReciter.subfolder]);

  // Active Fill Blank Exercise data (dynamic re-shuffled or from lesson)
  const activeFillBlankData = customFillBlankData || currentStep.fillBlankData;

  // Refresh stats helper
  const refreshStats = (sNum = activeSurahNumber) => {
    setRetentionDb(getRetentionDatabase());
    setSurahStats(getSurahMemorizationStats(sNum));
  };

  // Sync when propSurahNumber or propAyahNumber change
  useEffect(() => {
    if (propSurahNumber && (propSurahNumber !== activeSurahNumber || propAyahNumber !== activeAyahNumber)) {
      handleJumpToAyah(propSurahNumber, propAyahNumber || 1);
    }
  }, [propSurahNumber, propAyahNumber]);

  // Preload upcoming audio
  useEffect(() => {
    quranAudioPreloader.preloadNextAyahs(activeSurahNumber, activeAyahNumber, 3);
  }, [activeSurahNumber, activeAyahNumber]);

  // Handle Step transitions
  useEffect(() => {
    setIsPlayingAudio(false);
    setHighlightedWordIdx(null);
    setAudioProgressPercent(0);
    setCurrentRepeat(1);
    setIsFullBlindRevealed(false);
    setIsPeekRevealed(false);

    // Save exact position for synchronization across all tabs
    saveCurrentStudyPosition(activeSurahNumber, activeAyahNumber, currentStepIdx + 1);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = currentStep.audioUrl;
      audioRef.current.playbackRate = audioSpeed;
    }
  }, [currentStepIdx, activeSurahNumber, activeAyahNumber]);

  // Jump to specific Ayah
  const handleJumpToAyah = (sNum: number, aNum: number) => {
    const lockCheck = isAyahLockedForSabaq(sNum, aNum);
    // If it's locked purely due to points, we can block it.
    // However, we no longer strictly snap them back to their required linear plan order
    // if they are manually proceeding to the next ayah in their active study session.
    if (lockCheck.isLocked && lockCheck.lockType === 'points') {
      return;
    }

    const newLesson = generateAyahLesson(sNum, aNum, selectedReciter.subfolder);
    setActiveSurahNumber(sNum);
    setActiveAyahNumber(aNum);
    setLessonData(newLesson);
    setWordsData(getAyahWordsData(sNum, aNum, newLesson.ayah.arabic, newLesson.ayah.translation));
    setCurrentStepIdx(0);
    setShadowingRoundsDone(0);
    setHasSelfRecited(false);
    setCustomFillBlankData(null);
    setFilledBlanks({});
    setSelectedNextWordOption(null);
    setOrderedWordIds([]);
    setIsFullBlindRevealed(false);
    setSelectedScoreOption(null);
    setIsLessonSubmitted(false);
    setCompletionRecord(null);
    setWasPromoted(false);
    saveCurrentStudyPosition(sNum, aNum, 1);
    refreshStats(sNum);
    if (onNavigateToAyah) {
      onNavigateToAyah(sNum, aNum);
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
  };

  // Move to the next Ayah
  const handleContinueToNextAyah = () => {
    if (activeAyahNumber < surahMeta.totalAyahs) {
      handleJumpToAyah(activeSurahNumber, activeAyahNumber + 1);
      setViewMode('step-lesson');
    } else if (activeSurahNumber < 114) {
      // Advance to the next Surah
      handleJumpToAyah(activeSurahNumber + 1, 1);
      setViewMode('step-lesson');
    } else {
      // Completed entire Quran
      onClose();
    }
  };

  // Audio Playback toggles
  const handleToggleSpeed = () => {
    const nextSpeed = audioSpeed === 1.0 ? 0.75 : audioSpeed === 0.75 ? 1.25 : 1.0;
    setAudioSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handlePlayReferenceAudio = () => {
    if (!audioRef.current) return;
    if (!audioRef.current.src || audioRef.current.src !== currentStep.audioUrl) {
      audioRef.current.src = currentStep.audioUrl;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.playbackRate = audioSpeed;
    setAudioProgressPercent(0);
    setHighlightedWordIdx(0);
    audioRef.current
      .play()
      .then(() => {
        setIsPlayingAudio(true);
      })
      .catch((err) => {
        console.warn('Audio play request interrupted:', err);
        setIsPlayingAudio(false);
        setHighlightedWordIdx(null);
      });
  };

  const handleToggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      setHighlightedWordIdx(null);
    } else {
      handlePlayReferenceAudio();
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
        audioRef.current.play().catch(() => setIsPlayingAudio(false));
      }
    } else {
      setIsPlayingAudio(false);
      setHighlightedWordIdx(null);
      setAudioProgressPercent(0);
      setCurrentRepeat(1);
    }
  };

  // Toggle single Ayah audio inside the Complete Surah view
  const handleToggleSurahAyahAudio = (ayahNum: number) => {
    if (playingSurahAudioAyah === ayahNum) {
      if (surahAudioRef.current) {
        surahAudioRef.current.pause();
      }
      setPlayingSurahAudioAyah(null);
      return;
    }

    globalAudioManager.stopAll(`mem-lesson-${ayahNum}`);

    if (surahAudioRef.current) {
      surahAudioRef.current.pause();
    }

    const sPad = String(activeSurahNumber).padStart(3, '0');
    const aPad = String(ayahNum).padStart(3, '0');
    const audioUrl = `https://everyayah.com/data/${selectedReciter.subfolder}/${sPad}${aPad}.mp3`;

    const audio = new Audio(audioUrl);
    surahAudioRef.current = audio;
    setPlayingSurahAudioAyah(ayahNum);

    const unregister = globalAudioManager.registerAudioElement(audio, `mem-lesson-${ayahNum}`, () => {
      try {
        if (!audio.paused) audio.pause();
      } catch {}
      setPlayingSurahAudioAyah(null);
    });

    audio.onended = () => {
      unregister();
      setPlayingSurahAudioAyah(null);
    };
    audio.onerror = () => {
      unregister();
      setPlayingSurahAudioAyah(null);
    };
    audio.play().catch(() => {
      unregister();
      setPlayingSurahAudioAyah(null);
    });
  };

  // Step 6 Score submission & Automatic Progression Advancement
  const handleScoreSubmit = (option: typeof SELF_SCORE_OPTIONS[0]) => {
    setSelectedScoreOption(option);
    try {
      const result = recordRecallAttempt(
        activeSurahNumber,
        activeAyahNumber,
        'full_blind',
        option.selfScore,
        option.errorType,
        selectedConfusionAyah || undefined
      );

      setCompletionRecord(result.record);
      setIsLessonSubmitted(true);
      setWasPromoted(result.promoted);
      setCompletedAyahInfo({
        surahNumber: activeSurahNumber,
        ayahNumber: activeAyahNumber,
        arabic: lessonData.ayah.arabic,
        translation: lessonData.ayah.translation,
        transliteration: lessonData.ayah.transliteration,
      });
      refreshStats(activeSurahNumber);

      if (option.selfScore >= 3) {
        try {
          confetti({
            particleCount: 75,
            spread: 80,
            origin: { y: 0.5 },
          });
        } catch {}
      }

      // Automatically transition to the Ayah Completion Tajweed & Timeline page
      setViewMode('ayah-completion');
    } catch (err) {
      console.error('Error recording recall score:', err);
      setIsLessonSubmitted(true);
      setCompletedAyahInfo({
        surahNumber: activeSurahNumber,
        ayahNumber: activeAyahNumber,
        arabic: lessonData.ayah.arabic,
        translation: lessonData.ayah.translation,
        transliteration: lessonData.ayah.transliteration,
      });
      setViewMode('ayah-completion');
    }
  };

  // Play audio for completed verse in summary
  const handleToggleCompletionAudio = () => {
    if (isCompletionAudioPlaying && completionAudioRef.current) {
      completionAudioRef.current.pause();
      setIsCompletionAudioPlaying(false);
      return;
    }

    const audioUrl = lessonData.audioUrl;
    if (!audioUrl) return;

    if (completionAudioRef.current) {
      completionAudioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    completionAudioRef.current = audio;
    setIsCompletionAudioPlaying(true);

    const unregister = globalAudioManager.registerAudioElement(audio, `completion-${activeAyahNumber}`, () => {
      try {
        if (!audio.paused) audio.pause();
      } catch {}
      setIsCompletionAudioPlaying(false);
    });

    audio.onended = () => {
      unregister();
      setIsCompletionAudioPlaying(false);
    };
    audio.onerror = () => {
      unregister();
      setIsCompletionAudioPlaying(false);
    };
    audio.play().catch(() => {
      unregister();
      setIsCompletionAudioPlaying(false);
    });
  };

  // Proceed to next Ayah from the Completion & Timeline page
  const handleProceedToNextAyahFromSummary = () => {
    if (completionAudioRef.current) {
      try {
        completionAudioRef.current.pause();
      } catch {}
      setIsCompletionAudioPlaying(false);
    }

    const currentProg = getUserProgression();
    if (currentProg.activeStudyPosition) {
      handleJumpToAyah(currentProg.activeStudyPosition.surahNumber, currentProg.activeStudyPosition.ayahNumber);
      setViewMode('step-lesson');
    } else if (activeAyahNumber < surahMeta.totalAyahs) {
      handleJumpToAyah(activeSurahNumber, activeAyahNumber + 1);
      setViewMode('step-lesson');
    } else if (activeSurahNumber < 114) {
      handleJumpToAyah(activeSurahNumber + 1, 1);
      setViewMode('step-lesson');
    } else {
      onClose();
    }
  };

  // Manual toggle for checking an Ayah as memorized in the Complete Surah Page
  const handleToggleAyahMemorized = (ayahNum: number, currentlyMemorized: boolean) => {
    markAyahAsMemorized(activeSurahNumber, ayahNum, !currentlyMemorized);
    refreshStats(activeSurahNumber);
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

  const isCurrentAyahMemorized = isAyahMemorized(activeSurahNumber, activeAyahNumber);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex flex-col font-sans-ui selection:bg-[#FEF7DA] selection:text-[#D97706] pb-20">
      {/* Hidden Audio Player for 6-Step Drills */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
        preload="auto"
      />

      {/* ========================================================================= */}
      {/* 1. TOP COMPACT RESPONSIVE HEADER (Fits Single Screen on Android)          */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2.5 sm:px-4 py-2 shadow-2xs">
        <div className="max-w-xl mx-auto space-y-1.5">
          {/* Main Top Row: Back, Title/Ayah badge, View Mode, Controls */}
          <div className="flex items-center justify-between gap-1.5">
            {/* Return Back Button */}
            <button
              onClick={onClose}
              className="h-8 px-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
              title="Return back"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Surah & Ayah Pill */}
            <div className="flex items-center gap-1 min-w-0 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-black text-slate-950 truncate">
                {surahMeta.name} • Ayah {activeAyahNumber} of {surahMeta.totalAyahs}
              </span>
              <span className="text-[10px] text-emerald-800 font-bold font-amiri hidden sm:inline">
                ({surahMeta.arabicName})
              </span>
            </div>

            {/* View Switcher [6-Step Drill] vs [Full Surah] */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold shrink-0">
              <button
                onClick={() => setViewMode('step-lesson')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10.5px] ${
                  viewMode === 'step-lesson'
                    ? 'bg-white text-slate-950 font-extrabold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="6-Step Memorization Drill"
              >
                <Flame className={`w-3 h-3 ${viewMode === 'step-lesson' ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                <span>Drill</span>
              </button>
              <button
                onClick={() => setViewMode('surah-overview')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10.5px] ${
                  viewMode === 'surah-overview'
                    ? 'bg-white text-slate-950 font-extrabold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Surah Overview"
              >
                <BookOpen className={`w-3 h-3 ${viewMode === 'surah-overview' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Surah</span>
              </button>
            </div>

            {/* Right Controls: Font Stepper & Reciter Pill */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Font Stepper */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                <button
                  onClick={() => handleStepFontSize(-2)}
                  disabled={arabicFontSizePx <= 18}
                  className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-black text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer active:scale-90"
                  title="Decrease Font Size"
                >
                  A-
                </button>
                <span className="px-1 text-[9px] font-mono font-bold text-amber-950">
                  {arabicFontSizePx}
                </span>
                <button
                  onClick={() => handleStepFontSize(2)}
                  disabled={arabicFontSizePx >= 50}
                  className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-black text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer active:scale-90"
                  title="Increase Font Size"
                >
                  A+
                </button>
              </div>

              {/* Reciter Selector */}
              <button
                onClick={() => setShowReciterPicker(!showReciterPicker)}
                className="h-8 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title="Change Reciter"
              >
                <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">{selectedReciter.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>

          {/* Reciter Dropdown Picker */}
          {showReciterPicker && (
            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-1.5 animate-in fade-in">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Select Reference Reciter:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {QURAN_RECITERS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedReciter(r);
                      setShowReciterPicker(false);
                      setLessonData(generateAyahLesson(activeSurahNumber, activeAyahNumber, r.subfolder));
                    }}
                    className={`p-2 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedReciter.id === r.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <span>{r.name}</span>
                    <span className="text-[10px] opacity-75">{r.style}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5-Step Visual Drill Progress Strip */}
          {viewMode === 'step-lesson' && (
            <div className="space-y-1 pt-0.5">
              <div className="grid grid-cols-5 gap-1">
                {lessonData.steps.map((step, idx) => (
                  <button
                    key={step.stepNumber}
                    onClick={() => setCurrentStepIdx(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentStepIdx
                        ? 'bg-amber-500 ring-2 ring-amber-300'
                        : idx < currentStepIdx
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                    title={`Step ${idx + 1} of 5 for Ayah ${activeAyahNumber}: ${step.title}`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-[10.5px]">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-black text-amber-950 bg-amber-200/90 border border-amber-300 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                    Step {currentStepIdx + 1}/5 for Ayah {activeAyahNumber}
                  </span>
                  <span className="font-extrabold text-slate-950 truncate">
                    {currentStep.title}
                  </span>
                </div>
                <span className="text-slate-500 font-medium text-[10px] shrink-0 truncate ml-2 hidden sm:inline">
                  {currentStep.subtitle}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE (Centered, Perfectly Sized for Android Viewports)        */}
      {/* ========================================================================= */}
      <main className="max-w-xl mx-auto w-full px-2.5 sm:px-4 pt-2.5 sm:pt-3">
        {/* --------------------------------------------------------------------- */}
        {/* MODE A: 6-STEP IMMERSIVE DRILL LESSON                                 */}
        {/* --------------------------------------------------------------------- */}
        {viewMode === 'step-lesson' && (
          <div className="space-y-2.5 sm:space-y-3 animate-in fade-in duration-300">
            {/* STEP 1: LISTEN & FAMILIARIZE */}
            {currentStep.stepType === 'listen' && (
              <div className="space-y-2.5">
                {/* Unified All-in-One Verse & Audio Station Card */}
                <div className="p-3.5 sm:p-4.5 rounded-2xl bg-white border border-slate-300 shadow-2xs space-y-2.5 relative overflow-hidden">
                  <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-slate-100">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 font-extrabold text-[11px]">
                      Verse {activeAyahNumber} • Surah {surahMeta.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Juz {surahMeta.juzNumber} • {surahMeta.revelationType}
                    </span>
                  </div>

                  {/* Certified Arabic Quran Text - Solid Black, Clear Diacritics */}
                  <div className="py-1 px-1 bg-amber-50/20 rounded-xl">
                    <p
                      className="font-quran text-black font-bold leading-[2.0] sm:leading-[2.2] text-center overflow-visible select-text dark:text-slate-100"
                      dir="rtl"
                      style={{ fontSize: `${arabicFontSizePx}px` }}
                    >
                      {wordsData.map((w, idx) => (
                        <span
                          key={idx}
                          onClick={() => setSelectedWordForDrill(w)}
                          className={`inline-block px-1 py-0.5 mx-0.5 rounded-lg transition-all cursor-pointer hover:bg-amber-100 ${
                            highlightedWordIdx === idx
                              ? 'bg-amber-200 text-black font-black scale-105 shadow-2xs ring-1 ring-amber-400'
                              : 'text-black'
                          }`}
                          title={`${w.transliteration} — ${w.translation}`}
                        >
                          {w.arabic}
                        </span>
                      ))}{' '}
                      <span className="inline-block text-amber-600 font-sans text-lg align-middle mr-1">
                        ﴿{activeAyahNumber}﴾
                      </span>
                    </p>
                  </div>

                  {lessonData.ayah.transliteration && (
                    <p className="text-[11.5px] sm:text-xs text-amber-950 font-serif italic font-semibold text-center pt-1 border-t border-slate-100">
                      {lessonData.ayah.transliteration}
                    </p>
                  )}

                  <p className="text-[11px] sm:text-xs text-slate-700 italic font-medium text-center">
                    "{lessonData.ayah.translation}"
                  </p>

                  {/* Compact Audio Station Control Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        onClick={handleToggleAudio}
                        className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                        title={isPlayingAudio ? 'Pause Audio' : 'Play Audio'}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-4 h-4 fill-slate-950" />
                        ) : (
                          <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-950 block leading-tight truncate">
                          {isPlayingAudio ? 'Playing...' : 'Listen & Learn'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium truncate block">
                          {selectedReciter.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={handleToggleSpeed}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-[11px] cursor-pointer transition-colors"
                        title="Playback Speed"
                      >
                        {audioSpeed}x
                      </button>

                      <button
                        onClick={() => setRepeatCount((prev) => (prev === 1 ? 3 : prev === 3 ? 5 : 1))}
                        className={`px-2 py-1 rounded-lg font-black text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                          repeatCount > 1 ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-slate-100 text-slate-700'
                        }`}
                        title="Repeat Count"
                      >
                        <Repeat className="w-3 h-3" />
                        <span>{repeatCount}x</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Tip */}
                  <p className="text-[10px] text-slate-500 text-center font-medium">
                    💡 Tip: Tap any Arabic word above for pronunciation & Tajweed
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: VOCABULARY & ROOTS */}
            {currentStep.stepType === 'word-breakdown' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-center">
                  <p className="text-xs text-amber-900 font-bold">
                    Tap any card to hear the individual word pronunciation and breakdown
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" dir="rtl">
                  {wordsData.map((w, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedWordForDrill(w)}
                      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer text-center space-y-1 group active:scale-98"
                    >
                      <span className="font-quran text-2xl text-slate-900 block group-hover:text-amber-800 transition-colors dark:text-slate-100">
                        {w.arabic}
                      </span>
                      <span className="text-xs text-amber-900 font-bold block truncate" dir="ltr">
                        {w.transliteration}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium block truncate" dir="ltr">
                        {w.translation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: AUDIO SHADOWING (Redesigned for Balance) */}
            {currentStep.stepType === 'shadowing' && (
              <div className="space-y-3.5">
                {/* Verse Card */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-amber-900/10 shadow-2xs text-center space-y-3">
                  <div className="flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
                      <span>Verse {activeAyahNumber}</span>
                      <span className="text-amber-400">•</span>
                      <span className="font-medium text-amber-800">Shadowing Drill</span>
                    </span>
                  </div>

                  <p className="font-quran text-slate-900 leading-[2.2] text-center dark:text-slate-100" dir="rtl" style={{ fontSize: `${arabicFontSizePx}px` }}>
                    {lessonData.ayah.arabic}{' '}
                    <span className="inline-block text-amber-600 font-sans text-xl align-middle mr-1">۝{activeAyahNumber}</span>
                  </p>

                  {lessonData.ayah.transliteration && (
                    <p className="text-xs sm:text-sm text-amber-900 font-serif italic font-medium pt-2 border-t border-slate-100">
                      {lessonData.ayah.transliteration}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-slate-600 italic font-medium">
                    "{lessonData.ayah.translation}"
                  </p>
                </div>

                {/* Shadowing Practice Station (No dead space, balanced layout) */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-zinc-800/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">Audio Shadowing Station</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Listen and recite aloud alongside the reciter</p>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full border whitespace-nowrap shrink-0 ${
                      shadowingRoundsDone >= 3
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}>
                      {shadowingRoundsDone >= 3 && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      <span>{shadowingRoundsDone >= 3 ? 'Target Reached' : `${shadowingRoundsDone}/3 Rounds`}</span>
                    </span>
                  </div>

                  {/* 3-Round Progress Track */}
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((round) => {
                      const isDone = shadowingRoundsDone >= round;
                      return (
                        <div
                          key={round}
                          className={`p-2.5 rounded-2xl border text-center transition-all ${
                            isDone
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-black shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-400 font-semibold'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 text-xs">
                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Repeat className="w-3 h-3 text-slate-300 dark:text-slate-600" />}
                            <span>Round {round}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={handleToggleAudio}
                      className="h-11 sm:h-12 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                    >
                      {isPlayingAudio ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause Reciter</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Play & Shadow</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShadowingRoundsDone((p) => p + 1)}
                      className="h-11 sm:h-12 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Log 1 Round (+1)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SELF-RECITATION CHECKPOINT (Harmonious Light/Warm Redesign) */}
            {currentStep.stepType === 'self-recitation' && (
              <div className="space-y-3.5">
                {/* Verse Card with Peek State */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0E121B] border border-amber-900/10 dark:border-amber-900/30 shadow-2xs text-center space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs">
                      <span>Verse {activeAyahNumber}</span>
                      <span className="text-amber-400">•</span>
                      <span className="font-medium text-amber-800 dark:text-amber-400">Self-Recitation</span>
                    </span>
                  </div>

                  {isPeekRevealed ? (
                    <div className="space-y-2.5 animate-in fade-in">
                      <p className="font-quran text-slate-900 dark:text-slate-100 leading-[2.2] text-center" dir="rtl" style={{ fontSize: `${arabicFontSizePx}px` }}>
                        {lessonData.ayah.arabic}{' '}
                        <span className="inline-block text-amber-600 font-sans text-xl align-middle mr-1">۝{activeAyahNumber}</span>
                      </p>

                      {lessonData.ayah.transliteration && (
                        <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 font-serif italic font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
                          {lessonData.ayah.transliteration}
                        </p>
                      )}

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic font-medium">
                        "{lessonData.ayah.translation}"
                      </p>
                    </div>
                  ) : (
                    <div className="py-6 sm:py-8 space-y-2 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-dashed border-amber-300 dark:border-amber-800">
                      <p className="text-amber-900 dark:text-amber-300 font-bold text-xs sm:text-sm tracking-wide">
                        [ Arabic verse hidden for self-recitation ]
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic max-w-sm mx-auto px-4">
                        "{lessonData.ayah.translation}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Self-Recitation Controls */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0E121B] border border-slate-200 dark:border-zinc-800/80 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">Self-Guided Recitation</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Recite from memory without looking, then confirm</p>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full border whitespace-nowrap shrink-0 ${
                      hasSelfRecited
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {hasSelfRecited && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      <span>{hasSelfRecited ? 'Confirmed' : 'Pending'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        const nextPeek = !isPeekRevealed;
                        setIsPeekRevealed(nextPeek);
                        if (nextPeek) {
                          handlePlayReferenceAudio();
                        }
                      }}
                      className="h-11 sm:h-12 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                    >
                      {isPeekRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{isPeekRevealed ? 'Hide Verse' : 'Peek Verse & Audio'}</span>
                    </button>

                    <button
                      onClick={() => setHasSelfRecited(true)}
                      className={`h-11 sm:h-12 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-xs ${
                        hasSelfRecited
                          ? 'bg-emerald-500 dark:bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{hasSelfRecited ? 'Recited Out Loud' : 'Confirm Recited Out Loud'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: BLIND ACTIVE RECALL */}
            {currentStep.stepType === 'active-recall' && (
              <div className="space-y-3.5">
                {/* Fill-in-the-blank / 2-3 Letters Active Recall Drill */}
                {currentStep.mechanic === 'fill_blank' && activeFillBlankData && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
                    {/* Header Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                        activeFillBlankData.challengeType === 'letters'
                          ? 'bg-purple-50 text-purple-900 border border-purple-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}>
                        {activeFillBlankData.challengeType === 'letters' ? (
                          <span>🔤 {activeFillBlankData.blankCountDescription || '2-3 Letters'}</span>
                        ) : (
                          <span>🎲 {activeFillBlankData.blankCountDescription || 'Missing Words'}</span>
                        )}
                      </span>

                      <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                        {/* Mode toggles */}
                        <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                          <button
                            onClick={() => handleReshuffleBlanks('words')}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              activeFillBlankData.challengeType === 'words'
                                ? 'bg-white text-slate-900 shadow-2xs font-black'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Words
                          </button>
                          <button
                            onClick={() => handleReshuffleBlanks('letters')}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              activeFillBlankData.challengeType === 'letters'
                                ? 'bg-white text-purple-900 shadow-2xs font-black'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            2-3 Letters
                          </button>
                        </div>

                        {/* Re-shuffle Blanks Button */}
                        <button
                          onClick={() => handleReshuffleBlanks(activeFillBlankData.challengeType)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-2xs"
                        >
                          <Shuffle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Shuffle</span>
                        </button>
                      </div>
                    </div>

                    {/* Arabic Verse with Missing Words or 2-3 Letters Blanks */}
                    <div className="font-quran text-slate-900 leading-[2.2] text-center min-h-[70px] flex flex-wrap items-center justify-center dark:text-slate-100" dir="rtl" style={{ fontSize: `${arabicFontSizePx}px` }}>
                      {activeFillBlankData.challengeType === 'letters' && activeFillBlankData.letterChallenge ? (
                        activeFillBlankData.arabicWords.map((token, idx) => {
                          const isTargetWord = idx === activeFillBlankData.letterChallenge?.wordIndex;
                          const letterCh = activeFillBlankData.letterChallenge!;
                          const filled = filledBlanks[idx];

                          if (!isTargetWord) {
                            return <span key={idx} className="inline-block px-1 text-slate-800">{token}</span>;
                          }

                          return (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 mx-1 rounded-2xl bg-purple-50 border border-purple-300 shadow-2xs gap-0.5 align-middle"
                            >
                              {letterCh.prefix && (
                                <span className="text-slate-900 font-bold">{letterCh.prefix}</span>
                              )}
                              <span
                                onClick={() => {
                                  if (filled) {
                                    const next = { ...filledBlanks };
                                    delete next[idx];
                                    setFilledBlanks(next);
                                  }
                                }}
                                className={`inline-flex items-center justify-center px-2.5 py-0.5 mx-0.5 rounded-xl font-bold cursor-pointer transition-all border text-lg ${
                                  filled
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-500 shadow-2xs'
                                    : 'bg-white border-dashed border-purple-400 text-purple-700 min-w-[50px] text-center'
                                }`}
                              >
                                {filled || '____'}
                              </span>
                              {letterCh.suffix && (
                                <span className="text-slate-900 font-bold">{letterCh.suffix}</span>
                              )}
                            </span>
                          );
                        })
                      ) : (
                        activeFillBlankData.arabicWords.map((token, idx) => {
                          const isBlank = activeFillBlankData.blankIndices.includes(idx);
                          if (isBlank) {
                            const filled = filledBlanks[idx];
                            return (
                              <span
                                key={idx}
                                onClick={() => {
                                  if (filled) {
                                    const next = { ...filledBlanks };
                                    delete next[idx];
                                    setFilledBlanks(next);
                                  }
                                }}
                                className={`inline-block px-2.5 py-0.5 mx-1 rounded-xl font-bold cursor-pointer transition-all border ${
                                  filled
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-2xs'
                                    : 'bg-amber-50 border-dashed border-amber-400 text-amber-800 min-w-[55px] text-center'
                                }`}
                              >
                                {filled || '____'}
                              </span>
                            );
                          }
                          return <span key={idx} className="inline-block px-1">{token}</span>;
                        })
                      )}
                    </div>

                    {/* Word / Letter Bank */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        <span>
                          {activeFillBlankData.challengeType === 'letters'
                            ? `Letter Bank (${activeFillBlankData.letterChallenge?.letterCount || '2-3'} letters):`
                            : 'Word Bank:'}
                        </span>
                        <span className="text-slate-500 font-semibold normal-case">
                          {Object.keys(filledBlanks).length}/{activeFillBlankData.blankIndices.length} filled
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-2 flex-wrap" dir="rtl">
                        {activeFillBlankData.wordBank.map((item, bIdx) => {
                          const isUsed = Object.values(filledBlanks).includes(item);
                          const matchedWord = wordsData.find((wd) => wd.arabic === item);
                          return (
                            <button
                              key={bIdx}
                              disabled={isUsed}
                              onClick={() => {
                                const blanks = activeFillBlankData.blankIndices || [];
                                const firstEmptyBlank = blanks.find((idx) => !filledBlanks[idx]);
                                if (firstEmptyBlank !== undefined) {
                                  setFilledBlanks({ ...filledBlanks, [firstEmptyBlank]: item });
                                }
                              }}
                              className={`px-3 py-2 rounded-xl border transition-all cursor-pointer text-center ${
                                isUsed
                                  ? 'opacity-30 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                  : activeFillBlankData.challengeType === 'letters'
                                  ? 'bg-white border-purple-200 hover:border-purple-500 text-slate-900 hover:scale-105 active:scale-95 shadow-2xs font-bold'
                                  : 'bg-white border-slate-200 hover:border-amber-400 text-slate-800 hover:scale-105 active:scale-95 shadow-2xs font-bold'
                              }`}
                            >
                              <span className="font-quran text-lg font-bold block" dir="rtl">{item}</span>
                              {matchedWord?.transliteration && activeFillBlankData.challengeType === 'words' && (
                                <span className="text-[10.5px] text-amber-900 font-bold block" dir="ltr">
                                  {matchedWord.transliteration}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Blind Recall Drill (Harmonious Light/Warm Redesign) */}
                {currentStep.mechanic === 'full_blind' && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs text-center space-y-4">
                    <div className="flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                        Full Blind Recall Drill
                      </span>
                    </div>

                    {isFullBlindRevealed ? (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <p className="font-quran text-2xl sm:text-3xl text-slate-900 leading-[2.2] text-center dark:text-slate-100" dir="rtl">
                          {lessonData.ayah.arabic}{' '}
                          <span className="inline-block text-amber-600 font-sans text-xl align-middle mr-1">۝{activeAyahNumber}</span>
                        </p>
                        {lessonData.ayah.transliteration && (
                          <p className="text-xs sm:text-sm text-amber-900 font-serif italic pt-2 border-t border-slate-100">
                            {lessonData.ayah.transliteration}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-slate-600 italic">"{lessonData.ayah.translation}"</p>
                      </div>
                    ) : (
                      <div className="py-6 sm:py-8 space-y-2 bg-amber-50/40 rounded-2xl border border-dashed border-amber-300">
                        <p className="text-amber-900 font-bold text-xs sm:text-sm tracking-wide">
                          [ Full Blind Recall Active ]
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto px-4">
                          Recite the entire verse from memory out loud before checking your accuracy.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      <button
                        onClick={() => {
                          if (!isFullBlindRevealed) {
                            setIsFullBlindRevealed(true);
                            handlePlayReferenceAudio();
                          } else {
                            handleToggleAudio();
                          }
                        }}
                        className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-2"
                      >
                        {!isFullBlindRevealed ? (
                          <>
                            <Volume2 className="w-4 h-4 text-slate-950" />
                            <span>Reveal Verse & Check Recitation</span>
                          </>
                        ) : isPlayingAudio ? (
                          <>
                            <Pause className="w-4 h-4 fill-slate-950" />
                            <span>Pause Audio</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-slate-950" />
                            <span>Play Audio Again</span>
                          </>
                        )}
                      </button>

                      {isFullBlindRevealed && (
                        <div className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-emerald-50 text-emerald-800 font-black text-xs sm:text-sm border border-emerald-200">
                          <Check className="w-4 h-4 stroke-[3] text-emerald-600" />
                          <span>Checked</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: SELF-SCORING ASSESSMENT & AYAH PROMOTION */}
            {currentStep.stepType === 'self-scoring' && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-center">
                  <p className="text-xs sm:text-sm text-amber-900 font-bold">
                    How well did you recall Ayah {activeAyahNumber}? Select your self-evaluation:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {SELF_SCORE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleScoreSubmit(opt)}
                      className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left flex items-start gap-2.5 shadow-2xs ${
                        selectedScoreOption?.id === opt.id
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-100 scale-[1.01]'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{opt.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">{opt.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{opt.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Post-Scoring Celebration & Action Bar */}
                {isLessonSubmitted && (
                  <div className={`p-4 rounded-3xl border-2 text-slate-950 space-y-2.5 animate-in fade-in ${
                    wasPromoted
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-amber-50/90 border-amber-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-5 h-5 ${wasPromoted ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <span className="font-black text-xs sm:text-sm">
                          {wasPromoted
                            ? `Ayah ${activeAyahNumber} Mastered & Promoted!`
                            : `Qualifying Session Logged for Ayah ${activeAyahNumber}!`}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                        wasPromoted ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {wasPromoted ? '+60 XP' : '+30 XP'}
                      </span>
                    </div>

                    <p className={`text-xs font-medium ${wasPromoted ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {wasPromoted
                        ? 'Two qualifying blind recall sessions completed. Verse registered in Spaced Retention (Sabqi).'
                        : 'First qualifying session recorded. Complete one more to promote this Ayah.'}
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button
                        onClick={() => setViewMode('ayah-completion')}
                        className={`px-4 py-2.5 rounded-xl text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                          wasPromoted ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                      >
                        <span>
                          {wasPromoted
                            ? activeAyahNumber < surahMeta.totalAyahs
                              ? `View Completion & Advance to Ayah ${activeAyahNumber + 1} →`
                              : `Finish Surah ${surahMeta.name} 🎉`
                            : `Continue Lesson →`}
                        </span>
                      </button>

                      <button
                        onClick={() => setViewMode('surah-overview')}
                        className={`px-3.5 py-2.5 rounded-xl bg-white border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                          wasPromoted
                            ? 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                            : 'border-amber-300 text-amber-800 hover:bg-amber-50'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>View Surah</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* MODE B: AYAH COMPLETION, TAJWEED ANALYSIS & MONTHLY ROADMAP           */}
        {/* --------------------------------------------------------------------- */}
        {viewMode === 'ayah-completion' && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300 pb-20">
            {/* Top Celebration Header Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-amber-500/10 border-2 border-emerald-400 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <CheckCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Ayah Mastered
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        +60 XP • +10 Points
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                      Surah {surahMeta.name} • Ayah {completedAyahInfo?.ayahNumber || activeAyahNumber} Completed!
                    </h2>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="font-amiri text-2xl font-bold text-emerald-800">
                    {surahMeta.arabicName}
                  </span>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Verse {completedAyahInfo?.ayahNumber || activeAyahNumber} of {surahMeta.totalAyahs}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                Alhamdulillah! You have successfully mastered this verse. Review its exact Tajweed breakdown below, check your Hifz timeline, then proceed directly to memorize the next Ayah.
              </p>
            </div>

            {/* Next Ayah Action Card (Moved to Top) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-xs text-slate-400 font-semibold">Ready for your next verse?</p>
                <p className="text-base font-black text-white">
                  {activeAyahNumber < surahMeta.totalAyahs
                    ? `Proceed to Memorize Ayah ${activeAyahNumber + 1}`
                    : `Begin Next Surah (${ALL_114_SURAHS.find(s => s.number === activeSurahNumber + 1)?.name || 'Next'}) 🎉`}
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('surah-overview')}
                  className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Surah</span>
                </button>

                <button
                  onClick={handleProceedToNextAyahFromSummary}
                  className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>
                    {activeAyahNumber < surahMeta.totalAyahs
                      ? `Continue to Ayah ${activeAyahNumber + 1} →`
                      : 'Advance to Next Surah →'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Completed Ayah with Vivid Interactive Tajweed */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Tajweed Rules & Pronunciation Breakdown
                  </h3>
                </div>

                {/* Listen to Verse Audio Button */}
                <button
                  onClick={handleToggleCompletionAudio}
                  className="h-8 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  {isCompletionAudioPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-slate-800" />
                      <span>Pause Audio</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-slate-800" />
                      <span>Play Ayah ({selectedReciter.name.split(' ')[0]})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tajweed Rendered Ayah Box */}
              <div className="p-5 sm:p-7 rounded-2xl bg-emerald-50/30 border border-emerald-200/80 text-center space-y-3">
                <InteractiveTajweedAyah
                  arabicText={completedAyahInfo?.arabic || lessonData.ayah.arabic}
                  fontSizePx={Math.max(28, arabicFontSizePx + 2)}
                />
              </div>

              {/* Tajweed Legend Badges */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10.5px]">
                <span className="text-slate-400 font-bold mr-1">Tajweed Key:</span>
                <span className="px-2 py-0.5 rounded-md font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Madd (Elongation)
                </span>
                <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Qalqalah (Echo)
                </span>
                <span className="px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Ghunnah (Nasal)
                </span>
                <span className="px-2 py-0.5 rounded-md font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  Ikhfa (Conceal)
                </span>
                <span className="px-2 py-0.5 rounded-md font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  Idgham (Merge)
                </span>
                <span className="px-2 py-0.5 rounded-md font-bold bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200">
                  Iqlab (Convert)
                </span>
              </div>

              {/* Transliteration & Translation */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs sm:text-sm">
                {(completedAyahInfo?.transliteration || lessonData.ayah.transliteration) && (
                  <p className="font-semibold text-slate-600 italic">
                    "{completedAyahInfo?.transliteration || lessonData.ayah.transliteration}"
                  </p>
                )}
                <p className="font-bold text-slate-900">
                  "{completedAyahInfo?.translation || lessonData.ayah.translation}"
                </p>
              </div>
            </div>

            {/* Surah Progress Strip */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">
                  Surah {surahMeta.name} Progression: {surahStats.memorizedCount} of {surahMeta.totalAyahs} Ayahs
                </span>
                <span className="text-emerald-700 font-extrabold">{surahStats.percent}%</span>
              </div>

              {/* Verses mini-track */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: surahMeta.totalAyahs }, (_, i) => i + 1).map((aNum) => {
                  const isJustCompleted = aNum === (completedAyahInfo?.ayahNumber || activeAyahNumber);
                  const isAlreadyMem = isAyahMemorized(activeSurahNumber, aNum);
                  const isUpNext = aNum === (completedAyahInfo?.ayahNumber || activeAyahNumber) + 1;

                  if (isJustCompleted || isAlreadyMem) {
                    return (
                      <div
                        key={aNum}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-2xs"
                        title={`Ayah ${aNum} (Completed)`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Ayah {aNum}</span>
                      </div>
                    );
                  }

                  if (isUpNext) {
                    return (
                      <div
                        key={aNum}
                        className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow-2xs animate-pulse ring-2 ring-amber-300"
                        title={`Ayah ${aNum} (Up Next!)`}
                      >
                        <span>Ayah {aNum} (Next)</span>
                        <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={aNum}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 font-bold text-xs"
                      title={`Ayah ${aNum} (Remaining)`}
                    >
                      <span>Ayah {aNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Milestone Roadmap: Remaining Months in Gray */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Hifz Milestone Roadmap & Projected Timeline
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pace: {timelineMilestones.pace} Ayahs/day • Target: {timelineMilestones.formattedTargetDate} ({timelineMilestones.estMonthsRemaining} Months to go)
                  </p>
                </div>

                <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {timelineMilestones.memorizedAyahs} / {timelineMilestones.totalPlanAyahs} Ayahs Total
                </span>
              </div>

              {/* Month Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {timelineMilestones.months.map((m) => {
                  if (m.isCurrent) {
                    // Current Active Month: Vibrant Emerald / Amber Highlight
                    return (
                      <div
                        key={m.monthNumber}
                        className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-500 shadow-xs space-y-2 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md font-black text-[10.5px] bg-emerald-600 text-white uppercase tracking-wider">
                            {m.title} • Current
                          </span>
                          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-slate-950">{m.targetAyahs}</p>
                          <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                            {surahStats.memorizedCount} Ayahs Mastered in this Surah
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active Focus Session</span>
                        </div>
                      </div>
                    );
                  }

                  // Remaining Months to Go: Clean, calm gray styling as requested
                  return (
                    <div
                      key={m.monthNumber}
                      className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 text-slate-500 space-y-2 select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10.5px] bg-slate-200 text-slate-600 uppercase tracking-wider">
                          {m.title}
                        </span>
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-600">{m.targetAyahs}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Projected Milestone
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium pt-1">
                        <Lock className="w-3 h-3" />
                        <span>Remaining Month to Go</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* MODE C: COMPLETE SURAH PAGE (Mushaf with all Ayat & Memorized Badges) */}
        {/* --------------------------------------------------------------------- */}
        {viewMode === 'surah-overview' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Surah Header Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                      Surah {surahMeta.name}
                    </h2>
                    <span className="font-amiri text-lg sm:text-xl font-bold text-emerald-800">
                      ({surahMeta.arabicName})
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-semibold">
                    {surahMeta.translation} • {surahMeta.totalAyahs} Verses Total • <span className="text-emerald-700 font-black">{surahStats.memorizedCount} Memorized</span>
                  </p>
                </div>

                {surahStats.isComplete && onOpenSurahTest && (
                  <button
                    onClick={() => onOpenSurahTest(activeSurahNumber)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Take Surah Mastery Exam</span>
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-black text-slate-700">
                  <span>Surah Memorization Completion</span>
                  <span className="text-emerald-700 font-black text-xs">{surahStats.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/80">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                    style={{ width: `${surahStats.percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Verses List */}
            <div className="space-y-2.5">
              {Array.from({ length: surahMeta.totalAyahs }, (_, i) => i + 1).map((aNum) => {
                const isMem = isAyahMemorized(activeSurahNumber, aNum);
                const isCurrentFocus = aNum === activeAyahNumber;
                const lockStatus = isAyahLockedForSabaq(activeSurahNumber, aNum);
                const isLocked = lockStatus.isLocked;
                const ayahData = surahContent?.ayahs?.find((a) => a.number === aNum);
                const arabicText = ayahData?.arabic || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
                const transText = ayahData?.translation || 'In the name of Allah, the Entirely Merciful, the Especially Merciful.';

                return (
                  <div
                    key={aNum}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                      isCurrentFocus
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900/60 shadow-2xs'
                        : isMem
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                        : isLocked
                        ? 'bg-slate-50/80 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800/80 opacity-75'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Ayah Badge, Status & Quick Action */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] ${
                            isMem
                              ? 'bg-emerald-500 text-white'
                              : isCurrentFocus
                              ? 'bg-amber-600 text-white'
                              : isLocked
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {aNum}
                        </span>

                        {isMem && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] flex items-center gap-0.5 border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>Memorized</span>
                          </span>
                        )}

                        {isCurrentFocus && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] border border-amber-200 dark:border-amber-800">
                            ★ Current Sabaq Focus
                          </span>
                        )}

                        {isLocked && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Locked • Sequential Sabaq</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Audio play button */}
                        <button
                          onClick={() => handleToggleSurahAyahAudio(aNum)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Listen to Verse Audio"
                        >
                          {playingSurahAudioAyah === aNum ? (
                            <Pause className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </button>

                        {/* Toggle Memorized Checkmark Button */}
                        {!isLocked && (
                          <button
                            onClick={() => handleToggleAyahMemorized(aNum, isMem)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isMem
                                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                            title={isMem ? 'Mark as Unmemorized' : 'Check as Memorized'}
                          >
                            <CheckCircle2 className={`w-3 h-3 ${isMem ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                            <span>{isMem ? 'Checked' : 'Check'}</span>
                          </button>
                        )}

                        {/* Open 6-Step Drill for this Verse */}
                        {isLocked ? (
                          <button
                            disabled
                            title={lockStatus.reason || 'Complete previous verses first'}
                            className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold text-[11px] flex items-center gap-1 cursor-not-allowed"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Locked</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              handleJumpToAyah(activeSurahNumber, aNum);
                              setViewMode('step-lesson');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black text-[11px] flex items-center gap-0.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                          >
                            <span>Drill</span>
                            <ChevronRight className="w-2.5 h-2.5 stroke-[3]" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Arabic Calligraphy with leading-[2.2] and overflow-visible for perfect diacritics */}
                    <p
                      className="font-quran text-slate-900 dark:text-slate-100 leading-[2.2] overflow-visible text-right pt-1"
                      dir="rtl"
                      style={{ fontSize: `${Math.round(arabicFontSizePx * 0.75)}px` }}
                    >
                      {arabicText} <AyahNumberBadge number={aNum} />
                    </p>

                    {/* Transliteration */}
                    {ayahData?.transliteration && (
                      <p className="text-xs text-amber-900/90 dark:text-amber-300 font-serif italic pt-1 border-t border-slate-100 dark:border-slate-800">
                        {ayahData.transliteration}
                      </p>
                    )}

                    {/* Translation */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">
                      "{transText}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM STICKY ACTION BAR                                               */}
      {/* ========================================================================= */}
      {viewMode === 'step-lesson' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-3 py-2 shadow-md">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2.5">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIdx === 0}
              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                currentStepIdx === 0
                  ? 'opacity-40 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Previous</span>
            </button>

            {currentStepIdx < totalSteps - 1 ? (
              <button
                onClick={handleNextStep}
                disabled={!canProceedFromStep()}
                className={`px-5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  canProceedFromStep()
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>
                  {currentStepIdx === 0 && 'Next: Word Breakdown (Step 2/5) →'}
                  {currentStepIdx === 1 && 'Next: Shadowing Drill (Step 3/5) →'}
                  {currentStepIdx === 2 && 'Next: Self-Recite (Step 4/5) →'}
                  {currentStepIdx === 3 && 'Next: Active Recall Test (Step 5/5) →'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!isLessonSubmitted) {
                    const opt = selectedScoreOption || SELF_SCORE_OPTIONS[3];
                    handleScoreSubmit(opt);
                  } else {
                    setViewMode('ayah-completion');
                  }
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>
                  {isLessonSubmitted
                    ? `View Completion & Advance →`
                    : `Finish & Rate Ayah ${activeAyahNumber}`}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Word-level Pronunciation Drill Modal */}
      {selectedWordForDrill && (
        <WordPronunciationModal
          word={selectedWordForDrill}
          allAyahWords={wordsData}
          surahNumber={activeSurahNumber}
          ayahNumber={activeAyahNumber}
          surahName={surahMeta.name}
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
