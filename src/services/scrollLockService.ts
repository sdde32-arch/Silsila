// Silsila Global Background Scroll & Screen Static Lock Service
// Ensures that when any modal/popup is open, the background screen is 100% frozen,
// unscrollable, and non-interactive, while preserving the exact viewport position.

let activeLockCount = 0;
let savedScrollY = 0;
let previousBodyStyle: {
  overflow: string;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  height: string;
  paddingRight: string;
  touchAction: string;
} | null = null;
let previousHtmlStyle: {
  overflow: string;
  overscrollBehavior: string;
} | null = null;

export function lockScroll(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  if (activeLockCount === 0) {
    // Record the current scroll position before freezing
    savedScrollY =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    // Cache existing inline style states
    previousBodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      height: document.body.style.height,
      paddingRight: document.body.style.paddingRight,
      touchAction: document.body.style.touchAction,
    };

    previousHtmlStyle = {
      overflow: document.documentElement.style.overflow,
      overscrollBehavior: document.documentElement.style.overscrollBehavior,
    };

    // Calculate scrollbar width to prevent horizontal layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Freeze documentElement & body
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    document.documentElement.classList.add('modal-open');

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.touchAction = 'none';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.classList.add('modal-open');
  }

  activeLockCount++;
}

export function unlockScroll(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  activeLockCount = Math.max(0, activeLockCount - 1);

  if (activeLockCount === 0) {
    // Restore documentElement
    if (previousHtmlStyle) {
      document.documentElement.style.overflow = previousHtmlStyle.overflow;
      document.documentElement.style.overscrollBehavior = previousHtmlStyle.overscrollBehavior;
    } else {
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
    }
    document.documentElement.classList.remove('modal-open');

    // Restore body
    if (previousBodyStyle) {
      document.body.style.overflow = previousBodyStyle.overflow;
      document.body.style.position = previousBodyStyle.position;
      document.body.style.top = previousBodyStyle.top;
      document.body.style.left = previousBodyStyle.left;
      document.body.style.right = previousBodyStyle.right;
      document.body.style.width = previousBodyStyle.width;
      document.body.style.height = previousBodyStyle.height;
      document.body.style.paddingRight = previousBodyStyle.paddingRight;
      document.body.style.touchAction = previousBodyStyle.touchAction;
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.paddingRight = '';
      document.body.style.touchAction = '';
    }
    document.body.classList.remove('modal-open');

    // Restore exact scroll position without jumps
    window.scrollTo(0, savedScrollY);
  }
}

/**
 * Force reset all locks (e.g. during page unmounts or hard navigation)
 */
export function forceUnlockAllScroll(): void {
  activeLockCount = 1;
  unlockScroll();
}

export function isScrollLocked(): boolean {
  return activeLockCount > 0;
}
