import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  Flame,
  Info,
  ChevronRight,
  Play,
  Pause,
  Repeat,
} from 'lucide-react';
import {
  getWordAudioUrls,
  decomposeArabicWordToLetters,
  inferWordLinguistics,
  playIsolatedLetterSound,
  LetterSyllableBreakdown,
  WordDetailData,
} from '../services/quranAudioEngine';
import {
  analyzeLetterTajweedRule,
  TAJWEED_RULES,
  TajweedRuleInfo,
} from '../services/tajweedEngine';
import { useScrollLock } from '../hooks/useScrollLock';
import { CoachMarkOverlay } from './tour/CoachMarkOverlay';

interface WordInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  wordIdx: number; // 1-indexed
  wordText: string;
  transliteration?: string;
  translation?: string;
  onOpenTafsir?: () => void;
}

export const WordInspectorModal: React.FC<WordInspectorModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  ayahNumber,
  wordIdx,
  wordText,
  transliteration: initialTranslit,
  translation: initialTrans,
  onOpenTafsir,
}) => {
  useScrollLock(isOpen);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<1 | 3 | 'loop'>(1);
  const [repeatCounter, setRepeatCounter] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 1.0>(1.0);
  const [selectedLetterIdx, setSelectedLetterIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const repeatCountRef = useRef(0);

  // Linguistic & tajweed analysis
  const linguistics = inferWordLinguistics(wordText, initialTrans);
  const lettersBreakdown: LetterSyllableBreakdown[] = decomposeArabicWordToLetters(wordText);
  const audioUrls = getWordAudioUrls(surahNumber, ayahNumber, wordIdx);

  // Detect Tajweed rule from word structure
  const detectedRule: TajweedRuleInfo | null = (() => {
    // Check all characters in word
    for (let i = 0; i < wordText.length; i++) {
      const rule = analyzeLetterTajweedRule(wordText, i);
      if (rule) return rule;
    }
    // Specific custom checks for common Quranic patterns
    if (wordText.includes('ٓ') || wordText.includes('~')) return TAJWEED_RULES.madd_lazim;
    if (wordText.includes('نّ') || wordText.includes('مّ')) return TAJWEED_RULES.ghunnah;
    if (/[قطبجد]ْ/.test(wordText)) return TAJWEED_RULES.qalqalah;
    if (wordText.startsWith('ٱ')) return TAJWEED_RULES.hamzatul_wasl;
    if (/[اوي]/.test(wordText) && !/[\u064B-\u0652]/.test(wordText)) return TAJWEED_RULES.madd_tabeei;
    return null;
  })();

  // Reset states when word changes
  useEffect(() => {
    setIsPlaying(false);
    setRepeatCounter(0);
    repeatCountRef.current = 0;
    setSelectedLetterIdx(null);
    setAudioError(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [surahNumber, ayahNumber, wordIdx, wordText]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const playWordAudio = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setRepeatCounter(0);
      repeatCountRef.current = 0;
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.playbackRate = playbackSpeed;
    setAudioError(false);

    let urlIndex = 0;
    audio.src = audioUrls[urlIndex] || audioUrls[0];

    audio.onerror = () => {
      urlIndex++;
      if (urlIndex < audioUrls.length) {
        audio.src = audioUrls[urlIndex];
        audio.play().catch(fallbackWebSpeech);
      } else {
        fallbackWebSpeech();
      }
    };

    const handleEnded = () => {
      repeatCountRef.current += 1;
      setRepeatCounter(repeatCountRef.current);

      if (repeatMode === 'loop') {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
      } else if (repeatMode === 3 && repeatCountRef.current < 3) {
        setTimeout(() => {
          audio.currentTime = 0;
          audio.play().catch(() => setIsPlaying(false));
        }, 300);
      } else {
        setIsPlaying(false);
        setRepeatCounter(0);
        repeatCountRef.current = 0;
      }
    };

    audio.onended = handleEnded;

    setIsPlaying(true);
    setRepeatCounter(1);
    repeatCountRef.current = 1;

    audio.play().catch((err) => {
      console.warn('Audio play failed, using web speech synthesis fallback:', err);
      fallbackWebSpeech();
    });
  };

  const fallbackWebSpeech = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(wordText);
        utterance.lang = 'ar-SA';
        utterance.rate = playbackSpeed === 0.75 ? 0.7 : 0.85;
        utterance.onend = () => {
          setIsPlaying(false);
          setRepeatCounter(0);
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          setAudioError(true);
        };
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setIsPlaying(false);
        setAudioError(true);
      }
    } else {
      setIsPlaying(false);
      setAudioError(true);
    }
  };

  const handleCopyWord = () => {
    navigator.clipboard.writeText(wordText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedLetter =
    selectedLetterIdx !== null && lettersBreakdown[selectedLetterIdx]
      ? lettersBreakdown[selectedLetterIdx]
      : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-slate-200/90 text-slate-900 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              Word Inspector & Tajweed
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-all shadow-2xs active:scale-95"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Word Presentation with Audio Wave */}
        <div
          data-coach="word-root"
          className="relative py-4 px-3 rounded-2xl bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-50 border border-slate-200/80 text-center overflow-hidden"
        >
          {isPlaying && (
            <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400 animate-pulse" />
          )}

          <span
            className="font-quran text-5xl sm:text-6xl font-bold text-slate-950 block leading-[2.2] tracking-wide select-text drop-shadow-xs dark:text-slate-100"
            dir="rtl"
          >
            {wordText}
          </span>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-sm font-bold text-emerald-950 font-serif">
              {initialTranslit || linguistics.pronunciationTip.split('.')[0] || 'Pronunciation Guide'}
            </span>
          </div>
          {initialTrans && (
            <p className="text-xs text-slate-600 font-medium italic mt-0.5">
              "{initialTrans}"
            </p>
          )}

          {/* Ayah & Word Position Pill */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700 shadow-2xs">
            <span>Surah {surahName}</span>
            <span className="text-slate-300">•</span>
            <span>Ayah {ayahNumber}</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700">Word #{wordIdx}</span>
          </div>
        </div>

        {/* Audio Pronunciation & Memorization Drill Controls */}
        <div className="p-3.5 rounded-2xl bg-emerald-950 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-100">
                Word Audio Pronunciation
              </span>
            </div>
            {repeatMode === 3 && isPlaying && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 animate-bounce">
                Repetition {repeatCounter}/3
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Main Play Button */}
            <button
              onClick={playWordAudio}
              className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95 ${
                isPlaying
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-300 ring-2 ring-amber-300'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Stop Audio</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Listen to Word</span>
                </>
              )}
            </button>

            {/* Repeat Modes (1x, 3x, Loop) */}
            <button
              onClick={() => {
                const modes: Array<1 | 3 | 'loop'> = [1, 3, 'loop'];
                const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
                setRepeatMode(next);
              }}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                repeatMode !== 1
                  ? 'bg-emerald-800 border-emerald-400 text-emerald-100'
                  : 'bg-emerald-900/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
              }`}
              title="Change repetition drill"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>{repeatMode === 'loop' ? 'Loop' : `${repeatMode}x Drill`}</span>
            </button>

            {/* Speed Toggle (1x vs 0.75x Slow Tajweed Mode) */}
            <button
              onClick={() => {
                const nextSpeed = playbackSpeed === 1.0 ? 0.75 : 1.0;
                setPlaybackSpeed(nextSpeed);
                if (audioRef.current) {
                  audioRef.current.playbackRate = nextSpeed;
                }
              }}
              className={`px-2.5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                playbackSpeed === 0.75
                  ? 'bg-amber-400 border-amber-300 text-amber-950 font-black'
                  : 'bg-emerald-900/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
              }`}
              title="Toggle slow playback for tajweed practice"
            >
              {playbackSpeed}x
            </button>
          </div>

          <p className="text-[10px] text-emerald-300/80 text-center leading-tight">
            💡 Tip: Use <span className="text-amber-300 font-bold">3x Drill</span> or <span className="text-amber-300 font-bold">0.75x Slow</span> to master the exact Tajweed makhraj before reciting the full verse.
          </p>
        </div>

        {/* Tajweed Guidance Card */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                Tajweed Rule & Phonetics
              </span>
            </div>
            {detectedRule ? (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 border border-amber-300">
                {detectedRule.arabicName}
              </span>
            ) : (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 border border-emerald-200">
                حَرَكَات سَلِيمَة
              </span>
            )}
          </div>

          {detectedRule ? (
            <div className="space-y-1.5 text-xs">
              <p className="font-extrabold text-amber-950">
                {detectedRule.name}
                {detectedRule.countDuration && (
                  <span className="ml-1 text-[11px] font-semibold text-amber-800">
                    ({detectedRule.countDuration})
                  </span>
                )}
              </p>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                {detectedRule.howToPronounce || detectedRule.shortSummary}
              </p>
              {detectedRule.makhraj && (
                <div className="pt-1 border-t border-amber-200/60 text-[10px] text-amber-800 flex items-center gap-1">
                  <span className="font-bold">Makhraj Point:</span>
                  <span>{detectedRule.makhraj}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1 text-xs">
              <p className="font-bold text-amber-900">
                Standard Natural Flow & Precise Harakah
              </p>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                {linguistics.pronunciationTip ||
                  'Articulate each consonant clearly from its point of articulation without adding extra vowel elongation.'}
              </p>
            </div>
          )}
        </div>

        {/* Letter-by-Letter Articulation (Makhraj) Inspector */}
        {lettersBreakdown.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                Letter-by-Letter Makhraj
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Tap letter to inspect
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center p-2 rounded-xl bg-slate-50 border border-slate-200" dir="rtl">
              {lettersBreakdown.map((l, idx) => {
                const isSelected = selectedLetterIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const nextIdx = isSelected ? null : idx;
                      setSelectedLetterIdx(nextIdx);
                      playIsolatedLetterSound(l.letter, {
                        name: l.name,
                        arabicName: l.arabicName,
                        harakah: l.harakah,
                        mode: 'vowel_sound',
                      });
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-quran text-lg font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-300 scale-105 shadow-xs'
                        : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    } dark:text-slate-100`}
                  >
                    {l.letter}
                  </button>
                );
              })}
            </div>

            {selectedLetter && (
              <div className="p-2.5 rounded-xl bg-slate-100/80 border border-slate-200 text-xs space-y-1.5 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">
                      Letter: {selectedLetter.name} ({selectedLetter.arabicName})
                    </span>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      "{selectedLetter.transliteration}"
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        playIsolatedLetterSound(selectedLetter.letter, {
                          name: selectedLetter.name,
                          arabicName: selectedLetter.arabicName,
                          harakah: selectedLetter.harakah,
                          mode: 'vowel_sound',
                        })
                      }
                      className="p-1 rounded-md bg-white hover:bg-amber-100 text-slate-800 border border-slate-200 cursor-pointer shadow-2xs"
                      title="Play Letter Sound"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {selectedLetter.harakah}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Point of Articulation:</span>{' '}
                  {selectedLetter.makhraj}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
          <button
            onClick={handleCopyWord}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-all shadow-2xs active:scale-95 flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <span>Copy Arabic</span>
            )}
          </button>

          {onOpenTafsir && (
            <button
              onClick={() => {
                onOpenTafsir();
                onClose();
              }}
              className="flex-[2] py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Full Ayah Tafsir</span>
            </button>
          )}
        </div>
      </div>

      <CoachMarkOverlay
        featureKey="word_inspector"
        targetSelector='[data-coach="word-root"]'
        badge="Word Inspector"
        title="Word-by-Word Linguistics & Audio"
        description="Tap any phoneme or letter to hear its isolated pronunciation, or inspect the Arabic tri-literal root and morphological grammar breakdown."
        icon={Volume2}
      />
    </div>
  );
};
