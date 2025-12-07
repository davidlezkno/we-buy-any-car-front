/**
 * useBranches Hook - Branch data management
 * Implements Single Responsibility Principle (SRP)
 */

import { useState, useCallback, useRef } from 'react';
import { getBrancheById, getBranchesByCustomerVehicle } from '../../services/branchService';
import { convertTo12Hour, getDayName, getNext12Days } from '../../utils/helpers';

/**
 * Transform branch time slots to operation hours format
 * @param {Object} branch - Branch data with time slots
 * @param {string} type - Branch type ('branch' or 'home')
 * @returns {Object} Transformed branch data
 */
const transformBranchData = (branch, type = 'branch') => {
  const days = getNext12Days();
  const operationHours = [];

  for (let i = 0; i < days.length; i++) {
    const fechaHora = branch.timeSlots[`${days[i]}T00:00:00`];
    
    let objData;
    if (type === 'home' && fechaHora) {
      objData = {
        closeTime: fechaHora[0].timeOfDay === 'Afternoon' ? '01:00 PM' : 
                   (fechaHora[0].timeOfDay === 'Morning' ? '09:00 AM' : '08:00 PM'),
        date: days[i],
        timeSlotId: fechaHora[0].timeSlotId,
        dayOfWeek: getDayName(days[i]),
        isExceptional: false,
        openTime: fechaHora[0].timeOfDay === 'Afternoon' ? '01:00 PM' : 
                  (fechaHora[0].timeOfDay === 'Morning' ? '11:00 AM' : '08:00 PM'),
        type: 'open',
      };
    } else {
      objData = {
        closeTime: fechaHora ? convertTo12Hour(fechaHora[fechaHora.length - 1].timeSlot24Hour) : '',
        date: days[i],
        dayOfWeek: getDayName(days[i]),
        isExceptional: false,
        openTime: fechaHora ? convertTo12Hour(fechaHora[0].timeSlot24Hour) : '',
        type: fechaHora ? 'open' : 'closed',
      };
    }

    if (objData.type === 'open') {
      operationHours.push(objData);
      operationHours.push({ ...objData, openTime: '01:00 PM' });
    } else {
      operationHours.push(objData);
    }
  }

  return {
    address1: '',
    address2: '',
    branchEmail: '',
    branchId: branch.branchId,
    branchManagerName: '',
    branchName: branch.branchName,
    branchPhone: branch.telephone,
    city: branch.city,
    distanceMiles: branch.distanceInMiles,
    latitude: '',
    longitude: '',
    type,
    operationHours,
  };
};

/**
 * Custom hook for branch operations
 * @returns {Object} Branch state and methods
 */
export function useBranches() {
  const [branchesData, setBranchesData] = useState([]);
  const [branchesHours, setBranchesHours] = useState([]);
  const [firstBranch, setFirstBranch] = useState(null);
  const [selectedBranchHours, setSelectedBranchHours] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const isLoadingRef = useRef(false);

  /**
   * Fetch branches by zip code and customer vehicle
   * @param {string} zipCode - ZIP code
   * @param {string} customerVehicleId - Customer vehicle ID
   * @param {boolean} validateOnly - If true, don't trigger navigation
   */
  const fetchBranches = useCallback(async (zipCode, customerVehicleId, validateOnly = false) => {
    // Prevent duplicate calls
    if (isLoadingRef.current) return null;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const branchesResponse = await getBranchesByCustomerVehicle(zipCode, customerVehicleId);
      
      // Transform physical branches
      const transformedBranches = branchesResponse.physical.map(branch => 
        transformBranchData(branch, 'branch')
      );

      // Add mobile branch if exists
      if (branchesResponse?.mobile?.branchId) {
        transformedBranches.unshift(
          transformBranchData(branchesResponse.mobile, 'home')
        );
      }

      setBranchesData(transformedBranches);
      setBranchesHours(branchesResponse);
      sessionStorage.setItem('branchesHours', JSON.stringify(branchesResponse));

      // Fetch first branch details
      if (transformedBranches.length > 0) {
        const firstBranchDetails = await getBrancheById(transformedBranches[0].branchId);
        setFirstBranch(firstBranchDetails);
      }

      return { branches: transformedBranches, shouldNavigate: !validateOnly };
    } catch (err) {
      console.error('Error getting branches:', err);
      setError(err.message || 'Failed to fetch branches');
      return null;
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  /**
   * Get time slots for a specific branch and date
   * @param {string} branchId - Branch ID
   * @param {string} date - Date string
   */
  const getBranchTimeSlots = useCallback((branchId, date) => {
    const storedHours = branchesHours.length > 0 
      ? branchesHours 
      : JSON.parse(sessionStorage.getItem('branchesHours') || '{}');

    const physicalBranch = storedHours?.physical?.find(b => b.branchId === branchId);
    const mobileBranch = storedHours?.mobile?.branchId === branchId ? storedHours.mobile : null;
    
    const branch = physicalBranch || mobileBranch;
    if (!branch) return null;

    const timeSlots = branch.timeSlots[`${date}T00:00:00`];
    setSelectedBranchHours(timeSlots || null);
    return timeSlots;
  }, [branchesHours]);

  /**
   * Clear branch data
   */
  const clearBranches = useCallback(() => {
    setBranchesData([]);
    setBranchesHours([]);
    setFirstBranch(null);
    setSelectedBranchHours(null);
    sessionStorage.removeItem('branchesHours');
  }, []);

  return {
    branchesData,
    branchesHours,
    firstBranch,
    selectedBranchHours,
    loading,
    error,
    fetchBranches,
    getBranchTimeSlots,
    clearBranches,
    setSelectedBranchHours,
  };
}
