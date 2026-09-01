import React from 'react';

export interface SilsilaLogoProps {
  /**
   * Layout variant:
   * - 'mark-only': Just the emblem (Arch + Qaf + Book)
   * - 'horizontal': Emblem on left, "Silsila" logotype and tagline on right
   * - 'vertical' | 'primary': Stacked emblem, "Silsila" logotype, and tagline
   * - 'app-icon': Squircle container with the emblem (like iOS / Android app icon)
   * - 'compact': Emblem + "Silsila" text inline without tagline (for headers/nav)
   */
  variant?: 'mark-only' | 'horizontal' | 'vertical' | 'primary' | 'app-icon' | 'compact';
  /** Size preset */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  /** Color theme preference */
  theme?: 'auto' | 'light' | 'dark' | 'navy';
  /** Tagline text or custom subtitle */
  tagline?: string | false;
  /** Background container style for app-icon */
  iconBg?: 'navy' | 'cream' | 'white' | 'transparent';
  /** Additional custom class names */
  className?: string;
  /** Unique id for DOM targeting */
  id?: string;
}

/**
 * High-fidelity vector emblem for Silsila
 * Combines:
 * 1. The Islamic Arch / Dome with Top Finial Diamond (#D4A017 / Gold)
 * 2. The Arabic Letter Qaf (ق) Calligraphy
 * 3. The Open Quran Book Base (#0F1E3A / Deep Navy & Gold accents)
 */
