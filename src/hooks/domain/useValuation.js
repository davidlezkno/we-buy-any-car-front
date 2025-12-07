/**
 * useValuation Hook - Vehicle valuation operations
 * Implements Single Responsibility Principle (SRP)
 */

import { useState, useCallback } from 'react';
import { valuationService } from '../../services';

/**
 * Custom hook for vehicle valuation
 * @returns {Object} Valuation state and methods
 * 
 * @example
 * const { getValuation, valuation, loading, error } = useValuation();
 * await getValuation(vehicleData, userInfo);
 */
export function useValuation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [valuation, setValuation] = useState(null);

  const getValuation = useCallback(async (vehicleData, userInfo) => {
    setLoading(true);
    setError(null);
    setValuation(null);

    try {
      const result = await valuationService.getVehicleValuation(
        vehicleData,
        userInfo
      );
      setValuation(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to get valuation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitOffer = useCallback(async (vehicleData, userInfo, appointmentInfo) => {
    setLoading(true);
    setError(null);

    try {
      const result = await valuationService.submitVehicleOffer(
        vehicleData,
        userInfo,
        appointmentInfo
      );
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit offer';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getValuation,
    submitOffer,
    valuation,
    loading,
    error,
  };
}

