/**
 * Valuation Service - Handles vehicle valuation API calls
 * Implements Single Responsibility Principle (SRP)
 */

import httpClient from './utils/httpClient';

/**
 * Get vehicle valuation based on collected information
 * @param {Object} vehicleData - Vehicle information
 * @param {Object} userInfo - User information (currently unused)
 * @returns {Promise<Object>} Valuation result customerJourneyId
 */
export const getVehicleValuation = async (vehicleData, userInfo, retries = 2) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Base value calculation
    const year = parseInt(vehicleData.year) || 2020;
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;

    // Base values by year
    const baseValues = {
      2024: 40000,
      2023: 35000,
      2022: 30000,
      2021: 25000,
      2020: 20000,
      2019: 18000,
      2018: 16000,
      2017: 14000,
      2016: 12000,
      2015: 10000,
    };

    let baseValue = baseValues[year] || Math.max(5000, 40000 - age * 2500);

    // Adjust for mileage
    const mileage = parseInt(
      vehicleData.odometer || vehicleData.mileage || 50000
    );
    if (mileage < 30000) {
      baseValue *= 1.15;
    } else if (mileage < 50000) {
      baseValue *= 1.05;
    } else if (mileage > 100000) {
      baseValue *= 0.75;
    } else if (mileage > 150000) {
      baseValue *= 0.6;
    }

    // Adjust for condition
    if (vehicleData.runsAndDrives === 'No') {
      baseValue *= 0.5;
    }
    if (vehicleData.hasIssues === 'Yes') {
      baseValue *= 0.85;
    }
    if (vehicleData.hasAccident === 'Yes') {
      baseValue *= 0.8;
    }
    if (vehicleData.hasClearTitle === 'No') {
      baseValue *= 0.7;
    }

    // Make/model adjustments
    const premiumMakes = [
      'Tesla',
      'BMW',
      'Mercedes-Benz',
      'Audi',
      'Porsche',
      'Lexus',
    ];
    if (premiumMakes.includes(vehicleData.make)) {
      baseValue *= 1.2;
    }

    // Add small variance for realism
    const variance = (Math.random() - 0.5) * 0.1; // ±5%
    const finalValue = Math.round(baseValue * (1 + variance));

    return {
      success: true,
      valuation: finalValue,
      currency: 'USD',
      formattedValue: `$${finalValue.toLocaleString()}`,
      timestamp: new Date().toISOString(),
      vehicleInfo: {
        year: vehicleData.year,
        make: vehicleData.make,
        model: vehicleData.model,
        mileage: mileage,
        condition: {
          runsAndDrives: vehicleData.runsAndDrives,
          hasIssues: vehicleData.hasIssues,
          hasAccident: vehicleData.hasAccident,
          hasClearTitle: vehicleData.hasClearTitle,
        },
      },
    };
  } catch (error) {
    console.error('Get valuation error:', error);
    if (retries === 0) {
      return {
        success: false,
        valuation: 10000,
        currency: 'USD',
        formattedValue: '$10,000',
        error: error.message,
      };
    }
    return getVehicleValuation(vehicleData, userInfo, retries - 1);
  }
};


export const saveValuationVehicle = async (valuationVehicle, retries = 2) => {
  try {
    if(valuationVehicle.email === ""){
      const data = JSON.parse(localStorage.getItem("dataUpdateCustomerJourney"));
      valuationVehicle = {
        ...valuationVehicle,
        ...data,
        optionalPhoneNumber: data?.phone == "" ? null : data?.phone,
      };
    }
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.post(`/api/Valuation`, valuationVehicle);
    return response.data;
  } catch (error) {
    console.error('Save valuation vehicle error:', error);
    
    // Check if it's a 500 or 404 error - don't retry, throw immediately
    const status = error.response?.status;
    if (status === 500 || status === 404) {
      throw error; // Throw error to be caught by caller
    }
    
    // For other errors, retry
    if (retries === 0) {
      throw error; // Throw error after all retries exhausted
    }
    return saveValuationVehicle(valuationVehicle, retries - 1);
  }
};


export const getValuationVehicle = async (id, retries = 2) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.get(`/api/Valuation/${id.toString()}`);
    return response.data.sort();
  } catch (error) {
    console.error('Get valuation error:', error);
    if (retries === 0) return [];
    return getValuationVehicle(id, retries - 1);
  }
};

/**
 * Submit vehicle for offer
 * @param {Object} vehicleData - Vehicle information
 * @param {Object} userInfo - User information
 * @param {Object} appointmentInfo - Appointment information
 * @returns {Promise<Object>} Offer submission result
 */
export const submitVehicleOffer = async (
  vehicleData,
  userInfo,
  appointmentInfo,
  retries = 2
) => {
  try {
    const response = await httpClient.post('/api/offers', {
      vehicle: vehicleData,
      user: userInfo,
      appointment: appointmentInfo,
      timestamp: new Date().toISOString(),
    });

    return response.data;
  } catch (error) {
    console.error('Submit offer error:', error);
    if (retries === 0) {
      // For demo, return mock success
      return {
        success: true,
        offerId:
          'OFFER-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        estimatedValue: Math.floor(Math.random() * 30000) + 5000,
      };
    }
    return submitVehicleOffer(vehicleData, userInfo, appointmentInfo, retries - 1);
  }
};

export const valuationService = {
  getVehicleValuation,
  submitVehicleOffer,
  getValuationVehicle,
  saveValuationVehicle,
};

