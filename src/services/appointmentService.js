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
export const findNearbyStores = async (zipCode, retries = 3) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock store data - Replace with actual API call
    return [
      {
        id: 1,
        name: 'We Buy Any Car - Downtown',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '(555) 123-4567',
        hours: 'Mon-Sat: 9AM-7PM, Sun: 10AM-5PM',
        distance: '2.3 miles',
        rating: 4.8,
        coordinates: { lat: 40.7128, lng: -74.006 },
      },
      {
        id: 2,
        name: 'We Buy Any Car - Midtown',
        address: '456 Park Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10022',
        phone: '(555) 234-5678',
        hours: 'Mon-Sat: 9AM-7PM, Sun: 10AM-5PM',
        distance: '3.7 miles',
        rating: 4.7,
        coordinates: { lat: 40.7589, lng: -73.9851 },
      },
      {
        id: 3,
        name: 'We Buy Any Car - Brooklyn',
        address: '789 Atlantic Avenue',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11238',
        phone: '(555) 345-6789',
        hours: 'Mon-Sat: 9AM-7PM, Sun: 10AM-5PM',
        distance: '5.1 miles',
        rating: 4.9,
        coordinates: { lat: 40.6782, lng: -73.9442 },
      },
    ];
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

export const appointmentService = {
  findNearbyStores,
  bookAppointment,
  getAvailableTimeSlots,
};

