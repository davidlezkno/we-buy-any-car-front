/**
 * StepAppointment - Step 4: Appointment Scheduling
 * Implements Single Responsibility Principle (SRP)
 */

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import CalendarScheduler from '../UI/CalendarScheduler';
import AppointmentModal from '../UI/AppointmentModal';
import OTPModal from '../UI/OTPModal';
import ValuationBanner from './ValuationBanner';
import BranchInfo from './BranchInfo';
import NonDrivableVehicleInfo from './NonDrivableVehicleInfo';

/**
 * Appointment scheduling step
 * @param {Object} props - Component props
 */
const StepAppointment = ({
  vehicleData,
  userInfo,
  valuation,
  loadingValuation,
  branchesData,
  firstBranch,
  selectedBranchHours,
  selectedAppointment,
  selectedSlot,
  isModalOpen,
  showOTPModal,
  pendingAppointmentData,
  isSendingOTP,
  onSlotClick,
  onAppointmentConfirm,
  onSearchByZip,
  onBookAppointment,
  onModalClose,
  onOTPClose,
  onOTPVerify,
  onOTPResend,
  onResetFlow,
}) => {
  const trustpilotWidgetRef = useRef(null);

  // Initialize Trustpilot widget
  useEffect(() => {
    if (vehicleData?.runsAndDrives !== 'No') {
      initializeTrustpilot(trustpilotWidgetRef);
    }
  }, [vehicleData?.runsAndDrives]);

  // Show special info for non-drivable vehicles
  if (vehicleData?.runsAndDrives === 'No') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -30, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="space-y-6"
      >
        <NonDrivableVehicleInfo onRestart={onResetFlow} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="space-y-6"
    >
      {/* Valuation Banner */}
      <ValuationBanner
        valuation={valuation}
        loading={loadingValuation}
        isModalOpen={isModalOpen}
        trustpilotWidgetRef={trustpilotWidgetRef}
      />

      {/* Calendar Section */}
      <CalendarSection
        branchesData={branchesData}
        selectedAppointment={selectedAppointment}
        selectedSlot={selectedSlot}
        selectedBranchHours={selectedBranchHours}
        vehicleData={vehicleData}
        userInfo={userInfo}
        isModalOpen={isModalOpen}
        onSlotClick={onSlotClick}
        onSearchByZip={onSearchByZip}
        onBookAppointment={onBookAppointment}
        onModalClose={onModalClose}
        onAppointmentConfirm={onAppointmentConfirm}
      />

      {/* OTP Modal */}
      {pendingAppointmentData && (
        <OTPModal
          isOpen={showOTPModal}
          onClose={onOTPClose}
          phoneNumber={pendingAppointmentData.contactInfo?.telephone || pendingAppointmentData.phone || ''}
          onVerify={onOTPVerify}
          onResendCode={onOTPResend}
          onChangePhone={() => {}}
        />
      )}

      {/* Branch Information */}
      <BranchInfo branch={firstBranch} />

      {/* Footer Disclosure */}
      <FooterDisclosure />
    </motion.div>
  );
};

/**
 * Calendar section component
 */
