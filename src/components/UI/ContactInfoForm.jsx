/**
 * ContactInfoForm - Reusable contact information form
 * Used in both mobile and desktop appointment booking flows
 * 
 * REFACTORIZACIÓN: Este componente elimina la duplicación de código
 * entre los formularios mobile y desktop del CalendarScheduler
 */

import { forwardRef } from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Contact Information Form Component
 * @param {Object} props - Component props
 * @param {string} props.firstName - First name value
 * @param {string} props.lastName - Last name value
 * @param {string} props.telephone - Telephone value
 * @param {boolean} props.receiveSMS - SMS opt-in value
 * @param {string} props.smsError - SMS validation error message
 * @param {Function} props.onFirstNameChange - First name change handler
 * @param {Function} props.onLastNameChange - Last name change handler
 * @param {Function} props.onTelephoneChange - Telephone change handler
 * @param {Function} props.onReceiveSMSChange - SMS opt-in change handler
 * @param {Function} props.onSubmit - Form submit handler
 * @param {boolean} props.disabled - Disable submit button
 * @param {string} props.submitButtonText - Submit button text
 * @param {boolean} props.showAddressFields - Show address fields for home appointments
 * @param {string} props.address1 - Address line 1
 * @param {string} props.address2 - Address line 2
 * @param {string} props.city - City
 * @param {string} props.stateZip - State and zip code
 * @param {Function} props.onAddress1Change - Address 1 change handler
 * @param {Function} props.onAddress2Change - Address 2 change handler
 * @param {Function} props.onCityChange - City change handler
 * @param {string} props.checkboxId - Unique ID for SMS checkbox
 * @param {Object} smsCheckboxRef - Ref for SMS checkbox
 * @param {Object} smsCheckboxContainerRef - Ref for SMS checkbox container
 */
