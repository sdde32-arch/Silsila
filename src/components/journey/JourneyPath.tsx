import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Flame,
  Check,
  Lock,
  ChevronRight,
  RotateCcw,
  Volume2,
  X,
  ArrowRight,
  Eye,
  BookOpen,
} from 'lucide-react';
import {
  getSurahThematicProfile,
  ThematicIconItem,
  SurahThematicProfile,
} from './surahThemes';
import {
  getUserProgression,
  getMemorizationStatsSummary,
  SURAH_START_GLOBAL_ORDER,
  TOTAL_QURAN_AYAHS,
} from '../../services/memorizationEngine';
import { ALL_114_SURAHS } from '../../data/quranMetadata';
import { useScrollLock } from '../../hooks/useScrollLock';

export interface SurahLandmarkNode {
  id: string;
  number: number;
  badgeNumber?: string;
  name?: string;
  arabicName?: string;
  subtitle?: string;
  description?: string;
  status: 'completed' | 'active' | 'in_review' | 'locked';
  stars: number;
  totalStars: number;
  customThemeIcons?: ThematicIconItem[];
  palette?: {
    bgGradient: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
    glowColor: string;
    checkpointBg: string;
    accentColor: string;
    ringColor?: string;
  };
  landmarkEmoji?: string;
  landmarkName?: string;
  landmarkType?: string;
  position?: 'left' | 'right' | 'center';
  topOffset?: string;
  sideOffset?: string;
  totalAyahs?: number;
  juzNumber?: number;
  arabicSnippet?: string;
  translationSnippet?: string;
}

export interface JourneyPathProps {
  landmarks?: SurahLandmarkNode[];
  onStartLesson: (surahNumber?: number) => void;
  onExploreSurah: (surahNumber: number) => void;
  onOpenAudio?: (surahNumber?: number) => void;
  onNavigateToReview?: () => void;
  className?: string;
}

export const defaultSurahLandmarks: SurahLandmarkNode[] = ALL_114_SURAHS.map((s) => ({
  id: `node-${s.number}`,
  number: s.number,
  status: s.number === 1 ? 'completed' : s.number === 67 || s.number === 2 ? 'active' : 'locked',
  stars: s.number === 1 ? 3 : 0,
  totalStars: 3,
  name: s.name,
  arabicName: s.arabicName,
  totalAyahs: s.totalAyahs,
  juzNumber: s.juzNumber,
}));

