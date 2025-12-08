import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const OTPModal = ({ isOpen, onClose, phoneNumber, onVerify, onResendCode, onChangePhone }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResendMessage, setShowResendMessage] = useState(false);
  const inputRefs = useRef([]);

  // Format phone number for display
  const formatPhoneForDisplay = (phone) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  };

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset OTP when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setShowResendMessage(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleOtpChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    // if (newOtp.every((digit) => digit !== "") && index === 5) {
    //   handleSubmit(newOtp.join(""));
    // }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6);
        if (digits.length === 6) {
          const newOtp = digits.split("");
          setOtp(newOtp);
          inputRefs.current[5]?.focus();
        }
      });
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      setError("");
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (otpValue = null) => {
    const code = otpValue || otp.join("");
    
    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Code must be a 6-digit number");
      return;
    }

    // setIsLoading(true);
    // setError("");

    setIsLoading(true);
    setError("");
    
    try {
      if (onVerify) {
        // Call onVerify and wait for result
        const result = await onVerify(code);
        
        // If verification was successful (result === true), close modal immediately
        // Don't update any state - just close to avoid showing error message
        if (result === true) {
          onClose(); // Close modal on success - state will be reset by useEffect
          return; // Exit immediately without updating any state
        } else {
          setTimeout(() => {
            // Only reach here if verification failed
            // Verification failed - show error and stay on modal
            setIsLoading(false);
            setError("Invalid code. Please try again.");
            // Clear OTP inputs to allow retry
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
          }, 5000)
        }
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      // Error during verification - show error and stay on modal
      setIsLoading(false);
      setError(err.message || "Invalid code. Please try again.");
      // Clear OTP inputs to allow retry
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendCode = async () => {
    setShowResendMessage(false);
    if (onResendCode) {
      onResendCode();
      setShowResendMessage(true);
      setTimeout(() => setShowResendMessage(false), 5000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[10000]"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-gray-50 rounded-lg shadow-2xl z-[10002] overflow-hidden"
          style={{
            background: "#f9fafb",
            boxShadow: "0 25px 80px 0 rgba(0, 0, 0, 0.3), 0 10px 30px 0 rgba(0, 0, 0, 0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Enter Verification Code</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-6" id="otp-entry">
            <label htmlFor="OTP" className="block mb-6">
              <span className="text-gray-700 block mb-3 text-base">
                A one-time verification code has been sent to {formatPhoneForDisplay(phoneNumber)}.
              </span>
              {onChangePhone && (
                <a
                  id="wrong-number"
                  href="#"
                  onClick={(e) => {
                    setShowResendMessage(false);
                    e.preventDefault();
                    onChangePhone();
                  }}
                  className="green text-sm block mb-4"
                  style={{ color: "#20B24D" }}
                  data-wi-no="45325"
                  data-feature="OTP Fix Phone"
                >
                  <span className="md:hidden mobile-only">Tap here to use a different phone number.</span>
                  <span className="hidden md:inline desktop-only">Click here to use a different phone number.</span>
                </a>
              )}
              <span className="text-gray-700 block font-medium text-base mb-4">Please enter the six-digit code:</span>
            </label>

            {/* OTP Inputs */}
            <div id="otp-inputs" className="mb-6">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="number"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    // onKeyDown={(e) => handleKeyDown(index, e)}
                    // onPaste={index === 0 ? handlePaste : undefined}
                    className="text-center text-2xl font-bold border border-gray-300 rounded focus:border-primary-600 focus:ring-2 focus:ring-primary-200 outline-none transition-all bg-white md:w-14 md:h-14"
                    style={{ width: "2.5rem", textAlign: "center", height: "2.5rem", fontSize: "1.5rem", padding: "0" }}
                    aria-label={`Please enter OTP character ${index + 1}`}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {/* Hidden input for form submission */}
              <input
                type="hidden"
                id="OTP"
                name="OTP"
                value={otp.join("")}
                data-val="true"
                data-val-regex="Code must be a 6-digit number."
                data-val-regex-pattern="^\d{6}$"
              />

              {error && (
                <div className="text-red-600 text-sm mt-2 text-center" role="alert">
                  {error}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div id="otp-submit-button-mount" className="button-mount mb-6">
              <div>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isLoading || otp.some((digit) => !digit)}
                  className={`medium button loading-button wbac-font w-full bg-black hover:bg-gray-900 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative`}
                  id="otp-submit-button"
                  data-loading={isLoading}
                >
                  <div className="button-grid relative w-full flex items-center justify-center">
                    {isLoading && (
                      <div className="submit-loading absolute" style={{ height: "40px", width: "40px", opacity: isLoading ? 1 : 0, transition: "opacity 0.2s ease-in-out" }}>
                        {Array.from({ length: 12 }).map((_, i) => {
                          const rotation = i * 30;
                          const delay = -1 + (i * (1 / 12));
                          return (
                            <div
                              key={i}
                              style={{
                                position: "absolute",
                                top: "45%",
                                left: "40%",
                                transform: `rotate(${rotation}deg) translateX(-14px)`,
                                transformOrigin: "center center",
                                width: "8px",
                                height: "3.07692px",
                                backgroundColor: "rgb(255, 255, 255)",
                                borderRadius: "6.66667px",
                                animationDuration: "1s",
                                animationIterationCount: "infinite",
                                animationName: "loading-spinner-line-fade",
                                animationDelay: `${delay}s`,
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                    <span className={`submit-label ${isLoading ? "opacity-0" : ""}`}>Complete Booking</span>
                  </div>
                </button>
                <button type="submit" id="otp-submit-button-submit" className="hidden mobile-hidden" style={{ display: "none" }}></button>
              </div>
            </div>

            {/* Footer */}
            <div id="otp-footer" className="text-center space-y-3 text-sm">
              <p className="text-gray-600 text-sm">
                Having trouble? Call{" "}
                <a
                  href="tel:4845192538"
                  className="text-primary-600 hover:text-primary-800 underline"
                  data-wi-no="45153"
                  data-feature="Call Center Link"
                >
                  (484) 519-2538
                </a>
                .
              </p>
              {onResendCode && (
                <>
                  <a
                    id="did-not-receive"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleResendCode();
                    }}
                    className="green underline block"
                    style={{ color: "#20B24D", display: showResendMessage ? "none" : "block" }}
                    data-wi-no="45153"
                    data-feature="Request New OTP"
                  >
                    <span className="md:hidden mobile-only">Didn´t receive a code? Tap here to send another.</span>
                    <span className="hidden md:inline desktop-only">Didn´t receive a code? Click here to send another.</span>
                  </a>
                  {showResendMessage && (
                    <span className="click-message text-green-600 font-semibold block">
                      Another code has been sent to your phone.
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OTPModal;

