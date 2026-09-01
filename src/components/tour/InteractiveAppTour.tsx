import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Zap,
  RotateCcw,
  BookOpen,
  Map,
  Target,
  Heart,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Compass,
  Flame,
  Award,
  Layers,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { TabType } from '../../types';
import { setUserCompletedTour } from '../../services/tourService';
import { useScrollLock } from '../../hooks/useScrollLock';
import { SilsilaEmblem } from '../ui/SilsilaLogo';

export interface TourStop {
  id: string;
  targetSelector: string | null;
  tab: TabType;
  subTab?: 'hifz-map' | 'mastery-exams' | 'analytics';
  title: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  icon: React.FC<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  description: string;
  tip?: string;
}

const TOUR_STOPS: TourStop[] = [
  {
    id: 'bottom-nav',
    targetSelector: '[data-tour="bottom-nav"]',
    tab: 'today',
    title: 'The Four Core Tabs',
    badge: 'Step 1 of 4 • Navigation',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700',
    badgeText: 'text-emerald-950 dark:text-emerald-300',
    icon: Layers,
    iconBg: 'bg-emerald-600 text-white',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    description:
      '• Today: Your daily Sabaq lesson and spaced review queues.\n• Explore: Read and listen to all 114 Surahs with Tajweed and reciters.\n• Progress: Your complete 114-Surah roadmap, SM-2 retention curves, and Mastery Exams.\n• You: Spiritual Niyyah journal, target plan, and app preferences.',
    tip: 'Tap any tab anytime to switch views freely with zero lost progress.',
  },
  {
    id: 'sabaq-card',
    targetSelector: '[data-tour="sabaq-card"]',
    tab: 'today',
    title: "Today's Sabaq Lesson",
    badge: 'Step 2 of 4 • Daily New Verses',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700',
    badgeText: 'text-amber-950 dark:text-amber-300',
    icon: Zap,
    iconBg: 'bg-amber-500 text-slate-950',
    iconColor: 'text-amber-600 dark:text-amber-400',
    description:
      'This is your daily Sabaq lesson—your active new verse drill. Each session guides you through interactive active recall with phoneme-level audio, word breakdowns, and blind tests to lock verses into long-term memory.',
    tip: 'Daily pace: typically 1 to 5 new verses per day depending on your customized plan.',
  },
  {
    id: 'review-cards',
    targetSelector: '[data-tour="review-cards"]',
    tab: 'today',
    title: 'Sabqi & Manzil Spaced Review',
    badge: 'Step 3 of 4 • Retention Engine',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700',
    badgeText: 'text-indigo-950 dark:text-indigo-300',
    icon: RotateCcw,
    iconBg: 'bg-indigo-600 text-white',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    description:
      'Memorizing is only half the journey—spaced review keeps it permanent. Sabqi protects your recent 7-day verses from fading, while Manzil systematically reviews your past mastered Surahs over time.',
    tip: 'Daily reviews take just 3–5 minutes and ensure zero verses are forgotten.',
  },
  {
    id: 'hifz-points',
    targetSelector: '[data-tour="hifz-points"]',
    tab: 'today',
    title: 'Hifz Points & Mastery Gating',
    badge: 'Step 4 of 4 • Mastery Gating',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700',
    badgeText: 'text-emerald-950 dark:text-emerald-300',
    icon: Sparkles,
    iconBg: 'bg-emerald-600 text-white',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    description:
      'Earn points (+10 pts) for every completed Ayah drill and review (+1 pt). You need at least 5 points to unlock subsequent new verses, encouraging steady, deliberate mastery rather than rushing.',
    tip: 'Consistency streaks include a built-in grace system so life events never erase your hard work.',
  },
  {
    id: 'final-welcome',
    targetSelector: null,
    tab: 'today',
    title: 'Bismillah, You Are Ready!',
    badge: 'Ready • Silsila Walkthrough Complete',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700',
    badgeText: 'text-amber-950 dark:text-amber-300',
    icon: Sun,
    iconBg: 'bg-amber-500 text-slate-950',
    iconColor: 'text-amber-600 dark:text-amber-400',
    description:
      'Your personalized Hifz path is set. Learn deliberately, review consistently, and let each verse illuminate your heart and daily life.',
    tip: 'Tap below to jump directly into your first Sabaq drill!',
  },
];

