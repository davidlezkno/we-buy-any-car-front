/**
 * useToggle Hook - Toggle boolean state
 * Implements Single Responsibility Principle (SRP)
 */

import { useState, useCallback } from 'react';

/**
 * Custom hook for toggling boolean state
 * @param {boolean} initialValue - Initial boolean value
 * @returns {[boolean, Function, Function, Function]} [value, toggle, setTrue, setFalse]
 * 
 * @example
 * const [isOpen, toggle, open, close] = useToggle(false);
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse];
}

