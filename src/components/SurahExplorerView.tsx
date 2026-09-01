import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTajweed } from './tajweed/TajweedProvider';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Volume2,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  Repeat,
  ChevronLeft,
  Info,
  X,
  SlidersHorizontal,
  Bookmark,
  Share2,
  UserCheck,
  Headphones,
  Check,
  Music,
  Navigation,
  Type,
  CheckCircle2,
  DownloadCloud,
} from 'lucide-react';
import { ALL_114_SURAHS, SurahMeta } from '../data/quranMetadata';
import { SurahContent, AyahDetail, QuranWord } from '../data/quranVerses';
import {
  getSurahCompleteData,
  getAyahAudioUrl,
  RECITERS_LIST,
  ReciterInfo,
  saveLastReadPosition,
  toggleVerseBookmark,
  getBookmarks,
  setupMediaSession,
  getStoredReaderSettings,
  saveStoredReaderSettings,
} from '../services/quranDataService';
import { prefetchSurahWordTimings, getActiveWordIndex } from '../services/verseTimingService';
import { useScrollLock } from '../hooks/useScrollLock';
import { downloadAyahOfflineNotes } from '../services/downloadService';
import { TafsirModal } from './TafsirModal';
import { QuickJumpModal } from './QuickJumpModal';
import { WordInspectorModal } from './WordInspectorModal';
import { ReaderSettingsModal, ReaderDisplaySettings, DEFAULT_READER_SETTINGS } from './ReaderSettingsModal';
import { globalAudioManager } from '../services/globalAudioManager';
import { AyahNumberBadge } from './ui/AyahNumberBadge';
import { CoachMarkOverlay } from './tour/CoachMarkOverlay';

function getAyahWordsList(ayah: AyahDetail): QuranWord[] {
  if (ayah.words && ayah.words.length > 0) {
    const cleaned: QuranWord[] = [];
    for (const w of ayah.words) {
      const text = (w.arabic || '').trim();
      if (!text) continue;
      // If token is purely a standalone stop mark (e.g. ۚ, ۖ, ۗ, ۘ, ۙ, ۛ, ۞, ۩)
      if (/^[۞۩ۖۗۘۙۚۛۜ\u06D6-\u06DC\u06DE\u06E9]+$/u.test(text)) {
        if (cleaned.length > 0) {
          cleaned[cleaned.length - 1] = {
            ...cleaned[cleaned.length - 1],
            arabic: cleaned[cleaned.length - 1].arabic + ' ' + text,
          };
        }
      } else {
        cleaned.push({
          ...w,
          id: cleaned.length + 1,
        });
      }
    }
    if (cleaned.length > 0) return cleaned;
  }

  const rawTokens = (ayah.arabic || '').split(/\s+/).filter(Boolean);
  const words: QuranWord[] = [];
  for (const token of rawTokens) {
    if (/^[۞۩ۖۗۘۙۚۛۜ\u06D6-\u06DC\u06DE\u06E9]+$/u.test(token)) {
      if (words.length > 0) {
        words[words.length - 1].arabic += ' ' + token;
      }
    } else {
      words.push({
        id: words.length + 1,
        arabic: token,
        transliteration: '',
        translation: '',
      });
    }
  }
  return words;
}

interface SurahExplorerViewProps {
  surahNumber?: number;
  onBack: () => void;
  onStartLesson: (surahNumber: number, ayahNumber?: number) => void;
  onOpenAudio: (surahNumber: number) => void;
}