export const JourneyPath: React.FC<JourneyPathProps> = ({
  landmarks = defaultSurahLandmarks,
  onStartLesson,
  onExploreSurah,
  onOpenAudio,
  className = '',
}) => {
  const [progression, setProgression] = useState(() => getUserProgression());
  const [stats, setStats] = useState(() => getMemorizationStatsSummary());

  useEffect(() => {
    const refresh = () => {
      setProgression(getUserProgression());
      setStats(getMemorizationStatsSummary());
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('hafiz_progress_updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('hafiz_progress_updated', refresh);
    };
  }, []);

  const [selectedNode, setSelectedNode] = useState<{
    landmark: SurahLandmarkNode;
    profile: SurahThematicProfile;
  } | null>(null);
  useScrollLock(!!selectedNode);

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const [goalTasks, setGoalTasks] = useState([
    { id: '1', label: 'Memorize', subtext: 'Al-Baqarah 128 - 147', completed: true, surahNumber: 2 },
    { id: '2', label: 'Review', subtext: "Aal 'Imran 1 - 50", completed: false, surahNumber: 3 },
    { id: '3', label: 'Reflect', subtext: 'Surah Ar-Rahman', completed: false, surahNumber: 55 },
  ]);

  const toggleGoalTask = (id: string) => {
    setGoalTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  };

  const dynamicLandmarks = useMemo(() => {
    return (landmarks || defaultSurahLandmarks).map((node) => {
      const surahStart = SURAH_START_GLOBAL_ORDER[node.number] || 1;
      const meta = ALL_114_SURAHS.find((s) => s.number === node.number);
      const total = meta ? meta.totalAyahs : 7;
      const surahEnd = surahStart + total - 1;

      let status: 'completed' | 'active' | 'in_review' | 'locked' = node.status;
      let stars = node.stars;

      if (progression.furthestMemorizedGlobalOrder >= surahEnd) {
        status = 'completed';
        stars = 3;
      } else if (progression.furthestMemorizedGlobalOrder >= surahStart - 1) {
        status = 'active';
        const memCount = Math.max(0, progression.furthestMemorizedGlobalOrder - surahStart + 1);
        stars = Math.min(3, Math.floor((memCount / total) * 3));
      } else {
        status = 'locked';
        stars = 0;
      }

      return {
        ...node,
        status,
        stars,
      };
    });
  }, [landmarks, progression.furthestMemorizedGlobalOrder]);

  return (
    <div
      id="journey-path-container"
      className={`relative w-full rounded-2xl overflow-hidden shadow-xs border border-amber-900/15 bg-gradient-to-b from-[#FDFBF7] via-[#F7F4EB] to-[#FAF8F2] ${className}`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP OVERALL PROGRESS HERO CARD                                         */}
      {/* ========================================================================= */}
      <div className="p-4 bg-white/95 backdrop-blur-md border-b border-amber-900/15 m-3 rounded-2xl shadow-xs space-y-3">
        {/* Grid: Twin Circular Rings (Col 1) + 3 Metric Pills (Col 2) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Twin Identical Circles (Equal Size, Perfect Balance) */}
          <div className="md:col-span-5 flex items-center justify-center sm:justify-start gap-3 shrink-0">
            {/* Circle 1: Overall Percentage */}
            <div className="relative w-14 h-14 sm:w-15 sm:h-15 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="3.6"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="3.6"
                  strokeDasharray={`${stats.overallPercent}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 leading-none">{stats.overallPercent}%</span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">Overall</span>
              </div>
            </div>

            {/* Circle 2: Memorized Surahs Count */}
            <div className="relative w-14 h-14 sm:w-15 sm:h-15 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="3.6"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3.6"
                  strokeDasharray={`${Math.min(100, Math.round(((progression.masteredSurahs?.length || 0) / 114) * 100))}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-extrabold text-xs sm:text-sm text-emerald-700 leading-none">{progression.masteredSurahs?.length || 0}</span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5">Surahs</span>
              </div>
            </div>
          </div>

          {/* 3 Metric Pills in strict 3-column subgrid */}
          <div className="md:col-span-7 grid grid-cols-3 gap-1.5">
            {/* Memorized */}
            <div className="py-2 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-center min-w-0">
              <div className="flex items-center gap-1 text-amber-800">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                <span className="font-black text-xs">{progression.furthestMemorizedGlobalOrder || 0}</span>
              </div>
              <span className="text-[10px] font-bold text-amber-900/80 truncate w-full mt-0.5">
                Ayahs
              </span>
            </div>

            {/* In Review */}
            <div className="py-2 px-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center text-center min-w-0">
              <div className="flex items-center gap-1 text-purple-800">
                <RotateCcw className="w-3 h-3 shrink-0 text-purple-600" />
                <span className="font-black text-xs">{stats.dueTodayCount || 0}</span>
              </div>
              <span className="text-[10px] font-bold text-purple-900/80 truncate w-full mt-0.5">
                Due Today
              </span>
            </div>

            {/* Locked */}
            <div className="py-2 px-2.5 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-center min-w-0">
              <div className="flex items-center gap-1 text-slate-700">
                <Lock className="w-3 h-3 shrink-0 text-slate-500" />
                <span className="font-black text-xs">{Math.max(0, 114 - (progression.masteredSurahs?.length || 0) - (progression.currentSurah ? 1 : 0))}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 truncate w-full mt-0.5">
                Locked
              </span>
            </div>
          </div>
        </div>

        {/* Action CTA Button */}
        <button
          id="btn-view-journey"
          onClick={() => onExploreSurah(1)}
          className="w-full py-2.5 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
        >
          <span>Explore 114 Surahs</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. STRAIGHT VERTICAL ROADMAP WITH CLEAR SURAH LABELS & COMPACT CARDS      */}
      {/* ========================================================================= */}
      <div className="relative px-2.5 sm:px-4 py-3 space-y-3">
        {/* Precise SVG Path Track for Spine Alignment */}
        <svg
          className="absolute left-0 top-0 w-full h-full pointer-events-none z-0 overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="spine-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#10B981" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#6EE7B7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.3" />
            </linearGradient>
            <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Mobile Coordinate Line (x=30: center of 40px node + 10px px-2.5 padding) */}
          <line
            x1="30"
            y1="28"
            x2="30"
            y2="96%"
            stroke="url(#glow-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#path-glow)"
            className="sm:hidden opacity-70"
          />
          <line
            x1="30"
            y1="28"
            x2="30"
            y2="96%"
            stroke="url(#spine-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            className="sm:hidden"
          />
          <line
            x1="30"
            y1="28"
            x2="30"
            y2="96%"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeOpacity="0.9"
            className="sm:hidden"
          />

          {/* Desktop/Tablet Coordinate Line (x=40: center of 48px node + 16px px-4 padding) */}
          <line
            x1="40"
            y1="28"
            x2="40"
            y2="96%"
            stroke="url(#glow-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#path-glow)"
            className="hidden sm:block opacity-70"
          />
          <line
            x1="40"
            y1="28"
            x2="40"
            y2="96%"
            stroke="url(#spine-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="hidden sm:block"
          />
          <line
            x1="40"
            y1="28"
            x2="40"
            y2="96%"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            strokeLinecap="round"
            strokeOpacity="0.9"
            className="hidden sm:block"
          />
        </svg>

        {/* Dynamic Surah Milestone Cards with Clear Headers Above */}
        {dynamicLandmarks.map((node) => {
          const profile = getSurahThematicProfile(node.number);
          const isActive = node.status === 'active';
          const isCompleted = node.status === 'completed';
          const isInReview = node.status === 'in_review';
          const isLocked = node.status === 'locked';

          const palette = node.palette || profile.palette;
          const themeIcons = node.customThemeIcons || profile.themeIcons;

          return (
            <div
              key={node.id}
              className="relative grid grid-cols-[40px_1fr] sm:grid-cols-[48px_1fr] gap-2.5 sm:gap-3 items-start group"
            >
              {/* Spine Node Badge Button */}
              <div className="relative z-10 flex flex-col items-center pt-5">
                <button
                  type="button"
                  onClick={() => setSelectedNode({ landmark: node, profile })}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-xs transition-all duration-300 active:scale-95 cursor-pointer min-w-[36px] min-h-[36px] ${
                    isActive
                      ? 'bg-emerald-500 text-white ring-3 ring-emerald-300/60 animate-pulse'
                      : isCompleted
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                      : isInReview
                      ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}
                  aria-label={`Surah ${profile.name} status: ${node.status}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isActive ? (
                    <Flame className="w-4 h-4 fill-white text-white" />
                  ) : isInReview ? (
                    <RotateCcw className="w-4 h-4 text-white" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    node.number
                  )}
                </button>

                <span className="text-[9px] font-black text-slate-700 mt-0.5">
                  #{node.number}
                </span>
              </div>

              {/* Surah Container: Clear Header Above + Compact Signpost Card (Reduced 50%) */}
              <div className="min-w-0 flex flex-col">
                {/* 1. CLEAR SURAH NAME IDENTIFIER ABOVE CARD */}
                <div className="flex items-center justify-between gap-1.5 px-1 pb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[9px] font-black uppercase tracking-wider shrink-0">
                      Surah {node.number}
                    </span>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                      {node.name || profile.name}
                    </h3>
                    <span className="text-[10px] font-serif italic text-slate-600 truncate hidden xs:inline">
                      • {node.subtitle || profile.subtitle}
                    </span>
                  </div>

                  {/* Status Indicator / Stars Above */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider animate-pulse">
                        Active
                      </span>
                    )}
                    {isInReview && (
                      <span className="px-1.5 py-0.5 rounded-full bg-sky-500 text-white text-[8px] font-black uppercase tracking-wider">
                        Review
                      </span>
                    )}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((star) => (
                        <Star
                          key={star}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                            star <= node.stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. COMPACT SIGNPOST CARD (50% Dimensions, Crisp Grid Layout) */}
                <div
                  onClick={() => setSelectedNode({ landmark: node, profile })}
                  className={`relative cursor-pointer rounded-2xl p-2.5 sm:p-3 text-slate-900 transition-all duration-200 hover:translate-y-[-1px] active:scale-[0.99] shadow-xs bg-gradient-to-br ${palette.bgGradient} border ${palette.borderColor} ${
                    isActive ? 'ring-2 ring-emerald-400/60 shadow-md' : ''
                  }`}
                >
                  {/* Grid-based Content: Primary Thematic Badge + Pillar Icons + Practice CTA */}
                  <div className="grid grid-cols-1 xs:grid-cols-[1fr_auto] gap-2 items-center">
                    {/* Left Column: Landmark Emblem & Thematic Badges */}
                    <div className="min-w-0 space-y-1.5">
                      {/* Landmark Badge + Juz/Ayahs in one line */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md ${palette.badgeBg} ${palette.badgeText} text-[9.5px] font-black border border-slate-200/60 shrink-0 flex items-center gap-1 shadow-2xs`}>
                          <span>{profile.landmarkEmoji}</span>
                          <span>{profile.primaryThematicIcon.label}</span>
                        </span>
                        <span className="text-[9.5px] font-bold text-slate-600 truncate">
                          Juz' {profile.juzNumber} • {profile.totalAyahs} Ayahs
                        </span>
                      </div>

                      {/* Thematic Pillars Icons (Compact Row) */}
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {themeIcons.map((item, idx) => {
                          const tooltipKey = `${node.id}-${idx}`;
                          const isTooltipOpen = activeTooltip === tooltipKey;

                          return (
                            <div
                              key={idx}
                              className="relative flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/85 border border-slate-200 text-[9px] font-bold text-slate-700 shrink-0 cursor-pointer hover:bg-white transition-colors shadow-2xs"
                              onMouseEnter={() => setActiveTooltip(tooltipKey)}
                              onMouseLeave={() => setActiveTooltip(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTooltip(isTooltipOpen ? null : tooltipKey);
                              }}
                              title={item.label}
                            >
                              <span className={item.colorClass || 'text-amber-600'}>{item.icon}</span>
                              <span className="hidden sm:inline">{item.label}</span>

                              {isTooltipOpen && (
                                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded whitespace-nowrap shadow-xl z-30 pointer-events-none border border-slate-700">
                                  {item.label}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Quick Practice CTA */}
                    <div className="flex items-center justify-end shrink-0 pt-1 xs:pt-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartLesson(node.number);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10.5px] flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer min-h-[32px]"
                      >
                        <span>{isActive ? 'Continue' : 'Practice'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Milestone Checkpoint Strip */}
        <div className="relative flex items-center justify-center my-2 py-2.5 bg-amber-50/90 rounded-xl border border-amber-200/80 text-center shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Juz' 5 Milestone Exam & Checkpoint Quiz</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TODAY'S GOAL INTEGRATED FOOTER CARD                                   */}
      {/* ========================================================================= */}
      <div className="p-4 m-3 sm:m-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-slate-900">Today's Goal</h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-xs font-semibold text-slate-500">2 of 3 Completed</span>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {goalTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleGoalTask(task.id)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-100/80 cursor-pointer transition-all min-h-[44px]"
            >
              <div
                className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                  task.completed
                    ? 'bg-emerald-500 text-white'
                    : 'border-2 border-slate-300'
                }`}
              >
                {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="font-bold text-xs text-slate-800 truncate">{task.label}</p>
                <p className="text-[10.5px] text-slate-500 truncate">{task.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          id="btn-continue-goal"
          onClick={() => {
            const prog = getUserProgression();
            onStartLesson(prog.currentSurah, prog.currentAyah);
          }}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <span>
            {(() => {
              const prog = getUserProgression();
              const meta = ALL_114_SURAHS.find((s) => s.number === prog.currentSurah) || ALL_114_SURAHS[0];
              return `Continue Active Lesson (${meta.transliteration} • Ayah ${prog.currentAyah} of ${meta.totalAyahs})`;
            })()}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. LANDMARK DETAIL INSPECTION MODAL                                       */}
      {/* ========================================================================= */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Header: Clean Grid Layout with Zero Collision */}
            <div
              className={`p-4 sm:p-5 bg-gradient-to-r ${selectedNode.profile.palette.bgGradient} text-white border-b ${selectedNode.profile.palette.borderColor} shrink-0`}
            >
              {/* Row 1: Number Badge + Title + Close Button */}
              <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
                {/* Node Number Badge */}
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${selectedNode.profile.palette.badgeBg} border-2 ${selectedNode.profile.palette.borderColor} flex items-center justify-center font-black text-sm sm:text-base ${selectedNode.profile.palette.badgeText} shadow-md shrink-0`}
                >
                  {selectedNode.profile.number}
                </div>

                {/* Title & Metadata */}
                <div className="min-w-0 pr-1">
                  <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight truncate">
                    Surah {selectedNode.profile.name}
                  </h3>
                  <p className="text-xs text-amber-200/90 font-medium mt-0.5 truncate">
                    Juz' {selectedNode.profile.juzNumber} • {selectedNode.profile.subtitle} • {selectedNode.profile.totalAyahs} Ayahs
                  </p>
                </div>

                {/* Close Button (Dedicated Grid Column - Never Overlaps) */}
                <button
                  id="btn-close-landmark-modal"
                  onClick={() => setSelectedNode(null)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer min-w-[36px] min-h-[36px]"
                  aria-label="Close modal"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Row 2: Landmark & Primary Theme Badge */}
              <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-white/15">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 border border-white/25 text-[11px] font-extrabold text-amber-200">
                  <span className={selectedNode.profile.primaryThematicIcon.colorClass || 'text-amber-300'}>
                    {selectedNode.profile.primaryThematicIcon.icon}
                  </span>
                  <span>{selectedNode.profile.primaryThematicIcon.label}</span>
                </span>
                <span className="text-[11px] font-bold text-white/80">
                  {selectedNode.profile.landmarkEmoji} {selectedNode.profile.landmarkName}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
              {/* Arabic Verse Banner */}
              <div className="bg-[#FAF9F5] border border-amber-900/10 rounded-2xl p-4 text-center space-y-2">
                <p className="font-quran text-xl sm:text-2xl text-slate-900 font-bold leading-loose dark:text-slate-100" dir="rtl">
                  {selectedNode.profile.arabicSnippet}
                </p>
                <p className="text-xs text-slate-600 italic font-serif leading-relaxed px-2">
                  "{selectedNode.profile.translationSnippet}"
                </p>
              </div>

              {/* Landmark Lore & Destination Meaning */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <span className="text-lg">{selectedNode.profile.landmarkEmoji}</span>
                  <span className="font-extrabold text-sm">{selectedNode.profile.landmarkName}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedNode.profile.description}
                </p>
              </div>

              {/* Thematic Pillars & Distinct Iconography */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Thematic Pillars & Core Subjects
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedNode.profile.themeIcons.map((theme, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-xs font-bold text-slate-800 flex items-center gap-2.5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center shrink-0 text-base">
                        {theme.icon}
                      </div>
                      <span className="text-[11.5px] font-extrabold text-slate-800 leading-tight">
                        {theme.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 pb-1">
                {selectedNode.landmark.status !== 'locked' ? (
                  <>
                    <button
                      id="btn-modal-start-lesson"
                      onClick={() => {
                        setSelectedNode(null);
                        onStartLesson(selectedNode.profile.number);
                      }}
                      className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md min-h-[44px] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Start Memorization Lesson</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        id="btn-modal-listen-qari"
                        onClick={() => {
                          setSelectedNode(null);
                          if (onOpenAudio) onOpenAudio(selectedNode.profile.number);
                        }}
                        className="py-2.5 px-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 transition-all shadow-2xs cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Listen Qari</span>
                      </button>

                      <button
                        id="btn-modal-explore-surah"
                        onClick={() => {
                          setSelectedNode(null);
                          onExploreSurah(selectedNode.profile.number);
                        }}
                        className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95 transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-slate-600 shrink-0" />
                        <span>Explore Surah</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-1">
                    <p className="font-extrabold text-xs text-purple-900 flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Chapter Locked</span>
                    </p>
                    <p className="text-[11px] text-purple-700">
                      Complete previous Surahs along the path to unlock this milestone chapter.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyPath;
