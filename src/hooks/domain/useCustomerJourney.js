/**
 * useCustomerJourney Hook - Customer journey data management
 * Implements Single Responsibility Principle (SRP)
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GetCustomerJourney, 
  CustomerDetailJourney, 
  UpdateCustomerJourney,
} from '../../services/vehicleService';
import { cleanObject, formatPhone } from '../../utils/helpers';
import { getUserFriendlyMessage } from '../../services/errorHandler';

/**
 * Custom hook for customer journey operations
 * @param {string} journeyId - Customer journey ID
 * @returns {Object} Journey state and methods
 */
export function useCustomerJourney(journeyId) {
  const navigate = useNavigate();
  
  const [customerJourneyData, setCustomerJourneyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch customer journey data
   */
  const fetchJourney = useCallback(async () => {
    if (!journeyId) {
      navigate('/');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await GetCustomerJourney(journeyId);
      setCustomerJourneyData(data);
      return data;
    } catch (err) {
      const errorMessage = getUserFriendlyMessage(err);
      console.error('Error getting customer journey:', err);
      setError(errorMessage);
      
      // Show toast notification
      if (window.showToast) {
        window.showToast(errorMessage, 'error');
      }
      
      // Only navigate away if it's a critical error (404, 403)
      if (err.response?.status === 404 || err.response?.status === 403) {
        navigate('/');
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [journeyId, navigate]);

  /**
   * Update customer journey with series and body style
   * @param {Object} data - Series and body style data
   */
  const updateSeriesBody = useCallback(async (data) => {
    if (!journeyId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await CustomerDetailJourney({
        series: data.series,
        bodyStyle: data.bodyType,
      }, journeyId);
      
      const cleanResponse = cleanObject(response);
      setCustomerJourneyData(prev => ({ ...prev, ...cleanResponse }));
      return cleanResponse;
    } catch (err) {
      const errorMessage = getUserFriendlyMessage(err);
      console.error('Error updating customer journey:', err);
      setError(errorMessage);
      
      if (window.showToast) {
        window.showToast(errorMessage, 'error');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [journeyId]);

  /**
   * Update customer journey with vehicle condition data
   * @param {Object} data - Vehicle condition data
   */
  const updateVehicleCondition = useCallback(async (data) => {
    if (!journeyId) return null;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        mileage: parseInt(data.odometer?.toString().replace(/,/g, '') || '0'),
        zipCode: data.zipCode,
        email: data.email,
        isFinancedOrLeased: data.hasClearTitle === 'Yes',
        carIsDriveable: data.runsAndDrives === 'Yes',
        hasDamage: data.hasIssues === 'Yes',
        hasBeenInAccident: data.hasAccident === 'Yes',
        optionalPhoneNumber: data.phone ? formatPhone(data.phone) : null,
        customerHasOptedIntoSmsMessages: data.receiveSMS || false,
        captchaWasDisplayed: data.captchaMode || false,
      };

      const response = await UpdateCustomerJourney(payload, journeyId);
      const cleanResponse = cleanObject(response);
      setCustomerJourneyData(prev => ({ ...prev, ...cleanResponse }));
      
      // Store in localStorage for persistence
      localStorage.setItem('dataUpdateCustomerJourney', JSON.stringify(payload));
      
      return cleanResponse;
    } catch (err) {
      const errorMessage = getUserFriendlyMessage(err);
      console.error('Error updating customer journey:', err);
      setError(errorMessage);
      
      if (window.showToast) {
        window.showToast(errorMessage, 'error');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [journeyId]);

  // Auto-fetch on mount if journeyId exists
  useEffect(() => {
    if (journeyId && !customerJourneyData) {
      fetchJourney();
    }
  }, [journeyId, customerJourneyData, fetchJourney]);

  return {
    customerJourneyData,
    loading,
    error,
    fetchJourney,
    updateSeriesBody,
    updateVehicleCondition,
    setCustomerJourneyData,
  };
}