export const SilsilaEmblem: React.FC<{
  className?: string;
  isDark?: boolean;
  accentGold?: string;
  primaryColor?: string;
  id?: string;
}> = ({
  className = 'w-12 h-12',
  isDark = false,
  accentGold = '#D4A017',
  primaryColor,
  id = 'silsila-emblem',
}) => {
  const mainNavy = primaryColor || (isDark ? '#FFFFFF' : '#0F1E3A');
  const bookNavy = isDark ? '#1E293B' : '#0F1E3A';
  const pageFill = isDark ? '#0F172A' : '#FFFFFF';

  return (
    <svg
      id={id}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Silsila Brand Emblem"
    >
      <defs>
        {/* Subtle Gold Gradient */}
        <linearGradient id="silsilaGoldGrad" x1="50" y1="10" x2="150" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E6B422" />
          <stop offset="50%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#B3840E" />
        </linearGradient>
        {/* Deep Navy Gradient */}
        <linearGradient id="silsilaNavyGrad" x1="30" y1="100" x2="170" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isDark ? '#38BDF8' : '#0F1E3A'} />
          <stop offset="100%" stopColor={isDark ? '#818CF8' : '#1E293B'} />
        </linearGradient>
        {/* Shadow for emblem depth */}
        <filter id="emblemGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#D4A017" floodOpacity="0.15" />
        </filter>
      </defs>

      <g filter="url(#emblemGlow)">
        {/* 1. TOP FINIAL DIAMOND */}
        <polygon
          points="100,12 105.5,19 100,26 94.5,19"
          fill="url(#silsilaGoldGrad)"
        />

        {/* 2. ISLAMIC ARCH / DOME (GOLD) */}
        {/* Outer Arch */}
        <path
          d="M 100,24 C 114,35 136,52 144,78 C 149,94 147,112 146,126 C 140,126 138,124 138,118 C 139,102 138,84 130,70 C 122,55 110,41 100,34 C 90,41 78,55 70,70 C 62,84 61,102 62,118 C 62,124 60,126 54,126 C 53,112 51,94 56,78 C 64,52 86,35 100,24 Z"
          fill="url(#silsilaGoldGrad)"
        />

        {/* 3. ARABIC CALLIGRAPHY LETTER QAF (ق) */}
        {/* Two Dots of Qaf */}
        <ellipse cx="94" cy="54" rx="3.5" ry="3.5" fill={mainNavy} />
        <ellipse cx="106" cy="54" rx="3.5" ry="3.5" fill={mainNavy} />

        {/* Qaf Loop and Tail */}
        <path
          d="M 98,64 C 92,64 88,68 88,73 C 88,78 92,82 98,82 C 104,82 108,78 108,73 C 108,68 104,64 98,64 Z M 98,69 C 100.5,69 102.5,70.8 102.5,73 C 102.5,75.2 100.5,77 98,77 C 95.5,77 93.5,75.2 93.5,73 C 93.5,70.8 95.5,69 98,69 Z"
          fill={mainNavy}
        />
        {/* Qaf Graceful Sweeping Body */}
        <path
          d="M 108,74 C 108,82 103,88 97,90 C 89,92 82,90 77,84 C 74,80 72,78 70,79 C 68,80 68,85 71,90 C 76,98 86,104 98,103 C 111,102 120,93 122,81 C 123,74 122,69 119,67 C 117,66 115,67 114,70 C 113,73 111,74 108,74 Z"
          fill={mainNavy}
        />

        {/* 4. OPEN QURAN BOOK BASE */}
        {/* Bottom Outer Navy Cover Base */}
        <path
          d="M 100,154 C 84,142 56,133 30,132 C 26,132 24,136 27,138 C 54,147 80,159 97,171 C 99,172.5 101,172.5 103,171 C 120,159 146,147 173,138 C 176,136 174,132 170,132 C 144,133 116,142 100,154 Z"
          fill={bookNavy}
        />

        {/* Lower Book Leaf (Left Page Layer 1) */}
        <path
          d="M 98,146 C 78,133 52,125 28,124 C 26,124 24,127 26,129 C 50,136 76,146 96,158 C 97.5,159 98.5,158 98.5,156 L 98,146 Z"
          fill="url(#silsilaGoldGrad)"
          opacity="0.85"
        />
        {/* Lower Book Leaf (Right Page Layer 1) */}
        <path
          d="M 102,146 C 122,133 148,125 172,124 C 174,124 176,127 174,129 C 150,136 124,146 104,158 C 102.5,159 101.5,158 101.5,156 L 102,146 Z"
          fill="url(#silsilaGoldGrad)"
          opacity="0.85"
        />

        {/* Middle Main Leaf (Left Page - Deep Navy/Slate with Gold edge) */}
        <path
          d="M 98,136 C 76,123 48,114 24,113 C 22,113 20,116 22,118 C 48,126 74,136 96,149 C 97.5,150 98.5,149 98.5,147 L 98,136 Z"
          fill={bookNavy}
        />
        {/* Middle Main Leaf (Right Page - Deep Navy/Slate with Gold edge) */}
        <path
          d="M 102,136 C 124,123 152,114 176,113 C 178,113 180,116 178,118 C 152,126 126,136 104,149 C 102.5,150 101.5,149 101.5,147 L 102,136 Z"
          fill={bookNavy}
        />

        {/* Top Fanning Leaf (Left Page - Clean Crisp Page) */}
        <path
          d="M 98,126 C 74,113 44,103 20,102 C 18,102 16,105 18,107 C 46,115 72,126 96,140 C 97.5,141 98.5,140 98.5,138 L 98,126 Z"
          fill={pageFill}
          stroke="url(#silsilaGoldGrad)"
          strokeWidth="1.5"
        />
        {/* Top Fanning Leaf (Right Page - Clean Crisp Page) */}
        <path
          d="M 102,126 C 126,113 156,103 180,102 C 182,102 184,105 182,107 C 154,115 128,126 104,140 C 102.5,141 101.5,140 101.5,138 L 102,126 Z"
          fill={pageFill}
          stroke="url(#silsilaGoldGrad)"
          strokeWidth="1.5"
        />

        {/* Central Spine Gold Diamond */}
        <polygon
          points="100,147 104,153 100,159 96,153"
          fill="url(#silsilaGoldGrad)"
        />
      </g>
    </svg>
  );
};

