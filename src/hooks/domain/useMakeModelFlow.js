/**
 * useMakeModelFlow Hook - Main orchestrator for MakeModel flow
 * Implements Single Responsibility Principle (SRP) and manages flow state
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { trackValuationStep, trackFormSubmit } from '../../utils/tracking';

const STEP_PATHS = {
  1: '/valuation',
  2: '/valuation/vehicledetails',
  3: '/valuation/vehiclecondition',
  4: '/secure/bookappointment',
};

const STEP_NAMES = {
  1: 'Vehicle Information',
  2: 'Series & Body',
  3: 'Vehicle Condition',
  4: 'Appointment Scheduling',
};

/**
 * Get step number from URL path
 * @param {string} path - Current URL path
 * @param {Object} vehicleData - Current vehicle data
 * @returns {number} Step number
 */
const getStepFromPath = (path, vehicleData) => {
  if (path.includes('/secure/bookappointment')) return 4;
  if (path.includes('/valuation/vehiclecondition')) return 3;
  if (path.includes('/valuation/vehicledetails')) return 2;
  if (path === '/valuation' || path === '/sell-by-make-model') return 1;

  // Fallback based on data
  const hasInitialData = vehicleData?.year && vehicleData?.make && vehicleData?.model;
  if (hasInitialData && vehicleData?.series && vehicleData?.bodyType) return 3;
  if (hasInitialData) return 2;
  return 1;
};

/**
 * Custom hook for MakeModel flow management
 * @returns {Object} Flow state and navigation methods
 */
export function useMakeModelFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { uid } = useParams();
  const { vehicleData, updateVehicleData, resetData } = useApp();

  const [customerJourneyId, setCustomerJourneyId] = useState('');
  const [step, setStep] = useState(() => getStepFromPath(location.pathname, vehicleData));

  // Initialize customer journey ID
  useEffect(() => {
    const journeyId = uid || localStorage.getItem('customerJourneyId');
    setCustomerJourneyId(journeyId);
    if (journeyId) {
      localStorage.setItem('customerJourneyId', journeyId);
    }
  }, [uid]);

  // Sync step with URL
  useEffect(() => {
    const newStep = getStepFromPath(location.pathname, vehicleData);
    
    setStep((prevStep) => {
      if (prevStep !== newStep) {
        trackValuationStep(newStep, STEP_NAMES[newStep] || `Step ${newStep}`, vehicleData);
        return newStep;
      }
      return prevStep;
    });
  }, [location.pathname, vehicleData]);

  /**
   * Navigate to a specific step
   * @param {number} newStep - Target step number
   */
  const navigateToStep = useCallback((newStep) => {
    const id = customerJourneyId || localStorage.getItem('customerJourneyId');
    const basePath = STEP_PATHS[newStep] || '/valuation';
    const targetPath = `${basePath}/${id}`;

    if (location.pathname !== targetPath) {
      setStep(newStep);
      navigate(targetPath, { replace: true });
      trackValuationStep(newStep, STEP_NAMES[newStep] || `Step ${newStep}`, vehicleData);
    } else {
      setStep(newStep);
    }
  }, [customerJourneyId, location.pathname, navigate, vehicleData]);

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    if (step < 4) {
      navigateToStep(step + 1);
    }
  }, [step, navigateToStep]);

  /**
   * Go to previous step
   */
  const prevStep = useCallback(() => {
    if (step > 1) {
      navigateToStep(step - 1);
    }
  }, [step, navigateToStep]);

  /**
   * Reset flow and navigate to home
   */
  const resetFlow = useCallback(() => {
    resetData();
    navigate('/');
  }, [resetData, navigate]);

  /**
   * Track form submission
   * @param {string} formName - Name of the form
   * @param {Object} data - Form data
   */
  const trackSubmission = useCallback((formName, data) => {
    trackFormSubmit(formName, data);
  }, []);

  return {
    step,
    setStep,
    customerJourneyId,
    navigateToStep,
    nextStep,
    prevStep,
    resetFlow,
    trackSubmission,
    STEP_NAMES,
  };
}
