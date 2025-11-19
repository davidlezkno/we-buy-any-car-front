import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext";
import { decodeLicensePlate } from "../services/api";
import VehiclePreview from "../components/VehiclePreview/VehiclePreview";
import Input from "../components/UI/Input";
import Select from "../components/UI/Select";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import ProgressBar from "../components/UI/ProgressBar";

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const LicensePlateFlow = () => {
  const navigate = useNavigate();
  const { updateVehicleData, vehicleData, updateUserInfo } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Scroll to content when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const handlePlateSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const vehicleInfo = await decodeLicensePlate(
        data.plate.toUpperCase(),
        data.state,
      );
      updateVehicleData(vehicleInfo);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserInfoSubmit = (data) => {
    updateUserInfo(data);
    navigate("/confirmation");
  };

  return (
    <div className="section-container py-8">
      <div className="max-w-6xl mx-auto" ref={contentRef}>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Sell Your Car by License Plate
          </h1>
          <p className="text-lg text-gray-600">
            Enter your license plate and state for instant vehicle lookup
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          currentStep={step}
          totalSteps={2}
          steps={["License Plate", "Your Information"]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 container-cards-info">
          {/* Form Section */}
          <div>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Enter License Plate Details
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We&apos;ll automatically retrieve your vehicle information
                    from our database
                  </p>

                  <form
                    onSubmit={handleSubmit(handlePlateSubmit)}
                    className="space-y-6"
                  >
                    {/* Added unique IDs for automation testing */}
                    <Select
                      label="State"
                      options={US_STATES}
                      placeholder="Select state"
                      error={errors.state?.message}
                      id="plate-state-select"
                      {...register("state", {
                        required: "State is required",
                      })}
                    />

                    <Input
                      label="License Plate Number"
                      placeholder="ABC1234"
                      error={errors.plate?.message || error}
                      hint="Enter your plate number without spaces or dashes"
                      id="plate-input"
                      {...register("plate", {
                        required: "License plate is required",
                        minLength: {
                          value: 2,
                          message: "Plate number too short",
                        },
                        maxLength: {
                          value: 10,
                          message: "Plate number too long",
                        },
                      })}
                    />

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <strong>Privacy Notice:</strong>
                        <p className="mt-1">
                          Your plate information is used only for vehicle
                          identification and is not shared with third parties.
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>Having trouble?</strong>
                        <p className="mt-1">
                          Try using your{" "}
                          {/* Added unique IDs for automation testing */}
                          <button
                            type="button"
                            onClick={() => navigate("/sell-by-vin")}
                            className="font-semibold underline hover:text-blue-900"
                            id="try-vin-number-link-button"
                          >
                            VIN number
                          </button>{" "}
                          or{" "}
                          <button
                            type="button"
                            onClick={() => navigate("/sell-by-make-model")}
                            className="font-semibold underline hover:text-blue-900"
                            id="try-make-model-link-button"
                          >
                            Make & Model
                          </button>{" "}
                          instead.
                        </p>
                      </div>
                    </div>

                    {/* Added unique ID for automation testing */}
                    <Button
                      type="submit"
                      className="w-full"
                      loading={loading}
                      icon={ArrowRight}
                      iconPosition="right"
                      id="lookup-vehicle-button"
                    >
                      Lookup Vehicle
                    </Button>
                  </form>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Your Information
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Complete your details to receive your instant offer
                  </p>

                  <form
                    onSubmit={handleSubmit(handleUserInfoSubmit)}
                    className="space-y-4"
                  >
                    {/* Added unique IDs for automation testing */}
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      error={errors.name?.message}
                      id="plate-name-input"
                      {...register("name", {
                        required: "Name is required",
                      })}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      error={errors.email?.message}
                      id="plate-email-input"
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
                      id="plate-phone-input"
                      {...register("phone", {
                        required: "Phone is required",
                        pattern: {
                          value: /^[\d\s\-()]+$/,
                          message: "Invalid phone number",
                        },
                      })}
                    />

                    <Input
                      label="ZIP Code"
                      placeholder="10001"
                      maxLength={5}
                      error={errors.zipCode?.message}
                      id="plate-zip-code-input"
                      {...register("zipCode", {
                        required: "ZIP code is required",
                        pattern: {
                          value: /^\d{5}$/,
                          message: "Invalid ZIP code",
                        },
                      })}
                    />

                    <div className="flex gap-4 pt-4">
                      {/* Added unique IDs for automation testing */}
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setStep(1)}
                        icon={ArrowLeft}
                        id="back-from-plate-step-2-button"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        icon={ArrowRight}
                        iconPosition="right"
                        id="get-my-offer-plate-button"
                      >
                        Get My Offer
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Preview Section */}
          <div>
            <VehiclePreview vehicle={vehicleData} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicensePlateFlow;
