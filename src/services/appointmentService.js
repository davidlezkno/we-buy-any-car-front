/**
 * Appointment Service - Handles appointment-related API calls
 * Implements Single Responsibility Principle (SRP)
 */

import httpClient from './utils/httpClient';

/**
 * Find nearby stores/locations
 * @param {string} zipCode - Zip code for search
 * @returns {Promise<Array>} Array of nearby stores
 */
/**
 * Find nearby stores/locations
 * @param {string} zipCode - Zip code for search
 * @returns {Promise<Array>} Array of nearby stores
 */
export const findNearbyStores = async (zipCode, retries = 3) => {
  try {
    const token = sessionStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const response = await httpClient.get(`http://localhost:5001/api/content/branches`, {
      params: { zipCode, limit: 5, branchType: 'Physical' },
      headers
    });

    // Transform backend response to match frontend expectation if needed
    // Backend returns { branchLocations: [...] }
    return response.data.branchLocations || [];
  } catch (error) {
    console.error('Find stores error:', error);
    if (retries === 0) return [];
    return findNearbyStores(zipCode, retries - 1);
  }
};

export const createAppointment = async (appointmentData, retries = 3) => {
  try {
    const token = sessionStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const response = await httpClient.post(`http://localhost:5001/api/Appointment/book`, appointmentData, { headers });
    return response.data;
  } catch (error) {
    console.error('Get makes error:', error);
    if (retries === 0) throw error;
    return createAppointment(appointmentData, retries - 1);
  }
};

/**
 * Book an appointment
 * @param {Object} appointmentData - Appointment details
 * @returns {Promise<Object>} Booking confirmation
 */
export const bookAppointment = async (appointmentData, retries = 3) => {
  try {
    const response = await httpClient.post('/api/appointments', appointmentData);
    return response.data;
  } catch (error) {
    console.error('Book appointment error:', error);
    if (retries === 0) throw error;
    return bookAppointment(appointmentData, retries - 1);
  }
};


/**
 * Get available time slots for a date
 * @param {string} date - Date string
 * @param {string} locationId - Location ID
 * @returns {Promise<Array>} Available time slots
 */
export const getAvailableTimeSlots = async (date, locationId, retries = 3) => {
  try {
    const response = await httpClient.get('/api/appointments/slots', {
      params: { date, locationId },
    });
    return response.data;
  } catch (error) {
    console.error('Get time slots error:', error);
    if (retries === 0) return [];
    return getAvailableTimeSlots(date, locationId, retries - 1);
  }
};

/**
 * Request OTP code for appointment booking
 * @param {Object} otpRequest - OTP request data (customerVehicleId, branchId, targetPhoneNumber)
 * @returns {Promise<Object>} OTP request result
 */
export const requestOTP = async (otpRequest, retries = 3) => {
  try {
    const token = sessionStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const response = await httpClient.post(`http://localhost:5001/api/scheduling/otp/request`, otpRequest, { headers });
    return response.data;
  } catch (error) {
    console.error('Request OTP error:', error);
    if (retries === 0) throw error;
    return requestOTP(otpRequest, retries - 1);
  }
};

export const appointmentService = {
  findNearbyStores,
  bookAppointment,
  getAvailableTimeSlots,
  createAppointment,
  requestOTP,
};

