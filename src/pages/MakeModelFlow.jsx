/**
 * MakeModelFlow - Refactored Vehicle Valuation Flow
 * 
 * This component orchestrates the 4-step vehicle valuation process:
 * 1. Vehicle Information (handled by ValuationTabs)
 * 2. Series & Body Type Selection
 * 3. Vehicle Condition & User Information
 * 4. Appointment Scheduling
 * 
 * Implements SOLID principles:
 * - Single Responsibility: Each step is a separate component
 * - Open/Closed: Easy to extend with new steps
 * - Dependency Inversion: Uses hooks for business logic
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  useMakeModelFlow,
  useCustomerJourney,
  useVehicleSeries,
  useBranches,
  useDamageForm,
} from '../hooks';

// Components
import VehiclePreview from '../components/VehiclePreview/VehiclePreview';
import ProgressBar from '../components/UI/ProgressBar';
import ValuationTabs from '../components/Home/ValuationTabs';
import {
  StepSeriesBody,
  StepVehicleCondition,
  StepAppointment,
  AdditionalQuestionsForm,
  NoTowingModal,
} from '../components/MakeModelFlow';

// Services
import { saveValuationVehicle } from '../services/valuationService';
import { createAppointment, rescheduleAppointment } from '../services/appointmentService';
import { UpdateCustomerJourney } from '../services/vehicleService';

// Utils
import { cleanObject, formatPhone, formatUSD } from '../utils/helpers';

const PROGRESS_STEPS = [
  'Vehicle Info',
  'Series & Body',
  'Vehicle Condition',
  'Schedule Visit',
];

/**
 * Main MakeModelFlow component
 */
