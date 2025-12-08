import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Search, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import { decodeVIN } from "../services/api";
import VehiclePreview from "../components/VehiclePreview/VehiclePreview";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import ProgressBar from "../components/UI/ProgressBar";

const VINFlow = () => {
  const navigate = useNavigate();
  const { updateVehicleData, vehicleData, updateUserInfo } = useApp();
  // If VIN data is already decoded from HomePage, skip to step 2
  const hasDecodedVIN =
    vehicleData?.vin &&
    vehicleData?.make &&
    vehicleData?.model &&
    vehicleData?.year;
  const [step, setStep] = useState(hasDecodedVIN ? 2 : 1);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      vin: vehicleData?.vin || "",
    },
  });

  // Scroll to content when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const handleVINSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const vehicleInfo = await decodeVIN(data.vin.toUpperCase());
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
    <div className="section-container py-8 md:py-12 relative overflow-hidden">
      {/* Decorative background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-200/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10" ref={contentRef}>
        {/* Header with glass effect */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-all duration-300 px-4 py-2.5 rounded-2xl hover:bg-white/60 backdrop-blur-sm -ml-4"
            style={{
              background: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              boxShadow:
                "0 4px 16px 0 rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Sell Your Car by VIN
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
            Enter your VIN number and we&apos;ll fetch all the details
            automatically
          </p>
        </motion.div>

        {/* Progress Bar */}
        <ProgressBar
          currentStep={step}
          totalSteps={2}
          steps={["Vehicle VIN", "Your Information"]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 container-cards-info">
          {/* Form Section */}
          <div>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <div
                  className="rounded-3xl p-10 transition-all duration-500"
                  style={{
                    background: "rgba(255, 255, 255, 0.75)",
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                    border: "1px solid rgba(255, 255, 255, 0.9)",
                    boxShadow:
                      "0 20px 60px 0 rgba(31, 38, 135, 0.2), 0 8px 24px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)",
                  }}
                >
                  <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                      Enter Your VIN Number
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Your VIN is a 17-character code usually found on your
                      vehicle&apos;s dashboard or driver&apos;s side door.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit(handleVINSubmit)}
                    className="space-y-7"
                  >
                    {/* If VIN data is already decoded from HomePage, show summary */}
                    {hasDecodedVIN && !showEditForm ? (
                      <>
                        <div className="mb-6 p-5 rounded-2xl border-2 border-green-200 bg-green-50">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-bold text-green-900 text-lg">
                                Vehicle Verified
                              </h3>
                              <p className="text-sm text-green-700">
                                We found detailed information about your
                                vehicle.
                              </p>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-green-200">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {vehicleData.year} {vehicleData.make}{" "}
                              {vehicleData.model}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              VIN: {vehicleData.vin}
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-green-800">
                            Continue to get your instant offer!
                          </p>
                        </div>

                        <Button
                          type="button"
                          className="w-full"
                          onClick={() => setStep(2)}
                          icon={ArrowRight}
                          iconPosition="right"
                        >
                          Continue to Your Information
                        </Button>

                        <button
                          type="button"
                          onClick={() => setShowEditForm(true)}
                          className="w-full text-sm text-gray-600 hover:text-gray-900 underline mt-3"
                        >
                          Need to enter a different VIN? Edit
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Added unique ID for automation testing */}
                        <Input
                          label="VIN Number"
                          placeholder="Enter 17-character VIN"
                          icon={Search}
                          maxLength={17}
                          error={errors.vin?.message || error}
                          hint="Example: 1HGBH41JXMN109186"
                          id="vin-input"
                          {...register("vin", {
                            required: "VIN is required",
                            minLength: {
                              value: 17,
                              message: "VIN must be 17 characters",
                            },
                            maxLength: {
                              value: 17,
                              message: "VIN must be 17 characters",
                            },
                            pattern: {
                              value: /^[A-HJ-NPR-Z0-9]{17}$/i,
                              message: "Invalid VIN format",
                            },
                          })}
                        />

                        {showEditForm && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowEditForm(false);
                              // Reset form to original VIN if it exists
                              if (vehicleData?.vin) {
                                setValue("vin", vehicleData.vin);
                              }
                            }}
                            className="w-full text-sm text-gray-600 hover:text-gray-900 underline mt-2"
                            id="cancel-edit-vin-button"
                          >
                            Cancel edit
                          </button>
                        )}

                        <div
                          className="rounded-2xl p-5 flex gap-4 backdrop-blur-xl"
                          style={{
                            background: "rgba(59, 130, 246, 0.15)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            boxShadow:
                              "0 8px 32px 0 rgba(59, 130, 246, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
                          }}
                        >
                          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-900">
                            <strong className="font-bold">
                              Don&apos;t know your VIN?
                            </strong>
                            <p className="mt-1.5 leading-relaxed">
                              Try our{" "}
                              {/* Added unique ID for automation testing */}
                              <button
                                type="button"
                                onClick={() => navigate("/sell-by-make-model")}
                                className="font-bold underline hover:text-blue-700 transition-colors duration-300"
                                id="try-make-model-search-link-button"
                              >
                                Make & Model search
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
                          id="get-vehicle-details-button"
                        >
                          Get Vehicle Details
                        </Button>
                      </>
                    )}
                  </form>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <div
                  className="rounded-3xl p-10 transition-all duration-500"
                  style={{
                    background: "rgba(255, 255, 255, 0.75)",
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                    border: "1px solid rgba(255, 255, 255, 0.9)",
                    boxShadow:
                      "0 20px 60px 0 rgba(31, 38, 135, 0.2), 0 8px 24px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)",
                  }}
                >
                  <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                      Your Information
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      We&apos;ll use this to send you your instant offer
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit(handleUserInfoSubmit)}
                    className="space-y-7"
                  >
                    {/* Added unique IDs for automation testing */}
                    <Input
                      label="Full Name"
                      placeholder="John Doe"
                      error={errors.name?.message}
                      id="vin-name-input"
                      {...register("name", {
                        required: "Name is required",
                      })}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      error={errors.email?.message}
                      id="vin-email-input"
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
                      id="vin-phone-input"
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
                      id="vin-zip-code-input"
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
                        id="back-from-vin-step-2-button"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        icon={ArrowRight}
                        iconPosition="right"
                        id="get-my-offer-vin-button"
                      >
                        Get My Offer
                      </Button>
                    </div>
                  </form>
                </div>
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

export default VINFlow;