export interface InteractiveAppTourProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onSwitchTab: (tab: TabType, subTab?: 'hifz-map' | 'mastery-exams' | 'analytics') => void;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: number;
}

export const InteractiveAppTour: React.FC<InteractiveAppTourProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSwitchTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const currentStop = TOUR_STOPS[currentStepIndex] || TOUR_STOPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STOPS.length - 1;

  // Handle tour completion / dismissal
  const handleFinishTour = useCallback(() => {
    setUserCompletedTour(true);
    onSwitchTab('today');
    onClose();
  }, [onClose, onSwitchTab]);

  const handleSkipTour = useCallback(() => {
    setUserCompletedTour(true);
    onClose();
  }, [onClose]);

  // Update spotlight bounding box based on current DOM element
  const updateSpotlightPosition = useCallback(() => {
    if (!currentStop.targetSelector) {
      setSpotlightRect(null);
      return;
    }

    const el = document.querySelector(currentStop.targetSelector);
    if (!el) {
      // Element not found on current page yet
      setSpotlightRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;
    const computedStyle = window.getComputedStyle(el);
    const rawRadius = parseFloat(computedStyle.borderRadius) || 16;
    const borderRadius = Math.min(Math.max(rawRadius, 12), 24);

    setSpotlightRect({
      top: Math.max(0, rect.top - padding),
      left: Math.max(0, rect.left - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      borderRadius,
    });
  }, [currentStop.targetSelector]);

  // Effect: When step changes, handle tab switching & DOM element scrolling
  useEffect(() => {
    if (!isOpen) return;

    setIsTransitioning(true);

    // 1. Switch tab if necessary
    if (currentStop.tab && activeTab !== currentStop.tab) {
      onSwitchTab(currentStop.tab, currentStop.subTab);
    }

    // 2. Wait for tab rendering and element mounting
    const timer = setTimeout(() => {
      if (currentStop.targetSelector) {
        const el = document.querySelector(currentStop.targetSelector);
        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
      }

      // Small secondary delay to allow smooth scrolling to settle
      const settleTimer = setTimeout(() => {
        updateSpotlightPosition();
        setIsTransitioning(false);
      }, 180);

      return () => clearTimeout(settleTimer);
    }, 120);

    return () => clearTimeout(timer);
  }, [currentStepIndex, isOpen, currentStop.tab, currentStop.subTab, currentStop.targetSelector, onSwitchTab, updateSpotlightPosition]);

  // Effect: Listen to scroll and resize to keep spotlight in sync with layout
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateSpotlightPosition();
    };

    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
    };
  }, [isOpen, updateSpotlightPosition]);

  // Keyboard navigation (Escape, Left, Right)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkipTour();
      } else if (e.key === 'ArrowRight' && !isLastStep) {
        setCurrentStepIndex((prev) => Math.min(TOUR_STOPS.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFirstStep, isLastStep, handleSkipTour]);

  if (!isOpen) return null;

  const IconComponent = currentStop.icon;

  // Tooltip positioning math
  let tooltipStyle: React.CSSProperties = {};
  const isCenteredModal = !spotlightRect || currentStop.targetSelector === null;

  if (!isCenteredModal && spotlightRect) {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 600;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const tooltipWidth = Math.min(420, viewportWidth - 32);

    // Determine vertical placement (prefer below, fallback above if too close to bottom)
    const spaceBelow = viewportHeight - (spotlightRect.top + spotlightRect.height);
    const spaceAbove = spotlightRect.top;
    const placeBelow = spaceBelow >= 200 || spaceBelow > spaceAbove;

    let top = placeBelow
      ? spotlightRect.top + spotlightRect.height + 12
      : Math.max(16, spotlightRect.top - 220);

    // Keep within viewport vertical boundaries
    top = Math.max(16, Math.min(viewportHeight - 240, top));

    // Horizontal centering over the spotlight
    let left = spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2;
    left = Math.max(16, Math.min(viewportWidth - tooltipWidth - 16, left));

    tooltipStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      maxWidth: 'calc(100vw - 32px)',
      zIndex: 60,
    };
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto" role="dialog" aria-modal="true" aria-label="Silsila Interactive Tour">
      {/* 1. SPOTLIGHT SVG CUTOUT BACKDROP */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-auto transition-all duration-300 ease-out"
        style={{ zIndex: 51 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="silsila-tour-mask">
            {/* White background: fully opaque mask (allows dark tint to show) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />

            {/* Black cutout: transparent hole for the spotlighted element */}
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx={spotlightRect.borderRadius}
                ry={spotlightRect.borderRadius}
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Backdrop color overlay filled with mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.76)"
          mask="url(#silsila-tour-mask)"
        />
      </svg>

      {/* 2. GLOWING SPOTLIGHT BORDER HIGHLIGHT OVER LIVE TARGET */}
      {spotlightRect && (
        <div
          className="fixed pointer-events-none transition-all duration-300 ease-out border-2 border-amber-400/90 dark:border-amber-400 ring-4 ring-amber-400/25 shadow-lg shadow-amber-500/20 animate-pulse"
          style={{
            top: `${spotlightRect.top}px`,
            left: `${spotlightRect.left}px`,
            width: `${spotlightRect.width}px`,
            height: `${spotlightRect.height}px`,
            borderRadius: `${spotlightRect.borderRadius}px`,
            zIndex: 52,
          }}
        />
      )}

      {/* 3. TOP GLOBAL TOUR BAR (Skip Tour & Progress) */}
      <div className="fixed top-3 left-0 right-0 z-55 px-4 pointer-events-none flex items-center justify-between max-w-xl mx-auto">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/80 shadow-lg text-xs font-bold">
          <SilsilaEmblem className="w-4 h-4" />
          <span>Silsila Guided Tour</span>
        </div>

        <button
          onClick={handleSkipTour}
          className="pointer-events-auto px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700/80 shadow-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
          title="Skip the interactive tour"
        >
          <span>Skip tour</span>
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* 4. INTERACTIVE TOOLTIP CARD (ATTACHED TO ELEMENT OR CENTERED) */}
      <div
        ref={tooltipRef}
        style={isCenteredModal ? undefined : tooltipStyle}
        className={`${
          isCenteredModal
            ? 'fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-60'
            : ''
        } p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Top Meta: Step Badge & Close */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${currentStop.badgeBg} ${currentStop.badgeText}`}
          >
            {currentStop.badge}
          </span>

          <button
            onClick={handleSkipTour}
            className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Skip tour"
            aria-label="Skip tour"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title & Icon Header */}
        <div className="flex items-start gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${currentStop.iconBg}`}
          >
            <IconComponent className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
              {currentStop.title}
            </h2>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-normal leading-snug mt-1">
              {currentStop.description}
            </p>
          </div>
        </div>

        {/* Helpful Pro-Tip Box */}
        {currentStop.tip && (
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-tight">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
            <span>{currentStop.tip}</span>
          </div>
        )}

        {/* Step Indicator Dots & Navigation Actions */}
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STOPS.map((stop, idx) => (
              <button
                key={stop.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-4 h-1.5 bg-[#D97706] dark:bg-amber-400'
                    : 'w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                }`}
                title={`Go to step ${idx + 1}: ${stop.title}`}
                aria-label={`Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Buttons: Back / Next / Finish */}
          <div className="flex items-center gap-1.5">
            {!isFirstStep && (
              <button
                type="button"
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                onClick={handleFinishTour}
                className="px-3 py-1.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] active:scale-95 text-slate-950 text-[10px] font-black flex items-center gap-1 cursor-pointer shadow-sm transition-all"
              >
                <span>Bismillah, Start Learning</span>
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStepIndex((prev) => Math.min(TOUR_STOPS.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[10px] font-black flex items-center gap-0.5 cursor-pointer shadow-sm transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-3 h-3 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
