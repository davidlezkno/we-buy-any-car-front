/**
 * useScrollLock Hook - Lock/unlock body scroll
 * Implements Single Responsibility Principle (SRP)
 */

import { useEffect } from 'react';

/**
 * Custom hook for locking body scroll (useful for modals)
 * @param {boolean} lock - Whether to lock scroll
 * 
 * @example
 * useScrollLock(isModalOpen);
 */
export function useScrollLock(lock) {
  useEffect(() => {
    if (lock) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [lock]);
}

