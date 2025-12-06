/**
 * Valuation Service - Handles vehicle valuation API calls
 * Implements Single Responsibility Principle (SRP)
 */

import httpClient from './utils/httpClient';

export const getBranches = async (zipCode, limit, type, retries = 3) => {
  try {
    const token = sessionStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    const response = await httpClient.get(`http://localhost:5001/api/content/branches?zipCode=${zipCode}&limit=5&branchType=${type}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Get branches error:', error);
    if (retries === 0) return [];
    return getBranches(zipCode, limit, type, retries - 1);
  }
};

export const getBrancheById = async (idBranch, retries = 3) => {
  try {
    const token = sessionStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    const response = await httpClient.get(`http://localhost:5001/api/content/branches/${idBranch}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Get branches error:', error);
    if (retries === 0) return [];
    return getBrancheById(idBranch, retries - 1);
  }
};

export const getBranchesByCustomerVehicle = async (zipCode, customerVehicleId) => {
  try {
    const token = sessionStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    
    // if(zipCode == "" || zipCode == null){
    //   zipCode = localStorage.getItem("zipCode");
    // }

    if(customerVehicleId == "" || customerVehicleId == null){
      customerVehicleId = localStorage.getItem("customerVehicleId");
    }

    const response = await httpClient.get(`http://localhost:5001/api/Appointment/availability/${zipCode}/${customerVehicleId}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Get branches error:', error);
    return [];
   
  }
};
