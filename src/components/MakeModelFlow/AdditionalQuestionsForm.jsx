/**
 * AdditionalQuestionsForm - Additional vehicle questions when issues detected
 * Implements Single Responsibility Principle (SRP)
 */

import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Select from '../UI/Select';
import Button from '../UI/Button';
import RadioGroup from './RadioGroup';

/**
 * Additional questions form for vehicles with issues
 * @param {Object} props - Component props
 */
const AdditionalQuestionsForm = ({
  vehicleData,
  damageForm,
  onSubmit,
  onBack,
  loading,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      runsAndDrives: vehicleData?.runsAndDrives || 'Yes',
      hasFloodTheftSalvage: vehicleData?.hasFloodTheftSalvage || 'No',
      hasTaxiDrivingSchoolLawEnforcement: vehicleData?.hasTaxiDrivingSchoolLawEnforcement || 'No',
      odometerChanged: vehicleData?.odometerChanged || 'No',
      reportedAccident: vehicleData?.reportedAccident || 'No',
    },
  });

  const watchRunsAndDrives = watch('runsAndDrives');
  const watchHasFloodTheftSalvage = watch('hasFloodTheftSalvage');
  const watchHasTaxiDrivingSchoolLawEnforcement = watch('hasTaxiDrivingSchoolLawEnforcement');
  const watchOdometerChanged = watch('odometerChanged');
  const watchReportedAccident = watch('reportedAccident');

  const isFormValid =
    watchRunsAndDrives &&
    watchHasFloodTheftSalvage &&
    watchHasTaxiDrivingSchoolLawEnforcement &&
    watchOdometerChanged &&
    watchReportedAccident;

  const {
    damageZone,
    damageComponent,
    damageType,
    damageList,
    componentOptions,
    faultOptions,
    canAddDamage,
    zoneOptions,
    setDamageZone,
    setDamageComponent,
    setDamageType,
    addDamage,
    removeDamage,
  } = damageForm;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="space-y-6"
    >
      <div
        className="rounded-3xl p-5 md:p-8 lg:p-12 transition-all duration-500 relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow:
            '0 20px 60px 0 rgba(31, 38, 135, 0.2), 0 8px 24px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Additional Vehicle Information
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          {/* Additional questions */}
          <div className="space-y-4 pb-0 md:space-y-6 md:pb-6 md:border-b md:border-gray-200">
            <RadioGroup
              label="Does your car run and drive?"
              name="runsAndDrives"
              register={register}
              error={errors.runsAndDrives?.message}
              required
            />

            <RadioGroup
              label="Is there history on your vehicle resulting from flood, theft recovery or salvage loss?"
              name="hasFloodTheftSalvage"
              register={register}
              error={errors.hasFloodTheftSalvage?.message}
              required
            />

            <RadioGroup
              label="Has your car ever been used as a taxi, driving school car or for law enforcement purposes?"
              name="hasTaxiDrivingSchoolLawEnforcement"
              register={register}
              error={errors.hasTaxiDrivingSchoolLawEnforcement?.message}
              required
            />

            <RadioGroup
              label="Has the odometer ever been changed?"
              name="odometerChanged"
              register={register}
              error={errors.odometerChanged?.message}
              required
            />

            <RadioGroup
              label="Has your vehicle ever been in a reported accident?"
              name="reportedAccident"
              register={register}
              error={errors.reportedAccident?.message}
              required
            />
          </div>

          {/* Damage section */}
          <DamageSection
            damageZone={damageZone}
            damageComponent={damageComponent}
            damageType={damageType}
            damageList={damageList}
            componentOptions={componentOptions}
            faultOptions={faultOptions}
            canAddDamage={canAddDamage}
            zoneOptions={zoneOptions}
            onZoneChange={setDamageZone}
            onComponentChange={setDamageComponent}
            onTypeChange={setDamageType}
            onAddDamage={addDamage}
            onRemoveDamage={removeDamage}
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onBack}
              icon={ArrowLeft}
              id="back-from-additional-questions-button"
            >
              Back
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              icon={ArrowRight}
              iconPosition="right"
              id="submit-additional-questions-button"
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
        </form>
      </div>
    </motion.div>
  );
};

/**
 * Damage section component
 */
const DamageSection = ({
  damageZone,
  damageComponent,
  damageType,
  damageList,
  componentOptions,
  faultOptions,
  canAddDamage,
  zoneOptions,
  onZoneChange,
  onComponentChange,
  onTypeChange,
  onAddDamage,
  onRemoveDamage,
}) => (
  <div className="mt-8">
    <h3 className="text-xl font-bold text-gray-900 mb-4">
      Please Tell Us About Any Damage
    </h3>
    <div className="space-y-4">
      <Select
        label="Which Part of the Vehicle is Damaged?"
        options={zoneOptions}
        placeholder="Which Part of the Vehicle is Damaged?"
        value={damageZone}
        onChange={(e) => onZoneChange(e.target.value)}
        id="damage-zone-select"
      />

      <Select
        label="What Has Been Damaged?"
        options={componentOptions}
        placeholder="What Has Been Damaged?"
        value={damageComponent}
        onChange={(e) => onComponentChange(e.target.value)}
        disabled={!damageZone}
        id="damage-component-select"
      />

      <Select
        label="Please Select the Type of Damage"
        options={faultOptions}
        placeholder="Please Select the Type of Damage"
        value={damageType}
        onChange={(e) => onTypeChange(e.target.value)}
        disabled={!damageComponent}
        id="damage-type-select"
      />

      <Button
        type="button"
        onClick={onAddDamage}
        disabled={!canAddDamage}
        className="w-full md:w-auto"
        variant="outline"
        id="add-damage-button"
      >
        Add Damage
      </Button>

      {/* List of added damages */}
      {damageList.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Added Damages:</h4>
          {damageList.map((damage, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex-1">
                <span className="text-sm md:text-base text-gray-800 font-medium">
                  {damage.zoneLabel} - {damage.componentLabel} - {damage.typeLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveDamage(index)}
                className="ml-4 px-3 py-1.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200 whitespace-nowrap"
                id={`remove-damage-${index}-button`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default AdditionalQuestionsForm;
