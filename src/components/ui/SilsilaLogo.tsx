import React from 'react';

export interface SilsilaLogoProps {
  /**
   * Layout variant:
   * - 'mark-only': Just the emblem (Intertwined Golden Links + Royal Blue Arc + Diamonds)
   * - 'horizontal': Emblem on left, "Silsila" logotype and tagline on right
   * - 'vertical' | 'primary': Stacked emblem, "Silsila" logotype, and tagline
   * - 'app-icon': Squircle container with the emblem & logotype (matching official Silsila app icon)
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
 * Official High-Fidelity Vector Emblem for Silsila (سلسلة)
 * Features:
 * 1. Two Intertwined Capsule Chain Links (Golden Metallic Gradient #D99426 / #F59E0B)
 * 2. Distinctive Interlocking Royal Blue / Indigo Inner Arc (#3753DC)
 * 3. Top & Bottom Gold Rhombus / Diamonds (سلسلة Continuity Markers)
 */
export const SilsilaEmblem: React.FC<{
  className?: string;
  isDark?: boolean;
  showDiamonds?: boolean;
  id?: string;
}> = ({
  className = 'w-12 h-12',
  isDark = false,
  showDiamonds = true,
  id = 'silsila-emblem',
}) => {
  return (
    <svg
      id={id}
      viewBox="0 0 200 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Silsila Brand Emblem"
    >
      <defs>
        {/* Rich Warm Gold Metallic Gradient */}
        <linearGradient id="silsilaEmblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EDB037" />
          <stop offset="45%" stopColor="#D99426" />
          <stop offset="100%" stopColor="#BD7A16" />
        </linearGradient>

        {/* Vibrant Royal Blue / Cobalt Accent Gradient */}
        <linearGradient id="silsilaEmblemBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F71FA" />
          <stop offset="50%" stopColor="#3753DC" />
          <stop offset="100%" stopColor="#263DB3" />
        </linearGradient>

        {/* Subtle Depth Shadow */}
        <filter id="silsilaSoftShadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity={isDark ? "0.2" : "0.08"} />
        </filter>
      </defs>

      <g filter="url(#silsilaSoftShadow)">
        {/* 1. TOP DIAMOND */}
        {showDiamonds && (
          <polygon
            points="100,16 109,26 100,36 91,26"
            fill="url(#silsilaEmblemGold)"
          />
        )}

        {/* 2. BOTTOM DIAMOND */}
        {showDiamonds && (
          <polygon
            points="100,134 109,144 100,154 91,144"
            fill="url(#silsilaEmblemGold)"
          />
        )}

        {/* 3. RIGHT LINK GOLD BODY (Outer loop & top/bottom arms) */}
        <path
          d="M 106,58 L 138,58 A 24,24 0 0,1 138,106 L 106,106"
          stroke="url(#silsilaEmblemGold)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 4. BLUE INTERLOCKING INNER ARC (Passes under the left link's top arm) */}
        <path
          d="M 112,58 A 24,24 0 0,0 112,106"
          stroke="url(#silsilaEmblemBlue)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 5. LEFT LINK GOLD COMPLETE LOOP */}
        <path
          d="M 62,58 L 94,58 A 24,24 0 0,1 94,106 L 62,106 A 24,24 0 0,1 62,58 Z"
          stroke="url(#silsilaEmblemGold)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 6. BLUE WEAVE OVER LEFT LINK BOTTOM ARM (Creates the physical 3D interlock!) */}
        <path
          d="M 96,96 A 24,24 0 0,0 112,106"
          stroke="url(#silsilaEmblemBlue)"
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
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
  iconBg = 'cream',
  className = '',
  id = 'silsila-logo',
}) => {
  // Size mappings
  const emblemSizes = {
    xs: 'w-6 h-5',
    sm: 'w-8 h-7',
    md: 'w-10 h-8',
    lg: 'w-14 h-12',
    xl: 'w-20 h-16',
    '2xl': 'w-28 h-24',
    hero: 'w-36 h-30',
  };

  const titleSizes = {
    xs: 'text-sm font-bold',
    sm: 'text-base font-bold',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl sm:text-3xl font-bold tracking-tight',
    xl: 'text-3xl sm:text-4xl font-bold tracking-tight',
    '2xl': 'text-4xl sm:text-5xl font-bold tracking-tight',
    hero: 'text-5xl sm:text-6xl font-bold tracking-tight',
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

  // 2. APP ICON PREVIEW (Official Squircle Icon Box as provided in brand asset)
  if (variant === 'app-icon') {
    const isDark = theme === 'dark';
    const isNavyBg = iconBg === 'navy' || theme === 'navy';
    const isCreamBg = iconBg === 'cream' || (!isNavyBg && !isDark);

    const containerBg = isNavyBg
      ? 'bg-[#0F1E3A] text-white border-slate-700/60 shadow-md'
      : isCreamBg
      ? 'bg-[#FAF6F0] text-[#0F1E3A] border-amber-200/70 shadow-sm'
      : 'bg-white dark:bg-[#0F1E3A] text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 shadow-sm';

    return (
      <div
        id={id}
        className={`relative inline-flex flex-col items-center justify-center rounded-[24%] p-2 overflow-hidden select-none transition-transform border ${containerBg} ${className}`}
        style={{ aspectRatio: '1/1' }}
      >
        <SilsilaEmblem
          className="w-full h-auto max-w-[85%]"
          isDark={isNavyBg || isDark}
        />
        <span
          className="font-serif font-bold text-[11px] sm:text-xs tracking-tight text-[#0E1A34] dark:text-slate-100 mt-0.5 leading-none"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Silsila
        </span>
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
            className={`font-serif tracking-tight leading-none text-[#0E1A34] dark:text-slate-100 ${titleSizes[size]}`}
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
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
          className={`${emblemSizes[size]} drop-shadow-2xs transition-transform hover:scale-105`}
          isDark={theme === 'dark'}
        />

        <div className="mt-2 space-y-1">
          <h1
            className={`font-serif text-[#0E1A34] dark:text-white leading-none ${titleSizes[size]}`}
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Silsila
          </h1>

          {tagline && (
            <div className="flex items-center justify-center gap-1.5 pt-0.5 text-amber-700 dark:text-amber-400 font-medium">
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
          className={`font-serif text-[#0E1A34] dark:text-white leading-none ${titleSizes[size]}`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
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

