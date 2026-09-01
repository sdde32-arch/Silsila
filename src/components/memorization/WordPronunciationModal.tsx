import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  Headphones,
  Sliders,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Gauge,
  Radio,
  BookOpen,
} from 'lucide-react';
import {
  WordDetailData,
  ReciterProfile,
  QURAN_RECITERS,
  LetterSyllableBreakdown,
  playArabicWordPronunciation,
  playIsolatedLetterSound,
  decomposeArabicWordToLetters,
  getAyahWordsData,
} from '../../services/quranAudioEngine';
import { useScrollLock } from '../../hooks/useScrollLock';

export interface WordPronunciationModalProps {
  word?: WordDetailData;
  wordData?: WordDetailData;
  allAyahWords?: WordDetailData[];
  surahNumber?: number;
  ayahNumber?: number;
  surahName?: string;
  activeReciter?: ReciterProfile;
  onSelectReciter?: (reciter: ReciterProfile) => void;
  onSelectWord?: (word: WordDetailData) => void;
  onClose: () => void;
  onContinue?: () => void;
}

export const WordPronunciationModal: React.FC<WordPronunciationModalProps> = ({
  word: wordProp,
  wordData: wordDataProp,
  allAyahWords,
  surahNumber: surahNumberProp,
  ayahNumber: ayahNumberProp,
  surahName = 'Al-Fatihah',
  activeReciter: initialReciter,
  onSelectReciter,
  onSelectWord,
  onClose,
  onContinue,
}) => {
  useScrollLock(true);
  const initialWord: WordDetailData = wordProp || wordDataProp || {
    wordId: 1,
    arabic: '',
    transliteration: '',
    translation: '',
    surahNumber: surahNumberProp || 1,
    ayahNumber: ayahNumberProp || 1,
  };

  const surahNumber = surahNumberProp || initialWord.surahNumber || 1;
  const ayahNumber = ayahNumberProp || initialWord.ayahNumber || 1;

  // Current active word in modal (supports cycling through all words in the Ayah)
  const [currentWord, setCurrentWord] = useState<WordDetailData>(initialWord);

  // Reciter state
  const [reciter, setReciter] = useState<ReciterProfile>(
    initialReciter || QURAN_RECITERS[0]
  );
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  // Playback options: Mode, Speed & Repeats
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 0.75 | 1.0>(1.0);
  const [audioMode, setAudioMode] = useState<'reciter' | 'studio' | 'letters'>('reciter');

  // Audio Playback state
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [audioSourceTag, setAudioSourceTag] = useState<string>('');
  const activeAudioInstanceRef = useRef<HTMLAudioElement | null>(null);

  // Sequential Ayah words list
  const wordsList: WordDetailData[] = React.useMemo(() => {
    if (allAyahWords && allAyahWords.length > 0) return allAyahWords;
    return getAyahWordsData(surahNumber, ayahNumber);
  }, [allAyahWords, surahNumber, ayahNumber]);

  // Letters breakdown for current word
  const letterBreakdown: LetterSyllableBreakdown[] = React.useMemo(() => {
    if (currentWord.lettersBreakdown && currentWord.lettersBreakdown.length > 0) {
      return currentWord.lettersBreakdown;
    }
    return decomposeArabicWordToLetters(currentWord.arabic);
  }, [currentWord]);

  // Selected letter for detailed makhraj view
  const [selectedLetter, setSelectedLetter] = useState<LetterSyllableBreakdown | null>(null);
  const [playingLetterId, setPlayingLetterId] = useState<number | null>(null);

  // Continuous Ayah word-by-word player state
  const [isPlayingAllWords, setIsPlayingAllWords] = useState(false);
  const isPlayingSequenceRef = useRef(false);
  const playingAllWordsTimerRef = useRef<any>(null);

  // Practice state
  const [hasPracticed, setHasPracticed] = useState(false);

  // Sync state when initialWord changes
  useEffect(() => {
    setCurrentWord(initialWord);
    setSelectedLetter(null);
    setPlayingLetterId(null);
  }, [initialWord]);

  // Set default selected letter
  useEffect(() => {
    if (letterBreakdown.length > 0 && !selectedLetter) {
      setSelectedLetter(letterBreakdown[0]);
    }
  }, [letterBreakdown, selectedLetter]);

  // Clean up audio on unmount or word change
  useEffect(() => {
    return () => {
      isPlayingSequenceRef.current = false;
      stopAnyPlayingAudio();
      if (playingAllWordsTimerRef.current) clearTimeout(playingAllWordsTimerRef.current);
    };
  }, [currentWord]);

  const stopAnyPlayingAudio = () => {
    if (activeAudioInstanceRef.current) {
      try {
        activeAudioInstanceRef.current.pause();
        activeAudioInstanceRef.current.currentTime = 0;
      } catch {}
      activeAudioInstanceRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsPlayingReference(false);
  };

  // Play audio for current word with robust callback
  const handlePlayWordAudio = async (
    wordToPlay = currentWord,
    speed = playbackSpeed,
    onEnded?: () => void
  ) => {
    stopAnyPlayingAudio();
    setIsPlayingReference(true);

    try {
      const result = await playArabicWordPronunciation(
        wordToPlay,
        reciter,
        speed,
        () => {
          setIsPlayingReference(false);
          if (onEnded) onEnded();
        }
      );

      if (result.audioInstance) {
        activeAudioInstanceRef.current = result.audioInstance;
      }
      setAudioSourceTag(
        result.source === 'reciter_segment'
          ? `${reciter.name}`
          : result.source === 'wbw_studio'
          ? 'Studio WBW Recording'
          : 'Arabic Voice Synthesis'
      );
    } catch {
      setIsPlayingReference(false);
      if (onEnded) onEnded();
    }
  };

  // Handle switching to adjacent words in the Ayah
  const handleSelectWordByIndex = (targetWordIndex: number) => {
    if (targetWordIndex < 1 || targetWordIndex > wordsList.length) return;
    const targetWord = wordsList[targetWordIndex - 1];
    if (targetWord) {
      stopAnyPlayingAudio();
      if (isPlayingAllWords) {
        isPlayingSequenceRef.current = false;
        if (playingAllWordsTimerRef.current) clearTimeout(playingAllWordsTimerRef.current);
        setIsPlayingAllWords(false);
      }
      setCurrentWord(targetWord);
      setSelectedLetter(null);
      if (onSelectWord) onSelectWord(targetWord);
      // Auto-play the newly selected word
      setTimeout(() => {
        handlePlayWordAudio(targetWord);
      }, 100);
    }
  };

  // Play all words in sequence collectively (Event-driven chain through all words in the Ayah)
  const handlePlayAllWordsInAyah = () => {
    if (isPlayingAllWords) {
      isPlayingSequenceRef.current = false;
      if (playingAllWordsTimerRef.current) clearTimeout(playingAllWordsTimerRef.current);
      setIsPlayingAllWords(false);
      stopAnyPlayingAudio();
      return;
    }

    setIsPlayingAllWords(true);
    isPlayingSequenceRef.current = true;

    const playWordAt = (idx: number) => {
      if (!isPlayingSequenceRef.current) return;
      if (idx >= wordsList.length) {
        setIsPlayingAllWords(false);
        setIsPlayingReference(false);
        isPlayingSequenceRef.current = false;
        return;
      }

      const w = wordsList[idx];
      setCurrentWord(w);
      if (onSelectWord) onSelectWord(w);

      // Play word audio and wait for it to genuinely finish
      handlePlayWordAudio(w, playbackSpeed, () => {
        if (!isPlayingSequenceRef.current) return;
        // Natural Tajweed pause between words (350ms)
        playingAllWordsTimerRef.current = setTimeout(() => {
          if (!isPlayingSequenceRef.current) return;
          playWordAt(idx + 1);
        }, 350);
      });
    };

    playWordAt(0);
  };

  // Sequential letter-by-letter syllable playback
  const [isPlayingLetterSequence, setIsPlayingLetterSequence] = useState(false);
  const isPlayingLetterSeqRef = useRef(false);
  const letterSeqTimerRef = useRef<any>(null);

  // Play isolated letter sound (mode: 'vowel_sound' or 'letter_name')
  const handlePlayLetter = (
    l: LetterSyllableBreakdown,
    mode: 'vowel_sound' | 'letter_name' = 'vowel_sound'
  ) => {
    setSelectedLetter(l);
    setPlayingLetterId(l.id);
    playIsolatedLetterSound(l.letter, {
      name: l.name,
      arabicName: l.arabicName,
      harakah: l.harakah,
      mode,
      onAudioEnded: () => {
        setPlayingLetterId((prev) => (prev === l.id ? null : prev));
      },
    });
    setTimeout(() => {
      setPlayingLetterId((prev) => (prev === l.id ? null : prev));
    }, 700);
  };

  // Play all letters in sequence from right-to-left
  const handlePlayAllLettersInWord = () => {
    if (isPlayingLetterSequence) {
      isPlayingLetterSeqRef.current = false;
      if (letterSeqTimerRef.current) clearTimeout(letterSeqTimerRef.current);
      setIsPlayingLetterSequence(false);
      setPlayingLetterId(null);
      return;
    }

    if (letterBreakdown.length === 0) return;

    setIsPlayingLetterSequence(true);
    isPlayingLetterSeqRef.current = true;

    const playLetterAt = (idx: number) => {
      if (!isPlayingLetterSeqRef.current) return;
      if (idx >= letterBreakdown.length) {
        setIsPlayingLetterSequence(false);
        isPlayingLetterSeqRef.current = false;
        setPlayingLetterId(null);
        return;
      }

      const letter = letterBreakdown[idx];
      setSelectedLetter(letter);
      setPlayingLetterId(letter.id);

      playIsolatedLetterSound(letter.letter, {
        name: letter.name,
        arabicName: letter.arabicName,
        harakah: letter.harakah,
        mode: 'vowel_sound',
        onAudioEnded: () => {
          if (!isPlayingLetterSeqRef.current) return;
          letterSeqTimerRef.current = setTimeout(() => {
            playLetterAt(idx + 1);
          }, 320);
        },
      });

      // Safety fallback timer if onAudioEnded doesn't fire
      letterSeqTimerRef.current = setTimeout(() => {
        if (!isPlayingLetterSeqRef.current) return;
        playLetterAt(idx + 1);
      }, 900);
    };

    playLetterAt(0);
  };

  // Change reciter
  const handleChooseReciter = (chosen: ReciterProfile) => {
    setReciter(chosen);
    setShowReciterPicker(false);
    if (onSelectReciter) onSelectReciter(chosen);
    setTimeout(() => {
      handlePlayWordAudio(currentWord);
    }, 150);
  };

  const currentIdx = wordsList.findIndex((w) => w.wordNumber === currentWord.wordNumber);
  const hasPrevWord = currentIdx > 0;
  const hasNextWord = currentIdx < wordsList.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-6 max-h-[92vh] flex flex-col">
        {/* ========================================================================= */}
        {/* MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-[#FAF9F5] shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Return to lesson"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return</span>
            </button>

            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                Word Pronunciation & Tajweed
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold">
                Surah {surahName} • Ayah {ayahNumber} (Word {currentWord.wordNumber} of {wordsList.length})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] font-bold flex items-center gap-1">
              <Headphones className="w-3 h-3 text-amber-600" />
              <span>Arabic Audio</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCROLLABLE BODY (Smooth, Organic Scrolling with Overscroll Containment) */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain flex-1 scroll-smooth pb-6">
          {/* AYAH WORD-BY-WORD NAVIGATION STRIP */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-600" />
                <span>Ayah Sequence (Word by Word)</span>
              </span>
              <button
                onClick={handlePlayAllWordsInAyah}
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  isPlayingAllWords
                    ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                    : 'bg-amber-100/90 text-amber-900 border border-amber-200 hover:bg-amber-200'
                }`}
              >
                {isPlayingAllWords ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{isPlayingAllWords ? 'Stop Continuous' : 'Play All Words'}</span>
              </button>
            </div>

            {/* Word Cards Carousel */}
            <div
              dir="rtl"
              className="flex items-stretch gap-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin overscroll-x-contain"
            >
              {wordsList.map((w, idx) => {
                const isCurrent = w.wordNumber === currentWord.wordNumber;
                return (
                  <button
                    key={w.id || idx}
                    onClick={() => handleSelectWordByIndex(idx + 1)}
                    className={`group relative shrink-0 flex flex-col items-center justify-between p-2.5 min-w-[76px] sm:min-w-[86px] rounded-2xl transition-colors duration-150 cursor-pointer border ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500 shadow-xs ring-2 ring-amber-400/40'
                        : 'bg-white border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/30'
                    }`}
                  >
                    {/* Pure Arabic Word Script */}
                    <span
                      className={`font-amiri text-xl sm:text-2xl leading-none py-1 transition-colors ${
                        isCurrent
                          ? 'text-amber-800 font-extrabold'
                          : 'text-black group-hover:text-amber-950 font-bold'
                      } dark:text-slate-100`}
                      style={{ color: isCurrent ? undefined : '#000000' }}
                    >
                      {w.arabic}
                    </span>

                    {/* Word Position Number */}
                    <div className="w-full flex items-center justify-center gap-1 pt-1.5 border-t border-slate-100/90 mt-1">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-900'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN PROMINENT ARABIC WORD CARD */}
          <div className="p-5 rounded-3xl bg-[#FAF9F5] border border-amber-900/10 text-center space-y-3 relative overflow-hidden shadow-2xs">
            {/* Word Position Badge & Nav Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleSelectWordByIndex(currentIdx)}
                disabled={!hasPrevWord}
                className="px-2 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous Word"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev Word</span>
              </button>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                Word {currentWord.wordNumber} of {wordsList.length}
              </span>

              <button
                onClick={() => handleSelectWordByIndex(currentIdx + 2)}
                disabled={!hasNextWord}
                className="px-2 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next Word"
              >
                <span className="hidden sm:inline">Next Word</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Arabic Word Display */}
            <p
              className={`font-amiri text-5xl sm:text-6xl font-bold py-1 leading-relaxed tracking-wide transition-colors duration-200 ${
                isPlayingReference
                  ? 'text-amber-800'
                  : 'text-black'
              } dark:text-slate-100`}
              style={{ color: isPlayingReference ? undefined : '#000000' }}
              dir="rtl"
            >
              {currentWord.arabic}
            </p>

            {/* Transliteration & English Translation */}
            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              <span className="text-base font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80">
                {currentWord.transliteration}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-sm font-bold text-slate-700 italic">
                "{currentWord.translation}"
              </span>
            </div>

            {/* Linguistic Root & Part of Speech Pills */}
            <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
              {currentWord.rootLetters && (
                <div className="px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 flex items-center gap-1 text-[11px] font-bold text-slate-700">
                  <span className="text-slate-400 uppercase text-[9px]">Root:</span>
                  <span className="font-amiri font-bold text-amber-900" dir="rtl">
                    {currentWord.rootLetters}
                  </span>
                </div>
              )}

              {currentWord.grammarType && (
                <div className="px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 flex items-center gap-1 text-[11px] font-bold text-slate-700">
                  <span className="text-slate-400 uppercase text-[9px]">Type:</span>
                  <span className="capitalize text-indigo-900 font-extrabold">
                    {currentWord.grammarType}
                  </span>
                </div>
              )}

              {currentWord.tajweedRule && (
                <div className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200/90 flex items-center gap-1 text-[11px] font-bold text-amber-900">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{currentWord.tajweedRule}</span>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ARABIC LETTER-BY-LETTER (HUROOF & HARAKAT) BREAKDOWN (RTL RIGHT-TO-LEFT) */}
          {/* ========================================================================= */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Arabic Letter-by-Letter</span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                  Right → Left ({letterBreakdown.length} letters)
                </span>
              </div>

              {/* Syllable Flow Sequence Player */}
              <button
                onClick={handlePlayAllLettersInWord}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
                  isPlayingLetterSequence
                    ? 'bg-amber-500 text-slate-950 border-amber-600 animate-pulse'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200/80'
                }`}
                title="Play each letter syllable from right to left"
              >
                {isPlayingLetterSequence ? (
                  <>
                    <Pause className="w-3 h-3 text-slate-950" />
                    <span>Stop Syllables</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                    <span>Spell & Articulate</span>
                  </>
                )}
              </button>
            </div>

            {/* Interactive Letter Grid (Clean, Balanced, Symmetrical Cards) */}
            <div
              className={`grid gap-2 pt-1 ${
                letterBreakdown.length <= 3
                  ? 'grid-cols-3'
                  : letterBreakdown.length <= 4
                  ? 'grid-cols-4'
                  : letterBreakdown.length <= 6
                  ? 'grid-cols-3 sm:grid-cols-6'
                  : 'grid-cols-4 sm:grid-cols-7'
              }`}
              dir="rtl"
            >
              {letterBreakdown.map((item, letterIdx) => {
                const isSelected = selectedLetter?.id === item.id;
                const isPlayingThis = playingLetterId === item.id;
                return (
                  <button
                    key={item.id || letterIdx}
                    onClick={() => handlePlayLetter(item, 'vowel_sound')}
                    className={`group relative flex flex-col items-center justify-between p-2.5 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 min-h-[105px] ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 shadow-xs ring-2 ring-amber-400/50 text-slate-950 font-bold'
                        : isPlayingThis
                        ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-300'
                        : 'bg-[#FAF9F5] hover:bg-slate-50 border-slate-200 text-slate-900 hover:border-amber-300'
                    }`}
                    title={`Letter: ${item.name} (${item.arabicName}) - Tap to listen`}
                  >
                    {/* Top status indicator */}
                    <div className="w-full flex items-center justify-between px-0.5">
                      <span className="text-[8.5px] font-mono font-bold text-slate-400">
                        #{letterIdx + 1}
                      </span>
                      {isPlayingThis ? (
                        <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-amber-400 transition-colors" />
                      )}
                    </div>

                    {/* Arabic Letter Glyph */}
                    <span
                      className={`font-amiri text-3xl font-bold leading-none my-1 select-none transition-colors ${
                        isSelected || isPlayingThis ? 'text-amber-900 scale-105' : 'text-slate-900 group-hover:text-amber-950'
                      } dark:text-slate-100`}
                      dir="rtl"
                    >
                      {item.letter}
                    </span>

                    {/* Transliteration & Harakah Badge */}
                    <div className="w-full space-y-0.5 text-center">
                      <p className="text-[11px] font-sans font-black truncate text-emerald-800 bg-emerald-50/80 rounded px-1 py-0.2 border border-emerald-200/50 leading-tight">
                        {item.transliteration}
                      </p>
                      <p className="text-[9px] font-sans font-extrabold truncate text-slate-700 leading-tight">
                        {item.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Letter Makhraj & Articulation Guide */}
            {selectedLetter && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-left space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-black text-indigo-950 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-amiri text-2xl font-bold text-indigo-900 px-2.5 py-0.5 bg-white rounded-xl border border-indigo-200 shadow-2xs">
                      {selectedLetter.letter}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">
                          {selectedLetter.name} ({selectedLetter.arabicName})
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
                          Sound: "{selectedLetter.transliteration}"
                        </span>
                      </div>
                      <p className="text-[10px] font-semibold text-slate-500">
                        {selectedLetter.harakah}
                      </p>
                    </div>
                  </div>

                  {/* Dual Audio Options */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePlayLetter(selectedLetter, 'vowel_sound')}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10.5px] font-black flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Pronounce letter with its specific vowel / harakah"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Letter Sound ({selectedLetter.letter})</span>
                    </button>

                    <button
                      onClick={() => handlePlayLetter(selectedLetter, 'letter_name')}
                      className="px-2 py-1.5 rounded-xl bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Pronounce the full formal letter name"
                    >
                      <span>Name ({selectedLetter.arabicName})</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                  <strong className="text-indigo-950">Makhraj Point: </strong>
                  {selectedLetter.makhraj}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-indigo-700 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-200/70 text-indigo-900 font-bold text-[10px]">
                    {selectedLetter.makhrajCategory}
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-indigo-900">Vowel Diacritic: </strong>
                    {selectedLetter.harakah}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* PRONUNCIATION AUDIO PLAYER CONTROLS (ARABIC AUDIO) */}
          {/* ========================================================================= */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Arabic Audio Recitation</span>
              </h4>

              {/* Playback Speed Controls */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                {([0.5, 0.75, 1.0] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setPlaybackSpeed(spd);
                      handlePlayWordAudio(currentWord, spd);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition-colors cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-amber-500 text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd === 0.5 ? '0.5x (Slow)' : spd === 0.75 ? '0.75x' : '1.0x (Normal)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Player Box */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shadow-2xs">
                    <Volume2 className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">
                      Arabic Audio Reference
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isPlayingReference ? 'Playing authentic recitation...' : 'Tap listen for word pronunciation'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isPlayingReference) {
                      stopAnyPlayingAudio();
                    } else {
                      handlePlayWordAudio();
                    }
                  }}
                  className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs ${
                    isPlayingReference
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:shadow-md'
                  }`}
                >
                  {isPlayingReference ? (
                    <>
                      <Pause className="w-4 h-4 fill-slate-950" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Listen</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tajweed Guidance Box */}
              {currentWord.pronunciationTip && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 space-y-0.5">
                  <div className="flex items-center gap-1 font-black text-[11px] text-amber-900">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Makhraj & Articulation Tip</span>
                  </div>
                  <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                    {currentWord.pronunciationTip}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER */}
        {/* ========================================================================= */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-[#FAF9F5] flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              stopAnyPlayingAudio();
              if (onContinue) onContinue();
              else onClose();
            }}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
          >
            <span>Continue Ayah Lesson</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordPronunciationModal;