export const SilsilaLogo: React.FC<SilsilaLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  theme = 'auto',
  tagline = "Learn the Qur'an, Word by Word",
  iconBg = 'transparent',
  className = '',
  id = 'silsila-logo',
}) => {
  // Size mappings
  const emblemSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
    hero: 'w-36 h-36',
  };

  const titleSizes = {
    xs: 'text-sm font-black',
    sm: 'text-base font-black',
    md: 'text-xl font-black tracking-tight',
    lg: 'text-2xl sm:text-3xl font-black tracking-tight',
    xl: 'text-3xl sm:text-4xl font-black tracking-tight',
    '2xl': 'text-4xl sm:text-5xl font-black tracking-tight',
    hero: 'text-5xl sm:text-6xl font-black tracking-tight',
  };

  const taglineSizes = {
    xs: 'text-[9px] tracking-wide',
    sm: 'text-[10px] tracking-wider',
    md: 'text-xs tracking-wider',
    lg: 'text-xs sm:text-sm tracking-wider',
    xl: 'text-sm sm:text-base tracking-widest',
    '2xl': 'text-base sm:text-lg tracking-widest',
    hero: 'text-lg sm:text-xl tracking-widest',
  };

  // 1. MARK ONLY VARIANT
  if (variant === 'mark-only') {
    return (
      <SilsilaEmblem
        id={id}
        className={`${emblemSizes[size]} ${className}`}
        isDark={theme === 'dark'}
      />
    );
  }

  // 2. APP ICON PREVIEW (Squircle Icon Box as seen in brand document)
  if (variant === 'app-icon') {
    const isNavyBg = iconBg === 'navy' || theme === 'navy' || (theme === 'dark' && iconBg !== 'cream');
    const isCreamBg = iconBg === 'cream';

    const bgClass = isNavyBg
      ? 'bg-[#0F1E3A] text-white shadow-xl shadow-slate-950/30 border border-slate-700/50'
      : isCreamBg
      ? 'bg-[#F8F6F0] text-[#0F1E3A] shadow-lg shadow-amber-900/10 border border-amber-200/60'
      : 'bg-white dark:bg-[#0F1E3A] text-slate-900 dark:text-white shadow-lg border border-slate-200 dark:border-slate-800';

    return (
      <div
        id={id}
        className={`relative inline-flex flex-col items-center justify-center rounded-[24%] p-3 overflow-hidden select-none transition-transform hover:scale-105 ${bgClass} ${className}`}
        style={{ aspectRatio: '1/1' }}
      >
        <SilsilaEmblem
          className="w-full h-full max-w-[85%] max-h-[85%]"
          isDark={isNavyBg}
        />
      </div>
    );
  }

  // 3. COMPACT (Header/Navbar Inline)
  if (variant === 'compact') {
    return (
      <div id={id} className={`inline-flex items-center gap-2 select-none ${className}`}>
        <SilsilaEmblem className={emblemSizes[size]} isDark={theme === 'dark'} />
        <div className="flex flex-col text-left">
          <span
            className={`font-serif tracking-tight leading-none text-[#0F1E3A] dark:text-slate-100 ${titleSizes[size]}`}
            style={{ fontFamily: "'Plus Jakarta Sans', Georgia, serif" }}
          >
            Silsila
          </span>
          {tagline && (
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 leading-tight mt-0.5">
              سلسلة • Quran Hifz
            </span>
          )}
        </div>
      </div>
    );
  }

  // 4. VERTICAL / PRIMARY (Centered Stacked Logo with Diamond Flourishes)
  if (variant === 'vertical' || variant === 'primary') {
    return (
      <div id={id} className={`flex flex-col items-center text-center select-none ${className}`}>
        <SilsilaEmblem
          className={`${emblemSizes[size]} drop-shadow-sm transition-transform hover:scale-105`}
          isDark={theme === 'dark'}
        />

        <div className="mt-2.5 space-y-1">
          <h1
            className={`font-serif text-[#0F1E3A] dark:text-white leading-none ${titleSizes[size]}`}
            style={{ fontFamily: "'Plus Jakarta Sans', Georgia, serif" }}
          >
            Silsila
          </h1>

          {tagline && (
            <div className="flex items-center justify-center gap-1.5 pt-1 text-amber-700 dark:text-amber-400 font-medium">
              <span className="text-amber-600 dark:text-amber-400 text-xs">◆</span>
              <p
                className={`font-serif tracking-wide ${taglineSizes[size]}`}
                style={{ fontStyle: 'italic' }}
              >
                {tagline}
              </p>
              <span className="text-amber-600 dark:text-amber-400 text-xs">◆</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. HORIZONTAL (Default: Emblem on left, Logotype + Tagline on right)
  return (
    <div id={id} className={`inline-flex items-center gap-3 select-none ${className}`}>
      <SilsilaEmblem className={emblemSizes[size]} isDark={theme === 'dark'} />

      <div className="flex flex-col text-left justify-center">
        <h1
          className={`font-serif text-[#0F1E3A] dark:text-white leading-none ${titleSizes[size]}`}
          style={{ fontFamily: "'Plus Jakarta Sans', Georgia, serif" }}
        >
          Silsila
        </h1>

        {tagline && (
          <p
            className={`text-amber-700 dark:text-amber-400 font-medium font-serif italic mt-1 leading-tight ${taglineSizes[size]}`}
          >
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
};
