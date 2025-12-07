/**
 * useDisclosure Hook - Manage open/close state (commonly used for modals, dropdowns, etc.)
 * Implements Single Responsibility Principle (SRP)
 */

import { useToggle } from './useToggle';

/**
 * Custom hook for managing disclosure state (open/close)
 * @param {boolean} initialIsOpen - Initial open state
 * @returns {Object} Disclosure state and methods
 * 
 * @example
 * const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
 */
export function useDisclosure(initialIsOpen = false) {
  const [isOpen, toggle, setTrue, setFalse] = useToggle(initialIsOpen);

  return {
    isOpen,
    onOpen: setTrue,
    onClose: setFalse,
    onToggle: toggle,
  };
}

