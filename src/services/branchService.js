/**
 * Branch Service - Handles branch/location API calls
 * Implements Single Responsibility Principle (SRP)
 * 
 * SEGURIDAD: Usa httpClient con tokenManager integrado
 */

import httpClient from './utils/httpClient';

export const getBranches = async (zipCode, limit, type, retries = 3) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.get(`/api/content/branches?zipCode=${zipCode}&limit=5&branchType=${type}`);
    return response.data;
  } catch (error) {
    console.error('Get branches error:', error);
    if (retries === 0) return [];
    return getBranches(zipCode, limit, type, retries - 1);
  }
};

export const getBrancheById = async (idBranch, retries = 3) => {
  try {
    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.get(`/api/content/branches/${idBranch}`);
    return response.data;
  } catch (error) {
    console.error('Get branches error:', error);
    if (retries === 0) return [];
    return getBrancheById(idBranch, retries - 1);
  }
};

export const getBranchesByCustomerVehicle = async (zipCode, customerVehicleId) => {
  try {
    // if(zipCode == "" || zipCode == null){
    //   zipCode = localStorage.getItem("zipCode");
    // }

    if(customerVehicleId == "" || customerVehicleId == null){
      customerVehicleId = localStorage.getItem("customerVehicleId");
    }

    // SEGURIDAD: httpClient maneja automáticamente el token
    const response = await httpClient.get(`/api/Appointment/availability/${zipCode}/${customerVehicleId}`);
    return response.data;
  } catch (error) {
    console.error('Get branches error:', error);
    return [];
  }
};
