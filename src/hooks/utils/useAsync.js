/**
 * useAsync Hook - Handle async operations with loading, error, and data states
 * Implements Single Responsibility Principle (SRP)
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for managing async operations
 * @param {Function} asyncFunction - Async function to execute
 * @param {boolean} immediate - Whether to execute immediately on mount
 * @returns {Object} Async state and execute function
 * 
 * @example
 * const { execute, loading, error, data } = useAsync(fetchData, false);
 * await execute(params);
 */
export function useAsync(asyncFunction, immediate = false) {
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const result = await asyncFunction(...args);
        if (mountedRef.current) {
          setData(result);
          setError(null);
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err);
          setData(null);
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [asyncFunction]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { execute, loading, error, data };
}