const MakeModelFlow = () => {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  
  // Global app context
  const {
    vehicleData,
    updateVehicleData,
    userInfo,
    updateUserInfo,
    updateAppointmentInfo,
  } = useApp();

  // Custom hooks for flow management
  const {
    step,
    customerJourneyId,
    navigateToStep,
    resetFlow,
    trackSubmission,
  } = useMakeModelFlow();

  // Customer journey hook
  const {
    customerJourneyData,
    updateSeriesBody,
    updateVehicleCondition,
    loading: journeyLoading,
  } = useCustomerJourney(customerJourneyId);

  // Vehicle series hook
  const vehicleSeries = useVehicleSeries(customerJourneyData || vehicleData);

  // Branches hook
  const branches = useBranches();

  // Damage form hook
  const damageForm = useDamageForm();

  // Local state
  const [showAdditionalQuestions, setShowAdditionalQuestions] = useState(false);
  const [showNoTowingModal, setShowNoTowingModal] = useState(false);
  const [valuation, setValuation] = useState(null);
  const [loadingValuation, setLoadingValuation] = useState(false);
  const [selectedAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingAppointmentData, setPendingAppointmentData] = useState(null);
  const [step4Initialized, setStep4Initialized] = useState(false);
  const [zipCodeError, setZipCodeError] = useState(null);

  // Scroll to content when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Log reschedule status when on step 4
    if (step === 4) {
      const existingAppointmentId = localStorage.getItem('existingAppointmentId');
      console.log('📅 [MakeModelFlow] Step 4 loaded - Reschedule mode:', {
        existingAppointmentId,
        isReschedule: !!existingAppointmentId
      });
    }
  }, [step]);

  // Effect for normal flow: Update vehicle data when journey data changes
  useEffect(() => {
    if (customerJourneyData && vehicleSeries.listSeries.length > 0) {
      updateVehicleData({
        year: customerJourneyData.year,
        make: customerJourneyData.make,
        model: customerJourneyData.model,
      });

      if (
        window.location.pathname.includes('/secure/bookappointment') &&
        customerJourneyData.zipCode
      ) {
        localStorage.setItem('zipCode', customerJourneyData.zipCode);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerJourneyData, vehicleSeries.listSeries.length]);

  // Effect for step 4 reload: Load valuation and branches when page is reloaded
  useEffect(() => {
    const isOnStep4Url = window.location.pathname.includes('/secure/bookappointment');
    
    // Only run if we're on step 4 URL, have journey data, and haven't initialized yet
    if (!isOnStep4Url || !customerJourneyData || step4Initialized) {
      return;
    }

    // Check if we have the required data to load branches
    const hasCustomerVehicleId = customerJourneyData.customerVehicleId;
    const hasZipCode = customerJourneyData.zipCode || localStorage.getItem('zipCode');
    const noBranchesYet = branches.branchesData.length === 0;

    if (hasCustomerVehicleId && hasZipCode && noBranchesYet) {
      // Mark as initialized to prevent re-running
      setStep4Initialized(true);

      // Determine runsAndDrives - default to 'Yes' if not explicitly false
      // carIsDriveable can be true, false, null, or undefined
      const runsAndDrivesValue = customerJourneyData.carIsDriveable === false ? 'No' : 'Yes';

      // Update vehicle data with full journey info
      updateVehicleData({
        year: customerJourneyData.year,
        make: customerJourneyData.make,
        model: customerJourneyData.model,
        series: customerJourneyData.series,
        bodyType: customerJourneyData.body,
        customerVehicleId: customerJourneyData.customerVehicleId,
        email: customerJourneyData.email,
        zipCode: customerJourneyData.zipCode,
        runsAndDrives: runsAndDrivesValue,
      });

      // Set valuation from journey data
      if (customerJourneyData.valuationAmount) {
        setValuation({
          formattedValue: formatUSD(customerJourneyData.valuationAmount),
        });
      }

      // Load branches
      const loadBranches = async () => {
        setLoadingValuation(true);
        try {
          await branches.fetchBranches(
            hasZipCode,
            customerJourneyData.customerVehicleId,
            true
          );
        } catch (err) {
          console.error('Error loading branches on reload:', err);
        } finally {
          setLoadingValuation(false);
        }
      };

      loadBranches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerJourneyData, step4Initialized]);

  /**
   * Handle Series & Body form submission
   */
  const handleSeriesBodySubmit = useCallback(async (data) => {
    trackSubmission('series_body', {
      vehicle_series: data.series,
      vehicle_body_type: data.bodyType,
    });

    try {
      const response = await updateSeriesBody(data);
      if (response) {
        updateVehicleData({ ...vehicleData, ...response });
        navigateToStep(3);
      }
    } catch (error) {
      console.error('Error updating series/body:', error);
    }
  }, [trackSubmission, updateSeriesBody, updateVehicleData, vehicleData, navigateToStep]);

  /**
   * Process valuation and fetch branches
   */
  const processValuation = useCallback(async (data) => {
    setLoadingValuation(true);

    try {
      // Update customer journey
      const journeyResponse = await updateVehicleCondition(data);
      const cleanData = cleanObject(journeyResponse);

      updateVehicleData({ ...vehicleData, ...cleanData });
      localStorage.setItem('dataVehicleCondition', JSON.stringify({ ...vehicleData, ...cleanData }));

      // Save valuation
      const valuationResponse = await saveValuationVehicle({
        cvid: cleanData?.customerVehicleId || customerJourneyData?.customerVehicleId,
        mileage: parseInt(data.odometer?.toString().replace(/,/g, '') || '0'),
        zipCode: data.zipCode,
        email: data.email,
        isFinancedOrLeased: data.hasClearTitle === 'Yes',
        carIsDriveable: data.runsAndDrives === 'Yes',
        hasDamage: data.hasIssues === 'Yes',
        hasBeenInAccident: data.hasAccident === 'Yes',
        optionalPhoneNumber: data.phone ? formatPhone(data.phone) : null,
        customerJourneyId,
        customerHasOptedIntoSmsMessages: data.receiveSMS,
        captchaMode: 'true',
      });

      if (valuationResponse) {
        setValuation({
          formattedValue: formatUSD(
            valuationResponse.valuationAmount || customerJourneyData?.valuationAmount
          ),
        });

        if (cleanData.customerVehicleId) {
          localStorage.setItem('customerVehicleId', cleanData.customerVehicleId);
        }

        // Fetch branches
        const branchResult = await branches.fetchBranches(
          data.zipCode || vehicleData?.zipCode,
          cleanData?.customerVehicleId || customerJourneyData?.customerVehicleId
        );

        if (branchResult?.shouldNavigate) {
          navigateToStep(4);
        }
      }
    } catch (error) {
      console.error('Error processing valuation:', error);
      
      // Only set ZIP code error if it's actually a ZIP code related error
      const errorMessage = error.response?.data?.message || error.message || '';
      const isZipCodeError = errorMessage.toLowerCase().includes('zip') || 
                            errorMessage.toLowerCase().includes('postal') ||
                            error.response?.data?.errors?.zipCode;
      
      if (isZipCodeError) {
        setZipCodeError('Please enter the ZIP code closest to where you intend to sell the vehicle');
      } else {
        // Show generic error toast for other errors
        if (window.showToast) {
          window.showToast('An error occurred while processing your valuation. Please try again.', 'error');
        }
      }
    } finally {
      setLoadingValuation(false);
    }
  }, [
    updateVehicleCondition,
    vehicleData,
    updateVehicleData,
    customerJourneyData,
    customerJourneyId,
    branches,
    navigateToStep,
  ]);

  /**
   * Handle Vehicle Condition form submission
   */
  const handleVehicleConditionSubmit = useCallback(async (data) => {
    // Clear ZIP code error when submitting
    setZipCodeError(null);
    
    // Check if additional questions needed
    if (
      data.runsAndDrives === 'No' ||
      data.hasIssues === 'Yes' ||
      data.hasAccident === 'Yes'
    ) {
      updateVehicleData({
        ...vehicleData,
        runsAndDrives: data.runsAndDrives,
        hasIssues: data.hasIssues,
        hasAccident: data.hasAccident,
        hasClearTitle: data.hasClearTitle,
        odometer: data.odometer,
      });
      setShowAdditionalQuestions(true);
      return;
    }

    // Update user info
    updateUserInfo({
      zipCode: data.zipCode,
      email: data.email,
      phone: data.phone || '',
      receiveSMS: data.receiveSMS || false,
    });

    // Process valuation
    await processValuation(data);
  }, [vehicleData, updateVehicleData, updateUserInfo, processValuation]);

  /**
   * Handle additional questions submission
   */
  const handleAdditionalQuestionsSubmit = useCallback((data) => {
    if (data.runsAndDrives === 'No') {
      setShowNoTowingModal(true);
      return;
    }

    const contactData = {
      email: vehicleData?.email || userInfo?.email,
      phone: vehicleData?.phone || userInfo?.phone || null,
      zipCode: vehicleData?.zipCode || userInfo?.zipCode,
      receiveSMS: vehicleData?.receiveSMS || userInfo?.receiveSMS || false,
    };

    updateVehicleData({
      ...vehicleData,
      ...data,
      ...contactData,
      damages: damageForm.damageList,
    });

    if (contactData.email || contactData.phone || contactData.zipCode) {
      updateUserInfo(contactData);
    }

    setShowAdditionalQuestions(false);
    trackSubmission('additional_questions', {
      runs_and_drives: data.runsAndDrives,
      damages_count: damageForm.damageList.length,
    });

    navigateToStep(4);
  }, [vehicleData, userInfo, updateVehicleData, updateUserInfo, damageForm.damageList, trackSubmission, navigateToStep]);

  /**
   * Handle continue after no towing modal
   */
  const handleContinueAfterModal = useCallback(() => {
    setShowNoTowingModal(false);
    setShowAdditionalQuestions(false);
    navigateToStep(4);
  }, [navigateToStep]);

  /**
   * Handle slot click in calendar
   */
  const handleSlotClick = useCallback((slotData) => {
    branches.getBranchTimeSlots(slotData.locationId, slotData.date);
    setSelectedSlot(slotData);
    setIsModalOpen(true);
  }, [branches]);

  /**
   * Handle appointment confirmation
   */
  const handleAppointmentConfirm = useCallback(async (appointmentData) => {
    const branchSelect = branches.branchesData.find(
      (branch) => branch.branchId === appointmentData.locationId
    );

    try {
      // Check if this is a reschedule
      const existingAppointmentId = localStorage.getItem('existingAppointmentId');
      const isReschedule = !!existingAppointmentId;
      
      console.log('🔄 [MakeModelFlow] Appointment confirmation:', {
        existingAppointmentId,
        isReschedule,
        appointmentData
      });
      
      const appointmentPayload = {
        customerVehicleId: vehicleData.customerVehicleId,
        branchId: appointmentData.locationId,
        date: appointmentData.date,
        timeSlotId: appointmentData.specificTime.timeSlotId,
        customerPhoneNumber: formatPhone(appointmentData.contactInfo.telephone),
        customerFirstName: appointmentData.contactInfo.firstName,
        customerLastName: appointmentData.contactInfo.lastName,
        email: vehicleData.email,
        address1: appointmentData?.contactInfo?.addressLine1 || null,
        address2: appointmentData?.contactInfo?.addressLine2 || null,
        city: appointmentData.location,
        model: vehicleData.model,
        visitId: vehicleData.vid,
        otpCode: appointmentData.otpCode,
      };
      
      
      
      
      // Use reschedule or create appointment based on context
      const response = isReschedule 
        ? await rescheduleAppointment(existingAppointmentId, appointmentPayload)
        : await createAppointment(appointmentPayload);

      // Check if response indicates success
      // Backend might return { success: true } or { isValid: true } or just true
      const isSuccess = response === true || 
                       response?.success === true || 
                       response?.isValid === true ||
                       response?.isSuccess === true ||
                       (response && !response.error && !response.message?.toLowerCase().includes('invalid'));

      if (isSuccess) {
        // OTP verification successful - proceed to confirmation
        updateVehicleData({ ...vehicleData, branchInfo: branchSelect });
        updateAppointmentInfo(appointmentData);
        
        // Clear the existing appointment ID if it was a reschedule
        localStorage.removeItem('existingAppointmentId');
        
        // Show success message
        if (window.showToast) {
          const message = isReschedule ? 'Appointment rescheduled successfully!' : 'Appointment confirmed successfully!';
          window.showToast(message, 'success');
        }
        
        navigate(`/valuation/confirmation/${customerJourneyId}`, { replace: true });
        return true; // Indicate success
      } else {
        // OTP verification failed - stay on current page
        const errorMessage = response?.message || 'The OTP you entered is invalid or has expired. Please try again.';
        console.error('OTP verification failed:', response);
        
        if (window.showToast) {
          window.showToast(errorMessage, 'error');
        }
        
        return false; // Indicate failure
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      
      // Check if it's an OTP validation error (400 or specific error message)
      const isOTPError = error.response?.status === 400 || 
                        error.response?.data?.message?.toLowerCase().includes('otp') ||
                        error.response?.data?.message?.toLowerCase().includes('code') ||
                        error.response?.data?.message?.toLowerCase().includes('invalid');
      
      if (isOTPError) {
        // OTP error - show error in modal
        if (window.showToast) {
          window.showToast('The OTP you entered is invalid or has expired. Please try again.', 'error');
        }
        return false; // Show error in OTP modal
      } else {
        // Server error (500) or other error - show generic error and close modal
        if (window.showToast) {
          window.showToast('An error occurred while booking your appointment. Please try again.', 'error');
        }
        return true; // Close modal (don't show OTP error)
      }
    }
  }, [branches.branchesData, vehicleData, updateVehicleData, updateAppointmentInfo, navigate, customerJourneyId]);

  /**
   * Handle search by ZIP code
   */
  const handleSearchByZip = useCallback(async (zipCode, setError) => {
    if (!zipCode || zipCode.length !== 5) {
      console.warn('Invalid ZIP code:', zipCode);
      if (setError) {
        setError('Please enter a valid 5-digit ZIP code');
      }
      return { success: false };
    }

    setLoadingValuation(true);
    
    try {
      const customerVehicleId = vehicleData?.customerVehicleId || 
                               customerJourneyData?.customerVehicleId ||
                               localStorage.getItem('customerVehicleId');

      if (!customerVehicleId) {
        console.error('No customer vehicle ID available');
        setLoadingValuation(false);
        if (setError) {
          setError('Unable to search branches. Please complete the previous steps.');
        }
        return { success: false };
      }

      // Fetch branches for the new ZIP code (validateOnly = true to not trigger navigation)
      const result = await branches.fetchBranches(zipCode, customerVehicleId, true);
      
      if (result && result.branches && result.branches.length > 0) {
        // Only update ZIP code if branches were found
        updateVehicleData({ ...vehicleData, zipCode });
        updateUserInfo({ ...userInfo, zipCode });
        localStorage.setItem('zipCode', zipCode);
        
        if (window.showToast) {
          window.showToast(`Found ${result.branches.length} location(s) near ${zipCode}`, 'success');
        }
        setLoadingValuation(false);
        return { success: true };
      } else {
        // No branches found - show error
        setLoadingValuation(false);
        if (setError) {
          setError('Please enter the ZIP code closest to where you intend to sell the vehicle');
        }
        return { success: false };
      }
    } catch (error) {
      console.error('Error searching by ZIP:', error);
      setLoadingValuation(false);
      if (setError) {
        setError('Please enter the ZIP code closest to where you intend to sell the vehicle');
      }
      return { success: false };
    }
  }, [vehicleData, customerJourneyData, branches, updateVehicleData, updateUserInfo, userInfo]);

  /**
   * Handle book appointment from calendar
   */
  const handleBookAppointment = useCallback(async (appointmentData) => {
    
    
    if (!appointmentData.receiveSMS) {
      
      return;
    }

    const dateObj = new Date(appointmentData.date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dateFormatted = `${days[dateObj.getDay()]} ${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

    const slotData = {
      locationId: appointmentData.locationId,
      location: appointmentData.location || '',
      date: appointmentData.date,
      dateFormatted,
      time: appointmentData.time,
      phone: appointmentData.phone || '',
      contactInfo: {
        firstName: appointmentData.firstName,
        lastName: appointmentData.lastName,
        telephone: appointmentData.telephone,
        addressLine1: appointmentData.address1 || null,
        addressLine2: appointmentData.address2 || null,
      },
      receiveSMS: appointmentData.receiveSMS,
    };

    // Update optionalPhoneNumber BEFORE showing OTP modal
    try {
      const phoneNumber = formatPhone(appointmentData.telephone);
      
      
      
      
      const updateResult = await UpdateCustomerJourney(
        {
          optionalPhoneNumber: phoneNumber,
        },
        customerJourneyId
      );
      
      
      
      // Only show OTP modal if update was successful
      setPendingAppointmentData(slotData);
      setShowOTPModal(true);
    } catch (error) {
      console.error('❌ Error updating phone number:', error);
      if (window.showToast) {
        window.showToast('An error occurred while processing your request. Please try again.', 'error');
      }
    }
  }, [customerJourneyId]);

  // Step 1: Show ValuationTabs
  if (step === 1) {
    return (
      <ValuationTabs
        activeTab={0}
        onTabChange={(tabIndex) => {
          if (tabIndex !== 0) navigate('/');
        }}
        onMakeModelSubmit={(vehicleDetails) => {
          updateVehicleData(vehicleDetails);
          navigateToStep(2);
        }}
        onVinSubmit={(vehicleInfo) => {
          updateVehicleData(vehicleInfo);
          navigate('/sell-by-vin');
        }}
        onPlateSubmit={() => navigate('/sell-by-plate')}
        onOpenVinHelp={() => {}}
        hideHeaderAndTabs={true}
      />
    );
  }

  return (
    <div className="section-container pt-4 pb-8 md:pt-4 md:pb-12 relative overflow-hidden">
      {/* Background effects */}
      <BackgroundEffects />

      <div
        className="max-w-6xl mx-auto relative z-10 w-full"
        ref={contentRef}
        style={{ maxWidth: '100%', boxSizing: 'border-box' }}
      >
        {/* Header */}
        {step !== 4 && <FlowHeader />}

        {/* Progress Bar */}
        {step !== 4 && (
          <ProgressBar currentStep={step} totalSteps={4} steps={PROGRESS_STEPS} />
        )}

        <div
          className={`grid ${step === 4 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-0 lg:gap-12 container-cards-info w-full`}
          style={{ maxWidth: '100%', boxSizing: 'border-box' }}
        >
          {/* Form Section */}
          <div
            className={step === 4 ? 'w-full max-w-7xl mx-auto' : ''}
            style={{ maxWidth: '100%', boxSizing: 'border-box' }}
          >
            {/* Step 2: Series & Body */}
            {step === 2 && (
              <StepSeriesBody
                vehicleData={vehicleData}
                seriesOptions={vehicleSeries.seriesOptions}
                bodyTypeOptions={vehicleSeries.bodyTypeOptions}
                selectedSeries={vehicleSeries.selectedSeries}
                selectedBodyType={vehicleSeries.selectedBodyType}
                isSeriesDisabled={vehicleSeries.isSeriesDisabled}
                isBodyTypeDisabled={vehicleSeries.isBodyTypeDisabled}
                onSeriesChange={vehicleSeries.handleSeriesChange}
                onBodyTypeChange={vehicleSeries.handleBodyTypeChange}
                onSubmit={handleSeriesBodySubmit}
                loading={journeyLoading}
              />
            )}

            {/* Step 3: Vehicle Condition */}
            {step === 3 && !showAdditionalQuestions && (
              <StepVehicleCondition
                vehicleData={vehicleData}
                userInfo={userInfo}
                onSubmit={handleVehicleConditionSubmit}
                loading={loadingValuation}
                zipCodeError={zipCodeError}
              />
            )}

            {/* Additional Questions */}
            {showAdditionalQuestions && (
              <AdditionalQuestionsForm
                vehicleData={vehicleData}
                damageForm={damageForm}
                onSubmit={handleAdditionalQuestionsSubmit}
                onBack={() => setShowAdditionalQuestions(false)}
                loading={loadingValuation}
              />
            )}

            {/* No Towing Modal */}
            <NoTowingModal
              isOpen={showNoTowingModal}
              onClose={() => setShowNoTowingModal(false)}
              onContinue={handleContinueAfterModal}
            />

            {/* Step 4: Appointment */}
            {step === 4 && (
              <StepAppointment
                vehicleData={vehicleData}
                userInfo={userInfo}
                valuation={valuation}
                loadingValuation={loadingValuation}
                branchesData={branches.branchesData}
                firstBranch={branches.firstBranch}
                selectedBranchHours={branches.selectedBranchHours}
                selectedAppointment={selectedAppointment}
                selectedSlot={selectedSlot}
                isModalOpen={isModalOpen}
                showOTPModal={showOTPModal}
                pendingAppointmentData={pendingAppointmentData}
                customerJourneyId={customerJourneyId}
                onSlotClick={handleSlotClick}
                onAppointmentConfirm={handleAppointmentConfirm}
                onSearchByZip={handleSearchByZip}
                onBookAppointment={handleBookAppointment}
                onModalClose={() => {
                  setIsModalOpen(false);
                  setSelectedSlot(null);
                }}
                onOTPClose={() => {
                  setShowOTPModal(false);
                  setPendingAppointmentData(null);
                }}
                onOTPVerify={async (otpCode) => {
                  const result = await handleAppointmentConfirm({ ...pendingAppointmentData, otpCode });
                  return result; // Return true on success, false on failure
                }}
                onOTPResend={() => {}}
                onResetFlow={resetFlow}
              />
            )}
          </div>

          {/* Preview Section - Hidden in step 4 */}
          {step !== 4 && (
            <div>
              <VehiclePreview
                vehicle={{
                  ...(customerJourneyData || vehicleData),
                  // Preserve plate info from vehicleData if not in customerJourneyData
                  plateNumber: customerJourneyData?.plateNumber || vehicleData?.plateNumber,
                  plateState: customerJourneyData?.plateState || vehicleData?.plateState,
                }}
                loading={vehicleSeries.loading}
                imageUrl={customerJourneyData?.vehicleImageUrl || vehicleSeries.imageUrl}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Background effects component
 */
const BackgroundEffects = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-20 right-10 w-96 h-96 bg-primary-100/30 rounded-full blur-[120px]"></div>
    <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-200/20 rounded-full blur-[120px]"></div>
  </div>
);

/**
 * Flow header component
 */
const FlowHeader = () => (
  <motion.div
    className="mb-0 md:mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <h1 className="text-[20px] md:text-2xl lg:text-3xl font-bold text-gray-900 mb-[15px] md:mb-6 tracking-tight text-center md:text-left">
      Vehicle Condition
    </h1>
  </motion.div>
);

export default MakeModelFlow;
