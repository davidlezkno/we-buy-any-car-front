/**
 * useAppointmentBooking Hook - Appointment booking operations
 * Implements Single Responsibility Principle (SRP)
 */

import { useState, useCallback } from 'react';
import { appointmentService } from '../../services';

/**
 * Custom hook for appointment booking
 * @returns {Object} Booking state and methods
 * 
 * @example
 * const { bookAppointment, loading, error } = useAppointmentBooking();
 * await bookAppointment(appointmentData);
 */
export function useAppointmentBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bookAppointment = useCallback(async (appointmentData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await appointmentService.bookAppointment(appointmentData);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to book appointment';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const findStores = useCallback(async (zipCode) => {
    setLoading(true);
    setError(null);

    try {
      const stores = await appointmentService.findNearbyStores(zipCode);
      return stores;
    } catch (err) {
      const errorMessage = err.message || 'Failed to find stores';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookAppointment,
    findStores,
    loading,
    error,
  };
}

