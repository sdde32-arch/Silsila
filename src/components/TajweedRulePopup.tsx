import React, { useState } from 'react';
import {
  X,
  Volume2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Info,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { TajweedLetterSegment, TajweedRuleInfo } from '../services/tajweedEngine';
import { playIsolatedLetterSound } from '../services/quranAudioEngine';
import { useScrollLock } from '../hooks/useScrollLock';

interface TajweedRulePopupProps {
  segment: TajweedLetterSegment;
  allSegments?: TajweedLetterSegment[];
  ayahText?: string;
  onSelectSegment?: (segment: TajweedLetterSegment) => void;
  onClose: () => void;
}

export const TajweedRulePopup: React.FC<TajweedRulePopupProps> = ({
  segment,
  allSegments = [],
  ayahText = '',
  onSelectSegment,
  onClose,
}) => {
  useScrollLock(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const rule: TajweedRuleInfo = segment.rule || {
    id: 'general_articulation',
    name: `Letter ${segment.baseChar} (${segment.harakahName})`,
    arabicName: segment.letter,
    category: 'general',
    shortSummary: `Pronounced with ${segment.harakahName} according to standard Arabic Makharij.`,
    explanation: `Articulate the letter "${segment.baseChar}" clearly from its specific point of articulation with proper ${segment.harakahName}.`,
    howToPronounce: `Focus on crisp articulation without slurring the vowel or clipping the resonance.`,
    makhraj: 'Standard Quranic point of articulation for this letter.',
    lettersList: segment.baseChar,
    colorScheme: {
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-900',
      badgeBorder: 'border-slate-300',
      letterHighlightBg: 'bg-slate-200',
      letterHighlightText: 'text-slate-950',
      letterHighlightBorder: 'border-slate-400',
      glowClass: 'shadow-md',
      accentColor: '#475569',
    },
  };

  // Find all segments in the ayah that have a rule
  const ruleSegments = allSegments.filter((s) => s.rule);
  const currentRuleIdx = ruleSegments.findIndex(
    (s) => s.wordIndex === segment.wordIndex && s.charIndex === segment.charIndex
  );

  const handlePlayLetterSound = () => {
    setIsPlayingAudio(true);
    playIsolatedLetterSound(segment.letter, {
      name: segment.baseChar,
      harakah: segment.harakahName,
      mode: 'vowel_sound',
      onAudioEnded: () => setIsPlayingAudio(false),
    });
    setTimeout(() => setIsPlayingAudio(false), 900);
  };

  const handleNextRule = () => {
    if (currentRuleIdx < ruleSegments.length - 1 && onSelectSegment) {
      onSelectSegment(ruleSegments[currentRuleIdx + 1]);
    }
  };

  const handlePrevRule = () => {
    if (currentRuleIdx > 0 && onSelectSegment) {
      onSelectSegment(ruleSegments[currentRuleIdx - 1]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 text-slate-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Category Badge & Close */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-2xs ${rule.colorScheme.badgeBg} ${rule.colorScheme.badgeText} ${rule.colorScheme.badgeBorder}`}
            >
              {rule.category.toUpperCase()}
            </span>

            {rule.countDuration && (
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                ⏱ {rule.countDuration}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {ruleSegments.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold text-slate-600">
                <button
                  onClick={handlePrevRule}
                  disabled={currentRuleIdx <= 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white hover:text-slate-900 disabled:opacity-30 cursor-pointer transition-colors"
                  title="Previous Tajweed Rule in Ayah"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-1 text-[10px] font-mono">
                  {currentRuleIdx + 1}/{ruleSegments.length}
                </span>
                <button
                  onClick={handleNextRule}
                  disabled={currentRuleIdx >= ruleSegments.length - 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white hover:text-slate-900 disabled:opacity-30 cursor-pointer transition-colors"
                  title="Next Tajweed Rule in Ayah"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
              aria-label="Close Tajweed rule dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Spotlight: Tapped Letter & Word Context */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-amber-50/20 border border-slate-200/90 text-center space-y-3 relative overflow-hidden shadow-2xs">
          <div className="flex items-center justify-center gap-4">
            {/* Calligraphy Letter Spotlight */}
            <div
              className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer shadow-sm ${rule.colorScheme.letterHighlightBg} ${rule.colorScheme.letterHighlightBorder}`}
              onClick={handlePlayLetterSound}
              title="Tap to hear pronunciation"
            >
              <span
                className={`font-quran text-4xl sm:text-5xl font-extrabold ${rule.colorScheme.letterHighlightText}`}
                dir="rtl"
              >
                {segment.letter}
              </span>
            </div>

            {/* Letter Metadata & Audio Trigger */}
            <div className="text-left space-y-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                  {rule.arabicName}
                </h4>
              </div>
              <p className="text-xs font-bold text-slate-600">
                Letter: <span className="font-mono text-amber-700">{segment.baseChar}</span> • Harakah: <span className="font-mono text-slate-700">{segment.harakahName}</span>
              </p>

              <button
                onClick={handlePlayLetterSound}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all shadow-2xs active:scale-95 ${
                  isPlayingAudio
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-800'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlayingAudio ? 'Playing...' : 'Pronounce Letter'}</span>
              </button>
            </div>
          </div>

          {/* Word in Context */}
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Word:</span>
            <span
              className="font-quran text-2xl sm:text-3xl font-extrabold text-black px-2 py-0.5 rounded-lg bg-white/90 border border-slate-300 dark:text-slate-100"
              dir="rtl"
              style={{ color: '#000000' }}
            >
              {segment.wordText}
            </span>
          </div>
        </div>

        {/* Rule Details Section */}
        <div className="space-y-3">
          <div>
            <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{rule.name}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mt-1">
              {rule.explanation}
            </p>
          </div>

          {/* How to Pronounce */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>How to Recite & Apply</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
              {rule.howToPronounce}
            </p>
          </div>

          {/* Makhraj & Rule Letters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                Point of Articulation (Makhraj)
              </span>
              <p className="text-xs font-bold text-slate-800">{rule.makhraj}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                Letters of this Rule
              </span>
              <p className="text-xs font-bold text-slate-800 font-mono" dir="rtl">
                {rule.lettersList}
              </p>
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center justify-center cursor-pointer active:scale-98 transition-all shadow-xs"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
