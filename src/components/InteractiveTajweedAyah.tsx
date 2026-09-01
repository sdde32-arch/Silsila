import React, { useState, useMemo } from 'react';
import { Sparkles, Info } from 'lucide-react';
import {
  parseAyahIntoTajweedWords,
  TajweedLetterSegment,
  TajweedRuleInfo,
  TajweedCategory,
} from '../services/tajweedEngine';
import { TajweedRulePopup } from './TajweedRulePopup';

interface InteractiveTajweedAyahProps {
  arabicText: string;
  fontFamily?: string;
  fontSizePx?: number;
  highlightCategory?: TajweedCategory | 'all' | null;
  showTajweedIndicators?: boolean;
  interactive?: boolean;
  className?: string;
  onLetterTap?: (segment: TajweedLetterSegment) => void;
}

export const InteractiveTajweedAyah: React.FC<InteractiveTajweedAyahProps> = ({
  arabicText,
  fontFamily = "'Amiri', 'Scheherazade New', serif",
  fontSizePx = 26,
  highlightCategory = 'all',
  showTajweedIndicators = true,
  interactive = true,
  className = '',
  onLetterTap,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<TajweedLetterSegment | null>(null);

  // Parse words & segments
  const tajweedWords = useMemo(() => {
    return parseAyahIntoTajweedWords(arabicText);
  }, [arabicText]);

  // Flatten segments for easy navigation
  const allSegments = useMemo(() => {
    const list: TajweedLetterSegment[] = [];
    tajweedWords.forEach((tw) => list.push(...tw.segments));
    return list;
  }, [tajweedWords]);

  const handleSegmentClick = (segment: TajweedLetterSegment, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!interactive) return;
    setSelectedSegment(segment);
    onLetterTap?.(segment);
  };

  return (
    <>
      <div
        dir="rtl"
        className={`font-quran leading-[2.2] sm:leading-[2.4] text-slate-950 dark:text-white font-bold select-none text-center ${className}`}
        style={{ fontFamily, fontSize: `${fontSizePx}px` }}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2">
          {tajweedWords.map((w, wIdx) => {
            return (
              <span
                key={wIdx}
                className="inline-flex items-center flex-wrap px-1 py-0.5 rounded-xl transition-colors hover:bg-amber-50/50 dark:hover:bg-amber-950/30"
              >
                {w.segments.map((seg, sIdx) => {
                  const rule = seg.rule;
                  const isHighlightedCategory =
                    rule &&
                    (highlightCategory === 'all' || highlightCategory === rule.category);

                  const isSelected =
                    selectedSegment &&
                    selectedSegment.wordIndex === seg.wordIndex &&
                    selectedSegment.charIndex === seg.charIndex;

                  let customStyle = '';
                  if (isSelected) {
                    customStyle =
                      'bg-amber-400/90 dark:bg-amber-400 text-slate-950 rounded-lg px-0.5 ring-2 ring-amber-500 ring-offset-1 scale-105 shadow-xs font-black z-10';
                  } else if (showTajweedIndicators && isHighlightedCategory) {
                    if (rule.category === 'qalqalah') {
                      customStyle =
                        'text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/60 dark:border-emerald-700/60 hover:bg-emerald-200/80 dark:hover:bg-emerald-900/80 rounded-md px-0.5 cursor-pointer font-bold transition-all';
                    } else if (rule.category === 'ghunnah') {
                      customStyle =
                        'text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-950/80 border border-amber-300/60 dark:border-amber-700/60 hover:bg-amber-300/80 dark:hover:bg-amber-900/80 rounded-md px-0.5 cursor-pointer font-bold transition-all';
                    } else if (rule.category === 'madd') {
                      customStyle =
                        'text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/80 border border-purple-300/60 dark:border-purple-700/60 hover:bg-purple-200/80 dark:hover:bg-purple-900/80 rounded-md px-0.5 cursor-pointer font-bold transition-all';
                    } else if (rule.category === 'ikhfa') {
                      customStyle =
                        'text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/80 border border-rose-300/60 dark:border-rose-700/60 hover:bg-rose-200/80 dark:hover:bg-rose-900/80 rounded-md px-0.5 cursor-pointer font-bold transition-all';
                    } else if (rule.category === 'idgham') {
                      customStyle =
                        'text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-950/80 border border-orange-300/60 dark:border-orange-700/60 hover:bg-orange-200/80 dark:hover:bg-orange-900/80 rounded-md px-0.5 cursor-pointer font-bold transition-all';
                    } else if (rule.category === 'iqlab') {
                      customStyle =
                        'text-fuchsia-700 dark:text-fuchsia-300 bg-fuchsia-100/80 dark:bg-fuchsia-950/80 border border-fuchsia-300/60 dark:border-fuchsia-700/60 hover:bg-fuchsia-200/80 dark:hover:bg-fuchsia-900/80 rounded-md px-0.5 cursor-pointer font-bold transition-all';
                    } else if (rule.category === 'tafkhim') {
                      customStyle =
                        'text-amber-900 dark:text-amber-200 bg-amber-100/60 dark:bg-amber-950/60 border border-amber-300/50 dark:border-amber-700/50 hover:bg-amber-200/60 rounded-md px-0.5 cursor-pointer font-extrabold transition-all';
                    } else {
                      customStyle =
                        'text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/80 border border-blue-300/60 dark:border-blue-700/60 hover:bg-blue-200/80 rounded-md px-0.5 cursor-pointer transition-all';
                    }
                  } else if (interactive) {
                    customStyle =
                      'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white rounded-md px-0.5 cursor-pointer transition-colors';
                  }

                  return (
                    <span
                      key={sIdx}
                      onClick={(e) => handleSegmentClick(seg, e)}
                      className={`inline-block relative transition-all ${customStyle}`}
                      title={
                        rule
                          ? `Tajweed: ${rule.name} • Tap to view rule`
                          : `Letter: ${seg.baseChar} (${seg.harakahName}) • Tap to inspect`
                      }
                    >
                      {seg.letter}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tajweed Rule Popup Modal */}
      {selectedSegment && (
        <TajweedRulePopup
          segment={selectedSegment}
          allSegments={allSegments}
          ayahText={arabicText}
          onSelectSegment={setSelectedSegment}
          onClose={() => setSelectedSegment(null)}
        />
      )}
    </>
  );
};
