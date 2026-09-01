import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ChevronDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Headphones,
  Check,
} from 'lucide-react';
import { ALL_114_SURAHS } from '../data/quranMetadata';
import { getSurahCompleteData, getAyahAudioUrl, RECITERS_LIST, ReciterInfo } from '../services/quranDataService';
import { prefetchSurahWordTimings, getActiveWordIndex } from '../services/verseTimingService';
import { SurahContent, QuranWord } from '../data/quranVerses';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { globalAudioManager } from '../services/globalAudioManager';

function getAyahWords(arabicText?: string, existingWords?: QuranWord[]): string[] {
  if (existingWords && existingWords.length > 0) {
    const cleaned: string[] = [];
    for (const w of existingWords) {
      const text = (w.arabic || '').trim();
      if (!text) continue;
      if (/^[۞۩ۖۗۘۙۚۛۜ\u06D6-\u06DC\u06DE\u06E9]+$/u.test(text)) {
        if (cleaned.length > 0) {
          cleaned[cleaned.length - 1] += ' ' + text;
        }
      } else {
        cleaned.push(text);
      }
    }
    if (cleaned.length > 0) return cleaned;
  }

  const raw = (arabicText || '').split(/\s+/).filter(Boolean);
  const words: string[] = [];
  for (const tok of raw) {
    if (/^[۞۩ۖۗۘۙۚۛۜ\u06D6-\u06DC\u06DE\u06E9]+$/u.test(tok)) {
      if (words.length > 0) {
        words[words.length - 1] += ' ' + tok;
      }
    } else {
      words.push(tok);
    }
  }
  return words;
}

interface AudioPlayerSheetProps {
  surahNumber?: number;
  initialAyah?: number;
  onClose: () => void;
  onStartExercise?: () => void;
}

