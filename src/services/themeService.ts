/**
 * Silsila — Theme Manager (Light / Dark / System)
 * 
 * Manages user theme preference, system color-scheme detection,
 * and updates the 'dark' class on <html> accordingly.
 */

export type AppTheme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'silsila_theme_v1';

export function getStoredTheme(): AppTheme {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {}
  return 'system';
}

export function isSystemDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getEffectiveTheme(theme: AppTheme = getStoredTheme()): 'light' | 'dark' {
  if (theme === 'system') {
    return isSystemDark() ? 'dark' : 'light';
  }
  return theme;
}

export function applyTheme(theme: AppTheme = getStoredTheme()): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const effective = getEffectiveTheme(theme);

  if (effective === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }

  // Also update color-scheme meta
  let meta = document.querySelector('meta[name="color-scheme"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'color-scheme');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', effective === 'dark' ? 'dark light' : 'light dark');
}

export function setAppTheme(theme: AppTheme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent('silsila_theme_changed', { detail: { theme } }));
}

/**
 * Initialize theme listener for system preference shifts
 */
export function initTheme(): void {
  if (typeof window === 'undefined') return;
  applyTheme();

  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (getStoredTheme() === 'system') {
        applyTheme('system');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
  }
}
