/**
 * Vehicle Service - Handles all vehicle-related API calls
 * Implements Single Responsibility Principle (SRP)
 */

import axios from 'axios';
import httpClient from './utils/httpClient';
import { getCookie, random10Digits } from '../utils/helpers';


// External API endpoints
const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

/**
 * Decode VIN using NHTSA API
 * @param {string} vin - Vehicle Identification Number
 * @returns {Promise<Object>} Decoded vehicle data
 */
export const decodeVIN = async (vin, retries = 2) => {
  try {
    const response = await axios.get(
      `${NHTSA_BASE_URL}/DecodeVinValues/${vin}?format=json`
    );

    const data = response.data.Results[0];

    return {
      vin,
      make: data.Make,
      model: data.Model,
      year: data.ModelYear,
      trim: data.Trim,
      bodyClass: data.BodyClass,
      engineSize: data.DisplacementL,
      fuelType: data.FuelTypePrimary,
      transmission: data.TransmissionStyle,
      driveType: data.DriveType,
      vehicleType: data.VehicleType,
      manufacturer: data.Manufacturer,
    };
  } catch (error) {
    console.error('VIN decode error:', error);
    if (retries === 0) {
      return null;
    }
    return decodeVIN(vin, retries - 1);
  }
};

/**
 * Decode license plate (mock implementation)
 * @param {string} plate - License plate number
 * @param {string} state - State code
 * @returns {Promise<Object>} Vehicle data from license plate
 */
export const decodeLicensePlate = async (plate, state, retries = 2) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock response - Replace with actual API call
    return {
      plate,
      state,
      make: 'Toyota',
      model: 'Camry',
      year: '2020',
      vin: 'MOCK1234567890VIN',
      color: 'Silver',
      registrationStatus: 'Active',
    };
  } catch (error) {
    console.error('License plate lookup error:', error);
    if (retries === 0) {
      return null;
    }
    return decodeLicensePlate(plate, state, retries - 1);
  }
};

export const getVehicleMakes = async (year, retries = 2) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token desde tokenManager
    const response = await httpClient.get(`/api/Vehicles/makes/${year.toString()}`);
    return response.data.sort();
  } catch (error) {
    console.error('Get makes error:', error);
    if (retries === 0) return [];
    return getVehicleMakes(year, retries - 1);
  }
};

export const createVisitorID = async (retries = 2) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.post(
      `/api/Attribution/visitor`, 
      { oldVisitorId: random10Digits()}
    );
    return response.data;
  } catch (error) {
    console.error('Create customer journey error:', error);
    if (retries === 0) return [];
    return createVisitorID(retries - 1);
  }
};

export const createCustomerJourney = async (year,make,model, visitId = 1, retries = 2) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.post(
      `/api/customer-journey`, 
      {year: year, make: make, model: model, visitId: visitId}
    );
    return response.data;
  } catch (error) {
    console.error('Create customer journey error:', error);
    if (retries === 0) return [];
    return createCustomerJourney(year, make, model, visitId, retries - 1);
  }
};


export const createCustomerJourneyByPlate = async (  visitId, plateNumber, plateState ) => {
  try {
    visitId = visitId|| getCookie("visitorId");

    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.post(
      `/api/customer-journey/plate`, 
      {visitId: visitId, plateNumber: plateNumber, plateState: plateState}
    );
    return response.data;
  } catch (error) {
    console.error('Create customer journey error:', error);
    return null;
  }
};

export const createCustomerJourneyByVin = async ( vin = 1 , visitId ) => {
  try {
    visitId = visitId|| getCookie("visitorId");

    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.post(
      `/api/customer-journey/vin`, 
      {visitId: visitId, vin: vin}
    );
    return response.data;
  } catch (error) {
    console.error('Create customer journey error:', error);
    return null;
  }
};


export const CustomerDetailJourney = async (newData,customerJourneyId, retries = 2) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.post(`/api/customer-journey/${customerJourneyId.toString()}/vehicle-details`, newData);
    return response.data;
  } catch (error) {
    console.error('Get makes error:', error);
    if (retries === 0) return [];
    return CustomerDetailJourney(newData, customerJourneyId, retries - 1);
  }
};

export const UpdateCustomerJourney = async (newData,customerJourneyId, retries = 2) => {
  if(newData.email === ""){
    const data = JSON.parse(localStorage.getItem("dataUpdateCustomerJourney"));

    newData = {
      ...newData,
      ...(data ? data : {}),
      optionalPhoneNumber: data?.phone == "" ? null : data?.phone,
    };
  }

  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.post(`/api/customer-journey/${customerJourneyId.toString()}/vehicle-condition`, newData);
    return response.data;
  } catch (error) {
    console.error('Get makes error:', error);
    if (retries === 0) return [];
    return UpdateCustomerJourney(newData, customerJourneyId, retries - 1);
  }
};


export const GetCustomerJourney = async (customerJourneyId, retries = 2) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.get(`/api/customer-journey/${customerJourneyId.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Get makes error:', error);
    if (retries === 0) return [];
    return GetCustomerJourney(customerJourneyId, retries - 1);
  }
};



export const GetCustomerJourneyByVisit = async (visitId, retries = 2) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.get(`/api/customer-journey/${visitId.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Get makes error:', error);
    if (retries === 0) return [];
    return GetCustomerJourney(visitId, retries - 1);
  }
};

