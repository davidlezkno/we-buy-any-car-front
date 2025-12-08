/**
 * StepVehicleCondition - Step 3: Vehicle Condition & User Information
 * Implements Single Responsibility Principle (SRP)
 */

import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import RadioGroup from './RadioGroup';
import { formatPhoneNumber, getDigitsOnly } from '../../utils/phoneUtils';

/**
 * Vehicle Condition and User Information step
 * @param {Object} props - Component props
 */
const StepVehicleCondition = ({
  vehicleData,
  userInfo,
  onSubmit,
  loading,
  zipCodeError,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      runsAndDrives: vehicleData?.runsAndDrives || 'Yes',
      hasIssues: vehicleData?.hasIssues || 'No',
      hasAccident: vehicleData?.hasAccident || 'No',
      hasClearTitle: vehicleData?.hasClearTitle || 'Yes',
      odometer: vehicleData?.odometer || '',
      zipCode: vehicleData?.zipCode || userInfo?.zipCode || '',
      email: vehicleData?.email || userInfo?.email || '',
      phone: formatPhoneNumber(vehicleData?.phone || userInfo?.phone || ''),
      receiveSMS: false,
    },
  });

  const watchRunsAndDrives = watch('runsAndDrives');
  const watchHasIssues = watch('hasIssues');
  const watchHasAccident = watch('hasAccident');
  const watchHasClearTitle = watch('hasClearTitle');
  const watchOdometer = watch('odometer');
  const watchZipCode = watch('zipCode');
  const watchEmail = watch('email');
  const watchPhone = watch('phone');

  const isFormValid =
    watchRunsAndDrives &&
    watchHasIssues &&
    watchHasAccident &&
    watchHasClearTitle &&
    watchOdometer &&
    parseInt(watchOdometer?.toString().replace(/,/g, '') || '0') > 0 &&
    watchZipCode &&
    watchEmail;

  const isPhoneValid = watchPhone && getDigitsOnly(watchPhone).length === 10;

  // Set ZIP code error when prop changes
  useEffect(() => {
    if (zipCodeError) {
      setError('zipCode', {
        type: 'manual',
        message: zipCodeError,
      });
    }
  }, [zipCodeError, setError]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <div
        className="rounded-3xl p-10 transition-all duration-500"
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow:
            '0 20px 60px 0 rgba(31, 38, 135, 0.2), 0 8px 24px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        <div className="mb-0 md:mb-8">
          <h2 className="text-[16px] md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Vehicle Condition & Your Information
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          {/* Vehicle Condition Questions */}
          <div className="space-y-4 pb-0 md:space-y-6 md:pb-6 md:border-b md:border-gray-200">
            <RadioGroup
              label="Does Your Car Run and Drive?"
              name="runsAndDrives"
              register={register}
              error={errors.runsAndDrives?.message}
              required
            />

            <RadioGroup
              label="Does Your Car Have Cosmetic or Mechanical Issues?"
              name="hasIssues"
              register={register}
              error={errors.hasIssues?.message}
              required
            />

            <RadioGroup
              label="Has Your Car Ever Been in an Accident?"
              name="hasAccident"
              register={register}
              error={errors.hasAccident?.message}
              required
            />

            <RadioGroup
              label="Do You Have a Clear Title?"
              name="hasClearTitle"
              register={register}
              error={errors.hasClearTitle?.message}
              required
              hint='Select "No" if Your Vehicle is Leased or Financed.'
            />

            <Controller
              name="odometer"
              control={control}
              rules={{
                required: 'Odometer reading is required',
                validate: (value) => {
                  const numValue = parseInt(value?.toString().replace(/,/g, '') || '0');
                  if (numValue < 0) return 'Odometer must be positive';
                  if (numValue === 0) return 'Odometer reading is required';
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <Input
                  label="What Does the Odometer Read?"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter Vehicle Mileage"
                  error={fieldState.error?.message}
                  id="odometer-input"
                  value={field.value || ''}
                  onChange={(e) => {
                    // Remove all non-numeric characters
                    const numericValue = e.target.value.replace(/\D/g, '');
                    // Format with commas
                    const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    field.onChange(formattedValue);
                  }}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>

          {/* User Information */}
          <div className="space-y-6">
            <Input
              label="ZIP Code"
              placeholder="Enter ZIP Code"
              type="tel"
              inputMode="numeric"
              maxLength={5}
              error={errors.zipCode?.message}
              id="zip-code-input"
              {...register('zipCode', {
                required: 'ZIP code is required',
                pattern: { value: /^\d{5}$/, message: 'Invalid ZIP code' },
              })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter Email Address"
              error={errors.email?.message}
              id="email-input"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />

            <Controller
              name="phone"
              control={control}
              rules={{
                validate: (value) => {
                  if (!value || value.trim() === '') return true;
                  const digits = getDigitsOnly(value);
                  if (digits.length !== 10) {
                    return 'Phone number must be 10 digits';
                  }
                  return true;
                },
              }}
              render={({ field, fieldState }) => (
                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Phone Number (Optional)"
                  error={fieldState.error?.message}
                  id="phone-input"
                  value={field.value || ''}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    field.onChange(formatted);
                  }}
                  onBlur={field.onBlur}
                />
              )}
            />

            <label
              className={`flex items-center gap-3 ${
                !isPhoneValid ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              <input
                type="checkbox"
                id="receive-sms-checkbox"
                {...register('receiveSMS')}
                disabled={!isPhoneValid}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="text-gray-600 text-sm">
                Receive text (SMS) messages about your valuation*
              </span>
            </label>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className={`w-full ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              icon={ArrowRight}
              iconPosition="right"
              id="submit-vehicle-info-button"
              disabled={!isFormValid || loading}
              style={{
                background: !isFormValid
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                  : 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                color: '#FFFFFF',
                borderColor: !isFormValid ? '#9ca3af' : '#000000',
              }}
            >
              {loading ? 'Processing...' : 'See Your Valuation'}
            </Button>
          </div>

          {/* Disclosure Footer */}
          <DisclosureFooter />
        </form>
      </div>
    </motion.div>
  );
};

/**
 * Disclosure footer component
 */
const DisclosureFooter = () => (
  <div id="wizard-footer" className="mt-8 pt-6 border-t border-gray-200 space-y-4">
    <p className="email-disclosure text-xs text-gray-600 leading-relaxed">
      By entering your email address, you will receive confirmation of your vehicle
      valuation by email. You may receive future emails about your vehicle valuation
      and webuyanycar.com services. You may unsubscribe using the links provided or
      by contacting us directly. Refer to our{' '}
      <a
        href="https://www.webuyanycarusa.com/privacypolicy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-600 hover:text-primary-800 underline"
      >
        Privacy Policy
      </a>{' '}
      for full disclosure.
    </p>

    <div id="sms-disclosure-footer">
      <p className="disclosure text-xs text-gray-600 leading-relaxed">
        <sup>*</sup> By checking this box you consent to receive text (SMS) messages
        about your valuation. You may opt out at any time by replying STOP. For
        additional details, refer to our{' '}
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
    </div>
  </div>
);

export default StepVehicleCondition;
