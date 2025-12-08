/**
 * useFlowState Hook - Centralized state management for the valuation flow
 * Solves the fragmented state management issue (70+ useState in MakeModelFlow)
 * Provides a single source of truth for flow state
 */

import { useState, useCallback } from 'react';

/**
 * Initial state for the flow
 */
const initialFlowState = {
  // Vehicle information
  vehicle: {
    year: '',
    make: '',
    model: '',
    series: '',
    bodyType: '',
    vin: '',
    customerVehicleId: null,
  },
  
  // Vehicle condition
  condition: {
    odometer: '',
    runsAndDrives: '',
    hasIssues: '',
    hasAccident: '',
    hasClearTitle: '',
    damages: [],
  },
  
  // User information
  user: {
    email: '',
    phone: '',
    zipCode: '',
    receiveSMS: false,
    firstName: '',
    lastName: '',
  },
  
  // Appointment information
  appointment: {
    branchId: null,
    branchName: '',
    date: '',
    time: '',
    timeSlotId: null,
  },
  
  // Valuation result
  valuation: {
    amount: null,
    formattedValue: '',
    customerVehicleId: null,
  },
  
  // Journey metadata
  journey: {
    customerJourneyId: null,
    visitId: null,
    currentStep: 1,
  },
};

/**
 * Custom hook for centralized flow state management
 * @returns {Object} Flow state and update methods
 */
export function useFlowState() {
  const [flowState, setFlowState] = useState(initialFlowState);

  /**
   * Update vehicle information
   */
  const updateVehicle = useCallback((vehicleData) => {
    setFlowState(prev => ({
      ...prev,
      vehicle: { ...prev.vehicle, ...vehicleData },
    }));
  }, []);

  /**
   * Update vehicle condition
   */
  const updateCondition = useCallback((conditionData) => {
    setFlowState(prev => ({
      ...prev,
      condition: { ...prev.condition, ...conditionData },
    }));
  }, []);

  /**
   * Update user information
   */
  const updateUser = useCallback((userData) => {
    setFlowState(prev => ({
      ...prev,
      user: { ...prev.user, ...userData },
    }));
  }, []);

  /**
   * Update appointment information
   */
  const updateAppointment = useCallback((appointmentData) => {
    setFlowState(prev => ({
      ...prev,
      appointment: { ...prev.appointment, ...appointmentData },
    }));
  }, []);

  /**
   * Update valuation result
   */
  const updateValuation = useCallback((valuationData) => {
    setFlowState(prev => ({
      ...prev,
      valuation: { ...prev.valuation, ...valuationData },
    }));
  }, []);

  /**
   * Update journey metadata
   */
  const updateJourney = useCallback((journeyData) => {
    setFlowState(prev => ({
      ...prev,
      journey: { ...prev.journey, ...journeyData },
    }));
  }, []);

  /**
   * Update current step
   */
  const setCurrentStep = useCallback((step) => {
    setFlowState(prev => ({
      ...prev,
      journey: { ...prev.journey, currentStep: step },
    }));
  }, []);

  /**
   * Reset entire flow state
   */
  const resetFlow = useCallback(() => {
    setFlowState(initialFlowState);
  }, []);

  /**
   * Bulk update - useful for hydrating from backend
   */
  const hydrateState = useCallback((data) => {
    setFlowState(prev => ({
      vehicle: { ...prev.vehicle, ...data.vehicle },
      condition: { ...prev.condition, ...data.condition },
      user: { ...prev.user, ...data.user },
      appointment: { ...prev.appointment, ...data.appointment },
      valuation: { ...prev.valuation, ...data.valuation },
      journey: { ...prev.journey, ...data.journey },
    }));
  }, []);

  /**
   * Get complete state for submission
   */
  const getCompleteState = useCallback(() => {
    return {
      ...flowState.vehicle,
      ...flowState.condition,
      ...flowState.user,
      ...flowState.appointment,
      customerVehicleId: flowState.valuation.customerVehicleId || flowState.vehicle.customerVehicleId,
      customerJourneyId: flowState.journey.customerJourneyId,
      visitId: flowState.journey.visitId,
    };
  }, [flowState]);

  return {
    // State
    flowState,
    
    // Getters
    vehicle: flowState.vehicle,
    condition: flowState.condition,
    user: flowState.user,
    appointment: flowState.appointment,
    valuation: flowState.valuation,
    journey: flowState.journey,
    currentStep: flowState.journey.currentStep,
    
    // Setters
    updateVehicle,
    updateCondition,
    updateUser,
    updateAppointment,
    updateValuation,
    updateJourney,
    setCurrentStep,
    
    // Utilities
    resetFlow,
    hydrateState,
    getCompleteState,
  };
}