const CalendarSection = ({
  branchesData,
  selectedAppointment,
  selectedSlot,
  selectedBranchHours,
  vehicleData,
  userInfo,
  isModalOpen,
  onSlotClick,
  onSearchByZip,
  onBookAppointment,
  onModalClose,
  onAppointmentConfirm,
}) => (
  <div
    className="rounded-3xl px-6 pb-6 pt-0 md:p-10 md:pt-10 transition-all duration-500 w-full calendar-container-mobile"
    style={{
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      border: '1px solid rgba(255, 255, 255, 0.9)',
      boxShadow:
        '0 20px 60px 0 rgba(31, 38, 135, 0.2), 0 8px 24px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)',
      maxWidth: '100%',
      boxSizing: 'border-box',
    }}
  >
    {branchesData.length > 0 && (
      <CalendarScheduler
        branches={branchesData}
        searchZip={onSearchByZip}
        onSlotClick={onSlotClick}
        selectedDate={selectedAppointment?.date}
        selectedTime={selectedAppointment?.specificTime}
        selectedLocation={selectedAppointment}
        initialPhone={vehicleData?.phone || userInfo?.phone || ''}
        onBookAppointment={onBookAppointment}
      />
    )}

    {selectedAppointment && (
      <AppointmentConfirmation appointment={selectedAppointment} />
    )}

    {/* Appointment Modal */}
    {selectedBranchHours !== null && (
      <AppointmentModal
        branchesHours={selectedBranchHours}
        vehicleData={vehicleData}
        isOpen={isModalOpen}
        onClose={onModalClose}
        selectedSlot={selectedSlot}
        onConfirm={onAppointmentConfirm}
        initialPhone={vehicleData?.phone || userInfo?.phone || ''}
        initialReceiveSMS={vehicleData?.receiveSMS || userInfo?.receiveSMS || false}
      />
    )}
  </div>
);

/**
 * Appointment confirmation display
 */
const AppointmentConfirmation = ({ appointment }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-8 p-6 rounded-2xl border-2 border-green-200 bg-green-50"
  >
    <h3 className="font-bold text-green-900 text-lg mb-2">Appointment Confirmed:</h3>
    <p className="text-green-800 mb-3">
      <strong>Location:</strong> {appointment.location}
      <br />
      <strong>Date:</strong> {appointment.dateFormatted || appointment.date}
      <br />
      <strong>Time:</strong> {appointment.specificTime?.timeSlot24Hour || appointment.time}
      <br />
      <strong>Contact:</strong> {appointment.contactInfo?.firstName} {appointment.contactInfo?.lastName}
      <br />
      <strong>Phone:</strong> {appointment.contactInfo?.telephone || appointment.phone}
    </p>
  </motion.div>
);

/**
 * Footer disclosure component
 */
const FooterDisclosure = () => (
  <div
    className="rounded-3xl p-6 md:p-8 text-white"
    style={{
      background: 'linear-gradient(135deg, #20B24D 0%, #1a9a3e 50%, #20B24D 100%)',
    }}
  >
    <p className="text-xs md:text-sm leading-relaxed mb-4 text-justify md:text-left">
      <sup>*</sup> Valuations are provided as an estimate for informational purposes only
      and do not constitute an offer from webuyanycar.com<sup>®</sup>, except where you
      are expressly made a conditional 7 Day Offer. Valuations are based on the limited
      information we collect from you online and market information about your vehicle
      (which, for some makes, models and years, can be limited). Therefore the valuation
      may be adjusted at our discretion at any time, including prior to or during our
      in-branch vehicle inspection. Additional fees (e.g. titling) may also apply. By
      selecting to receive a valuation or conditional 7 Day Offer, you agree to our{' '}
      <a href="/termsofuse" className="underline hover:text-white/80">
        Terms of Use
      </a>
      .
    </p>
  </div>
);

/**
 * Initialize Trustpilot widget
 */
const initializeTrustpilot = (widgetRef) => {
  let attempts = 0;
  const maxAttempts = 50;

  const init = () => {
    attempts++;
    if (window.Trustpilot && widgetRef.current) {
      try {
        if (typeof window.Trustpilot.loadFromElement === 'function') {
          window.Trustpilot.loadFromElement(widgetRef.current, true);
        } else if (typeof window.Trustpilot.load === 'function') {
          window.Trustpilot.load();
        }
      } catch (e) {
        console.error('Error initializing Trustpilot widget:', e);
      }
    } else if (attempts < maxAttempts) {
      setTimeout(init, 100);
    }
  };

  requestAnimationFrame(() => {
    setTimeout(init, 300);
  });
};

export default StepAppointment;
