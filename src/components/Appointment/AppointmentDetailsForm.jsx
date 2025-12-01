// AppointmentDetailsForm captures appointment details and presents contextual guidance per appointment mode.
import { memo } from "react";
import { ArrowLeft, ArrowRight, MapPin, Star } from "lucide-react";
import Button from "../UI/Button";
import Card from "../UI/Card";
import Input from "../UI/Input";
import Select from "../UI/Select";

/**
 * @typedef {import("react-hook-form").FieldErrors} FieldErrors
 */

/**
 * @param {{
 *  appointmentType: string,
 *  errors: FieldErrors,
 *  handleSubmit: Function,
 *  homeBenefits: string[],
 *  isLoadingStores: boolean,
 *  minDate: string,
 *  onBack: () => void,
 *  onSelectStore: Function,
 *  onSubmit: Function,
 *  register: Function,
 *  selectedStore: Record<string, any> | null,
 *  stores: Array,
 *  timeSlots: string[]
 * }} props
 */
const AppointmentDetailsForm = ({
  appointmentType,
  errors,
  handleSubmit,
  homeBenefits,
  minDate,
  onBack,
  onSubmit,
  register,
  selectedStore,
  stores,
  onSelectStore,
  isLoadingStores,
  timeSlots,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {appointmentType === "store"
          ? "Store Visit Details"
          : "Home Appointment Details"}
      </h2>
      <p className="text-gray-600 mb-6">
        Complete the form to schedule your appointment
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="John Doe"
          error={errors.name?.message}
          id="appointment-name-input"
          {...register("name", { required: "Name is required" })}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          id="appointment-email-input"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="(555) 123-4567"
          error={errors.phone?.message}
          id="appointment-phone-input"
          {...register("phone", { required: "Phone is required" })}
        />

        <Input
          label="ZIP Code"
          placeholder="10001"
          maxLength={5}
          error={errors.zipCode?.message}
          id="appointment-zip-code-input"
          {...register("zipCode", {
            required: "ZIP code is required",
            pattern: {
              value: /^\d{5}$/,
              message: "Invalid ZIP code",
            },
          })}
        />

        {appointmentType === "home" && (
          <Input
            label="Home Address"
            placeholder="123 Main Street, Apt 4B"
            error={errors.address?.message}
            id="appointment-address-input"
            {...register("address", {
              required: "Address is required for home appointments",
            })}
          />
        )}

        <Input
          label="Preferred Date"
          type="date"
          error={errors.date?.message}
          min={minDate}
          id="appointment-date-input"
          {...register("date", { required: "Date is required" })}
        />

        <Select
          label="Preferred Time"
          options={timeSlots}
          placeholder="Select time"
          error={errors.time?.message}
          id="appointment-time-select"
          {...register("time", { required: "Time is required" })}
        />

        <div className="space-y-2">
          <label className="label" htmlFor="appointment-notes-textarea">
            Additional Notes (Optional)
          </label>
          <textarea
            id="appointment-notes-textarea"
            className="input-field min-h-[100px] resize-none"
            placeholder="Any special requirements or notes..."
            {...register("notes")}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            icon={ArrowLeft}
            id="back-from-appointment-step-2-button"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1"
            icon={ArrowRight}
            iconPosition="right"
            id="schedule-appointment-button"
          >
            Schedule Appointment
          </Button>
        </div>
      </form>
    </Card>

    <div className="space-y-6">
      {appointmentType === "store" && (
        <>
          {isLoadingStores && <Card>Loading nearby locations...</Card>}
          {!isLoadingStores && stores.length > 0 && (
            <>
              <h3 className="text-xl font-bold text-gray-900">
                Nearby Locations
              </h3>
              {stores.map((store, index) => (
                <Card
                  key={store.id + "-" + index}
                  hover
                  className={`cursor-pointer transition-all ${
                    selectedStore?.id === store.id
                      ? "ring-2 ring-primary-500"
                      : ""
                  }`}
                  onClick={() => onSelectStore(store)}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary-100 p-3 rounded-xl flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">
                        {store.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {store.address}, {store.city}, {store.state}{" "}
                        {store.zipCode}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {store.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {store.rating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {store.hours}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </>
      )}

      {appointmentType === "home" && (
        <Card className="bg-green-50 border border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Home Appointment Benefits
          </h3>
          <ul className="space-y-3">
            {homeBenefits.map((benefit, index) => (
              <li key={benefit + "-" + index} className="flex items-start gap-2">
                <div className="bg-green-500 rounded-full p-0.5 mt-1">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  </div>
);

export default memo(AppointmentDetailsForm);
