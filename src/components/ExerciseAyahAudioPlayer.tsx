import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  Gauge,
  Sparkles,
  User,
  ChevronDown,
  Headphones,
  Check,
} from 'lucide-react';
import { RECITERS_LIST, ReciterInfo, getAyahAudioUrl } from '../services/quranDataService';
import { globalAudioManager } from '../services/globalAudioManager';

interface ExerciseAyahAudioPlayerProps {
  surahNumber?: number;
  ayahNumber?: number;
  ayahReference?: string;
  arabicText?: string;
  className?: string;
}

export const ExerciseAyahAudioPlayer: React.FC<ExerciseAyahAudioPlayerProps> = ({
  surahNumber,
  ayahNumber,
  ayahReference = 'Target Ayah',
  arabicText = '',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [repeatMode, setRepeatMode] = useState<'1x' | '3x' | '5x' | 'infinite'>('1x');
  const [repeatsRemaining, setRepeatsRemaining] = useState<number>(1);
  const [selectedReciter, setSelectedReciter] = useState<ReciterInfo>(RECITERS_LIST[0]);
  const [showReciterMenu, setShowReciterMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerIdRef = useRef<string>(`exercise-player-${Math.random().toString(36).substring(2, 9)}`);

  // Audio source URL
  const audioUrl = useMemo(() => {
    if (surahNumber && ayahNumber && surahNumber > 0 && ayahNumber > 0) {
      return getAyahAudioUrl(surahNumber, ayahNumber, selectedReciter.subfolder);
    }
    return '';
  }, [surahNumber, ayahNumber, selectedReciter.subfolder]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Reset and stop audio when target verse changes
  useEffect(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setRepeatsRemaining(repeatMode === '3x' ? 3 : repeatMode === '5x' ? 5 : 1);
  }, [surahNumber, ayahNumber, audioUrl]);

  // Initialize and register audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsBuffering(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
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
        audio.play().catch(() => setIsPlaying(false));
      } else if (repeatMode === '3x' || repeatMode === '5x') {
        if (repeatsRemaining > 1) {
          setRepeatsRemaining((prev) => prev - 1);
          audio.currentTime = 0;
          audio.play().catch(() => setIsPlaying(false));
        } else {
          setIsPlaying(false);
          setRepeatsRemaining(repeatMode === '3x' ? 3 : 5);
        }
      } else {
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      setIsBuffering(false);
      // Fallback to Web Speech API if CDN audio is blocked
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && arabicText) {
        try {
          const cleanText = arabicText.replace(/[0-9٠-٩۝۞]/g, '').trim();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'ar-SA';
          utterance.rate = playbackSpeed * 0.88;
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        } catch {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Register with GlobalAudioManager to guarantee singleton audio playback
    const unregisterGlobal = globalAudioManager.registerAudioElement(
      audio,
      playerIdRef.current,
      () => {
        try {
          if (!audio.paused) audio.pause();
        } catch {}
        setIsPlaying(false);
      }
    );

    // Subscribe to global stop events
    const unsubscribe = globalAudioManager.subscribe((event) => {
      if (event.action === 'stop' && event.id !== playerIdRef.current) {
        setIsPlaying(false);
      }
    });

    return () => {
      unregisterGlobal();
      unsubscribe();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      try {
        if (!audio.paused) {
          audio.pause();
        }
      } catch {}
    };
  }, [audioUrl, repeatMode, repeatsRemaining, arabicText, playbackSpeed]);

  // Sync speed & mute settings
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.muted = isMuted;
    }
  }, [playbackSpeed, isMuted]);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      // 1. Instantly stop all other audios playing across the entire app
      globalAudioManager.stopAll(playerIdRef.current);

      if (audioUrl) {
        if (audio.src !== audioUrl) {
          audio.src = audioUrl;
        }
        audio.playbackRate = playbackSpeed;
        audio.muted = isMuted;
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Fallback to TTS
            if (typeof window !== 'undefined' && 'speechSynthesis' in window && arabicText) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(arabicText);
              utterance.lang = 'ar-SA';
              utterance.rate = playbackSpeed * 0.88;
              utterance.onend = () => setIsPlaying(false);
              utterance.onerror = () => setIsPlaying(false);
              window.speechSynthesis.speak(utterance);
              setIsPlaying(true);
            }
          });
      } else if (arabicText && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(arabicText);
        utterance.lang = 'ar-SA';
        utterance.rate = playbackSpeed * 0.88;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  // Replay from beginning
  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        togglePlay();
      }
    }
  };

  // Seek bar scrubber
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current && !isNaN(targetTime)) {
      audioRef.current.currentTime = targetTime;
    }
  };

  // Cycle playback speed (0.75x -> 1.0x -> 1.25x)
  const handleCycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  // Cycle repeat modes
  const handleCycleRepeat = () => {
    const modes: Array<'1x' | '3x' | '5x' | 'infinite'> = ['1x', '3x', '5x', 'infinite'];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setRepeatMode(nextMode);
    setRepeatsRemaining(nextMode === '3x' ? 3 : nextMode === '5x' ? 5 : 1);
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all ${
        isPlaying
          ? 'bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-amber-500/10 border-amber-400/80 shadow-md ring-2 ring-amber-400/20'
          : 'bg-[#FAF9F5] border-slate-200/90 shadow-xs hover:border-slate-300'
      } ${className}`}
    >
      {/* Top Header Label */}
      <div className="px-3.5 pt-3 pb-2 flex items-center justify-between gap-2 border-b border-slate-200/60 bg-white/70 backdrop-blur-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isPlaying
                ? 'bg-amber-500 text-white shadow-2xs animate-pulse'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
          </div>

          <div className="min-w-0">
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 truncate">
              <span>Target Ayah Audio</span>
              <span className="text-amber-700 font-bold">•</span>
              <span className="text-amber-700 font-bold truncate">{ayahReference}</span>
            </span>
          </div>
        </div>

        {/* Reciter Selector Dropdown Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowReciterMenu(!showReciterMenu)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200/80 text-[11px] font-bold text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Change Reciter"
          >
            <User className="w-3 h-3 text-amber-600" />
            <span className="truncate max-w-[110px]">{selectedReciter.name.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Reciter Dropdown Menu */}
          {showReciterMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                Select Quran Reciter
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {RECITERS_LIST.map((reciter) => {
                  const isSelected = selectedReciter.id === reciter.id;
                  return (
                    <button
                      key={reciter.id}
                      type="button"
                      onClick={() => {
                        setSelectedReciter(reciter);
                        setShowReciterMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold truncate">{reciter.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{reciter.style}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Player Controller Bar */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-center gap-3">
          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 shrink-0 ${
              isPlaying
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white ring-4 ring-amber-300/60 shadow-amber-200'
                : 'bg-gradient-to-br from-slate-900 to-slate-800 text-amber-300 hover:from-slate-800 hover:to-slate-700 shadow-slate-300'
            }`}
            title={isPlaying ? 'Pause Audio' : 'Play Target Ayah Audio'}
            aria-label={isPlaying ? 'Pause Target Ayah' : 'Play Target Ayah'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5 text-amber-400" />
            )}
          </button>

          {/* Audio Scrubber & Live Time */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span className="font-mono text-slate-800">{formatTime(currentTime)}</span>
              <div className="flex items-center gap-1.5">
                {/* Dancing Equalizer Waveform while playing */}
                {isPlaying && (
                  <span className="flex items-end gap-0.5 h-3.5">
                    <span className="w-1 bg-amber-500 rounded-full animate-bounce [animation-duration:0.6s] h-2"></span>
                    <span className="w-1 bg-amber-600 rounded-full animate-bounce [animation-duration:0.4s] h-3.5"></span>
                    <span className="w-1 bg-amber-500 rounded-full animate-bounce [animation-duration:0.7s] h-1.5"></span>
                    <span className="w-1 bg-amber-600 rounded-full animate-bounce [animation-duration:0.5s] h-3"></span>
                  </span>
                )}
                <span className="font-mono">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Precision Range Slider */}
            <div className="relative flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600 transition-all"
                title="Seek audio position"
                aria-label="Seek audio position"
              />
            </div>
          </div>
        </div>

        {/* Bottom Auxiliary Controls (Replay, Speed, Repeat, Mute) */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
          <div className="flex items-center gap-1.5">
            {/* Replay 0:00 */}
            <button
              type="button"
              onClick={handleReplay}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200/80 text-[11px] font-bold text-slate-600 transition-all cursor-pointer active:scale-95"
              title="Restart from beginning"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Replay</span>
            </button>

            {/* Speed Selector */}
            <button
              type="button"
              onClick={handleCycleSpeed}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer active:scale-95 ${
                playbackSpeed !== 1.0
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-600'
              }`}
              title="Change Playback Speed"
            >
              <Gauge className="w-3 h-3 text-amber-600" />
              <span>{playbackSpeed}x</span>
            </button>

            {/* Repeat Mode */}
            <button
              type="button"
              onClick={handleCycleRepeat}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer active:scale-95 ${
                repeatMode !== '1x'
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                  : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-600'
              }`}
              title="Repeat Verse for Memorization"
            >
              <Repeat className="w-3 h-3 text-indigo-600" />
              <span>{repeatMode === 'infinite' ? '∞ Loop' : `${repeatMode}`}</span>
            </button>
          </div>

          {/* Audio Hint */}
          <div className="text-[10.5px] font-medium text-slate-500 italic hidden sm:inline">
            Listen before answering
          </div>
        </div>
      </div>
    </div>
  );
};
