import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Star,
  Flame,
  Check,
  Lock,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  BookOpen,
  Sparkles,
  Trophy,
  Shield,
  Zap,
  Play,
  Pause,
  Filter,
  Layers,
  Compass,
  CheckCircle2,
  Info,
  Gift,
  Award,
  Target,
  ChevronRightSquare,
  ListTree,
} from 'lucide-react';
import {
  getRetentionDatabase,
  getMemorizationStatsSummary,
  getDueReviewAyahs,
  getUserProgression,
  isAyahAccessible,
  isSurahUnlocked,
  clearLearningHistory,
  getActiveAyahForSurah,
  getGlobalOrder,
  getUserPlan,
  AyahRetentionRecord,
  AyahMasteryState,
  MemorizationPlan,
} from '../../services/memorizationEngine';
import { SURAH_CONTENT_DB, AyahDetail, SurahContent } from '../../data/quranVerses';
import { ALL_114_SURAHS, SurahMeta } from '../../data/quranMetadata';
import { getSurahThematicProfile, SurahThematicProfile } from '../journey/surahThemes';
import { getAyahAudioUrl } from '../../services/quranDataService';
import { globalAudioManager } from '../../services/globalAudioManager';
import { useScrollLock } from '../../hooks/useScrollLock';

export interface MemorizationJourneyProps {
  onStartLesson: (surahNumber?: number, ayahNumber?: number) => void;
  onExploreSurah: (surahNumber: number) => void;
  onOpenAudio?: (surahNumber?: number) => void;
  onNavigateToReview?: () => void;
  onOpenSurahTest?: (surahNumber: number) => void;
  onOpenPlanModal?: () => void;
  className?: string;
}

interface JourneyAyahNode {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabicSnippet: string;
  transliterationSnippet: string;
  translationSnippet: string;
  state: AyahMasteryState;
  retentionScore: number;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewAt: number;
  stars: number; // 0 to 3
  isMilestone?: boolean;
  position: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
}

interface JourneySurahSection {
  surahNumber: number;
  meta: SurahMeta;
  profile: SurahThematicProfile;
  content?: SurahContent;
  ayahNodes: JourneyAyahNode[];
  masteredCount: number;
  totalAyahs: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
}

