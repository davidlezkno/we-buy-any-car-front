// AppointmentFlow orchestrates appointment scheduling while delegating presentation to focused child components.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Clock, Home, MapPin, Star } from "lucide-react";
import AppointmentDetailsForm from "../components/Appointment/AppointmentDetailsForm";
import AppointmentTypeSelection from "../components/Appointment/AppointmentTypeSelection";
import ProgressBar from "../components/UI/ProgressBar";
import useNearbyStores from "../hooks/useNearbyStores";
import { useApp } from "../context/AppContext";
import {
  APPOINTMENT_STEPS,
  APPOINTMENT_TIME_SLOTS,
  HOME_APPOINTMENT_BENEFITS,
} from "../utils/constants";

/**
 * Guides users through selecting an appointment type and submitting scheduling details.
 */
const AppointmentFlow = () => {
  const navigate = useNavigate();
  const { updateAppointmentInfo, updateUserInfo } = useApp();
  const [step, setStep] = useState(1);
  const [appointmentType, setAppointmentType] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const contentRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const watchZipCode = watch("zipCode");
  const { stores, isLoading: isLoadingStores } = useNearbyStores(watchZipCode);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const appointmentTypeOptions = useMemo(
    () => [
      {
        id: "store",
        label: "Visit a Store",
        description:
          "Come to one of our convenient locations for a quick, professional appraisal",
        icon: MapPin,
        highlights: [
          {
            id: "duration",
            icon: Clock,
            text: "30-minute appointment",
          },
          {
            id: "experts",
            icon: Star,
            text: "Expert appraisers",
          },
        ],
        accent: {
          container: "bg-primary-100 group-hover:bg-primary-200",
          icon: "text-primary-600",
          highlightIcon: "text-yellow-500",
        },
      },
      {
        id: "home",
        label: "Home Appointment",
        description:
          "We’ll come to you! Get an appraisal from the comfort of your home",
        icon: Home,
        highlights: [
          {
            id: "schedule",
            icon: Clock,
            text: "Flexible scheduling",
          },
          {
            id: "convenience",
            icon: Star,
            text: "Maximum convenience",
          },
        ],
        accent: {
          container: "bg-green-100 group-hover:bg-green-200",
          icon: "text-green-600",
          highlightIcon: "text-yellow-500",
        },
      },
    ],
    [],
  );

  const minAppointmentDate = useMemo(
    () => new Date().toISOString().split("T")[0],
    [],
  );
  const progressSteps = useMemo(() => APPOINTMENT_STEPS, []);

  const handleTypeSelection = useCallback((type) => {
    setAppointmentType(type);
    setSelectedStore(null);
    setStep(2);
  }, []);

  const handleAppointmentSubmit = useCallback(
    (data) => {
      updateUserInfo({
        name: data.name,
        email: data.email,
        phone: data.phone,
        zipCode: data.zipCode,
      });

      updateAppointmentInfo({
        type: appointmentType,
        store: selectedStore,
        date: data.date,
        time: data.time,
        address: data.address,
        notes: data.notes,
      });

      setStep(3);
      navigate("/confirmation");
    },
    [
      appointmentType,
      navigate,
      selectedStore,
      updateAppointmentInfo,
      updateUserInfo,
    ],
  );

  const handleStoreSelection = useCallback((store) => {
    setSelectedStore(store);
  }, []);

  const handleBackToType = useCallback(() => {
    setStep(1);
  }, []);

  useEffect(() => {
    if (appointmentType !== "store") {
      return;
    }

    if (!selectedStore && stores.length > 0) {
      setSelectedStore(stores[0]);
    }
  }, [appointmentType, selectedStore, stores]);

  return (
    <div className="section-container py-8">
      <div className="max-w-6xl mx-auto" ref={contentRef}>
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            id="back-to-home-button"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Schedule an Appointment
          </h1>
          <p className="text-lg text-gray-600">
            Choose between a store visit or home appointment
          </p>
        </div>

        <ProgressBar
          currentStep={step}
          totalSteps={progressSteps.length}
          steps={progressSteps}
        />

        {step === 1 && (
          <AppointmentTypeSelection
            options={appointmentTypeOptions}
            onSelect={handleTypeSelection}
          />
        )}

        {step === 2 && (
          <AppointmentDetailsForm
            appointmentType={appointmentType}
            errors={errors}
            handleSubmit={handleSubmit}
            homeBenefits={HOME_APPOINTMENT_BENEFITS}
            minDate={minAppointmentDate}
            onBack={handleBackToType}
            onSubmit={handleAppointmentSubmit}
            register={register}
            selectedStore={selectedStore}
            stores={stores}
            onSelectStore={handleStoreSelection}
            isLoadingStores={isLoadingStores}
            timeSlots={APPOINTMENT_TIME_SLOTS}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentFlow;
