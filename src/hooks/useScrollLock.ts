import { useEffect } from 'react';
import { lockScroll, unlockScroll } from '../services/scrollLockService';

/**
 * Custom React hook to lock the background screen and make it completely static
 * whenever a pop-up / modal / overlay is active.
 *
 * @param isLocked Whether the background should be locked (defaults to true)
 */
export function useScrollLock(isLocked: boolean = true): void {
  useEffect(() => {
    if (!isLocked) return;

    lockScroll();

    return () => {
      unlockScroll();
    };
  }, [isLocked]);
}
