import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  X,
  Check,
  ChevronRight,
  Info,
  BookOpen,
  Volume2,
  Trophy,
  DownloadCloud,
  Sliders,
} from 'lucide-react';
import { CoachMarkKey, hasSeenCoachMark, markCoachMarkSeen } from '../../services/coachMarkService';
import { useScrollLock } from '../../hooks/useScrollLock';

export interface CoachMarkOverlayProps {
  featureKey: CoachMarkKey;
  targetSelector: string | null;
  title: string;
  description: string;
  badge?: string;
  icon?: React.FC<{ className?: string }>;
  onDismiss?: () => void;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: number;
}

export const CoachMarkOverlay: React.FC<CoachMarkOverlayProps> = ({
  featureKey,
  targetSelector,
  title,
  description,
  badge = 'Feature Guide',
  icon: Icon = Sparkles,
  onDismiss,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    // Check if user has already seen this coach mark
    if (!hasSeenCoachMark(featureKey)) {
      // Delay slightly for component to mount DOM nodes
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [featureKey]);

  const updatePosition = useCallback(() => {
    if (!targetSelector) {
      setSpotlightRect(null);
      return;
    }

    const el = document.querySelector(targetSelector);
    if (!el) {
      setSpotlightRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const computed = window.getComputedStyle(el);
    const rawRadius = parseInt(computed.borderRadius, 10);
    const borderRadius = isNaN(rawRadius) ? 16 : Math.max(12, Math.min(rawRadius, 28));

    const padding = 8;
    setSpotlightRect({
      top: Math.max(0, rect.top - padding),
      left: Math.max(0, rect.left - padding),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      borderRadius: borderRadius + padding / 2,
    });
  }, [targetSelector]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    if (targetSelector) {
      const el = document.querySelector(targetSelector);
      if (el && typeof ResizeObserver !== 'undefined') {
        resizeObserverRef.current = new ResizeObserver(() => updatePosition());
        resizeObserverRef.current.observe(el);
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isOpen, targetSelector, updatePosition]);

  const handleDismiss = useCallback(() => {
    markCoachMarkSeen(featureKey);
    setIsOpen(false);
    onDismiss?.();
  }, [featureKey, onDismiss]);

  if (!isOpen) return null;

  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Tooltip positioning
  let tooltipStyle: React.CSSProperties = {};
  if (spotlightRect) {
    const tooltipWidth = Math.min(windowWidth - 32, 420);
    const spaceBelow = windowHeight - (spotlightRect.top + spotlightRect.height);
    const spaceAbove = spotlightRect.top;

    let top: number;
    if (spaceBelow >= 220 || spaceBelow >= spaceAbove) {
      top = Math.min(windowHeight - 240, spotlightRect.top + spotlightRect.height + 16);
    } else {
      top = Math.max(16, spotlightRect.top - 230);
    }

    let left = spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2;
    left = Math.max(16, Math.min(windowWidth - tooltipWidth - 16, left));

    tooltipStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
    };
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coachmark-title"
    >
      {/* SVG Spotlight Mask Cutout */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto cursor-pointer"
        onClick={handleDismiss}
        style={{ zIndex: 1 }}
      >
        <defs>
          <mask id={`mask-coachmark-${featureKey}`}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
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
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(5, 8, 18, 0.76)"
          mask={`url(#mask-coachmark-${featureKey})`}
        />
      </svg>

      {/* Spotlight Ring Border */}
      {spotlightRect && (
        <div
          className="absolute pointer-events-none transition-all duration-300 ease-out animate-pulse"
          style={{
            zIndex: 2,
            top: `${spotlightRect.top}px`,
            left: `${spotlightRect.left}px`,
            width: `${spotlightRect.width}px`,
            height: `${spotlightRect.height}px`,
            borderRadius: `${spotlightRect.borderRadius}px`,
            border: '2.5px solid #F59E0B',
            boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.25), 0 0 24px rgba(245, 158, 11, 0.35)',
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        ref={tooltipRef}
        style={spotlightRect ? tooltipStyle : undefined}
        className={`${
          !spotlightRect
            ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md'
            : ''
        } z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                {badge}
              </span>
              <h3 id="coachmark-title" className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-slate-50 tracking-tight mt-1 leading-snug">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Dismiss guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description Body */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          {description}
        </p>

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 font-medium">One-time feature tip</span>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Got it</span>
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