export const SurahExplorerView: React.FC<SurahExplorerViewProps> = ({
  surahNumber = 2,
  onBack,
  onStartLesson,
  onOpenAudio,
}) => {
  // Navigation & View States
  const { annotateText } = useTajweed();
  const [viewMode, setViewMode] = useState<'list' | 'setup' | 'reader'>('list');

  // Selected Surah
  const [selectedSurahMeta, setSelectedSurahMeta] = useState<SurahMeta>(() => {
    return ALL_114_SURAHS.find((s) => s.number === surahNumber) || ALL_114_SURAHS[1];
  });

  // Loaded Surah Content (All 114 Surahs Supported)
  const [activeSurahContent, setActiveSurahContent] = useState<SurahContent | null>(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState<boolean>(false);

  // Reciter Selection
  const [selectedQari, setSelectedQari] = useState<ReciterInfo>(RECITERS_LIST[0]);
  const [showQariModal, setShowQariModal] = useState<boolean>(false);

  // Reader Tab: 'cards' vs 'mushaf'
  const [readerTab, setReaderTab] = useState<'cards' | 'mushaf'>('cards');

  // Study Configuration States
  const [loopFromAyah, setLoopFromAyah] = useState<number>(1);
  const [loopToAyah, setLoopToAyah] = useState<number>(5);
  const [repeatCount, setRepeatCount] = useState<number>(5);
  const [repeatRemaining, setRepeatRemaining] = useState<number>(5);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [memorizeMode, setMemorizeMode] = useState<boolean>(false);
  const [studyMode, setStudyMode] = useState<'read' | 'listen-repeat'>('read');
  const [isLooping, setIsLooping] = useState<boolean>(false);

  // Audio Playback & Active Ayah Tracking
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  const [revealedWords, setRevealedWords] = useState<Record<string, boolean>>({});
  const [activeMushafPage, setActiveMushafPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'meccan' | 'medinan' | 'short'>('all');
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  useScrollLock(showInfoModal);

  // New Feature Modals
  const [selectedTafsirAyah, setSelectedTafsirAyah] = useState<AyahDetail | null>(null);
  const [initialTafsirTab, setInitialTafsirTab] = useState<'hifz' | 'exegesis' | 'reflections' | 'vocabulary'>('hifz');
  const [showQuickJump, setShowQuickJump] = useState<boolean>(false);
  const [showReaderSettings, setShowReaderSettings] = useState<boolean>(false);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<Record<number, boolean>>({});
  const [downloadingAyah, setDownloadingAyah] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadedAyahs, setDownloadedAyahs] = useState<Record<number, boolean>>({});
  const [expandedAIInsights, setExpandedAIInsights] = useState<Record<number, boolean>>({});
  const [selectedWordInspector, setSelectedWordInspector] = useState<{
    word: string;
    ayahNumber: number;
    wordIdx: number;
    transliteration?: string;
    translation?: string;
  } | null>(null);

  // Reader Display Settings
  const [displaySettings, setDisplaySettings] = useState<ReaderDisplaySettings>(() => {
    return getStoredReaderSettings();
  });

  const handleUpdateDisplaySettings = (newSettings: Partial<ReaderDisplaySettings>) => {
    setDisplaySettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveStoredReaderSettings(updated);
      return updated;
    });
  };

  // Quick Font Size Stepper (delta in px)
  const currentArabicPx = displaySettings.customArabicFontSizePx ||
    (displaySettings.arabicFontSize === 'compact' ? 22 :
     displaySettings.arabicFontSize === 'normal' ? 26 :
     displaySettings.arabicFontSize === 'large' ? 30 :
     displaySettings.arabicFontSize === 'xlarge' ? 36 :
     displaySettings.arabicFontSize === 'jumbo' ? 42 : 50);

  const handleStepFontSize = (delta: number) => {
    const nextPx = Math.min(60, Math.max(18, currentArabicPx + delta));
    handleUpdateDisplaySettings({
      customArabicFontSizePx: nextPx,
    });
  };

  const getArabicStyle = () => {
    const fontFamily =
      displaySettings.arabicFontFamily === 'scheherazade'
        ? "'Scheherazade New', serif"
        : displaySettings.arabicFontFamily === 'standard'
        ? "'Amiri', 'Scheherazade New', serif"
        : "'Amiri', serif";

    const lineHeight =
      displaySettings.lineSpacing === 'compact'
        ? 1.8
        : displaySettings.lineSpacing === 'balanced'
        ? 2.2
        : displaySettings.lineSpacing === 'spacious'
        ? 3.0
        : 2.5;

    return {
      fontSize: `${currentArabicPx}px`,
      fontFamily,
      lineHeight,
      color: '#000000',
      fontWeight: 700,
    };
  };

  const getTranslationFontClass = () => {
    switch (displaySettings.translationFontSize) {
      case 'small':
        return 'text-xs leading-relaxed';
      case 'large':
        return 'text-base leading-relaxed';
      case 'xlarge':
        return 'text-lg leading-relaxed';
      default:
        return 'text-sm leading-relaxed';
    }
  };

  // HTML5 Audio Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Refresh bookmarks for current Surah
  const refreshBookmarks = () => {
    const all = getBookmarks();
    const map: Record<number, boolean> = {};
    all
      .filter((b) => b.surahNumber === selectedSurahMeta.number)
      .forEach((b) => {
        map[b.ayahNumber] = true;
      });
    setBookmarkedVerses(map);
  };

  // Synchronize when prop changes
  useEffect(() => {
    if (surahNumber) {
      const found = ALL_114_SURAHS.find((s) => s.number === surahNumber);
      if (found) {
        setSelectedSurahMeta(found);
        setLoopFromAyah(1);
        setLoopToAyah(Math.min(found.totalAyahs, 5));
      }
    }
  }, [surahNumber]);

  // Load Complete Surah Data
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSurah(true);

    // Prefetch real-time word timings for active surah & reciter
    prefetchSurahWordTimings(selectedSurahMeta.number, selectedQari.id || selectedQari.subfolder);

    getSurahCompleteData(selectedSurahMeta.number, selectedQari.subfolder).then((data) => {
      if (isMounted) {
        setActiveSurahContent(data);
        setIsLoadingSurah(false);
        setActiveMushafPage(data.pageNumber || 1);
        setLoopToAyah((prev) => Math.min(prev, data.totalAyahs));
        refreshBookmarks();

        // Auto-save last read position
        saveLastReadPosition({
          surahNumber: data.number,
          ayahNumber: 1,
          surahName: data.name,
          mushafPage: data.pageNumber || 1,
          timestamp: Date.now(),
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahMeta.number, selectedQari.subfolder]);

  // Handle HTML5 Audio Playback Engine
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setAudioCurrentTime(audio.currentTime);
        setAudioDuration(audio.duration);
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handlePlay = () => setIsAudioPlaying(true);
    const handlePause = () => setIsAudioPlaying(false);

    const handleEnded = () => {
      if (!activeSurahContent) return;

      if (isLooping) {
        if (playingAyah !== null) {
          if (playingAyah < loopToAyah) {
            const nextAyah = playingAyah + 1;
            setPlayingAyah(nextAyah);
            playAyahAudio(nextAyah);
          } else {
            if (repeatRemaining > 1) {
              setRepeatRemaining((prev) => prev - 1);
              setPlayingAyah(loopFromAyah);
              playAyahAudio(loopFromAyah);
            } else {
              setIsLooping(false);
              setIsAudioPlaying(false);
              setPlayingAyah(null);
            }
          }
        }
      } else {
        if (playingAyah !== null && playingAyah < activeSurahContent.totalAyahs) {
          const nextAyah = playingAyah + 1;
          setPlayingAyah(nextAyah);
          playAyahAudio(nextAyah);
        } else {
          setIsAudioPlaying(false);
          setPlayingAyah(null);
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    const unregister = globalAudioManager.registerAudioElement(audio, 'surah-explorer', () => {
      try {
        if (!audio.paused) audio.pause();
        setIsAudioPlaying(false);
      } catch {}
    });

    return () => {
      unregister();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeSurahContent, isLooping, playingAyah, loopFromAyah, loopToAyah, repeatRemaining]);

  // Adjust playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // High-precision 60fps audio time sync loop for word-by-word active tracking
  useEffect(() => {
    if (!isAudioPlaying) return;
    let animFrameId: number;

    const updateTick = () => {
      if (audioRef.current && !audioRef.current.paused) {
        setAudioCurrentTime(audioRef.current.currentTime);
        if (audioRef.current.duration) {
          setAudioDuration(audioRef.current.duration);
          setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      }
      animFrameId = requestAnimationFrame(updateTick);
    };

    animFrameId = requestAnimationFrame(updateTick);
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isAudioPlaying]);

  const playAyahAudio = (ayahNum: number) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    const surahNum = activeSurahContent?.number ?? selectedSurahMeta.number;
    const totalAyahs = activeSurahContent?.totalAyahs ?? selectedSurahMeta.totalAyahs;
    const translit = activeSurahContent?.transliteration ?? selectedSurahMeta.transliteration;
    const juz = activeSurahContent?.juzNumber ?? selectedSurahMeta.juzNumber;
    const surahName = activeSurahContent?.name ?? selectedSurahMeta.name;
    const pageNum = activeSurahContent?.pageNumber ?? selectedSurahMeta.pageNumber ?? 1;

    const url = getAyahAudioUrl(surahNum, ayahNum, selectedQari.subfolder);

    if (audio.src !== url) {
      audio.src = url;
    }
    audio.playbackRate = playbackSpeed;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsAudioPlaying(true);
        })
        .catch((err) => {
          console.warn('Audio play request interrupted or blocked:', err);
          setIsAudioPlaying(false);
        });
    }

    // Save reading progress
    saveLastReadPosition({
      surahNumber: surahNum,
      ayahNumber: ayahNum,
      surahName,
      mushafPage: pageNum,
      timestamp: Date.now(),
    });

    // Lock screen MediaSession integration
    setupMediaSession({
      title: `Ayah ${ayahNum} • Surah ${translit}`,
      artist: selectedQari.name,
      album: `The Noble Quran (Juz ${juz})`,
      onPlay: () => {
        audio.play().catch(console.warn);
        setIsAudioPlaying(true);
      },
      onPause: () => {
        audio.pause();
        setIsAudioPlaying(false);
      },
      onNext: () => {
        if (ayahNum < totalAyahs) {
          setPlayingAyah(ayahNum + 1);
          playAyahAudio(ayahNum + 1);
        }
      },
      onPrev: () => {
        if (ayahNum > 1) {
          setPlayingAyah(ayahNum - 1);
          playAyahAudio(ayahNum - 1);
        }
      },
    });
  };

  const handleTogglePlayAyah = (ayahNum: number) => {
    if (playingAyah === ayahNum && isAudioPlaying) {
      audioRef.current?.pause();
      setIsAudioPlaying(false);
    } else {
      setPlayingAyah(ayahNum);
      setIsAudioPlaying(true);
      playAyahAudio(ayahNum);
    }
  };

  const handleStartLoop = () => {
    setIsLooping(true);
    setRepeatRemaining(repeatCount);
    setPlayingAyah(loopFromAyah);
    setViewMode('reader');
    playAyahAudio(loopFromAyah);
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsAudioPlaying(false);
    setIsLooping(false);
    setPlayingAyah(null);
  };

  const handleToggleWordReveal = (ayahNum: number, wordId: number) => {
    const key = `${ayahNum}-${wordId}`;
    setRevealedWords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleBookmark = (ayah: AyahDetail) => {
    if (!activeSurahContent) return;
    const added = toggleVerseBookmark(
      activeSurahContent.number,
      ayah.number,
      activeSurahContent.transliteration,
      ayah.arabic,
      ayah.translation,
      'favorite'
    );
    setBookmarkedVerses((prev) => ({ ...prev, [ayah.number]: added }));
  };

  // Filter Surahs for search and category
  const filteredSurahs = useMemo(() => {
    let list = ALL_114_SURAHS;

    if (activeCategoryFilter === 'meccan') {
      list = list.filter((s) => s.revelationType === 'Meccan');
    } else if (activeCategoryFilter === 'medinan') {
      list = list.filter((s) => s.revelationType === 'Medinan');
    } else if (activeCategoryFilter === 'short') {
      list = list.filter((s) => s.totalAyahs <= 20);
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (s) =>
        s.number.toString() === q ||
        s.name.toLowerCase().includes(q) ||
        s.transliteration.toLowerCase().includes(q) ||
        s.translation.toLowerCase().includes(q) ||
        s.arabicName.includes(q)
    );
  }, [searchQuery, activeCategoryFilter]);

  const toArabicNumerals = (num: number) => {
    return num.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Font size resolver
  const getArabicFontClass = () => {
    switch (displaySettings.arabicFontSize) {
      case 'normal':
        return 'text-2xl leading-relaxed';
      case 'large':
        return 'text-3xl leading-loose';
      case 'xlarge':
        return 'text-4xl leading-[2.2]';
      case 'jumbo':
        return 'text-5xl leading-[2.4]';
      default:
        return 'text-3xl leading-loose';
    }
  };

  // =========================================================================
  // 1. SURAH LIST / BROWSER VIEW
  // =========================================================================
  if (viewMode === 'list') {
    return (
      <div id="tour-mushaf-explorer" data-tour="mushaf-explorer" className="w-full max-w-2xl mx-auto space-y-3.5 animate-in fade-in duration-200 pb-2">
        <header className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-white border border-slate-300 text-slate-900 hover:text-indigo-600 hover:border-indigo-400 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 group"
              aria-label="Back"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-slate-900 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight leading-tight text-slate-950">
                All Chapters (114 Surahs)
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Select a Surah to read, memorize, or listen
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowQuickJump(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:text-indigo-800 hover:border-indigo-400 text-xs font-bold transition-all cursor-pointer shadow-xs min-h-[40px] active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5 text-indigo-700" />
            <span>Jump</span>
          </button>
        </header>

        {/* Pill Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Surah name, number, or translation..."
            className="w-full pl-11 pr-10 py-3 rounded-full bg-white border border-slate-300 text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs min-h-[46px] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All 114', activeStyle: 'bg-slate-950 dark:bg-indigo-600 text-white', inactiveStyle: 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850' },
            { id: 'meccan', label: 'Meccan (86)', activeStyle: 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs', inactiveStyle: 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100/80' },
            { id: 'medinan', label: 'Medinan (28)', activeStyle: 'bg-indigo-700 dark:bg-indigo-600 text-white shadow-xs', inactiveStyle: 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-900/60 hover:bg-indigo-100/80' },
            { id: 'short', label: 'Short Surahs', activeStyle: 'bg-amber-600 dark:bg-amber-600 text-white shadow-xs', inactiveStyle: 'bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/60 hover:bg-amber-100/80' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[32px] border ${
                activeCategoryFilter === tab.id
                  ? `${tab.activeStyle} shadow-xs font-extrabold border-transparent`
                  : `${tab.inactiveStyle} shadow-2xs`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Surah List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-0.5">
          {filteredSurahs.map((surah) => {
            const isSelected = selectedSurahMeta.number === surah.number;
            const isMeccan = surah.revelationType.toLowerCase() === 'meccan';

            return (
              <button
                key={surah.number}
                onClick={() => {
                  setSelectedSurahMeta(surah);
                  setLoopFromAyah(1);
                  setLoopToAyah(Math.min(surah.totalAyahs, 5));
                  setViewMode('setup');
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all text-left min-h-[68px] cursor-pointer active:scale-[0.99] group ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-100/80 via-indigo-50/50 to-white dark:from-indigo-950/60 dark:via-[#0E121B] dark:to-indigo-950/40 border-2 border-indigo-600 dark:border-indigo-500 text-slate-950 dark:text-slate-100 shadow-md ring-2 ring-indigo-500/20'
                    : isMeccan
                    ? 'bg-gradient-to-r from-emerald-50/60 via-teal-50/20 to-white dark:from-emerald-950/30 dark:via-[#0E121B] dark:to-teal-950/20 hover:from-emerald-50/90 hover:to-teal-50/40 border border-emerald-200/90 dark:border-emerald-900/50 hover:border-emerald-400 dark:hover:border-emerald-600 text-slate-950 dark:text-slate-100 shadow-[0_2px_8px_rgba(16,185,129,0.05)]'
                    : 'bg-gradient-to-r from-indigo-50/60 via-sky-50/20 to-white dark:from-indigo-950/30 dark:via-[#0E121B] dark:to-sky-950/20 hover:from-indigo-50/90 hover:to-sky-50/40 border border-indigo-200/90 dark:border-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-950 dark:text-slate-100 shadow-[0_2px_8px_rgba(99,102,241,0.05)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-black border border-indigo-600 shadow-sm'
                        : isMeccan
                        ? 'bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-950/80 dark:to-teal-950/80 border border-emerald-300/80 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                        : 'bg-gradient-to-br from-indigo-100 to-sky-50 dark:from-indigo-950/80 dark:to-sky-950/80 border border-indigo-300/80 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300'
                    }`}
                  >
                    {surah.number}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm tracking-tight truncate leading-tight text-slate-950 dark:text-slate-100">
                      {surah.transliteration}
                    </h3>
                    <p className="text-[11.5px] truncate font-medium mt-0.5 text-slate-600 dark:text-slate-400">
                      {surah.translation} • {surah.totalAyahs}v
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="font-quran text-xl sm:text-2xl font-bold block text-black dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all leading-[2.2] overflow-visible" dir="rtl">
                    {surah.arabicName}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isMeccan
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20'
                    }`}>
                      Juz {surah.juzNumber} • {surah.revelationType}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Jump Modal */}
        {showQuickJump && (
          <QuickJumpModal
            currentSurahNumber={selectedSurahMeta.number}
            totalAyahs={selectedSurahMeta.totalAyahs}
            currentAyah={playingAyah || 1}
            currentPage={selectedSurahMeta.pageNumber}
            onJumpToAyah={(ayah) => {
              setPlayingAyah(ayah);
              setViewMode('reader');
              playAyahAudio(ayah);
            }}
            onJumpToPage={(pg) => {
              setActiveMushafPage(pg);
              setReaderTab('mushaf');
              setViewMode('reader');
            }}
            onSelectSurah={(num) => {
              const s = ALL_114_SURAHS.find((x) => x.number === num);
              if (s) {
                setSelectedSurahMeta(s);
                setViewMode('setup');
              }
            }}
            onClose={() => setShowQuickJump(false)}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. SURAH SETUP / OVERVIEW VIEW
  // =========================================================================
  if (viewMode === 'setup') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-3.5 animate-in fade-in duration-200 pb-2">
        <header className="flex items-center justify-between pt-1">
          <button
            onClick={() => setViewMode('list')}
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-200/90 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 flex items-center justify-center transition-all cursor-pointer shadow-[0_2px_10px_rgba(99,102,241,0.12)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.22)] ring-1 ring-slate-200/80 hover:ring-indigo-300 active:scale-95 group"
            aria-label="Back to Surah List"
            title="Back to Surah List"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuickJump(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-b from-indigo-50/90 via-indigo-100/60 to-indigo-50/80 border border-indigo-200/90 text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 text-xs font-bold shadow-[0_2px_10px_rgba(99,102,241,0.16)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.25)] ring-1 ring-indigo-200/80 cursor-pointer min-h-[40px] active:scale-95 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-indigo-600" />
              <span>Jump</span>
            </button>

            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-200/90 text-slate-800 hover:border-amber-200 text-xs font-bold shadow-[0_2px_10px_rgba(99,102,241,0.10)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.18)] ring-1 ring-slate-200/80 cursor-pointer min-h-[40px] active:scale-95 transition-all"
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>About</span>
            </button>
          </div>
        </header>

        {/* Main Setup Container */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-100 space-y-4 shadow-xs">
          {/* Top Surah Header with Tonal Canvas */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-indigo-50/30 to-white dark:from-indigo-950/40 dark:via-slate-850 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/60 flex items-start justify-between shadow-2xs">
            <div className="space-y-1">
              <span className="text-[10.5px] font-black uppercase tracking-wider block text-indigo-700 dark:text-indigo-300">
                SURAH {selectedSurahMeta.number} • {selectedSurahMeta.revelationType.toUpperCase()}
              </span>
              <h2 className="font-extrabold text-xl sm:text-2xl tracking-tight leading-tight text-slate-950 dark:text-slate-100">
                {selectedSurahMeta.transliteration}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                {selectedSurahMeta.translation}
              </p>
            </div>

            <div className="text-right">
              <span className="font-quran text-3xl sm:text-4xl font-bold block text-black dark:text-white leading-[2.2] overflow-visible" dir="rtl">
                {selectedSurahMeta.arabicName}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold mt-1 block">
                Juz {selectedSurahMeta.juzNumber} • Page {selectedSurahMeta.pageNumber}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">VERSES</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-slate-100">{selectedSurahMeta.totalAyahs} Ayahs</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">JUZ</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-slate-100">Juz {selectedSurahMeta.juzNumber}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">REVELATION</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-slate-100 capitalize">{selectedSurahMeta.revelationType}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">PAGE</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-slate-100">Page {selectedSurahMeta.pageNumber}</span>
            </div>
          </div>

          {/* Audio Recitation Card */}
          <div
            onClick={() => setShowQariModal(true)}
            className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <Headphones className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider block">ARABIC AUDIO</span>
                <p className="text-xs sm:text-sm font-extrabold text-slate-950 dark:text-slate-100">Reference Recitation Audio</p>
              </div>
            </div>

            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
              Audio Settings <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Loop & Repetition Config Card */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                <span>LOOP VERSES</span>
                <Info className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <span className="text-xs font-bold text-slate-950 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full shadow-2xs">
                Ayahs {loopFromAyah} – {loopToAyah}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10.5px] text-slate-600 dark:text-slate-400 font-bold block mb-1">FROM AYAH</label>
                <input
                  type="number"
                  min={1}
                  max={selectedSurahMeta.totalAyahs}
                  value={loopFromAyah}
                  onChange={(e) => setLoopFromAyah(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-slate-100 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-[10.5px] text-slate-600 dark:text-slate-400 font-bold block mb-1">TO AYAH</label>
                <input
                  type="number"
                  min={loopFromAyah}
                  max={selectedSurahMeta.totalAyahs}
                  value={loopToAyah}
                  onChange={(e) => setLoopToAyah(Math.min(selectedSurahMeta.totalAyahs, parseInt(e.target.value) || 1))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-950 dark:text-slate-100 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Loop Repeats */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10.5px] text-slate-600 font-bold uppercase tracking-wider">REPEATS</span>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-xl shadow-2xs">
                <button
                  onClick={() => setRepeatCount((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 border border-slate-200/70 text-slate-700 flex items-center justify-center text-xs font-black cursor-pointer shadow-2xs"
                >
                  -
                </button>
                <span className="text-xs font-black text-slate-900 px-1">{repeatCount}</span>
                <button
                  onClick={() => setRepeatCount((prev) => Math.min(20, prev + 1))}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 border border-slate-200/70 text-slate-700 flex items-center justify-center text-xs font-black cursor-pointer shadow-2xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Play in Loop CTA */}
            <button
              onClick={isLooping ? handleStopAudio : handleStartLoop}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
            >
              {isLooping ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isLooping ? 'Stop Loop Playback' : 'Play in loop'}</span>
            </button>
          </div>

          {/* Quick Reader Entry Card */}
          <button
            onClick={() => setViewMode('reader')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-white via-slate-50 to-slate-100/60 hover:from-slate-50 hover:to-slate-100 border border-slate-200/90 hover:border-indigo-300 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs min-h-[44px]"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Open in Full Quran Reader</span>
          </button>
        </div>

        {/* Reciter Modal */}
        {showQariModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-lg bg-white border border-slate-200 text-slate-900 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">Select Reciter (Qari)</h3>
                </div>
                <button
                  onClick={() => setShowQariModal(false)}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] rounded-full bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center cursor-pointer transition-all shadow-2xs active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {RECITERS_LIST.map((qari) => {
                  const isSelected = selectedQari.id === qari.id;
                  return (
                    <button
                      key={qari.id}
                      onClick={() => {
                        setSelectedQari(qari);
                        setShowQariModal(false);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all cursor-pointer border min-h-[56px] ${
                        isSelected
                          ? 'bg-indigo-50/60 border-indigo-500 text-slate-900 ring-1 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200/80 text-slate-900 hover:bg-slate-50 shadow-2xs'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm text-slate-900">{qari.name}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{qari.style}</p>
                        <p className="text-[10px] text-slate-400">{qari.origin} • {qari.bitrate}</p>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="font-quran text-lg font-bold block text-slate-950 dark:text-slate-100 leading-[2.2]" dir="rtl">
                          {qari.arabicName}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-1">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Quick Jump Modal */}
        {showQuickJump && (
          <QuickJumpModal
            currentSurahNumber={selectedSurahMeta.number}
            totalAyahs={selectedSurahMeta.totalAyahs}
            currentAyah={playingAyah || 1}
            currentPage={selectedSurahMeta.pageNumber}
            onJumpToAyah={(ayah) => {
              setPlayingAyah(ayah);
              setViewMode('reader');
              playAyahAudio(ayah);
            }}
            onJumpToPage={(pg) => {
              setActiveMushafPage(pg);
              setReaderTab('mushaf');
              setViewMode('reader');
            }}
            onSelectSurah={(num) => {
              const s = ALL_114_SURAHS.find((x) => x.number === num);
              if (s) setSelectedSurahMeta(s);
            }}
            onClose={() => setShowQuickJump(false)}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. QURAN READER VIEW: CARDS & MUSHAF MODES
  // =========================================================================
  return (
    <div className="w-full max-w-xl mx-auto space-y-3 animate-in fade-in duration-200 pb-2 px-1.5 sm:px-3">
      {/* Sticky Top Audio Player Bar */}
      {playingAyah !== null && (
        <div className="sticky top-2 z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-xl text-slate-900 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold">
                  Ayah {playingAyah} of {selectedSurahMeta.totalAyahs}
                </span>
                <span className="text-xs font-bold text-slate-900 truncate">
                  {selectedSurahMeta.transliteration}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                {selectedQari.name} {isLooping ? `(Loop ×${repeatRemaining})` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (playingAyah > 1) {
                    setPlayingAyah(playingAyah - 1);
                    playAyahAudio(playingAyah - 1);
                  }
                }}
                disabled={playingAyah <= 1}
                className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-200/80 hover:border-slate-300 text-slate-700 flex items-center justify-center disabled:opacity-40 cursor-pointer shadow-2xs active:scale-95 transition-all"
                title="Previous Ayah"
                aria-label="Previous Ayah"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleTogglePlayAyah(playingAyah)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 hover:from-indigo-900 hover:to-indigo-950 text-white flex items-center justify-center shadow-md active:scale-95 cursor-pointer border border-indigo-900/30 ring-2 ring-indigo-500/20 transition-all"
                title={isAudioPlaying ? 'Pause recitation' : 'Resume recitation'}
                aria-label={isAudioPlaying ? 'Pause recitation' : 'Resume recitation'}
              >
                {isAudioPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => {
                  if (playingAyah < selectedSurahMeta.totalAyahs) {
                    setPlayingAyah(playingAyah + 1);
                    playAyahAudio(playingAyah + 1);
                  }
                }}
                disabled={playingAyah >= selectedSurahMeta.totalAyahs}
                className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-200/80 hover:border-slate-300 text-slate-700 flex items-center justify-center disabled:opacity-40 cursor-pointer shadow-2xs active:scale-95 transition-all"
                title="Next Ayah"
                aria-label="Next Ayah"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleStopAudio}
                className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-200/80 text-slate-500 hover:text-slate-900 flex items-center justify-center ml-1 cursor-pointer shadow-2xs active:scale-95 transition-all"
                title="Close audio player"
                aria-label="Close audio player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar (Flows Right-to-Left for Arabic recitation) */}
          <div className="mt-2.5 flex items-center gap-2" dir="rtl">
            <span className="text-[10px] text-slate-400 font-mono w-8 text-right">
              {formatTime(audioCurrentTime)}
            </span>
            <div
              className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex flex-row justify-start cursor-pointer hover:bg-slate-200 transition-colors"
              dir="rtl"
              onClick={(e) => {
                if (audioRef.current && audioDuration > 0) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = 1 - (clickX / rect.width);
                  const targetTime = Math.max(0, Math.min(ratio * audioDuration, audioDuration));
                  audioRef.current.currentTime = targetTime;
                  setAudioCurrentTime(targetTime);
                  setAudioProgress((targetTime / audioDuration) * 100);
                }
              }}
            >
              <div
                className="h-full bg-gradient-to-l from-indigo-500 to-indigo-700 transition-all rounded-full"
                style={{ width: `${audioProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-mono w-8 text-left">
              {formatTime(audioDuration)}
            </span>
          </div>
        </div>
      )}

      {/* Top Bar with Jump & Display controls - Clean Responsive 2-Row Layout */}
      <div className="flex flex-col gap-2.5 px-0.5 py-1 w-full">
        {/* Row 1: Context & Navigation */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => setViewMode('setup')}
              className="w-9 h-9 rounded-xl bg-white border border-slate-300 text-slate-800 hover:text-indigo-700 hover:border-indigo-400 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 group shrink-0"
              title="Surah Settings & Overview"
            >
              <ArrowLeft className="w-4 h-4 text-slate-800 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center justify-between gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-indigo-300 text-slate-950 text-xs font-extrabold shadow-sm cursor-pointer h-9 whitespace-nowrap transition-all active:scale-95 flex-1 min-w-[120px]"
            >
              <span className="truncate">{selectedSurahMeta.transliteration}</span>
              <span className="w-4.5 h-4.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 flex items-center justify-center text-[9px] shrink-0">
                <Info className="w-2.5 h-2.5 text-amber-700" />
              </span>
            </button>
          </div>

          <button
            onClick={() => setShowQuickJump(true)}
            className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:text-indigo-800 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="Jump to Ayah / Juz"
          >
            <Navigation className="w-4 h-4 text-indigo-700" />
          </button>
        </div>

        {/* Row 2: Display Controls */}
        <div className="flex items-center gap-2 w-full">
          {/* Quick Font Size Stepper (A- / A+) */}
          <div className="flex items-center justify-between bg-white border border-slate-300 rounded-xl p-0.5 shadow-sm flex-1 h-9">
            <button
              onClick={() => handleStepFontSize(-2)}
              disabled={currentArabicPx <= 18}
              className="w-8 h-full rounded-lg flex items-center justify-center text-[10.5px] font-black text-slate-800 hover:text-black hover:bg-slate-100 disabled:opacity-30 cursor-pointer active:scale-90 transition-all shrink-0"
              title="Decrease Font Size (A-)"
              aria-label="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => setShowReaderSettings(true)}
              className="flex-1 h-full flex items-center justify-center px-1 text-[11px] font-mono font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-300 cursor-pointer transition-colors mx-0.5"
              title="Current font size - click for settings"
            >
              {currentArabicPx}px
            </button>
            <button
              onClick={() => handleStepFontSize(2)}
              disabled={currentArabicPx >= 60}
              className="w-8 h-full rounded-lg flex items-center justify-center text-[10.5px] font-black text-slate-800 hover:text-black hover:bg-slate-100 disabled:opacity-30 cursor-pointer active:scale-90 transition-all shrink-0"
              title="Increase Font Size (A+)"
              aria-label="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* [Cards] / [Mushaf] Toggle Pill */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-300 flex-1 h-9 shadow-inner">
            <button
              onClick={() => setReaderTab('cards')}
              className={`flex-1 h-full rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                readerTab === 'cards'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setReaderTab('mushaf')}
              className={`flex-1 h-full rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                readerTab === 'mushaf'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-700 hover:text-black'
              }`}
            >
              Mushaf
            </button>
          </div>
        </div>
      </div>

      {isLoadingSurah && !activeSurahContent ? (
        <div className="py-12 text-center space-y-3 bg-white rounded-2xl border border-slate-300 p-6 shadow-2xs">
          <div className="w-7 h-7 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Loading verses for Surah {selectedSurahMeta.name}...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 3A. CARDS VIEW */}
          {/* ========================================================================= */}
          {readerTab === 'cards' && activeSurahContent && (
            <div className="space-y-3">
              {/* Medina Mushaf Bismillah Opening Header for Surahs other than 1 and 9 */}
              {selectedSurahMeta.number !== 1 && selectedSurahMeta.number !== 9 && (
                <div className="text-center py-6 px-4 rounded-3xl bg-white border border-slate-300 shadow-2xs">
                  <p className="font-quran text-3xl sm:text-4xl font-bold text-black leading-loose overflow-visible dark:text-slate-100" dir="rtl">
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              )}

              {activeSurahContent.ayahs.map((ayah) => {
                const isAyahPlaying = playingAyah === ayah.number && isAudioPlaying;
                const isBookmarked = bookmarkedVerses[ayah.number] || false;
                const wordsList = getAyahWordsList(ayah);
                const activeWordIdx = isAyahPlaying
                  ? getActiveWordIndex({
                      surahNumber: activeSurahContent.number,
                      ayahNumber: ayah.number,
                      wordsCount: wordsList.length,
                      currentTimeSeconds: audioCurrentTime,
                      durationSeconds: audioDuration,
                      reciterKey: selectedQari.id || selectedQari.subfolder,
                      arabicWords: wordsList.map((w) => w.arabic),
                    })
                  : -1;

                return (
                  <div
                    key={ayah.number}
                    className={`p-3.5 sm:p-4.5 rounded-2xl transition-all border ${
                      isAyahPlaying
                        ? 'bg-white text-slate-950 border-2 border-indigo-600 shadow-md ring-2 ring-indigo-500/10'
                        : 'bg-white text-slate-950 border border-slate-300 shadow-2xs hover:border-slate-400'
                    }`}
                  >
                    {/* Verse Card Top Bar: Aligned, Compact Action Row */}
                    <div className="flex flex-col gap-2.5 pb-3 mb-3 border-b border-slate-200/80 w-full">
                      {/* Row 1: Utilities (Verse Pill, Bookmark, Download, Play) */}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 h-8 flex items-center shadow-xs">
                            Verse {ayah.number}
                          </div>
                          <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 h-8 rounded-lg border border-slate-200 shadow-2xs select-none hover:bg-slate-50 transition-colors" title="Toggle Tajweed Colorization">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider hidden sm:inline">Tajweed</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider sm:hidden">Taj</span>
                            <input 
                              type="checkbox" 
                              checked={displaySettings.showTajweed ?? false} 
                              onChange={(e) => {
                                const newSettings = { ...displaySettings, showTajweed: e.target.checked };
                                setDisplaySettings(newSettings);
                                saveStoredReaderSettings(newSettings);
                              }}
                              className="w-3.5 h-3.5 accent-emerald-500 rounded-sm cursor-pointer" 
                            />
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleBookmark(ayah)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                              isBookmarked
                                ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs'
                                : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-black border border-slate-200 shadow-xs'
                            }`}
                            title={isBookmarked ? 'Bookmarked' : 'Bookmark verse'}
                          >
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>

                          {/* Download Ayah Notes Button */}
                          <button
                            data-coach={ayah.number === 1 ? 'offline-download' : undefined}
                            onClick={async () => {
                              if (downloadingAyah === ayah.number) return;
                              setDownloadingAyah(ayah.number);
                              setDownloadProgress(0);
                              
                              const interval = setInterval(() => {
                                setDownloadProgress(p => {
                                  if (p >= 90) return 90;
                                  return p + 15;
                                });
                              }, 200);
                              await downloadAyahOfflineNotes(selectedSurahMeta.number, ayah.number);
                              
                              clearInterval(interval);
                              setDownloadProgress(100);
                              setTimeout(() => {
                                setDownloadingAyah(null);
                                setDownloadProgress(0);
                                setDownloadedAyahs(prev => ({ ...prev, [ayah.number]: true }));
                              }, 600);
                            }}
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                              downloadingAyah === ayah.number
                                ? 'bg-slate-50 border-slate-300'
                                : downloadedAyahs[ayah.number]
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                            title={downloadedAyahs[ayah.number] ? "Offline Notes Downloaded" : "Download Offline Notes for this Ayah"}
                            disabled={downloadingAyah === ayah.number}
                          >
                            <div className="relative w-4 h-4">
                              <DownloadCloud className={`absolute inset-0 w-4 h-4 ${
                                downloadingAyah === ayah.number 
                                  ? 'text-slate-300' 
                                  : downloadedAyahs[ayah.number] 
                                    ? 'text-emerald-500' 
                                    : 'text-slate-600'
                              }`} />
                              {downloadingAyah === ayah.number && (
                                <div
                                  className="absolute inset-0 text-emerald-500 overflow-hidden transition-all duration-200"
                                  style={{ clipPath: `inset(${100 - downloadProgress}% 0 0 0)` }}
                                >
                                  <DownloadCloud className="w-4 h-4 fill-current" />
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Play Button */}
                        <button
                          onClick={() => handleTogglePlayAyah(ayah.number)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 ${
                            isAyahPlaying
                              ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                              : 'bg-slate-950 hover:bg-slate-800 text-white'
                          }`}
                          aria-label={`Play verse ${ayah.number}`}
                        >
                          {isAyahPlaying ? (
                            <Pause className="w-3 h-3 fill-current" />
                          ) : (
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Deep Actions (Stretched evenly) */}
                    <div className="flex items-center gap-2 w-full">
                      {/* 6-Step Memorization Lesson Button */}
                      <button
                        onClick={() => onStartLesson(selectedSurahMeta.number, ayah.number)}
                        className="flex-1 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-[11px] font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
                        title="Start Memorization Lesson for this Ayah"
                      >
                        <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Memorize</span>
                      </button>

                      {/* Tafsir & Reflections Button */}
                      <button
                        onClick={() => {
                          setSelectedTafsirAyah(ayah);
                          setInitialTafsirTab('exegesis');
                        }}
                        className="flex-1 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
                        title="Open Tafsir & Word Meanings"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                        <span>Tafsir</span>
                      </button>
                    </div>
                  </div>

                  {/* Arabic Calligraphy - High Contrast, Solid Charcoal / Crisp Text */}
                    <div className="my-2 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 transition-all">
                      {memorizeMode ? (
                        <div className="flex flex-wrap gap-1.5 items-center justify-start leading-loose" dir="rtl">
                          {wordsList.map((w, widx) => {
                            const isWordActive = isAyahPlaying && widx === activeWordIdx;
                            const isRevealed = revealedWords[`${ayah.number}-${w.id || widx + 1}`] || isWordActive;
                            return (
                              <button
                                key={w.id || widx}
                                onClick={() => handleToggleWordReveal(ayah.number, w.id || widx + 1)}
                                style={getArabicStyle()}
                                className={`font-bold font-quran px-2 py-0.5 rounded-lg transition-all cursor-pointer text-black ${
                                  isWordActive
                                    ? 'bg-amber-300 text-slate-950 font-black ring-2 ring-amber-400 shadow-md scale-105 inline-block'
                                    : isRevealed
                                    ? 'bg-amber-100 text-black border border-amber-300 shadow-2xs'
                                    : 'bg-slate-200 text-slate-600 border border-slate-300'
                                } dark:text-slate-100`}
                                title="Click to reveal / hide word"
                              >
                                {isRevealed ? (displaySettings.showTajweed ? annotateText(w.arabic) : w.arabic) : '••••'}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          className="flex flex-wrap gap-x-2.5 gap-y-1.5 items-center justify-start text-right text-black"
                          dir="rtl"
                          style={{ lineHeight: getArabicStyle().lineHeight }}
                        >
                          {wordsList.map((w, widx) => {
                            const isWordActive = isAyahPlaying && widx === activeWordIdx;
                            return (
                              <span
                                key={w.id || widx}
                                onClick={() => {
                                  if (displaySettings.showWordHints) {
                                    setSelectedWordInspector({
                                      word: w.arabic,
                                      ayahNumber: ayah.number,
                                      wordIdx: widx + 1,
                                      transliteration: w.transliteration,
                                      translation: w.translation,
                                    });
                                  }
                                }}
                                style={getArabicStyle()}
                                className={`font-bold font-quran transition-all duration-150 cursor-pointer rounded-lg px-1.5 py-0.5 ${
                                  isWordActive
                                    ? 'bg-amber-300 text-slate-950 font-black ring-2 ring-amber-400 shadow-md scale-105 inline-block'
                                    : displaySettings.showWordHints
                                    ? 'text-black hover:bg-indigo-100 hover:text-indigo-900'
                                    : 'text-black'
                                } dark:text-slate-100`}
                              >
                                {displaySettings.showTajweed ? annotateText(w.arabic) : w.arabic}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Standardized Ayah Meta Bar */}
                    <div className="flex items-center justify-between pt-0.5 pb-1 px-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {displaySettings.showWordHints ? '💡 Tap any word for Tajweed breakdown' : ''}
                      </span>
                      <div className="flex items-center gap-1.5 ml-auto">
                        <AyahNumberBadge
                          ayahNumber={ayah.number}
                          surahNumber={selectedSurahMeta.number}
                          variant={isAyahPlaying ? 'gold' : 'subtle'}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Transliteration */}
                    {displaySettings.showTransliteration && !memorizeMode && (
                      <div className="pt-1.5 border-t border-slate-200">
                        <p className="text-xs text-slate-600 font-serif italic leading-relaxed">
                          {ayah.transliteration}
                        </p>
                      </div>
                    )}

                    {/* English Translation */}
                    {displaySettings.showTranslation && (
                      <div className="pt-1">
                        <p className={`text-slate-900 font-sans font-normal ${getTranslationFontClass()}`}>
                          {ayah.translation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3B. MUSHAF VIEW (Clean, single-card layout) */}
          {/* ========================================================================= */}
          {readerTab === 'mushaf' && activeSurahContent && (
            <div className="space-y-3">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 shadow-2xs space-y-3">
                {/* Top Mushaf Header Ribbon */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5 shadow-2xs">
                  <h2 className="font-quran text-2xl sm:text-3xl font-bold text-black leading-[2.2] overflow-visible dark:text-slate-100" dir="rtl">
                    {activeSurahContent.arabicName}
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-slate-700 font-extrabold tracking-wider uppercase">
                    {activeSurahContent.transliteration.toUpperCase()} • JUZ {activeSurahContent.juzNumber}
                  </p>
                </div>

                {/* Bismillah Opening */}
                {activeSurahContent.number !== 9 && (
                  <div className="text-center py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <p className="font-quran text-2xl sm:text-3xl font-bold text-black leading-[2.2] overflow-visible dark:text-slate-100" dir="rtl">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                    </p>
                  </div>
                )}

                {/* Classical Flowing Ayahs */}
                <div className="p-3.5 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200 shadow-2xs text-justify space-y-2" dir="rtl">
                  <p className="text-black font-bold font-quran leading-loose dark:text-slate-100" style={getArabicStyle()}>
                    {activeSurahContent.ayahs.map((ayah) => {
                      const isSelected = playingAyah === ayah.number && isAudioPlaying;
                      const wordsList = getAyahWordsList(ayah);
                      const activeWordIdx = isSelected
                        ? getActiveWordIndex({
                            surahNumber: activeSurahContent.number,
                            ayahNumber: ayah.number,
                            wordsCount: wordsList.length,
                            currentTimeSeconds: audioCurrentTime,
                            durationSeconds: audioDuration,
                            reciterKey: selectedQari.id || selectedQari.subfolder,
                            arabicWords: wordsList.map((w) => w.arabic),
                          })
                        : -1;

                      return (
                        <span
                          key={ayah.number}
                          onClick={() => handleTogglePlayAyah(ayah.number)}
                          className={`inline transition-colors px-0.5 rounded-lg cursor-pointer text-black ${
                            isSelected ? 'bg-amber-50/90 ring-1 ring-amber-300' : 'hover:text-indigo-700'
                          }`}
                        >
                          {wordsList.map((w, widx) => {
                            const isWordActive = isSelected && widx === activeWordIdx;
                            return (
                              <span
                                key={w.id || widx}
                                onClick={(e) => {
                                  if (displaySettings.showWordHints) {
                                    e.stopPropagation();
                                    setSelectedWordInspector({
                                      word: w.arabic,
                                      ayahNumber: ayah.number,
                                      wordIdx: widx + 1,
                                      transliteration: w.transliteration,
                                      translation: w.translation,
                                    });
                                  }
                                }}
                                className={`transition-all duration-150 inline-block mx-0.5 rounded px-1 cursor-pointer hover:bg-amber-100 ${
                                  isWordActive
                                    ? 'bg-amber-300 text-slate-950 font-black ring-2 ring-amber-400 shadow-sm scale-105'
                                    : ''
                                }`}
                              >
                                {displaySettings.showTajweed ? annotateText(w.arabic) : w.arabic}
                              </span>
                            );
                          })}{' '}
                          <span className={`inline-flex items-center justify-center w-6 h-6 mx-1 align-middle rounded-full border text-[11px] font-bold select-none shadow-2xs ${
                            isSelected ? 'bg-amber-400 text-amber-950 border-amber-500 font-black' : 'bg-amber-100 border-amber-300 text-amber-950'
                          }`}>
                            ﴿{toArabicNumerals(ayah.number)}﴾
                          </span>{' '}
                        </span>
                      );
                    })}
                  </p>
                </div>
              </div>

              {/* Mushaf Page Navigation Controls */}
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-white border border-slate-300 shadow-2xs">
                <button
                  onClick={() => setActiveMushafPage((prev) => Math.max(1, prev - 1))}
                  disabled={activeMushafPage === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 disabled:opacity-40 cursor-pointer min-h-[36px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs font-extrabold text-slate-950">
                  Page {activeMushafPage} of 604
                </span>

                <button
                  onClick={() => setActiveMushafPage((prev) => Math.min(604, prev + 1))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer min-h-[36px]"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Word Inspector & Tajweed Modal */}
      {selectedWordInspector && activeSurahContent && (
        <WordInspectorModal
          isOpen={true}
          onClose={() => setSelectedWordInspector(null)}
          surahNumber={activeSurahContent.number}
          surahName={activeSurahContent.name}
          ayahNumber={selectedWordInspector.ayahNumber}
          wordIdx={selectedWordInspector.wordIdx}
          wordText={selectedWordInspector.word}
          transliteration={selectedWordInspector.transliteration}
          translation={selectedWordInspector.translation}
          onOpenTafsir={() => {
            const ayahObj = activeSurahContent?.ayahs.find((a) => a.number === selectedWordInspector.ayahNumber);
            if (ayahObj) setSelectedTafsirAyah(ayahObj);
          }}
        />
      )}

      {/* Surah About Modal */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowInfoModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`About Surah ${selectedSurahMeta.transliteration}`}
        >
          <div
            className="w-full max-w-lg bg-white border border-slate-200 text-slate-900 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">About Surah {selectedSurahMeta.transliteration}</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-full bg-gradient-to-b from-white via-slate-50 to-slate-100 border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center cursor-pointer transition-all shadow-2xs active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">CHAPTER NUMBER</span>
                  <p className="text-lg font-black text-slate-900">Surah #{selectedSurahMeta.number}</p>
                </div>
                <div className="text-right">
                  <span className="font-quran text-2xl font-bold text-slate-950 dark:text-slate-100 leading-[2.2] overflow-visible block" dir="rtl">{selectedSurahMeta.arabicName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Revelation</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedSurahMeta.revelationType}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Verses</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">{selectedSurahMeta.totalAyahs} Ayahs</p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Juz (Section)</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">Juz {selectedSurahMeta.juzNumber}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Mushaf Page</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">Page {selectedSurahMeta.pageNumber}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">English Meaning</h4>
                <p className="text-sm font-bold text-[#6366F1]">{selectedSurahMeta.translation}</p>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  Surah {selectedSurahMeta.transliteration} is a profound {selectedSurahMeta.revelationType.toLowerCase()} chapter of the Holy Quran consisting of {selectedSurahMeta.totalAyahs} noble verses, situated in Juz {selectedSurahMeta.juzNumber}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tafsir Modal */}
      {selectedTafsirAyah && activeSurahContent && (
        <TafsirModal
          surahNumber={activeSurahContent.number}
          ayahNumber={selectedTafsirAyah.number}
          surahName={activeSurahContent.transliteration}
          arabicText={selectedTafsirAyah.arabic}
          translation={selectedTafsirAyah.translation}
          transliteration={selectedTafsirAyah.transliteration}
          initialTab={initialTafsirTab}
          onClose={() => setSelectedTafsirAyah(null)}
        />
      )}

      {/* Quick Jump Modal */}
      {showQuickJump && (
        <QuickJumpModal
          currentSurahNumber={selectedSurahMeta.number}
          totalAyahs={selectedSurahMeta.totalAyahs}
          currentAyah={playingAyah || 1}
          currentPage={selectedSurahMeta.pageNumber}
          onJumpToAyah={(ayah) => {
            setPlayingAyah(ayah);
            playAyahAudio(ayah);
          }}
          onJumpToPage={(pg) => {
            setActiveMushafPage(pg);
            setReaderTab('mushaf');
          }}
          onSelectSurah={(num) => {
            const s = ALL_114_SURAHS.find((x) => x.number === num);
            if (s) setSelectedSurahMeta(s);
          }}
          onClose={() => setShowQuickJump(false)}
        />
      )}

      {/* Reader Settings Modal */}
      {showReaderSettings && (
        <ReaderSettingsModal
          settings={displaySettings}
          onUpdateSettings={handleUpdateDisplaySettings}
          onClose={() => setShowReaderSettings(false)}
        />
      )}

      {/* Contextual Coach Mark: Offline Downloads */}
      <CoachMarkOverlay
        featureKey="offline_downloads"
        targetSelector='[data-coach="offline-download"]'
        badge="Offline Study"
        title="Offline Study & Tafsir Notes"
        description="Download formatted study sheets, Arabic calligraphy, and thematic Tafsir notes directly to your device for offline review."
        icon={DownloadCloud}
      />
    </div>
  );
};