const ContactInfoForm = forwardRef(({
  firstName,
  lastName,
  telephone,
  receiveSMS,
  smsError,
  onFirstNameChange,
  onLastNameChange,
  onTelephoneChange,
  onReceiveSMSChange,
  onSubmit,
  disabled = false,
  submitButtonText = 'BOOK APPOINTMENT',
  showAddressFields = false,
  address1 = '',
  address2 = '',
  city = '',
  stateZip = 'NJ, 07008',
  onAddress1Change,
  onAddress2Change,
  onCityChange,
  checkboxId = 'appointment-modal-receive-sms-checkbox',
}, ref) => {
  // Destructure refs if provided
  const { smsCheckboxRef, smsCheckboxContainerRef } = ref || {};

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    // Validate SMS opt-in is required
    if (!receiveSMS) {
      const errorMessage = "You must receive a verification code by text (SMS) message to complete your appointment booking online. If you prefer not to receive the code by SMS, please call (484) 519-2538 to schedule your appointment.";
      
      if (onReceiveSMSChange) {
        onReceiveSMSChange(false, errorMessage);
      }
      
      // Focus and scroll to the checkbox when error is shown
      setTimeout(() => {
        // First, scroll the container into view
        if (smsCheckboxContainerRef?.current) {
          smsCheckboxContainerRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
        // Then try to focus the checkbox
        if (smsCheckboxRef?.current) {
          smsCheckboxRef.current.focus();
          // If checkbox doesn't receive focus, try the label
          setTimeout(() => {
            if (document.activeElement !== smsCheckboxRef.current) {
              const label = document.querySelector(`label[for="${checkboxId}"]`);
              if (label) {
                label.setAttribute('tabIndex', '-1');
                label.focus();
              }
            }
          }, 50);
        }
      }, 150);
      return;
    }
    
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-5">
      {/* First Name */}
      <div className="w-full">
        <label className="label hidden md:block" htmlFor="appointment-modal-first-name-input">
          First Name
        </label>
        <div className="relative group">
          <input
            className="input-field"
            placeholder="Enter First Name"
            id="appointment-modal-first-name-input"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            required
          />
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 animate-shimmer"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.1), transparent) 0% 0% / 200% 100%",
            }}
          ></div>
        </div>
      </div>

      {/* Last Name */}
      <div className="w-full">
        <label className="label hidden md:block" htmlFor="appointment-modal-last-name-input">
          Last Name
        </label>
        <div className="relative group">
          <input
            className="input-field"
            placeholder="Enter Last Name"
            id="appointment-modal-last-name-input"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            required
          />
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 animate-shimmer"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.1), transparent) 0% 0% / 200% 100%",
            }}
          ></div>
        </div>
      </div>

      {/* Telephone */}
      <div className="w-full">
        <label className="label hidden md:block" htmlFor="appointment-modal-telephone-input">
          Telephone
        </label>
        <div className="relative group">
          <input
            className="input-field"
            type="tel"
            inputMode="numeric"
            placeholder="Enter Telephone Number"
            id="appointment-modal-telephone-input"
            value={telephone}
            onChange={(e) => onTelephoneChange(e.target.value)}
            required
          />
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 animate-shimmer"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(2, 132, 199, 0.1), transparent) 0% 0% / 200% 100%",
            }}
          ></div>
        </div>
      </div>

      {/* Address Fields (only for home appointments) */}
      {showAddressFields && (
        <>
          <div className="w-full">
            <input
              className="textbox mobile-address input-field"
              data-val="true"
              data-val-required="Address is required."
              id="Address1"
              maxLength={50}
              name="Address1"
              placeholder="Address Line 1"
              type="text"
              value={address1}
              onChange={(e) => onAddress1Change?.(e.target.value)}
              required
              style={{ display: "inline-block", width: "100%" }}
            />
          </div>

          <div className="w-full">
            <input
              className="textbox mobile-address input-field"
              id="Address2"
              maxLength={50}
              name="Address2"
              placeholder="Address Line 2 (Optional)"
              type="text"
              value={address2}
              onChange={(e) => onAddress2Change?.(e.target.value)}
              style={{ display: "inline-block", width: "100%" }}
            />
          </div>

          <div className="city-state-zip-container flex gap-2">
            <div className="flex-1">
              <input
                className="textbox mobile-address input-field"
                data-val="true"
                data-val-required="City is required."
                id="City"
                maxLength={50}
                name="City"
                placeholder="City"
                type="text"
                value={city}
                onChange={(e) => onCityChange?.(e.target.value)}
                required
                style={{ display: "inline-block", width: "100%" }}
              />
            </div>
            <div className="flex-1">
              <input
                id="state-zip"
                type="text"
                value={stateZip}
                className="textbox mobile-address input-field"
                readOnly
                tabIndex={-1}
                style={{ 
                  display: "inline-block", 
                  width: "100%", 
                  backgroundColor: "#f3f4f6", 
                  cursor: "not-allowed" 
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* SMS Opt-in Checkbox */}
      <div className="flex items-start gap-3 pt-2" ref={smsCheckboxContainerRef}>
        <input
          type="checkbox"
          id={checkboxId}
          ref={smsCheckboxRef}
          className={`mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 ${
            smsError ? "border-red-500 border-2 ring-2 ring-red-300 shadow-lg" : ""
          }`}
          style={smsError ? { 
            borderColor: "#ef4444", 
            borderWidth: "2px",
            boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          } : {}}
          checked={receiveSMS}
          onChange={(e) => {
            if (onReceiveSMSChange) {
              onReceiveSMSChange(e.target.checked, '');
            }
          }}
        />
        <label
          htmlFor={checkboxId}
          className="text-sm text-gray-700 cursor-pointer"
        >
          Receive text (SMS) messages about this appointment**
        </label>
      </div>
      
      {/* SMS Error Message */}
      {smsError && (
        <span className="text-red-600 text-sm block mt-2">
          {smsError}
        </span>
      )}

      {/* Submit Button */}
      <div className="pt-0 md:pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className="w-full bg-black text-white font-bold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
        >
          {submitButtonText}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

ContactInfoForm.displayName = 'ContactInfoForm';

export default ContactInfoForm;