/**
 * Get models by make using NHTSA API
 * @param {string} make - Vehicle make
 * @returns {Promise<string[]>} Array of vehicle models
 */
export const getSeries = async (year,model,make, retries = 2) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.get(`/api/Vehicles/trims/${year.toString()}/${make.toString()}/${model.toString()}`);
    return response.data.sort();
  } catch (error) {
    console.error('Get models error:', error);
    if (retries === 0) return [];
    return getSeries(year,model,make, retries - 1);
  }
};

export const getModelsByMake = async (year,make, retries = 2) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.get(`/api/Vehicles/models/${year.toString()}/${make.toString()}`);
    return response.data.sort();
  } catch (error) {
    console.error('Get models error:', error);
    if (retries === 0) return [];
    return getModelsByMake(year,make, retries - 1);
  }
};

/**
 * Get vehicle years (last 30 years)
 * @returns {string[]} Array of years
 */
export const getVehicleYears = async (retries = 2) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.get('/api/Vehicles/years');
    
    return response.data;
  } catch (error) {
    console.error('Get years error:', error);
    if (retries === 0) return [];
    return getVehicleYears(retries - 1);
  }
};


export const getImageVehicle = async (externalUrl, retries = 2) => {
  try {
    // SEGURIDAD: Usar httpClient que maneja el token automáticamente
    const response = await httpClient.get(
      `/api/Vehicles/image?url=${encodeURIComponent(externalUrl)}`,
      { responseType: 'blob' }
    );

    const objectUrl = URL.createObjectURL(response.data);
    return objectUrl;
    
  } catch (error) {
    console.error('Get image error:', error);
    if (retries === 0) return [];
    return getImageVehicle(externalUrl, retries - 1);
  }
};

/**
 * Get vehicle image URL
 * @param {string} make - Vehicle make
 * @param {string} model - Vehicle model
 * @param {string} year - Vehicle year
 * @returns {Promise<string>} Image URL
 */
export const getVehicleImage = async (make, model, year, retries = 2) => {
  try {
    const basePath = import.meta.env.BASE_URL || '/';

    const vehicleImageMap = {
      toyota: `${basePath}vehicles/toyota-camry.jpg`,
      honda: `${basePath}vehicles/honda-civic.jpg`,
      ford: `${basePath}vehicles/ford-f150.jpg`,
      bmw: `${basePath}vehicles/bmw-sedan.jpg`,
      chevrolet: `${basePath}vehicles/chevrolet-suv.jpg`,
      tesla: `${basePath}vehicles/tesla-model3.jpg`,
      nissan: `${basePath}vehicles/nissan-altima.jpg`,
    };

    const makeLower = make?.toLowerCase() || '';
    const imageUrl =
      vehicleImageMap[makeLower] || `${basePath}vehicles/default-car.jpg`;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return imageUrl;
  } catch (error) {
    console.error('Get vehicle image error:', error);
    if (retries === 0) {
      const basePath = import.meta.env.BASE_URL || '/';
      return `${basePath}vehicles/default-car.jpg`;
    }
    return getVehicleImage(make, model, year, retries - 1);
  }
};

/**
 * Get component list for damage selection
 * @param {string} zoneId - Zone ID (unused in current implementation)
 * @returns {Promise<Array<{value: string, label: string}>>} Component options
 */
export const getComponentList = async (zoneId, retries = 2) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return [
      { value: '9', label: 'Bumper' },
      { value: '103', label: 'Bumper - Metal' },
      { value: '23', label: 'Grille' },
      { value: '4', label: 'Hood' },
      { value: '28', label: 'Lights' },
      { value: '60', label: 'Windshield' },
    ];
  } catch (error) {
    console.error('Get component list error:', error);
    if (retries === 0) return [];
    return getComponentList(zoneId, retries - 1);
  }
};

/**
 * Get fault type list for damage type selection
 * @param {string} componentId - Component ID (unused in current implementation)
 * @returns {Promise<Array<{value: string, label: string}>>} Fault type options
 */
export const getFaultTypeList = async (componentId, retries = 2) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return [
      { value: '17', label: 'Dent' },
      { value: '68', label: 'Dent - Large' },
      { value: '36', label: 'Rust' },
    ];
  } catch (error) {
    console.error('Get fault type list error:', error);
    if (retries === 0) return [];
    return getFaultTypeList(componentId, retries - 1);
  }
};

/**
 * Cancel appointment
 * @param {string} customerVehicleId - Customer vehicle ID
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<Object>} Response data
 */
export const cancelAppointment = async (customerVehicleId, phoneNumber, retries = 2) => {
  try {
    const response = await httpClient.delete(
      `/api/Appointment/cancel/${customerVehicleId}/${phoneNumber}`
    );
    return response.data;
  } catch (error) {
    console.error('Cancel appointment error:', error);
    if (retries === 0) throw error;
    return cancelAppointment(customerVehicleId, phoneNumber, retries - 1);
  }
};

export const vehicleService = {
  decodeVIN,
  decodeLicensePlate,
  getVehicleMakes,
  getModelsByMake,
  createCustomerJourney,
  UpdateCustomerJourney,
  CustomerDetailJourney,
  getVehicleYears,
  getVehicleImage,
  getComponentList,
  getFaultTypeList,
  getSeries,
  cancelAppointment,
};

