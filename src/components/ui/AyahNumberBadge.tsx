import React from 'react';
import { toArabicNumerals } from '../../data/quranMetadata';

export interface AyahNumberBadgeProps {
  ayahNumber?: number;
  number?: number; // Compatibility alias
  surahNumber?: number;
  variant?: 'subtle' | 'gold' | 'emerald' | 'dark' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showEnglishLabel?: boolean;
  className?: string;
}

export const AyahNumberBadge: React.FC<AyahNumberBadgeProps> = ({
  ayahNumber: ayahNumberProp,
  number: numberProp,
  surahNumber,
  variant = 'subtle',
  size = 'md',
  showEnglishLabel = true,
  className = '',
}) => {
  const actualAyahNumber = ayahNumberProp ?? numberProp ?? 1;
  const arabicNum = toArabicNumerals(actualAyahNumber);

  // Styling presets based on theme variant
  const variantStyles = {
    subtle: 'bg-gradient-to-b from-slate-100 to-slate-200/80 border-slate-300/80 text-slate-800 shadow-2xs',
    gold: 'bg-gradient-to-b from-amber-50 to-amber-100/90 border-amber-300 text-amber-950 shadow-2xs',
    emerald: 'bg-gradient-to-b from-emerald-50 to-emerald-100/90 border-emerald-300 text-emerald-950 shadow-2xs',
    dark: 'bg-white/10 border-white/20 text-white backdrop-blur-xs shadow-2xs',
    minimal: 'bg-transparent border-slate-200 text-slate-600',
  };

  const arabicMedallionStyles = {
    subtle: 'bg-white text-slate-900 border-slate-200 shadow-inner',
    gold: 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 border-amber-300/80 shadow-xs font-black',
    emerald: 'bg-emerald-600 text-white border-emerald-400 shadow-xs font-black',
    dark: 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs font-black',
    minimal: 'bg-slate-100 text-slate-800 border-slate-200 font-bold',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5 min-h-[24px]',
    md: 'text-[11px] px-2.5 py-1 gap-2 min-h-[30px]',
    lg: 'text-xs px-3 py-1.5 gap-2.5 min-h-[34px]',
  };

  const medallionSizeClasses = {
    sm: 'w-4.5 h-4.5 text-[10px]',
    md: 'w-5.5 h-5.5 text-[11px]',
    lg: 'w-6.5 h-6.5 text-xs',
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-sans font-bold rounded-full border select-none transition-all ${
        variantStyles[variant]
      } ${sizeClasses[size]} ${className}`}
      title={`Ayah ${actualAyahNumber}${surahNumber ? ` (Surah ${surahNumber})` : ''}`}
    >
      {showEnglishLabel && (
        <span className="tracking-tight uppercase font-extrabold text-[10px] sm:text-[10.5px] opacity-90">
          {surahNumber ? `Verse ${surahNumber}:${actualAyahNumber}` : `Verse ${actualAyahNumber}`}
        </span>
      )}

      {/* Traditional Quranic Circular Ayah End Medallion ۝ */}
      <span
        dir="rtl"
        className={`inline-flex items-center justify-center rounded-full border shrink-0 font-quran leading-none transition-transform ${
          arabicMedallionStyles[variant]
        } ${medallionSizeClasses[size]}`}
      >
        {arabicNum}
      </span>
    </div>
  );
};