export const AudioPlayerSheet: React.FC<AudioPlayerSheetProps> = ({
  surahNumber = 67,
  initialAyah = 1,
  onClose,
  onStartExercise,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(initialAyah);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [repeatMode, setRepeatMode] = useState<'1x' | '3x' | '5x' | 'infinite'>('3x');
  const [repeatLeft, setRepeatLeft] = useState<number>(3);
  const [selectedQari, setSelectedQari] = useState<ReciterInfo>(RECITERS_LIST[0]);
  const [surahData, setSurahData] = useState<SurahContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const surahMeta = ALL_114_SURAHS.find((s) => s.number === surahNumber) || ALL_114_SURAHS[66];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    prefetchSurahWordTimings(surahNumber, selectedQari.id || selectedQari.subfolder);

    getSurahCompleteData(surahNumber, selectedQari.subfolder).then((data) => {
      if (isMounted) {
        setSurahData(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [surahNumber, selectedQari.subfolder]);

  // High precision RAF time update loop
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;

    const tick = () => {
      if (audioRef.current && !audioRef.current.paused) {
        const cTime = audioRef.current.currentTime;
        const dur = audioRef.current.duration || 0;
        setCurrentTime(cTime);
        setDuration(dur);
        if (dur > 0) {
          setProgress((cTime / dur) * 100);
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  // Handle HTML5 Audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    const handleEnded = () => {
      setIsBuffering(false);
      if (repeatMode === 'infinite') {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      } else if (repeatMode === '3x' || repeatMode === '5x') {
        if (repeatLeft > 1) {
          setRepeatLeft((prev) => prev - 1);
          audio.currentTime = 0;
          audio.play().catch(console.warn);
        } else {
          // Advance to next Ayah if available
          if (surahData && currentAyah < surahData.totalAyahs) {
            const next = currentAyah + 1;
            setCurrentAyah(next);
            setRepeatLeft(repeatMode === '3x' ? 3 : 5);
            playAyah(next);
          } else {
            setIsPlaying(false);
          }
        }
      } else {
        // 1x: Advance to next ayah
        if (surahData && currentAyah < surahData.totalAyahs) {
          const next = currentAyah + 1;
          setCurrentAyah(next);
          playAyah(next);
        } else {
          setIsPlaying(false);
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    const unregister = globalAudioManager.registerAudioElement(audio, 'audio-player-sheet', () => {
      try {
        if (!audio.paused) audio.pause();
        setIsPlaying(false);
      } catch {}
    });

    return () => {
      unregister();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, repeatLeft, surahData, currentAyah]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const playAyah = (ayahNum: number) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const url = getAyahAudioUrl(surahNumber, ayahNum, selectedQari.subfolder);
    audio.src = url;
    audio.playbackRate = playbackSpeed;
    audio.play().catch(console.warn);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playAyah(currentAyah);
    }
  };

  const handleNextAyah = () => {
    if (currentAyah < (surahData?.totalAyahs || surahMeta.totalAyahs)) {
      const next = currentAyah + 1;
      setCurrentAyah(next);
      setRepeatLeft(repeatMode === '3x' ? 3 : repeatMode === '5x' ? 5 : 1);
      if (isPlaying) {
        playAyah(next);
      }
    }
  };

  const handlePrevAyah = () => {
    if (currentAyah > 1) {
      const prev = currentAyah - 1;
      setCurrentAyah(prev);
      setRepeatLeft(repeatMode === '3x' ? 3 : repeatMode === '5x' ? 5 : 1);
      if (isPlaying) {
        playAyah(prev);
      }
    }
  };

  const activeVerse = surahData?.ayahs.find((a) => a.number === currentAyah) || surahData?.ayahs[0];

  return (
    <div className="w-full max-w-xl mx-auto pb-4 space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <button
          onClick={() => {
            audioRef.current?.pause();
            onClose();
          }}
          className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 flex items-center justify-center transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
          title="Close player"
          aria-label="Close player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h1 className="font-extrabold text-slate-900 text-base tracking-tight">Quran Audio Reciter</h1>
          <p className="text-[11px] text-slate-400 font-medium">Tajweed & Recitation Loop</p>
        </div>

        <div className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center">
          <Volume2 className="w-5 h-5" />
        </div>
      </div>

      {/* Main Recitation Surface Card */}
      <Card variant="default" padding="lg" className="space-y-5">
        {/* Surah & Ayah Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="warm" size="md">
            Surah {surahMeta.transliteration} • Ayah {currentAyah} of {surahMeta.totalAyahs}
          </Badge>
          <span className="font-quran text-xl font-bold text-slate-500 dark:text-slate-300" dir="rtl">
            {surahMeta.arabicName}
          </span>
        </div>

        {/* Highlighted Arabic Text Box */}
        <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-amber-900/10 text-center space-y-3 text-slate-900 shadow-2xs">
          {isLoading ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500">
              <div className="w-4 h-4 rounded-full border-2 border-[#6366F1] border-t-transparent animate-spin" />
              <span>Loading verse data...</span>
            </div>
          ) : (
            <>
              {(() => {
                const words = getAyahWords(activeVerse?.arabic, activeVerse?.words);
                const activeWordIdx = isPlaying
                  ? getActiveWordIndex({
                      surahNumber,
                      ayahNumber: currentAyah,
                      wordsCount: words.length,
                      currentTimeSeconds: currentTime,
                      durationSeconds: duration,
                      reciterKey: selectedQari.id || selectedQari.subfolder,
                      arabicWords: words,
                    })
                  : -1;

                return (
                  <div
                    dir="rtl"
                    className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-quran text-2xl sm:text-3xl text-slate-900 font-bold leading-[2.4] dark:text-slate-100"
                  >
                    {words.map((w, idx) => {
                      const isWordActive = isPlaying && idx === activeWordIdx;
                      return (
                        <span
                          key={idx}
                          className={`transition-all duration-150 rounded-lg px-2 py-0.5 inline-block ${
                            isWordActive
                              ? 'bg-amber-300 text-slate-950 font-black ring-2 ring-amber-400 shadow-md scale-105'
                              : 'text-slate-900'
                          }`}
                        >
                          {w}
                        </span>
                      );
                    })}
                  </div>
                );
              })()}
              {activeVerse?.transliteration && (
                <p className="text-xs text-slate-500 italic leading-relaxed pt-2 border-t border-slate-200/60 font-serif">
                  {activeVerse.transliteration}
                </p>
              )}
              {activeVerse?.translation && (
                <p className="text-xs text-slate-700 leading-relaxed pt-1 font-medium">
                  "{activeVerse.translation}"
                </p>
              )}
            </>
          )}
        </div>

        {/* Audio Waveform & Right-to-Left Progress Flow */}
        <div className="space-y-2 py-1" dir="rtl">
          {/* RTL Waveform Pulse (Arabic right-to-left flow) */}
          <div className="flex items-center justify-center gap-1.5 flex-row-reverse">
            {[40, 65, 30, 85, 95, 45, 70, 55, 90, 60, 40, 75, 50, 80, 35].map((h, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-300 ${
                  isPlaying ? 'bg-amber-500 animate-pulse' : 'bg-slate-200'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(12, h * 0.45)}px` : '10px',
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>

          {/* Right-to-Left Audio Progress Track */}
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex flex-row justify-start" dir="rtl">
            <div
              className="h-full bg-gradient-to-l from-amber-400 via-amber-500 to-amber-600 rounded-full transition-all duration-150 ease-linear shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-5 pt-1">
          <button
            onClick={handlePrevAyah}
            disabled={currentAyah <= 1}
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all disabled:opacity-40 border border-slate-200/80 hover:scale-105 active:scale-95 cursor-pointer"
            title="Previous Ayah"
            aria-label="Previous Ayah"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-full bg-[#0F172A] hover:bg-slate-800 text-white flex items-center justify-center shadow-lg shadow-slate-900/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 ml-1 fill-current" />
            )}
          </button>

          <button
            onClick={handleNextAyah}
            disabled={currentAyah >= (surahData?.totalAyahs || surahMeta.totalAyahs)}
            className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all disabled:opacity-40 border border-slate-200/80 hover:scale-105 active:scale-95 cursor-pointer"
            title="Next Ayah"
            aria-label="Next Ayah"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Speed & Repeat Settings */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          {/* Speed Pills */}
          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Playback Speed
            </span>
            <div className="flex items-center justify-between gap-1">
              {[0.75, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`min-h-[40px] px-2 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center justify-center flex-1 cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Repeat Mode Pills */}
          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Ayah Loop
            </span>
            <div className="flex items-center justify-between gap-1">
              {(['1x', '3x', '5x', 'infinite'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setRepeatMode(mode);
                    setRepeatLeft(mode === '3x' ? 3 : mode === '5x' ? 5 : 1);
                  }}
                  className={`min-h-[40px] px-2 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center justify-center flex-1 cursor-pointer ${
                    repeatMode === mode
                      ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  {mode === 'infinite' ? 'Loop' : mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Reciter Selector Bar */}
      <Card variant="default" padding="md" className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
          Select Reciter (Qari)
        </span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {RECITERS_LIST.map((qari) => {
            const isSelected = selectedQari.id === qari.id;
            return (
              <button
                key={qari.id}
                onClick={() => {
                  setSelectedQari(qari);
                  if (isPlaying) {
                    playAyah(currentAyah);
                  }
                }}
                className={`min-h-[44px] px-3.5 py-2 rounded-2xl border flex items-center gap-2 whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow-xs ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {qari.name.charAt(0)}
                </div>
                <span className="text-xs font-bold">{qari.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Jump into Practice Action */}
      {onStartExercise && (
        <Button
          variant="warm"
          size="lg"
          fullWidth
          onClick={() => {
            audioRef.current?.pause();
            onStartExercise();
          }}
          leftIcon={<Sparkles className="w-4 h-4 fill-white" />}
        >
          Switch to Active Recall Practice
        </Button>
      )}
    </div>
  );
};
