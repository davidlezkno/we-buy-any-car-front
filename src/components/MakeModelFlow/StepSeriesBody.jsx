/**
 * StepSeriesBody - Step 2: Series & Body Type Selection
 * Implements Single Responsibility Principle (SRP)
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Select from '../UI/Select';
import Button from '../UI/Button';

/**
 * Series and Body Type selection step
 * @param {Object} props - Component props
 * @param {Object} props.vehicleData - Current vehicle data
 * @param {Array} props.seriesOptions - Available series options
 * @param {Array} props.bodyTypeOptions - Available body type options
 * @param {string} props.selectedSeries - Currently selected series
 * @param {string} props.selectedBodyType - Currently selected body type
 * @param {boolean} props.isSeriesDisabled - Whether series select is disabled
 * @param {boolean} props.isBodyTypeDisabled - Whether body type select is disabled
 * @param {Function} props.onSeriesChange - Handler for series change
 * @param {Function} props.onBodyTypeChange - Handler for body type change
 * @param {Function} props.onSubmit - Handler for form submission
 * @param {boolean} props.loading - Loading state
 */
const StepSeriesBody = ({
  vehicleData,
  seriesOptions,
  bodyTypeOptions,
  selectedSeries,
  selectedBodyType,
  isSeriesDisabled,
  isBodyTypeDisabled,
  onSeriesChange,
  onBodyTypeChange,
  onSubmit,
  loading,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      series: selectedSeries || '',
      bodyType: selectedBodyType || '',
    },
  });

  const watchSeries = watch('series');
  const watchBodyType = watch('bodyType');

  // Sync form with external state
  useEffect(() => {
    if (selectedSeries) {
      setValue('series', selectedSeries);
    }
  }, [selectedSeries, setValue]);

  useEffect(() => {
    if (selectedBodyType) {
      setValue('bodyType', selectedBodyType);
    }
  }, [selectedBodyType, setValue]);

  const handleSeriesSelect = (e) => {
    const value = e.target.value;
    setValue('series', value);
    onSeriesChange(value);
  };

  const handleBodyTypeSelect = (e) => {
    const value = e.target.value;
    setValue('bodyType', value);
    onBodyTypeChange(value);
  };

  const isFormValid = watchSeries && watchBodyType;

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
        <div className="mb-3">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Series & Body Type
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <Select
            label="Select Series"
            options={seriesOptions}
            placeholder="Select Series"
            error={errors.series?.message}
            value={selectedSeries}
            disabled={loading || isSeriesDisabled}
            id="series-select"
            {...register('series')}
            onChange={handleSeriesSelect}
          />

          <Select
            label="Select Body Type"
            options={bodyTypeOptions}
            placeholder="Select body type"
            error={errors.bodyType?.message}
            value={selectedBodyType}
            disabled={loading || isBodyTypeDisabled || !watchSeries}
            id="body-type-select"
            {...register('bodyType', {
              required: 'Body type is required',
            })}
            onChange={handleBodyTypeSelect}
          />

          <div className="pt-4">
            <Button
              type="submit"
              className={`w-full ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              icon={ArrowRight}
              iconPosition="right"
              id="continue-to-step-3-button"
              disabled={!isFormValid || loading}
              style={{
                background: !isFormValid
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                  : 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                color: '#FFFFFF',
                borderColor: !isFormValid ? '#9ca3af' : '#000000',
              }}
            >
              {loading ? 'Loading...' : 'Continue To Step 3'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default StepSeriesBody;