export const MemorizationJourney: React.FC<MemorizationJourneyProps> = ({
  onStartLesson,
  onExploreSurah,
  onOpenAudio,
  onNavigateToReview,
  onOpenSurahTest,
  onOpenPlanModal,
  className = '',
}) => {
  // Local state
  const [retentionDb, setRetentionDb] = useState<Record<string, AyahRetentionRecord>>(() => getRetentionDatabase());
  const [stats, setStats] = useState(() => getMemorizationStatsSummary());
  const [progression, setProgression] = useState(() => getUserProgression());
  const [userPlan, setUserPlan] = useState<MemorizationPlan>(() => getUserPlan());
  const [selectedJuzFilter, setSelectedJuzFilter] = useState<number | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'due' | 'active' | 'mastered'>('all');
  const [selectedAyahNode, setSelectedAyahNode] = useState<JourneyAyahNode | null>(null);
  useScrollLock(!!selectedAyahNode);

  // Expanded Surahs state (only tapped Surahs reveal their Ayah-level nodes)
  const [expandedSurahs, setExpandedSurahs] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    const activeSurah = progression.currentSurah || userPlan.selectedSurahs?.[0] || 1;
    initial.add(activeSurah);
    return initial;
  });
  
  // Audio playback state for preview
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync with retention DB and user plan updates
  useEffect(() => {
    const refreshData = () => {
      setRetentionDb(getRetentionDatabase());
      setStats(getMemorizationStatsSummary());
      setProgression(getUserProgression());
      setUserPlan(getUserPlan());
    };
    refreshData();
    window.addEventListener('storage', refreshData);
    window.addEventListener('hafiz_progress_updated', refreshData);
    return () => {
      window.removeEventListener('storage', refreshData);
      window.removeEventListener('hafiz_progress_updated', refreshData);
    };
  }, []);

  const toggleSurahExpanded = (surahNumber: number) => {
    setExpandedSurahs((prev) => {
      const next = new Set(prev);
      if (next.has(surahNumber)) {
        next.delete(surahNumber);
      } else {
        next.add(surahNumber);
      }
      return next;
    });
  };

  const expandAllSurahs = () => {
    const allNumbers = ALL_114_SURAHS.map((s) => s.number);
    setExpandedSurahs(new Set(allNumbers));
  };

  const collapseAllSurahs = () => {
    setExpandedSurahs(new Set());
  };

  const handleResetHistory = () => {
    if (window.confirm('Are you sure you want to reset all learning history and start fresh from Surah Al-Fatihah (Ayah 1)?')) {
      clearLearningHistory();
      setRetentionDb(getRetentionDatabase());
      setStats(getMemorizationStatsSummary());
      setProgression(getUserProgression());
      setUserPlan(getUserPlan());
      setSelectedAyahNode(null);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggleAudio = (surahNumber: number, ayahNumber: number) => {
    const key = `${surahNumber}:${ayahNumber}`;
    if (playingAudioKey === key) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioKey(null);
    } else {
      globalAudioManager.stopAll(`journey-node-${key}`);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const url = getAyahAudioUrl(surahNumber, ayahNumber);
      const audio = new Audio(url);
      audioRef.current = audio;

      const unregister = globalAudioManager.registerAudioElement(audio, `journey-node-${key}`, () => {
        try {
          if (!audio.paused) audio.pause();
        } catch {}
        setPlayingAudioKey(null);
      });

      audio.play().catch(() => {
        unregister();
        setPlayingAudioKey(null);
      });
      setPlayingAudioKey(key);
      audio.onended = () => {
        unregister();
        setPlayingAudioKey(null);
      };
      audio.onerror = () => {
        unregister();
        setPlayingAudioKey(null);
      };
    }
  };

  // Build the list of active Surah sections for the journey path strictly based on the user's memorization plan
  const journeySurahSections: JourneySurahSection[] = useMemo(() => {
    // 1. Determine which surahs belong to the user's chosen plan
    let baseSurahNumbers: number[] = [];

    if (userPlan.planType === 'full_quran') {
      // Whole Quran: all 114 surahs
      baseSurahNumbers = ALL_114_SURAHS.map((s) => s.number);
    } else if (userPlan.planType === 'single_surah') {
      // Single Surah plan: focus strictly on the chosen single surah
      baseSurahNumbers = userPlan.selectedSurahs && userPlan.selectedSurahs.length > 0
        ? [userPlan.selectedSurahs[0]]
        : [progression.currentSurah || 67];
    } else if (userPlan.planType === 'package') {
      // Curated Package: e.g. Juz 30 (78..114), 4 Quls (109, 112, 113, 114), etc.
      baseSurahNumbers = userPlan.selectedSurahs && userPlan.selectedSurahs.length > 0
        ? userPlan.selectedSurahs
        : ALL_114_SURAHS.filter((s) => s.juzNumber === 30).map((s) => s.number);
    } else if (userPlan.planType === 'custom_selection') {
      // Custom selection of surahs chosen by user
      baseSurahNumbers = userPlan.selectedSurahs && userPlan.selectedSurahs.length > 0
        ? userPlan.selectedSurahs
        : [1, 2];
    } else {
      baseSurahNumbers = ALL_114_SURAHS.map((s) => s.number);
    }

    // Filter by Juz if user selected a specific Juz in the filter bar (only applicable if more than 1 surah)
    const surahList = ALL_114_SURAHS.filter((s) => {
      const isInPlan = baseSurahNumbers.includes(s.number);
      if (!isInPlan) return false;
      if (selectedJuzFilter === 'all') return true;
      return s.juzNumber === selectedJuzFilter;
    });

    // Sequence positions for the serpentine winding game path
    const positionCycle: ('left' | 'center-left' | 'center' | 'center-right' | 'right')[] = [
      'center',
      'center-left',
      'left',
      'center-left',
      'center',
      'center-right',
      'right',
      'center-right',
    ];

    return surahList.map((meta) => {
      const profile = getSurahThematicProfile(meta.number);
      const content = SURAH_CONTENT_DB[meta.number];
      const totalAyahs = meta.totalAyahs;

      // Build Ayah nodes for this Surah
      const availableVersesCount = content ? content.ayahs.length : Math.min(meta.totalAyahs, 10);
      const ayahNodes: JourneyAyahNode[] = [];

      for (let a = 1; a <= availableVersesCount; a++) {
        const key = `${meta.number}:${a}`;
        const record = retentionDb[key];
        const verseDetail = content?.ayahs.find((v) => v.number === a);

        let state: AyahMasteryState = 'LOCKED';
        let retentionScore = 0;
        let easeFactor = 2.5;
        let intervalDays = 1;
        let repetitions = 0;
        let nextReviewAt = 0;
        let stars = 0;

        if (record) {
          state = record.state || (record.stage === 'manzil' ? 'MASTERED' : record.stage === 'sabqi' ? 'RECALLING' : 'LEARNING');
          retentionScore = record.retentionScore ?? (record.stage === 'manzil' ? 95 : record.stage === 'sabqi' ? 80 : 50);
          easeFactor = record.easeFactor || 2.5;
          intervalDays = record.intervalDays || 1;
          repetitions = record.repetitions || 0;
          nextReviewAt = record.nextReviewAt || 0;

          if (state === 'MASTERED') {
            stars = 3;
          } else if (state === 'RECALLING') {
            stars = 2;
          } else if (state === 'PRACTICING' || state === 'LEARNING') {
            stars = 1;
          } else if (state === 'DUE_FOR_REVIEW') {
            stars = retentionScore >= 80 ? 2 : 1;
          }
        } else {
          // Dynamic calculation based on progression sequence
          const accessible = isAyahAccessible(meta.number, a);
          if (accessible) {
            state = 'LEARNING';
            stars = 0;
          } else {
            state = 'LOCKED';
            stars = 0;
          }
        }

        const isMilestone = a === 1 || a === 5 || a === 10 || a === totalAyahs;
        const posIndex = (a - 1) % positionCycle.length;

        ayahNodes.push({
          id: `node-${meta.number}-${a}`,
          surahNumber: meta.number,
          surahName: meta.name,
          ayahNumber: a,
          arabicSnippet: verseDetail?.arabic || `آية ${a}`,
          transliterationSnippet: verseDetail?.transliteration || `Ayah ${a}`,
          translationSnippet: verseDetail?.translation || `Verse ${a} of Surah ${meta.name}`,
          state,
          retentionScore,
          easeFactor,
          intervalDays,
          repetitions,
          nextReviewAt,
          stars,
          isMilestone,
          position: positionCycle[posIndex],
        });
      }

      const masteredCount = ayahNodes.filter((n) => {
        const key = `${meta.number}:${n.ayahNumber}`;
        const rec = retentionDb[key];
        if (rec && (rec.stage === 'sabqi' || rec.stage === 'manzil')) return true;
        const global = getGlobalOrder(meta.number, n.ayahNumber);
        return global <= (progression.furthestMemorizedGlobalOrder || 0);
      }).length;
      const isCompleted = masteredCount >= totalAyahs || (meta.number === 1 && masteredCount >= 7);
      const isCurrent = meta.number === progression.currentSurah || ayahNodes.some((n) => n.state === 'PRACTICING' || n.state === 'RECALLING' || n.state === 'LEARNING' || n.state === 'DUE_FOR_REVIEW');
      const isUnlocked = isSurahUnlocked(meta.number) || isCompleted || isCurrent;

      return {
        surahNumber: meta.number,
        meta,
        profile,
        content,
        ayahNodes,
        masteredCount,
        totalAyahs,
        isUnlocked,
        isCompleted,
        isCurrent,
      };
    });
  }, [retentionDb, selectedJuzFilter, progression, userPlan]);

  // Filter sections and nodes based on status filter
  const filteredSections = useMemo(() => {
    if (selectedStatusFilter === 'all') return journeySurahSections;

    return journeySurahSections
      .map((sec) => {
        const filteredNodes = sec.ayahNodes.filter((node) => {
          if (selectedStatusFilter === 'due') {
            return node.state === 'DUE_FOR_REVIEW' || (node.nextReviewAt > 0 && node.nextReviewAt <= Date.now());
          }
          if (selectedStatusFilter === 'active') {
            return node.state === 'LEARNING' || node.state === 'PRACTICING' || node.state === 'RECALLING';
          }
          if (selectedStatusFilter === 'mastered') {
            return node.state === 'MASTERED';
          }
          return true;
        });

        return {
          ...sec,
          ayahNodes: filteredNodes,
        };
      })
      .filter((sec) => sec.ayahNodes.length > 0 || selectedStatusFilter === 'all');
  }, [journeySurahSections, selectedStatusFilter]);

  // Position horizontal alignment classes
  const getPositionClass = (pos: JourneyAyahNode['position']) => {
    switch (pos) {
      case 'left':
        return 'translate-x-[-70px] sm:translate-x-[-110px]';
      case 'center-left':
        return 'translate-x-[-35px] sm:translate-x-[-55px]';
      case 'center':
        return 'translate-x-0';
      case 'center-right':
        return 'translate-x-[35px] sm:translate-x-[55px]';
      case 'right':
        return 'translate-x-[70px] sm:translate-x-[110px]';
      default:
        return 'translate-x-0';
    }
  };

  // Node styling by mastery state using existing color palette
  const getNodeVisualStyles = (state: AyahMasteryState, isSelected: boolean) => {
    switch (state) {
      case 'MASTERED':
        return {
          bg: 'bg-gradient-to-b from-emerald-400 to-emerald-600',
          border: 'border-emerald-200 ring-4 ring-emerald-500/25',
          text: 'text-white font-black',
          shadow: 'shadow-lg shadow-emerald-600/30',
          glow: 'bg-emerald-400/20',
          badgeText: 'Mastered',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          starColor: 'fill-amber-300 text-amber-300',
        };
      case 'RECALLING':
        return {
          bg: 'bg-gradient-to-b from-indigo-500 to-indigo-700',
          border: 'border-indigo-200 ring-4 ring-indigo-500/30',
          text: 'text-white font-black',
          shadow: 'shadow-lg shadow-indigo-600/30 animate-pulse',
          glow: 'bg-indigo-400/20',
          badgeText: 'Recalling',
          badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          starColor: 'fill-amber-300 text-amber-300',
        };
      case 'PRACTICING':
      case 'LEARNING':
        return {
          bg: 'bg-gradient-to-b from-sky-400 to-blue-600',
          border: 'border-sky-200 ring-4 ring-sky-500/25',
          text: 'text-white font-black',
          shadow: 'shadow-md shadow-sky-600/20',
          glow: 'bg-sky-400/20',
          badgeText: 'Learning',
          badgeBg: 'bg-sky-50 text-sky-800 border-sky-200',
          starColor: 'fill-amber-300 text-amber-300',
        };
      case 'DUE_FOR_REVIEW':
      case 'NEEDS_REINFORCEMENT':
        return {
          bg: 'bg-gradient-to-b from-amber-400 to-amber-600',
          border: 'border-amber-200 ring-4 ring-amber-500/40',
          text: 'text-slate-950 font-black',
          shadow: 'shadow-xl shadow-amber-500/40 animate-bounce',
          glow: 'bg-amber-400/30',
          badgeText: 'Due for Review',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          starColor: 'fill-slate-900 text-slate-900',
        };
      case 'LOCKED':
      default:
        return {
          bg: 'bg-slate-100',
          border: 'border-slate-300 ring-2 ring-slate-200/50',
          text: 'text-slate-400 font-bold',
          shadow: 'shadow-xs',
          glow: 'transparent',
          badgeText: 'Locked',
          badgeBg: 'bg-slate-100 text-slate-500 border-slate-200',
          starColor: 'fill-slate-300 text-slate-300',
        };
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto space-y-3.5 pb-12 box-border select-none ${className}`}>
      {/* 1. TOP QUEST HUD */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border border-slate-200/80 p-3.5 rounded-2xl shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Level / Rank Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs border border-amber-300 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 truncate">
                  {progression.userXP >= 500 ? 'Level 2 • Hafiz Student' : 'Level 1 • Hafiz Beginner'} • {progression.userXP} XP
                </span>
              </div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight mt-0.5 truncate">
                Quran Memorization Map
              </h2>
            </div>
          </div>

          {/* Action buttons: Reset & Due Reviews */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenPlanModal && (
              <button
                onClick={onOpenPlanModal}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-200/80 transition-colors cursor-pointer"
                title="Change Memorization Strategy & Plan"
              >
                <Target className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Plan</span>
              </button>
            )}

            <button
              onClick={handleResetHistory}
              title="Reset progress to start fresh from Surah Al-Fatihah"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {(stats.dueTodayCount > 0 || (stats as any).dueCount > 0) && (
              <button
                onClick={onNavigateToReview || (() => onStartLesson(1, 1))}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold flex items-center gap-1 shadow-xs transition-colors cursor-pointer animate-pulse shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{stats.dueTodayCount || (stats as any).dueCount || 0} Due</span>
              </button>
            )}
          </div>
        </div>

        {/* ACTIVE STRATEGY CONTEXT BANNER */}
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50/70 via-white to-indigo-50/50 border border-amber-200/70 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-slate-900 truncate">
                  {stats.planTitle || "Whole Qur'an"}
                </span>
                <span className="text-[9.5px] font-bold text-amber-800 uppercase px-1.5 py-0.2 rounded bg-amber-100/70 border border-amber-200/60">
                  {userPlan.planType === 'full_quran'
                    ? '114 Surahs'
                    : userPlan.planType === 'single_surah'
                    ? 'Single Surah'
                    : userPlan.planType === 'package'
                    ? 'Package'
                    : 'Custom Surahs'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                {journeySurahSections.length} Surah{journeySurahSections.length === 1 ? '' : 's'} on map • Tap any Surah to open verse steps
              </p>
            </div>
          </div>

          {/* Quick Expand All / Collapse All Toggle */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={expandAllSurahs}
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Expand all Surahs to view all Ayah nodes"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllSurahs}
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Collapse all Surahs to names only"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Quest Stats Metrics Row (3-Column Grid) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Mastered Ayahs */}
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase truncate">Mastered</p>
              <p className="font-extrabold text-xs sm:text-sm text-emerald-800">{stats.masteredCount} Ayahs</p>
            </div>
          </div>

          {/* Retention Strength */}
          <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase truncate">Retention</p>
              <p className="font-extrabold text-xs sm:text-sm text-indigo-800">{stats.averageRetention}%</p>
            </div>
          </div>

          {/* Daily Streak */}
          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase truncate">Streak</p>
              <p className="font-extrabold text-xs sm:text-sm text-amber-800">{progression.streakDays} Day{progression.streakDays === 1 ? '' : 's'}</p>
            </div>
          </div>
        </div>

        {/* Filter Bar (Juz and Mastery States - only show Juz filter if multiple Surahs) */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pt-0.5 no-scrollbar text-xs">
          {journeySurahSections.length > 1 && (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Juz:</span>
              {(['all', 1, 29, 30] as const).map((juz) => (
                <button
                  key={juz}
                  onClick={() => setSelectedJuzFilter(juz)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    selectedJuzFilter === juz
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {juz === 'all' ? 'All' : `Juz ${juz}`}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 shrink-0 ml-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase">State:</span>
            {(['all', 'due', 'active', 'mastered'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs capitalize transition-all cursor-pointer ${
                  selectedStatusFilter === status
                    ? 'bg-amber-400 text-slate-950 shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. GAME-STYLE JOURNEY PATH ROAD */}
      <div className="relative w-full pt-2 space-y-6">
        {filteredSections.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-xl border border-amber-200">
              🗺️
            </div>
            <h4 className="font-extrabold text-sm text-slate-900">No Surahs Match the Filter</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Try switching back to all Juz or clearing the status filter to view your full memorization journey.
            </p>
            <button
              onClick={() => {
                setSelectedJuzFilter('all');
                setSelectedStatusFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer"
            >
              Reset Filters & Show All
            </button>
          </div>
        ) : (
          filteredSections.map((section, sIdx) => {
          const { profile, meta, ayahNodes, isCompleted, isCurrent, isUnlocked } = section;
          const isExpanded = expandedSurahs.has(meta.number);
          const activeStage = getActiveAyahForSurah(meta.number, retentionDb);
          const activeAyahInSurah = activeStage.ayahNumber;
          const activeStepInSurah = activeStage.stepNumber;

          return (
            <div key={meta.number} className="relative space-y-4">
              {/* SURAH LANDMARK CARD: Shows Surah Name & Summary; Tapping expands/collapses Ayah level */}
              <div
                onClick={() => toggleSurahExpanded(meta.number)}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all p-4 sm:p-4.5 cursor-pointer hover:shadow-md ${
                  profile.palette.borderColor
                } ${
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-50 via-white to-[#FAF9F5] shadow-xs border-emerald-300 hover:border-emerald-400'
                    : isCurrent
                    ? 'bg-gradient-to-br from-indigo-50/70 via-white to-[#FAF9F5] shadow-xs border-indigo-300 hover:border-indigo-400'
                    : 'bg-white shadow-2xs hover:border-amber-300'
                }`}
              >
                {/* Background Islamic Watermark Pattern */}
                <div className="absolute right-[-15px] top-[-15px] text-slate-900/5 select-none pointer-events-none text-8xl font-amiri font-bold dark:text-slate-100">
                  {meta.number}
                </div>

                {/* Landmark Card Header */}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Landmark Crown Badge */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-xs border shrink-0 transition-transform group-hover:scale-105 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span>{profile.landmarkEmoji || '🕌'}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border ${profile.palette.badgeBg} ${profile.palette.badgeText}`}>
                          Surah #{meta.number} • {meta.revelationType}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Juz {meta.juzNumber}
                        </span>
                      </div>

                      {/* Surah Name and Arabic Name */}
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight mt-0.5 group-hover:text-indigo-600 transition-colors truncate">
                        {meta.name}{' '}
                        <span className="font-amiri font-bold text-emerald-800 text-sm sm:text-base mr-1">
                          ({meta.arabicName})
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium truncate">{profile.subtitle || meta.translation}</p>
                    </div>
                  </div>

                  {/* Right Action CTAs & Expand Toggle */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {onOpenSurahTest && (
                      <button
                        onClick={() => onOpenSurahTest(meta.number)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1 transition-all shadow-2xs active:scale-95 cursor-pointer"
                        title="Take Surah Mastery Verification Exam"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Exam</span>
                      </button>
                    )}

                    <button
                      onClick={() => onExploreSurah(meta.number)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
                      title="Open in Surah Reader"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>

                    {/* Expand / Collapse Button */}
                    <button
                      onClick={() => toggleSurahExpanded(meta.number)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center gap-1 font-bold text-xs ${
                        isExpanded
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                      title={isExpanded ? 'Collapse Ayat view' : 'Expand to view Ayat on map'}
                    >
                      {isExpanded ? (
                        <>
                          <span className="hidden sm:inline text-[11px]">Hide Ayat</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline text-[11px]">View Ayat</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Active Learning Stage Banner & Start Lesson Trigger */}
                <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wide">
                      Active Stage
                    </span>
                    <span className="font-bold text-slate-700 text-[11px]">
                      Ayah {activeAyahInSurah} of {meta.totalAyahs} • Step {activeStepInSurah} of 6
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartLesson(meta.number, activeAyahInSurah);
                      }}
                      className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Start Lesson</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Ayah Count */}
                <div className="relative z-10 mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Memorization Progress</span>
                    </span>
                    <span className="font-black text-slate-900">
                      {section.masteredCount} / {meta.totalAyahs} Ayahs ({Math.round((section.masteredCount / meta.totalAyahs) * 100)}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, (section.masteredCount / meta.totalAyahs) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* S-CURVE SERPENTINE ROAD CONNECTORS & AYAH STEPPING NODES (ONLY SHOWN WHEN SURAH IS EXPANDED) */}
              {isExpanded && (
                <div className="relative flex flex-col items-center py-4 space-y-7 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Visual Road Centerline / Dotted Connector */}
                  <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-amber-300/40 via-emerald-400/40 to-indigo-400/40 -z-10 rounded-full" />

                  {ayahNodes.map((node, aIdx) => {
                    const isSelected = selectedAyahNode?.id === node.id;
                    const visual = getNodeVisualStyles(node.state, isSelected);
                    const posClass = getPositionClass(node.position);

                    return (
                      <div
                        key={node.id}
                        className={`relative flex flex-col items-center transition-transform duration-300 ${posClass}`}
                      >
                        {/* Milestone Crown / Special Badge if applicable */}
                        {node.isMilestone && node.state === 'MASTERED' && (
                          <div className="absolute -top-3.5 z-20 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black shadow-xs uppercase tracking-wider">
                            <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                            <span>Checkpoint</span>
                          </div>
                        )}

                        {/* DUE FOR REVIEW ALERT BADGE */}
                        {node.state === 'DUE_FOR_REVIEW' && (
                          <div className="absolute -top-4 z-20 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black shadow-md border border-amber-200 animate-pulse uppercase tracking-wider flex items-center gap-1">
                            <RotateCcw className="w-2.5 h-2.5 stroke-[3]" />
                            <span>Review</span>
                          </div>
                        )}

                        {/* AYAH GAME NODE ORB */}
                        <button
                          onClick={() => setSelectedAyahNode(node)}
                          className={`group relative w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 border-2 ${
                            visual.bg
                          } ${visual.border} ${visual.shadow} ${
                            isSelected ? 'scale-110 ring-4 ring-amber-400 shadow-xl z-20' : ''
                          }`}
                          title={`Ayah ${node.ayahNumber} - ${visual.badgeText}`}
                        >
                          {/* Node Number */}
                          <span className={`text-sm sm:text-base ${visual.text}`}>
                            {node.ayahNumber}
                          </span>

                          {/* Star Cluster (1 to 3 stars based on retention) */}
                          {node.state !== 'LOCKED' ? (
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-2 h-2 ${
                                    s <= node.stars ? visual.starColor : 'text-white/30 fill-transparent'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <Lock className="w-3 h-3 text-slate-400 mt-0.5" />
                          )}
                        </button>

                        {/* Floating Micro Label */}
                        <div className="mt-1 text-center">
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${visual.badgeBg}`}>
                            Ayah {node.ayahNumber}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
      </div>

      {/* 3. SELECTED AYAH QUEST CARD / BOTTOM DRAWER MODAL */}
      {selectedAyahNode && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-6">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#FAF9F5] via-white to-amber-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-xs border border-amber-300">
                  {selectedAyahNode.ayahNumber}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Surah {selectedAyahNode.surahName} [{selectedAyahNode.surahNumber}:{selectedAyahNode.ayahNumber}]
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Memory Retention Score: <span className="font-bold text-emerald-700">{selectedAyahNode.retentionScore}%</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAyahNode(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Ayah Calligraphy & Translation */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Calligraphy Display */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-amber-900/10 text-right space-y-2">
                <p className="font-amiri text-xl sm:text-2xl text-slate-900 leading-loose dark:text-slate-100" dir="rtl">
                  {selectedAyahNode.arabicSnippet}
                </p>
                <p className="text-left text-xs font-semibold text-slate-500">
                  {selectedAyahNode.transliterationSnippet}
                </p>
              </div>

              {/* Translation */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Translation
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedAyahNode.translationSnippet}
                </p>
              </div>

              {/* SM-2 Retention Data Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Interval</p>
                  <p className="font-black text-xs text-slate-800">{selectedAyahNode.intervalDays} Days</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Ease Factor</p>
                  <p className="font-black text-xs text-slate-800">{selectedAyahNode.easeFactor}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Repetitions</p>
                  <p className="font-black text-xs text-slate-800">{selectedAyahNode.repetitions}x</p>
                </div>
              </div>

              {/* Quick Audio Recitation Preview Button */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-indigo-950">Audio Recitation</h5>
                    <p className="text-[10px] text-indigo-700">Mishary Rashid Alafasy</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleAudio(selectedAyahNode.surahNumber, selectedAyahNode.ayahNumber)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                >
                  {playingAudioKey === `${selectedAyahNode.surahNumber}:${selectedAyahNode.ayahNumber}` ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Listen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-100 bg-[#FAF9F5] flex items-center gap-2.5">
              <button
                onClick={() => {
                  const sNum = selectedAyahNode.surahNumber;
                  const aNum = selectedAyahNode.ayahNumber;
                  setSelectedAyahNode(null);
                  onStartLesson(sNum, aNum);
                }}
                className="flex-1 min-h-[48px] px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 transition-all"
              >
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
                <span>Start 6-Step Memorization Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const sNum = selectedAyahNode.surahNumber;
                  setSelectedAyahNode(null);
                  onExploreSurah(sNum);
                }}
                className="px-3.5 min-h-[48px] rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                title="Explore in Reader"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemorizationJourney;
