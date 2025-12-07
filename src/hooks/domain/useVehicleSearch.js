/**
 * useVehicleSearch Hook - Vehicle search operations
 * Implements Single Responsibility Principle (SRP)
 */

import { useState, useCallback } from 'react';
import { vehicleService } from '../../services';

/**
 * Custom hook for vehicle search operations
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoSearch - Whether to search on mount
 * @returns {Object} Search state and methods
 * 
 * @example
 * const { search, results, loading, error } = useVehicleSearch({ autoSearch: false });
 * await search('1HGCM82633A123456');
 */
export function useVehicleSearch(options = {}) {
  const { autoSearch = false } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const search = useCallback(async (vin) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await vehicleService.decodeVIN(vin);
      setResults(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to search vehicle';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    search,
    results,
    loading,
    error,
  };
}

