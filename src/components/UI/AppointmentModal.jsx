import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Clock } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import OTPModal from "./OTPModal";
import { random3Digits } from "../../utils/helpers";
import { sendSmS } from "../../services/appointmentService";

const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  selectedSlot, 
  onConfirm, 
  initialPhone = "", 
  initialReceiveSMS = false, 
  vehicleData, 
  branchesHours }) => {

  
  const [step, setStep] = useState(1); 
  const [selectedTime, setSelectedTime] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    telephone: "",
    receiveSMS: false,
  });
  const [errors, setErrors] = useState({});
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  // Function to extract only digits from phone number
  const getDigitsOnly = (phone) => {
    return phone.replace(/\D/g, "");
  };

  // Function to format phone number as (XXX) XXX XXXX
  const formatPhoneNumber = (phone) => {
    const digits = getDigitsOnly(phone);
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    if (limitedDigits.length === 0) return "";
    if (limitedDigits.length <= 3) return `(${limitedDigits}`;
    if (limitedDigits.length <= 6) {
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
    }
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6)}`;
  };

  // Pre-fill telephone when modal opens with initialPhone
  // Auto-select receiveSMS checkbox if phone is valid (10 digits)
  useEffect(() => {
    if (isOpen && initialPhone) {
      setFormData((prev) => {
        // Only update if telephone is empty or modal just opened
        if (!prev.telephone) {
          // Format the initial phone number
          const formatted = formatPhoneNumber(initialPhone);
          const phoneDigits = getDigitsOnly(formatted);
          // If phone has 10 digits, auto-select checkbox
          const shouldAutoSelectSMS = phoneDigits.length === 10;
          return { 
            ...prev, 
            telephone: formatted,
            receiveSMS: shouldAutoSelectSMS
          };
        }
        return prev;
      });
    }

    if(branchesHours.length > 0){
      const dataHours = {
        Morning: [],
        Afternoon: [],
        Evening: [],
      };
      branchesHours.map(hours => {
        const hour = parseInt(hours?.timeSlot24Hour?.split(':')[0], 10);
          if(hour >= 5 && hour < 12){
            dataHours['Morning'].push(hours);
          }else if(hour >= 12 && hour < 19){
            dataHours['Afternoon'].push(hours);
          }
          else if(hour >= 18 && hour < 24){
            dataHours['Evening'].push(hours);
          }
      });
      
      setAvailableTimes(dataHours[selectedSlot?.time] || []);
    }
  }, [isOpen, initialPhone]);

  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(2);
  };

  const handleInputChange = (field, value) => {
    // Format telephone number if it's the telephone field
    if (field === "telephone") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    const phoneDigits = getDigitsOnly(formData.telephone);
    if (!phoneDigits) {
      newErrors.telephone = "Telephone is required";
    } else if (phoneDigits.length !== 10) {
      newErrors.telephone = "Telephone must be 10 digits";
    }
    // SMS checkbox is required
    if (!formData.receiveSMS) {
      newErrors.receiveSMS = "You must receive a verification code by text (SMS) message to complete your appointment booking online. If you prefer not to receive the code by SMS, please call (484) 519-2538 to schedule your appointment.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    
    if (validateForm()) {
      console.log("---- vehicleData.id ---", vehicleData);
      console.log("---- formData.telephone ---", formData);

      
      // sendSmS(vehicleData.customerVehicleId, vehicleData.optionalPhoneNumber, "Your appointment has been booked successfully. Please use the following code to verify your appointment: " + random3Digits(6), 3).then(res => {
      //   console.log("---- res sendSMS ---", res);
      // });
      
      // SMS checkbox is always required, so always show OTP modal
      setIsSendingOTP(true);
      // Simulate sending OTP code (in production, this would be an API call)
      // TODO: Replace with actual API call to send OTP
      setTimeout(() => {
        setIsSendingOTP(false);
        setShowOTPModal(true);
      }, 500);
    } else {
      // If validation fails, scroll to first error or checkbox
      if (errors.receiveSMS) {
        const checkbox = document.getElementById("appointment-modal-receive-sms-checkbox");
        if (checkbox) {
          setTimeout(() => {
            checkbox.scrollIntoView({ behavior: "smooth", block: "center" });
            checkbox.focus();
          }, 100);
        }
      }
    }
  };

  const handleOTPVerify = async (otpCode) => {
    // TODO: Replace with actual API call to verify OTP
    // Simulate OTP verification
    console.log("---- otpCode ---", otpCode);

    console.log("---- selectedTime ---", selectedTime);
    const confirmedAppointment = {
      ...selectedSlot,
      specificTime: selectedTime,
      contactInfo: formData,
      otpCode: otpCode,
    };
    onConfirm(confirmedAppointment);
    // -- ACA SE VERIFICA EL CODIGO QUE SE ENVIA POR MENSAJE DE TEXTO --
    // return new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     // For demo purposes, accept any 6-digit code
    //     if (otpCode.length === 6) {
    //       // OTP verified successfully - confirm appointment and navigate
    //       const confirmedAppointment = {
    //         ...selectedSlot,
    //         specificTime: selectedTime?.timeSlot24Hour,
    //         contactInfo: formData,
    //       };
          
    //       // Call onConfirm to update appointment info
    //       onConfirm(confirmedAppointment);
          
    //       // Reset and close modals
    //       setStep(1);
    //       setSelectedTime({});
    //       setFormData({
    //         firstName: "",
    //         lastName: "",
    //         telephone: "",
    //         receiveSMS: false,
    //       });
    //       setErrors({});
    //       setShowOTPModal(false);
    //       onClose();
          
    //       // Navigate to confirmation page immediately after OTP verification
    //       setTimeout(() => {
    //         navigate("/valuation/confirmation", { replace: true });
    //       }, 100);
          
    //       resolve();
    //     } else {
    //       reject(new Error("Invalid code. Please try again."));
    //     }
    //   }, 1000);
    // });
  };

  const handleResendOTP = async () => {
    // TODO: Replace with actual API call to resend OTP
    setIsSendingOTP(true);
    setTimeout(() => {
      setIsSendingOTP(false);
    }, 500);
  };

  const handleChangePhone = () => {
    setShowOTPModal(false);
    // Return to contact info step
    setStep(2);
  };

  const handleBack = () => {
    if (showOTPModal) {
      setShowOTPModal(false);
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      setSelectedTime({});
      setErrors({});
    } else {
      onClose();
    }
  };

  // Close OTP modal when main modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowOTPModal(false);
    }
  }, [isOpen]);

  // Check if form is valid for button enabling
  const isFormValid = () => {
    const phoneDigits = getDigitsOnly(formData.telephone);
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      phoneDigits.length === 10 &&
      formData.receiveSMS === true // SMS checkbox is required
    );
  };

  if (!isOpen || !selectedSlot) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBack}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[10000] overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255, 255, 255, 0.9)",
            boxShadow:
              "0 25px 80px 0 rgba(0, 0, 0, 0.3), 0 10px 30px 0 rgba(0, 0, 0, 0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{ zIndex: 10001 }}>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1
                ? `${selectedSlot.location} for ${selectedSlot.dateFormatted} - ${selectedSlot.time}`
                : selectedSlot.specificTime
                  ? `${selectedSlot.location} for ${selectedSlot.dateFormatted} - ${selectedSlot.specificTime}`
                  : "Enter Contact Info"}
            </h2>
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 1 ? (
              <>
                <p className="text-gray-600 mb-6">
                  Select a specific time for {selectedSlot.time}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {availableTimes.map((time, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSelect(time)}
                      className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-600 hover:bg-primary-50 transition-all duration-200 text-left group"
                      id={`appointment-time-slot-${time.timeSlot24Hour.replace(/\s+/g, "-").toLowerCase()}-button`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                        <span className="font-semibold text-gray-900 group-hover:text-primary-700">
                          {time.timeSlot24Hour}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Appointment Information Banner */}
                <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl border border-primary-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wide">
                      Appointment Details
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-800">
                    <p className="font-semibold">
                      <span className="text-gray-600">Location:</span>{" "}
                      {selectedSlot.location}
                    </p>
                    <p className="font-semibold">
                      <span className="text-gray-600">Date:</span>{" "}
                      {selectedSlot.dateFormatted}
                    </p>
                    <p className="font-semibold">
                      <span className="text-gray-600">Time:</span>{" "}
                      {selectedTime?.timeSlot24Hour || selectedSlot.specificTime || selectedSlot.time}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  Enter contact info to confirm your appointment
                </p>
                <div className="space-y-5">
                  {/* Added unique IDs for automation testing */}
                  <Input
                    label="First Name"
                    placeholder="Enter First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    error={errors.firstName}
                    id="appointment-modal-first-name-input"
                  />

                  <Input
                    label="Last Name"
                    placeholder="Enter Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    error={errors.lastName}
                    id="appointment-modal-last-name-input"
                  />

                  <Input
                    label="Telephone"
                    placeholder="Enter Telephone Number"
                    value={formData.telephone}
                    onChange={(e) =>
                      handleInputChange("telephone", e.target.value)
                    }
                    error={errors.telephone}
                    id="appointment-modal-telephone-input"
                  />

                  <div className="flex items-start gap-3 pt-2">
                    {/* ID already exists, keeping it for consistency */}
                    <input
                      type="checkbox"
                      id="appointment-modal-receive-sms-checkbox"
                      checked={formData.receiveSMS}
                      onChange={(e) => {
                        handleInputChange("receiveSMS", e.target.checked);
                        // Clear error when checkbox is checked
                        if (e.target.checked && errors.receiveSMS) {
                          setErrors((prev) => ({ ...prev, receiveSMS: "" }));
                        }
                      }}
                      className={`mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 ${
                        errors.receiveSMS ? "border-red-500 border-2 ring-2 ring-red-300" : ""
                      }`}
                    />
                    <label
                      htmlFor="appointment-modal-receive-sms-checkbox"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Receive text (SMS) messages about this appointment**
                    </label>
                  </div>
                  {errors.receiveSMS && (
                    <p className="text-red-600 text-sm mt-2" role="alert">
                      {errors.receiveSMS}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            {step === 2 && (
              <>
                <div className="flex gap-3 mb-4">
                  <Button
                    variant="secondary"
                    onClick={handleBack}
                    icon={ArrowLeft}
                    className="flex-1"
                    id="appointment-modal-back-button"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    icon={ArrowRight}
                    iconPosition="right"
                    className={`flex-1 ${
                      !isFormValid() || isSendingOTP ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    id="appointment-modal-book-button"
                    disabled={!isFormValid() || isSendingOTP}
                    style={
                      !isFormValid() || isSendingOTP
                        ? {
                            background:
                              "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                            color: "#FFFFFF",
                            borderColor: "#9ca3af",
                          }
                        : {}
                    }
                  >
                    {isSendingOTP ? "Sending Code..." : "BOOK APPOINTMENT"}
                  </Button>
                </div>
                {/* SMS Disclosure - Only show when checkbox IS selected */}
                {formData.receiveSMS && (
                  <p className="disclosure text-xs text-gray-600 leading-relaxed">
                    <sup>**</sup> By checking this box you consent to receive text
                    (SMS) messages about your appointment. You may opt out at any
                    time by replying STOP. For additional details, refer to our{" "}
                    <a
                      href="https://www.webuyanycarusa.com/privacypolicy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 underline"
                    >
                      Privacy Policy
                    </a>
                    . Message and data rates may apply.
                  </p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => {
          console.log("---- onClose OTPModal ---");
          setShowOTPModal(false);
          setStep(2);
        }}
        phoneNumber={formData.telephone}
        onVerify={handleOTPVerify}
        onResendCode={handleResendOTP}
        onChangePhone={handleChangePhone}
      />
    </AnimatePresence>
  );
};

export default AppointmentModal;
