import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  Check,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Info,
  Pause,
  Headphones,
  Lightbulb,
} from 'lucide-react';
import { ExerciseCardProps } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import {
  parseAyahIntoTajweedWords,
  TajweedLetterSegment,
  TajweedRuleInfo,
  TajweedCategory,
  TAJWEED_RULES,
} from '../services/tajweedEngine';
import { playFullAyahPronunciation, globalAudioManager } from '../services/quranAudioEngine';
import { TajweedRulePopup } from './TajweedRulePopup';
import { InteractiveTajweedAyah } from './InteractiveTajweedAyah';
import { ExerciseAyahAudioPlayer } from './ExerciseAyahAudioPlayer';
import { useTajweed } from './tajweed/TajweedProvider';

interface ExtendedExerciseCardProps extends ExerciseCardProps {
  onOpenAIHelp?: () => void;
  tajweedTip?: string;
}

export const ExerciseCard: React.FC<ExtendedExerciseCardProps> = ({
  type,
  progressCurrent,
  progressTotal,
  promptText = '',
  ayahReference = 'Surah Al-Mulk [67:19]',
  ayahWithBlanks = '',
  wordBank = [],
  correctBlanks = [],
  blankCount = 1,
  options = [],
  direction = 'arabic-to-meaning',
  fontFamily = "'Amiri', 'Scheherazade New', serif",
  tajweedTip,
  onClose,
  onSubmit,
  onContinue,
  onOpenAIHelp,
}) => {
  // State for multiple-choice types
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // State for fill-blank type
  const [filledBlanks, setFilledBlanks] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>(wordBank);

  // Refs for scrolling to the active blanked-out word
  const ayahContainerRef = useRef<HTMLDivElement>(null);
  const blankRefs = useRef<{ [index: number]: HTMLButtonElement | null }>({});

  // Validation State
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioStopRef = useRef<(() => void) | null>(null);

  // Tajweed Letter Highlighting & Popup State
  const [showTajweedLetters, setShowTajweedLetters] = useState(true);
  const { annotateText } = useTajweed();
  const [showTajweed, setShowTajweed] = useState(false);
  const [selectedTajweedSegment, setSelectedTajweedSegment] = useState<TajweedLetterSegment | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<TajweedCategory | 'all'>('all');

  // Parse surah and ayah number from reference e.g. "Surah Al-Mulk [67:19]" or "67:19"
  const { surahNumber, ayahNumber } = useMemo(() => {
    if (!ayahReference) return { surahNumber: undefined, ayahNumber: undefined };
    const match = ayahReference.match(/\[?(\d+):(\d+)\]?/);
    if (match) {
      return {
        surahNumber: parseInt(match[1], 10),
        ayahNumber: parseInt(match[2], 10),
      };
    }
    return { surahNumber: undefined, ayahNumber: undefined };
  }, [ayahReference]);

  // Compute the full target Arabic sentence for pronunciation
  const completeTargetArabicText = useMemo(() => {
    if (type === 'fill-blank' && ayahWithBlanks) {
      let fullText = ayahWithBlanks;
      if (correctBlanks.length > 0) {
        correctBlanks.forEach((word) => {
          fullText = fullText.replace('___', word);
        });
      } else if (wordBank.length > 0) {
        fullText = fullText.replace('___', wordBank[0]);
      } else {
        fullText = fullText.replace(/___/g, '');
      }
      return fullText.trim();
    }

    if (type === 'english-fill-blank') {
      return promptText || '';
    }

    if (direction === 'meaning-to-arabic') {
      const correctOpt = options.find((o) => o.isCorrect);
      return correctOpt ? correctOpt.text : options[0]?.text || '';
    }

    if (type === 'arabic-choice' || type === 'sequence-choice') {
      return promptText || (options.find((o) => o.isCorrect)?.text ?? '');
    }

    return promptText;
  }, [type, ayahWithBlanks, correctBlanks, wordBank, direction, options, promptText]);

  // Extract all Arabic text relevant to this exercise to find detected Tajweed rules
  const allExerciseArabicText = useMemo(() => {
    if (type === 'english-fill-blank') {
      return {
        strategy: 'Contextual Meaning',
        badgeColor: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/80',
        text: 'Look at the Arabic text and try to recall the general meaning. Look for familiar root words to connect to the English blanks.'
      };
    }
    if (type === 'fill-blank') {
      return `${ayahWithBlanks.replace(/___/g, ' ')} ${wordBank.join(' ')}`;
    }
    if (type === 'english-fill-blank') {
      return promptText || '';
    }
    if (direction === 'meaning-to-arabic') {
      return options.map((o) => o.text).join(' ');
    }
    return promptText || options.map((o) => o.text).join(' ');
  }, [type, ayahWithBlanks, wordBank, promptText, options, direction]);

  // Cleanup active audio on unmount or step change and subscribe to global stops
  useEffect(() => {
    const unsubscribe = globalAudioManager.subscribe((event) => {
      if (event.action === 'stop') {
        setAudioPlaying(false);
      }
    });

    return () => {
      unsubscribe();
      if (audioStopRef.current) {
        audioStopRef.current();
        audioStopRef.current = null;
      }
    };
  }, []);

  // Sync state when exercise properties change
  useEffect(() => {
    globalAudioManager.stopAll();
    if (audioStopRef.current) {
      audioStopRef.current();
      audioStopRef.current = null;
    }
    setSelectedOptionId(null);
    setFilledBlanks([]);
    setAvailableWords(wordBank);
    setStatus('idle');
    setAudioPlaying(false);
    setSelectedTajweedSegment(null);
    blankRefs.current = {};
  }, [type, promptText, ayahWithBlanks, wordBank, ayahReference]);

  // Active blank index in focus (first unfilled blank slot, or the last filled slot)
  const activeBlankIndex = useMemo(() => {
    if (filledBlanks.length < blankCount) {
      return filledBlanks.length;
    }
    return Math.max(0, blankCount - 1);
  }, [filledBlanks.length, blankCount]);

  // Automatically scroll the container to the active blanked-out word if the verse overflows
  useEffect(() => {
    if (type !== 'fill-blank' && type !== 'english-fill-blank') return;

    const scrollTimer = setTimeout(() => {
      const activeEl = blankRefs.current[activeBlankIndex];
      const containerEl = ayahContainerRef.current;

      if (!activeEl) return;

      if (containerEl) {
        const isContainerScrollable = containerEl.scrollHeight > containerEl.clientHeight;
        const containerRect = containerEl.getBoundingClientRect();
        const elRect = activeEl.getBoundingClientRect();

        const isOutOfView =
          elRect.top < containerRect.top + 16 ||
          elRect.bottom > containerRect.bottom - 16;

        if (isContainerScrollable || isOutOfView) {
          activeEl.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
        }
      } else {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    }, 120);

    return () => clearTimeout(scrollTimer);
  }, [type, ayahWithBlanks, activeBlankIndex, filledBlanks.length, progressCurrent]);

  // Detected unique Tajweed rules in this exercise
  const detectedRules = useMemo(() => {
    const parsed = parseAyahIntoTajweedWords(allExerciseArabicText);
    const ruleMap = new Map<string, TajweedRuleInfo>();
    parsed.forEach((w) => {
      w.segments.forEach((s) => {
        if (s.rule) {
          ruleMap.set(s.rule.id, s.rule);
        }
      });
    });
    return Array.from(ruleMap.values());
  }, [allExerciseArabicText]);

  // Pedagogical Study Tip tailored to the active exercise type & direction
  const studyTipData = useMemo(() => {
    if (type === 'fill-blank') {
      return {
        strategy: 'Rhythmic Meter',
        badgeColor: 'bg-amber-100/90 text-amber-800 border-amber-300/80',
        text: tajweedTip
          ? `${tajweedTip}. Recite the verse aloud from the start—its rhythmic cadence naturally leads to the missing word.`
          : 'Recite the verse smoothly from the beginning; the natural rhythmic meter and preceding vowels (Harakat) will trigger the missing word effortlessly.',
      };
    }
    if (type === 'meaning-choice') {
      if (direction === 'meaning-to-arabic') {
        return {
          strategy: 'Visual Recall',
          badgeColor: 'bg-indigo-100/90 text-indigo-800 border-indigo-300/80',
          text: 'Form a vivid mental image of the Arabic script and its vocal cadence in your mind before scanning the available choices.',
        };
      }
      return {
        strategy: 'Root Association',
        badgeColor: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/80',
        text: 'Anchor your recall to key 3-letter Arabic root patterns and imagery rather than memorizing rigid, literal translations.',
      };
    }
    if (type === 'arabic-choice') {
      return {
        strategy: 'Diacritics & Accuracy',
        badgeColor: 'bg-sky-100/90 text-sky-800 border-sky-300/80',
        text: 'Scan carefully for subtle letter diacritics (Harakat) and Sukoon markers to distinguish closely paired Quranic words.',
      };
    }
    if (type === 'sequence-choice') {
      return {
        strategy: 'Flow Continuity',
        badgeColor: 'bg-purple-100/90 text-purple-800 border-purple-300/80',
        text: 'Recall the thematic storyline and what immediately precedes this verse to build an unbreakable recitation chain for Salah.',
      };
    }
    return {
      strategy: 'Active Retrieval',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      text: 'Active recall testing builds resilient memory retention much faster than passive re-reading.',
    };
  }, [type, direction, tajweedTip]);

  // Audio Playback / Replay Handler
  const handlePlayAudio = async () => {
    if (audioPlaying) {
      if (audioStopRef.current) {
        audioStopRef.current();
        audioStopRef.current = null;
      }
      setAudioPlaying(false);
      return;
    }

    setAudioPlaying(true);

    try {
      const result = await playFullAyahPronunciation({
        arabicText: completeTargetArabicText || promptText,
        surahNumber,
        ayahNumber,
        reciterSubfolder: 'Alafasy_128kbps',
        playbackSpeed: 1.0,
        onAudioStart: () => {
          setAudioPlaying(true);
        },
        onAudioEnded: () => {
          setAudioPlaying(false);
          audioStopRef.current = null;
        },
        onError: () => {
          setAudioPlaying(false);
          audioStopRef.current = null;
        },
      });

      audioStopRef.current = result.stop;
    } catch {
      setAudioPlaying(false);
    }
  };

  // Choice Selection
  const handleSelectOption = (id: string) => {
    if (status !== 'idle') return;
    setSelectedOptionId(id);
  };

  // Word Bank Interaction
  const handleSelectWord = (word: string, index: number) => {
    if (status !== 'idle') return;
    if (filledBlanks.length >= blankCount) return;

    setFilledBlanks((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveBlank = (index: number) => {
    if (status !== 'idle') return;
    const removedWord = filledBlanks[index];
    if (!removedWord) return;

    setFilledBlanks((prev) => prev.filter((_, i) => i !== index));
    setAvailableWords((prev) => [...prev, removedWord]);
  };

  // Validation Logic
  const handleCheckAnswer = () => {
    let isCorrect = false;

    if (type === 'fill-blank' || type === 'english-fill-blank') {
      if (filledBlanks.length !== blankCount) return;
      isCorrect = filledBlanks.every((word, idx) => word === correctBlanks[idx]);
    } else {
      if (!selectedOptionId) return;
      const selected = options.find((opt) => opt.id === selectedOptionId);
      isCorrect = !!selected?.isCorrect;
    }

    const nextStatus = isCorrect ? 'correct' : 'incorrect';
    setStatus(nextStatus);
    onSubmit?.(isCorrect);
  };

  const isCheckDisabled =
    (type === 'fill-blank' || type === 'english-fill-blank') ? filledBlanks.length < blankCount : !selectedOptionId;

  // Helper to render letter-by-letter Tajweed clickable spans for a snippet of Arabic text
  const renderInteractiveTextSegment = (textChunk: string, baseChunkKey: string) => {
    const words = parseAyahIntoTajweedWords(textChunk);

    return (
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-black font-bold" dir="rtl" style={{   }}>
        {words.map((w, wIdx) => (
          <span key={`${baseChunkKey}-w-${wIdx}`} className="inline-flex items-center">
            {w.segments.map((seg, sIdx) => {
              const rule = seg.rule;
              const isHighlightedCategory =
                rule &&
                (activeCategoryFilter === 'all' || activeCategoryFilter === rule.category);

              const isSelected =
                selectedTajweedSegment &&
                selectedTajweedSegment.wordIndex === seg.wordIndex &&
                selectedTajweedSegment.charIndex === seg.charIndex &&
                selectedTajweedSegment.wordText === seg.wordText;

              let customStyle = '';
              if (isSelected) {
                customStyle =
                  'bg-amber-400 text-black rounded-md px-0.5 ring-2 ring-amber-500 scale-110 shadow-sm font-black z-10';
              } else if (showTajweedLetters && isHighlightedCategory) {
                if (rule.category === 'qalqalah') {
                  customStyle =
                    'text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 rounded px-0.5 cursor-pointer font-bold transition-all shadow-[0_0_8px_rgba(16,185,129,0.2)]';
                } else if (rule.category === 'ghunnah') {
                  customStyle =
                    'text-amber-950 bg-amber-200/90 hover:bg-amber-300 rounded px-0.5 cursor-pointer font-bold transition-all shadow-[0_0_8px_rgba(245,158,11,0.2)]';
                } else if (rule.category === 'madd') {
                  customStyle =
                    'text-purple-900 bg-purple-100/90 hover:bg-purple-200 rounded px-0.5 cursor-pointer font-bold transition-all shadow-[0_0_8px_rgba(168,85,247,0.2)]';
                } else if (rule.category === 'ikhfa') {
                  customStyle =
                    'text-rose-900 bg-rose-100/90 hover:bg-rose-200 rounded px-0.5 cursor-pointer font-bold transition-all shadow-[0_0_8px_rgba(244,63,94,0.2)]';
                } else if (rule.category === 'idgham') {
                  customStyle =
                    'text-orange-900 bg-orange-100/90 hover:bg-orange-200 rounded px-0.5 cursor-pointer font-bold transition-all shadow-[0_0_8px_rgba(249,115,22,0.2)]';
                } else if (rule.category === 'iqlab') {
                  customStyle =
                    'text-fuchsia-900 bg-fuchsia-100/90 hover:bg-fuchsia-200 rounded px-0.5 cursor-pointer font-bold transition-all shadow-[0_0_8px_rgba(217,70,239,0.2)]';
                } else if (rule.category === 'tafkhim') {
                  customStyle =
                    'text-black bg-amber-100/70 hover:bg-amber-200 rounded px-0.5 cursor-pointer font-black transition-all';
                } else {
                  customStyle =
                    'text-blue-900 bg-blue-100/90 hover:bg-blue-200 rounded px-0.5 cursor-pointer transition-all';
                }
              } else {
                customStyle =
                  'text-black hover:bg-amber-100/60 rounded px-0.5 cursor-pointer transition-colors';
              }

              return (
                <span
                  key={`${baseChunkKey}-s-${sIdx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTajweedSegment(seg);
                  }}
                  className={`inline-block transition-all select-none ${customStyle}`}
                  title={
                    rule
                      ? `Tajweed Rule: ${rule.name} • Tap to view rule details`
                      : `Letter: ${seg.baseChar} (${seg.harakahName}) • Tap to inspect`
                  }
                >
                  {seg.letter}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    );
  };

  // Render Arabic text with slotted blank boxes & interactive Tajweed letter spans

  const renderEnglishBlankAyah = () => {
    const parts = (ayahWithBlanks || '').split('___');

    return (
      <div
        id="exercise-ayah-text-container-english"
        ref={ayahContainerRef}
        className="font-sans text-base sm:text-lg text-slate-800 font-bold leading-relaxed text-center my-4 select-none max-h-[300px] sm:max-h-[360px] overflow-y-auto overflow-x-hidden scroll-smooth px-3 py-4 rounded-2xl border border-slate-200/70 bg-[#FCFBF7]/90 shadow-inner custom-scrollbar"
        tabIndex={0}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2">
          {parts.map((part, i) => {
            const isTargetBlank = i < parts.length - 1;
            const isFilled = Boolean(filledBlanks[i]);
            const isCurrentlyActive = isTargetBlank && i === activeBlankIndex && !isFilled;

            return (
              <React.Fragment key={i}>
                <span className="inline-flex items-center text-slate-700">{part}</span>
                {isTargetBlank && (
                  <button
                    id={`exercise-blank-slot-${i}`}
                    ref={(el) => {
                      blankRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => handleRemoveBlank(i)}
                    className={`inline-flex items-center justify-center min-w-[80px] h-10 min-h-[40px] px-3 align-middle rounded-xl border-2 transition-all font-sans text-sm font-bold active:scale-95 ${
                      isFilled
                        ? status === 'correct'
                          ? 'border-[#10B981] bg-[#ECFDF5] text-[#059669] shadow-xs'
                          : status === 'incorrect'
                          ? 'border-[#EF4444] bg-[#FEF2F2] text-[#B91C1C] shadow-xs'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs hover:border-slate-400 dark:hover:border-slate-500'
                        : isCurrentlyActive
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-500/20 scale-[1.02]'
                        : 'border-slate-200 bg-slate-50 text-slate-400 border-dashed hover:border-slate-300'
                    }`}
                  >
                    {isFilled ? filledBlanks[i] : '___'}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBlankAyah = () => {
    const parts = ayahWithBlanks.split('___');

    return (
      <div
        id="exercise-ayah-text-container"
        ref={ayahContainerRef}
        dir="rtl"
        className="font-quran text-2xl sm:text-3xl text-black font-bold leading-[2.5] text-center my-4 select-none dark:text-slate-100 max-h-[300px] sm:max-h-[360px] overflow-y-auto overflow-x-hidden scroll-smooth px-3 py-2 rounded-2xl border border-slate-200/70 bg-[#FCFBF7]/90 dark:bg-slate-900/40 shadow-inner custom-scrollbar"
        style={{ fontFamily,   }}
        tabIndex={0}
        aria-label="Quranic Ayah Text with Blank Spaces"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2.5 py-1">
          {parts.map((part, i) => {
            const isTargetBlank = i < parts.length - 1;
            const isFilled = Boolean(filledBlanks[i]);
            const isCurrentlyActive = isTargetBlank && i === activeBlankIndex && !isFilled;

            return (
              <React.Fragment key={i}>
                {showTajweed ? (
                  <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-black font-bold" dir="rtl" style={{   }}>
                    {annotateText(part)}
                  </span>
                ) : (
                  renderInteractiveTextSegment(part, `part-${i}`)
                )}
                {isTargetBlank && (
                  <button
                    id={`exercise-blank-slot-${i}`}
                    ref={(el) => {
                      blankRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => handleRemoveBlank(i)}
                    aria-label={
                      isFilled
                        ? `Filled blank ${i + 1}: ${filledBlanks[i]}. Tap to remove`
                        : `Blank slot ${i + 1} of ${blankCount}${isCurrentlyActive ? ' (Active)' : ''}`
                    }
                    className={`inline-flex items-center justify-center min-w-[96px] h-12 min-h-[48px] mx-1.5 px-3.5 align-middle rounded-xl border-2 transition-all font-quran text-xl font-bold active:scale-95 ${
                      isFilled
                        ? status === 'correct'
                          ? 'border-[#10B981] bg-[#ECFDF5] text-[#059669] shadow-xs'
                          : status === 'incorrect'
                          ? 'border-[#F43F5E] bg-[#FFF1F2] text-[#E11D48]'
                          : 'border-[#6366F1] bg-[#EEF2FF] text-[#4F46E5] shadow-xs'
                        : isCurrentlyActive
                        ? 'border-dashed border-indigo-500 bg-indigo-50/90 text-indigo-700 ring-2 ring-indigo-400 ring-offset-2 ring-offset-[#FCFBF7] animate-pulse shadow-sm'
                        : 'border-dashed border-slate-300 bg-white/80 text-slate-400 dark:text-slate-300'
                    }`}
                  >
                    {filledBlanks[i] || '...'}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col justify-between min-h-[580px] pb-6 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95"
            title="Exit Session"
            aria-label="Exit Session"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Unified Progress Bar */}
          <div className="flex-1 max-w-xs">
            <ProgressBar
              value={progressCurrent}
              max={progressTotal}
              color="amber"
              size="sm"
            />
          </div>
        </div>

        {/* Ayah Reference Badge & Prompt Category */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="warm" size="sm">
              {ayahReference}
            </Badge>

          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Step {progressCurrent} of {progressTotal}
          </span>
        </div>
      </div>

      {/* Main Learning Card Surface */}
      <Card variant="default" padding="lg" className="my-4 space-y-4 relative">
        {/* Prompt Header with Tajweed Highlighting Toggle */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
              {type === 'fill-blank' && 'Fill in the Missing Word'}
              {type === 'english-fill-blank' && 'English Translation Recall'}
              {type === 'meaning-choice' && 'Quranic Translation & Meaning'}
              {type === 'arabic-choice' && 'Recognize the Arabic Ayah'}
              {type === 'sequence-choice' && 'Sequence Recall (What comes next?)'}
            </h3>
            {tajweedTip ? (
              <p className="text-[11px] font-bold text-[#D97706] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {tajweedTip}
              </p>
            ) : (
              <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Tap letters in the verse to inspect Tajweed rules
              </p>
            )}
          </div>

        </div>

        {/* Tajweed Rules Quick Category Chips Filter (Discovered in this Ayah) */}
        {showTajweedLetters && detectedRules.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
            <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-600" /> Tajweed Rules:
            </span>
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                activeCategoryFilter === 'all'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 border border-amber-200/80 dark:border-amber-800/80'
              }`}
            >
              All Rules
            </button>
            {detectedRules.map((rule) => {
              const isActive = activeCategoryFilter === rule.category;
              return (
                <button
                  key={rule.id}
                  onClick={() => {
                    setActiveCategoryFilter(rule.category);
                    // Find first segment of this rule and open popup
                    const parsed = parseAyahIntoTajweedWords(allExerciseArabicText);
                    for (const w of parsed) {
                      for (const s of w.segments) {
                        if (s.rule && s.rule.category === rule.category) {
                          setSelectedTajweedSegment(s);
                          return;
                        }
                      }
                    }
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer border ${
                    isActive
                      ? `${rule.colorScheme.badgeBg} ${rule.colorScheme.badgeText} ${rule.colorScheme.badgeBorder} ring-1 ring-amber-500 shadow-2xs`
                      : `bg-white dark:bg-slate-800 hover:${rule.colorScheme.badgeBg} text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700`
                  }`}
                  title={`Click to highlight and view rule: ${rule.name}`}
                >
                  {rule.category === 'qalqalah' && 'Qalqalah (Echo)'}
                  {rule.category === 'ghunnah' && 'Ghunnah (2 Counts)'}
                  {rule.category === 'madd' && 'Madd (Elongation)'}
                  {rule.category === 'ikhfa' && 'Ikhfa (Concealment)'}
                  {rule.category === 'idgham' && 'Idgham (Assimilation)'}
                  {rule.category === 'iqlab' && 'Iqlab (Meem)'}
                  {rule.category === 'tafkhim' && 'Tafkhim (Heavy)'}
                  {rule.category === 'hamzatul_wasl' && 'Hamzatul Wasl'}
                  {rule.category === 'izhar' && 'Izhar (Clear)'}
                  {rule.category === 'general' && rule.arabicName}
                </button>
              );
            })}
          </div>
        )}

        {/* Native Audio Player Widget for Target Ayah */}
        {/* Optional Bismillah for Verse 1 (if not Fatiha/Tawbah) */}
        {ayahNumber === 1 && surahNumber && surahNumber !== 1 && surahNumber !== 9 && (
          <div className="text-center py-3 px-3 mb-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
             <InteractiveTajweedAyah
                arabicText="بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
                fontFamily={fontFamily}
                fontSizePx={24}
                highlightCategory={activeCategoryFilter}
                showTajweedIndicators={showTajweedLetters}
                onLetterTap={(segment) => setSelectedTajweedSegment(segment)}
              />
          </div>
        )}
        
        {/* Native Audio Player Widget for Target Ayah */}
        <ExerciseAyahAudioPlayer
          surahNumber={surahNumber}
          ayahNumber={ayahNumber}
          ayahReference={ayahReference}
          arabicText={completeTargetArabicText || promptText}
          className="my-1"
        />

        {/* Dynamic Exercise Body */}

        {type === 'english-fill-blank' && (
          <div className="space-y-4">
            {promptText && (
              <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-slate-100 text-center">
                <InteractiveTajweedAyah
                  arabicText={promptText}
                  fontFamily={fontFamily}
                  fontSizePx={28}
                  highlightCategory={activeCategoryFilter}
                  showTajweedIndicators={showTajweedLetters}
                  onLetterTap={(segment) => setSelectedTajweedSegment(segment)}
                />
              </div>
            )}

            {renderEnglishBlankAyah()}

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Word Bank (Tap word to insert)
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {availableWords.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectWord(word, index)}
                    className="min-h-[44px] h-11 px-5 rounded-xl bg-[#FAF9F5] hover:bg-slate-100 border border-slate-300 font-sans text-sm font-extrabold text-slate-800 transition-all shadow-2xs hover:scale-105 active:scale-95"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {type === 'fill-blank' && (
          <div className="space-y-4">
            {promptText && (
              <p className="text-xs text-slate-600 font-medium italic text-center">
                "{promptText}"
              </p>
            )}

            {/* Arabic verse with slotted blank buttons and interactive letter highlights */}
            {renderBlankAyah()}

            {/* Word Bank Chips */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Word Bank (Tap word to insert)
                </span>
                <span className="text-[10.5px] font-medium text-amber-700/90 italic">
                  Tip: Tap letters in verse to inspect rules
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {availableWords.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectWord(word, index)}
                    className="min-h-[48px] h-12 px-6 rounded-2xl bg-[#FAF9F5] hover:bg-slate-100 border border-slate-300 font-quran text-xl font-extrabold text-black transition-all shadow-2xs hover:scale-105 active:scale-95 dark:text-slate-100"
                    dir="rtl"
                    style={{ fontFamily,   }}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Choice Variants (Meaning, Arabic, Sequence) */}
        {type !== 'fill-blank' && type !== 'english-fill-blank' && (
          <div className="space-y-4">
            {/* Prompt Display with Interactive Tajweed Letter Highlighting */}
            <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-slate-100 text-center">
              {direction === 'meaning-to-arabic' ? (
                <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                  "{promptText}"
                </p>
              ) : (
                <InteractiveTajweedAyah
                  arabicText={promptText}
                  fontFamily={fontFamily}
                  fontSizePx={28}
                  highlightCategory={activeCategoryFilter}
                  showTajweedIndicators={showTajweedLetters}
                  onLetterTap={(segment) => setSelectedTajweedSegment(segment)}
                />
              )}
            </div>

            {/* 4 Option Buttons Grid */}
            <div className="grid grid-cols-1 gap-2.5">
              {options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isArabicOption = type === 'arabic-choice' || type === 'sequence-choice';

                let cardStyle =
                  'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700';

                if (isSelected && status === 'idle') {
                  cardStyle =
                    'bg-[#EEF2FF] border-2 border-[#6366F1] text-[#4F46E5] shadow-xs';
                } else if (status === 'correct' && option.isCorrect) {
                  cardStyle =
                    'bg-[#ECFDF5] border-2 border-[#10B981] text-[#059669] shadow-xs';
                } else if (status === 'incorrect' && isSelected && !option.isCorrect) {
                  cardStyle =
                    'bg-[#FFF1F2] border-2 border-[#F43F5E] text-[#E11D48]';
                } else if (status === 'incorrect' && option.isCorrect) {
                  cardStyle =
                    'bg-[#ECFDF5] border-2 border-[#10B981] text-[#059669]';
                }

                return (
                  <div
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`min-h-[52px] p-3.5 rounded-2xl font-bold text-xs sm:text-sm text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${cardStyle}`}
                  >
                    {isArabicOption ? (
                      <div className="w-full text-right" dir="rtl">
                        {renderInteractiveTextSegment(option.text, `opt-${option.id}`)}
                      </div>
                    ) : (
                      <span className="leading-relaxed">{option.text}</span>
                    )}

                    {status !== 'idle' && option.isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pedagogical Study Tip Section */}
        <div className="mt-4 pt-3.5 border-t border-slate-150/80 bg-[#FAF9F5] -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-3.5 sm:p-4 rounded-b-2xl flex items-start gap-2.5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-300/60 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1">
                Study Tip
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${studyTipData.badgeColor}`}
              >
                {studyTipData.strategy}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {studyTipData.text}
            </p>
          </div>
        </div>
      </Card>

      {/* Interactive Tajweed Rule Popup Modal */}
      {selectedTajweedSegment && (
        <TajweedRulePopup
          segment={selectedTajweedSegment}
          allSegments={parseAyahIntoTajweedWords(allExerciseArabicText).flatMap((w) => w.segments)}
          ayahText={allExerciseArabicText}
          onSelectSegment={(seg) => setSelectedTajweedSegment(seg)}
          onClose={() => setSelectedTajweedSegment(null)}
        />
      )}

      {/* Bottom Feedback Dock */}
      {status === 'idle' ? (
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={isCheckDisabled}
          onClick={handleCheckAnswer}
          className="shadow-md"
        >
          Check Answer
        </Button>
      ) : (
        <div
          className={`p-4 sm:p-5 rounded-3xl border animate-in slide-in-from-bottom-2 duration-200 flex flex-col sm:flex-row items-center justify-between gap-3 ${
            status === 'correct'
              ? 'bg-[#ECFDF5] border-[#10B981]/30 text-[#065F46]'
              : 'bg-[#FFF1F2] border-[#F43F5E]/30 text-[#9F1239]'
          }`}
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white ${
                status === 'correct' ? 'bg-[#10B981]' : 'bg-[#F43F5E]'
              }`}
            >
              {status === 'correct' ? (
                <Check className="w-6 h-6 stroke-[3]" />
              ) : (
                <AlertCircle className="w-6 h-6 stroke-[3]" />
              )}
            </div>

            <div>
              <h4 className="font-extrabold text-sm sm:text-base">
                {status === 'correct' ? 'Masha\'Allah! Correct' : 'Needs Reinforcement'}
              </h4>
              <p className="text-xs opacity-80">
                {status === 'correct'
                  ? 'Your retention score for this Ayah has increased.'
                  : 'We will bring this Ayah back in spaced recall soon.'}
              </p>
            </div>
          </div>

          <Button
            variant={status === 'correct' ? 'primary' : 'destructive'}
            size="md"
            onClick={onContinue}
            rightIcon={
              progressCurrent === progressTotal ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )
            }
            className="w-full sm:w-auto shrink-0 shadow-sm font-black"
          >
            {progressCurrent === progressTotal ? 'Complete Sequence' : 'Continue'}
          </Button>
        </div>
      )}
    </div>
  );
};

