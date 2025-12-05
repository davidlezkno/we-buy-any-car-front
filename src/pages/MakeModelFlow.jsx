import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  getVehicleMakes,
  getModelsByMake,
  getVehicleYears,
  getComponentList,
  getFaultTypeList,
} from "../services/api";
import {
  trackValuationStep,
  trackAppointmentConfirm,
  trackFormSubmit,
} from "../utils/tracking";
import VehiclePreview from "../components/VehiclePreview/VehiclePreview";
import Select from "../components/UI/Select";
import Input from "../components/UI/Input";
import Button from "../components/UI/Button";
import ProgressBar from "../components/UI/ProgressBar";
import CalendarScheduler from "../components/UI/CalendarScheduler";
import AppointmentModal from "../components/UI/AppointmentModal";
import OTPModal from "../components/UI/OTPModal";
import ValuationTabs from "../components/Home/ValuationTabs";
import { createVisitorID, CustomerDetailJourney, GetCustomerJourney, getImageVehicle, getSeries, UpdateCustomerJourney } from "../services/vehicleService";
import { saveValuationVehicle } from "../services/valuationService";
import { getBrancheById, getBranches, getBranchesByCustomerVehicle } from "../services/branchService";
import { cleanObject, convertTo12Hour, formatPhone, formatUSD, getDayName, getNext12Days } from "../utils/helpers";
import { createAppointment } from "../services/appointmentService";
import { allowedZips } from "../utils/model";
import * as OTPAuth from "otpauth";

const MakeModelFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [listSeries, setListSeries] = useState([]);
  const [listBodyTypes, setListBodyTypes] = useState([]);
  const [imageSelected, setImageSelected] = useState("");
  const [customerJourneyId, setCustomerJourneyId] = useState("");
  const [customerJourneyData, setCustomerJourneyData] = useState(null);
  const [branchesData, setBranchesData] = useState([]);
  const [firstBranch, setFirstBranch] = useState(null);
  
  // OTP Secret from environment variable
  const otpSecret = import.meta.env.VITE_OTP_SECRET || "";
  const [branchesHours, setBranchesHours] = useState([]);
  const [BodyTypeSelected, setBodyTypeSelected] = useState("");
  const [branchesHoursSelected, setBranchesHoursSelected] = useState(null);
  const [SerieSelected, setSerieSelected] = useState("");
  const { uid } = useParams();
  const {
    updateVehicleData,
    vehicleData,
    updateUserInfo,
    updateAppointmentInfo,
    userInfo,
    resetData,
  } = useApp();

  useEffect(() => {
    const customerJourneyId = uid || localStorage.getItem("customerJourneyId");
    setCustomerJourneyId(customerJourneyId);
    localStorage.setItem("customerJourneyId", customerJourneyId);
    if(!customerJourneyId){
      navigate("/");
    }else{

      GetCustomerJourney(customerJourneyId).then(customerJourney => {
        if(customerJourney){
          setCustomerJourneyData(customerJourney);
          const { year, make, model } = customerJourney;
          if(customerJourney.zipCode != "" && window.location.pathname.indexOf("/valuation/appointment") >= 0){
           handleVehicleConditionSubmit(getValues());
            // getBranches(customerJourney.zipCode, 1, "Physical").then(branches => {
            //   sessionStorage.setItem("branches", JSON.stringify(branches.branchLocations));
            //   setBranchesData(branches.branchLocations);
            // }).catch(error => {
            //   console.error("Error getting branches:", error);
            // });
          }

          getSeries(year,model,make).then(series => {
            updateVehicleData({
              year: year,
              make: make,
              model: model,
            });
            setListSeries(series);
            setSerieSelected(series[0].series);
            setValue("series", series[0].series);
            
            // watchSeries || !watchBodyType

            if(window.location.pathname.indexOf("/valuation/vehicledetails") >= 0){

              const dat = series.filter(item => item.series === series[0].series);
              setListBodyTypes(dat);      
              if(dat.length === 1){
                setValue("bodyType", dat[0].bodystyle);
                setBodyTypeSelected(dat[0].bodystyle);
              }                  

              if([...new Set(series.map(item => (item.series)))].length === 1 && dat.length === 1){
                handleSeriesBodySubmit({series:series[0].series,bodyType:dat[0].bodystyle});
              }
              loadImage(series[0].imageUrl);

            }

            

          }).catch(error => {
            console.error("Error getting series:", error);
          });
          
        }
      }).catch(error => {
        console.error("Error getting customer journey:", error);
        navigate("/");
      });
    }
  }, [ navigate ]);

  const loadImage = async (imageUrl) => {
    getImageVehicle(imageUrl).then(image => {
      setImageSelected(image);
    }).catch(error => {
      console.error("Error getting image:", error);
    });
    
  };

  // Determine initial step based on URL path and vehicle data
  // This allows direct URL access and proper state restoration
  // Each step now has a distinct URL for better tracking and navigation
  const getInitialStepFromUrl = () => {
    const path = location.pathname;

    // Map URL paths to steps
    if (path === "/valuation/appointment" || path.includes("/appointment")) {
      return 4; // Step 4: Appointment Scheduling
    }
    if (path === "/valuation/vehiclecondition" || path.includes("/vehiclecondition")) {
      return 3; // Step 3: Vehicle Condition
    }
    if (path === "/valuation/vehicledetails" || path.includes("/vehicledetails")) {
      return 2; // Step 2: Series & Body
    }
    if (path === "/valuation" || path === "/sell-by-make-model") {
      return 1; // Step 1: Vehicle Information
    }

    // Default fallback - determine from data availability
    const hasInitialData =
      vehicleData?.year && vehicleData?.make && vehicleData?.model;
    if (hasInitialData && vehicleData?.series && vehicleData?.bodyType) {
      return 3;
    }
    if (hasInitialData) {
      return 2;
    }
    return 1;
  };

  const [step, setStep] = useState(getInitialStepFromUrl);
  
  // Sync step with URL when location changes (for direct URL access)
  // This allows users to refresh or directly access URLs and restore the correct step
  // Also tracks page views for GTM and GA4
  useEffect(() => {

    const path = location.pathname;
    let newStep;

    // Determine step from URL path - each step has a distinct URL
    if (path === "/valuation/appointment" || path.includes("/appointment")) {
      newStep = 4;
    } else if (path === "/valuation/vehiclecondition" || path.includes("/condition")) {
      newStep = 3;
    } else if (path === "/valuation/vehicledetails" || path.includes("/details")) {
      newStep = 2;
    } else if (path === "/valuation" || path === "/sell-by-make-model") {
      newStep = 1;
    } else {
      // Default fallback
      newStep = getInitialStepFromUrl();
    }

    // Only update if step actually changed to prevent unnecessary re-renders
    setStep((prevStep) => {
      if (prevStep !== newStep) {
        // Track page view when step changes
        const stepNames = {
          1: "Vehicle Information",
          2: "Series & Body",
          3: "Vehicle Condition",
          4: "Appointment Scheduling",
        };
        trackValuationStep(
          newStep,
          stepNames[newStep] || `Step ${newStep}`,
          vehicleData,
        );
        return newStep;
      }
      return prevStep;
    });
  }, [location.pathname, vehicleData]);

  // Helper function to update step and navigate to corresponding URL
  // This ensures URL changes are tracked by Google Tag Manager and GA4
  // Each step has a unique URL for better analytics and direct access
  const updateStepAndNavigate = (newStep) => {
    // Map step to URL path - each step has a distinct URL
    console.log("---- customerJourneyId ---", );
    const id = customerJourneyId || localStorage.getItem("customerJourneyId");
    const stepPaths = {
      1: `/valuation/${id}`,
      2: `/valuation/vehicledetails/${id}`,
      3: `/valuation/vehiclecondition/${id}`,
      4: `/valuation/appointment/${id}`,
    };


    const targetPath = stepPaths[newStep] || "/valuation";
    

    // Only navigate if we're not already on the correct path
    // This prevents unnecessary navigation and GTM events
    console.log("---- location.pathname ---", location.pathname);
    console.log("---- targetPath ---", targetPath);
    if (location.pathname !== targetPath) {
      setStep(newStep);
      navigate(targetPath, { replace: true });

      // Track page view for GTM and GA4
      // The useEffect will also trigger tracking, but we call it here for immediate tracking
      const stepNames = {
        1: "Vehicle Information",
        2: "Series & Body",
        3: "Vehicle Condition",
        4: "Appointment Scheduling",
      };
      trackValuationStep(
        newStep,
        stepNames[newStep] || `Step ${newStep}`,
        vehicleData,
      );
    } else {
      // If already on correct path, just update step state
      setStep(newStep);
    }
  };
  const [showEditForm, setShowEditForm] = useState(false);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedMake, setSelectedMake] = useState("");
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null);
  const previousMakeRef = useRef("");
  const trustpilotWidgetRef = useRef(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
    setValue,
    getValues,
    control,
  } = useForm({
    defaultValues: {
      year: vehicleData?.year || "",
      make: vehicleData?.make || "",
      model: vehicleData?.model || "",
      series: vehicleData?.series || "",
      bodyType: vehicleData?.bodyType || "",
      runsAndDrives: vehicleData?.runsAndDrives || "Yes",
      hasIssues: vehicleData?.hasIssues || "No",
      hasAccident: vehicleData?.hasAccident || "No",
      hasClearTitle: vehicleData?.hasClearTitle || "Yes",
      hasFloodTheftSalvage: vehicleData?.hasFloodTheftSalvage || "No",
      hasTaxiDrivingSchoolLawEnforcement:
        vehicleData?.hasTaxiDrivingSchoolLawEnforcement || "No",
      odometerChanged: vehicleData?.odometerChanged || "No",
      reportedAccident: vehicleData?.reportedAccident || "No",
      odometer: vehicleData?.odometer || "",
      zipCode: vehicleData?.zipCode || userInfo?.zipCode || "",
      email: vehicleData?.email || userInfo?.email || "",
      phone: (() => {
        const phoneValue = vehicleData?.phone || userInfo?.phone || "";
        // Format phone if it exists and is not already formatted
        if (phoneValue && !phoneValue.includes("(")) {
          const digits = phoneValue.replace(/\D/g, "");
          if (digits.length === 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} ${digits.slice(6)}`;
          }
        }
        return phoneValue;
      })(),
    },
  });

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingAppointmentData, setPendingAppointmentData] = useState(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [valuation, setValuation] = useState(null);
  const [loadingValuation, setLoadingValuation] = useState(false);
  const [searchZip, setSearchZip] = useState("");
  const [showAdditionalQuestions, setShowAdditionalQuestions] = useState(false);
  const [showNoTowingModal, setShowNoTowingModal] = useState(false);
  const watchYear = watch("year");
  const watchMake = watch("make");
  const watchSeries = watch("series");
  const watchBodyType = watch("bodyType");
  const watchPhone = watch("phone");
  const watchRunsAndDrives = watch("runsAndDrives");
  const watchHasIssues = watch("hasIssues");
  const watchHasAccident = watch("hasAccident");
  const watchHasClearTitle = watch("hasClearTitle");
  const watchOdometer = watch("odometer");
  const watchZipCode = watch("zipCode");
  const watchEmail = watch("email");
  const watchHasFloodTheftSalvage = watch("hasFloodTheftSalvage");
  const watchHasTaxiDrivingSchoolLawEnforcement = watch("hasTaxiDrivingSchoolLawEnforcement");
  const watchOdometerChanged = watch("odometerChanged");
  const watchReportedAccident = watch("reportedAccident");

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

  // State for damage selection dropdowns
  const [damageZone, setDamageZone] = useState("");
  const [damageComponent, setDamageComponent] = useState("");
  const [damageType, setDamageType] = useState("");
  const [damageList, setDamageList] = useState([]);
  const [componentOptions, setComponentOptions] = useState([]);
  const [faultOptions, setFaultOptions] = useState([]);

  // Options for damage zone select
  const zoneOptions = [
    { value: "1", label: "Behind the Wheel" },
    { value: "4", label: "Driver Side Front" },
    { value: "2", label: "Driver Side Front Interior" },
    { value: "13", label: "Driver Side Rear" },
    { value: "14", label: "Driver Side Rear Interior" },
    { value: "5", label: "Front" },
    { value: "7", label: "Passenger Side Front" },
    { value: "8", label: "Passenger Side Front Interior" },
    { value: "9", label: "Passenger Side Rear" },
    { value: "10", label: "Passenger Side Rear Interior" },
    { value: "11", label: "Rear" },
    { value: "12", label: "Rear Interior" },
    { value: "3", label: "Roof Panel" },
    { value: "17", label: "Test Drive" },
    { value: "6", label: "Under the Hood" },
    { value: "16", label: "Undercarriage" },
    { value: "15", label: "Vehicle Disclosure Items" },
  ];

  // Determine if Add Damage button should be enabled
  const canAddDamage = damageZone && damageComponent && damageType;

  useEffect(() => {
    if(years.length === 0){
      getVehicleYears().then(yearsData => {
        setYears(yearsData.map(year => year.toString()));
      }).catch(error => {
        console.error("Error fetching years:", error);
      });
    }
  }, []);

  const loadMakes = async (year) => {
    const makesData = await getVehicleMakes(year);
    setMakes(makesData);
  };

  // Prefill fields and load models if context has data (from HomePage)
  useEffect(() => {
    if (vehicleData?.make && !selectedMake && !watchMake) {
      setSelectedMake(vehicleData.make);
      // Load models automatically if make exists
      const loadModels = async () => {
        setLoading(true);
        try {
          const modelsData = await getModelsByMake(vehicleData.year,vehicleData.make);
          setModels(modelsData);
        } catch (error) {
          console.error("Error loading models:", error);
        } finally {
          setLoading(false);
        }
      };
      loadModels();
      // Update the ref to prevent the other useEffect from running
      previousMakeRef.current = vehicleData.make;
    }
  }, [vehicleData, selectedMake, watchMake]);

  // Scroll to content when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  // Scroll to main element when step 4 shows content for non-drivable vehicles
  useEffect(() => {
    if (step === 4 && vehicleData?.runsAndDrives === "No") {
      // Scroll to main element to maintain content focus
      setTimeout(() => {
        const mainElement = document.querySelector("main.flex-grow");
        if (mainElement) {
          mainElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [step, vehicleData?.runsAndDrives]);

  // Scroll to main element when step 4 shows branch information (when vehicle runs)
  useEffect(() => {
    if (step === 4 && vehicleData?.runsAndDrives !== "No" && valuation) {
      // Scroll to main element when branch information is displayed
      setTimeout(() => {
        const mainElement = document.querySelector("main.flex-grow");
        if (mainElement) {
          mainElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }
  }, [step, vehicleData?.runsAndDrives, valuation]);

  // Load valuation when entering step 4
  useEffect(() => {
    // if (step === 4 && vehicleData) {
    //   const loadValuation = async () => {
    //     setLoadingValuation(true);
    //     try {
    //       const valuationData = await getVehicleValuation(
    //         vehicleData,
    //         userInfo,
    //       );

    //       // setValuation(valuationData);

    //       // Track valuation completion for analytics
    //       if (valuationData?.valuation) {
    //         trackValuationComplete({
    //           valuation: valuationData.valuation,
    //           year: vehicleData.year,
    //           make: vehicleData.make,
    //           model: vehicleData.model,
    //           odometer: vehicleData.odometer,
    //         });
    //       }
    //     } catch (error) {
    //       // Error loading valuation - log for debugging but don't disrupt UX
    //       console.error("Error loading valuation:", error);
    //     } finally {
    //       setLoadingValuation(false);
    //     }
    //   };
    //   loadValuation();
    // }
  }, [step, vehicleData, userInfo]);

  // Initialize Trustpilot widget when step 4 is shown
  useEffect(() => {
    if (step === 4 && vehicleData?.runsAndDrives !== "No") {
      let attempts = 0;
      const maxAttempts = 50; // Try for up to 5 seconds (50 * 100ms)

      // Wait for Trustpilot script to be available and initialize widget
      const initTrustpilot = () => {
        attempts++;
        
        // Check if Trustpilot script is loaded
        if (window.Trustpilot && trustpilotWidgetRef.current) {
          try {
            // Trustpilot script is loaded, initialize the widget
            // Trustpilot should auto-initialize, but we can trigger it manually if needed
            if (typeof window.Trustpilot.loadFromElement === 'function') {
              window.Trustpilot.loadFromElement(trustpilotWidgetRef.current, true);
            } else if (typeof window.Trustpilot.load === 'function') {
              // Alternative initialization method
              window.Trustpilot.load();
            }
            // Trustpilot widgets should auto-initialize when script is loaded
            // The script scans for elements with class 'trustpilot-widget'
            
            // Apply styles to Trustpilot profile link after widget loads
            const applyTrustpilotStyles = () => {
              const profileLink = document.querySelector(
                '.trustpilot-widget a#profile-link, .trustpilot-widget a.tp-widget-profile-link, a#profile-link.tp-widget-profile-link'
              );
              if (profileLink) {
                // Apply styles directly to override inline styles
                profileLink.style.setProperty('background-color', '#fff', 'important');
                profileLink.style.setProperty('-webkit-border-radius', '5px', 'important');
                profileLink.style.setProperty('-moz-border-radius', '5px', 'important');
                profileLink.style.setProperty('-ms-border-radius', '5px', 'important');
                profileLink.style.setProperty('border-radius', '5px', 'important');
                profileLink.style.setProperty('width', '170px', 'important');
                profileLink.style.setProperty('height', '130px', 'important');
                profileLink.style.setProperty('margin-left', '23px', 'important');
                profileLink.style.setProperty('padding-left', '5px', 'important');
                profileLink.style.setProperty('display', 'block', 'important');
                profileLink.style.setProperty('box-sizing', 'border-box', 'important');
                profileLink.style.setProperty('overflow', 'hidden', 'important');
                return true;
              }
              return false;
            };
            
            // Use MutationObserver to watch for the element being added
            const observer = new MutationObserver(() => {
              if (applyTrustpilotStyles()) {
                observer.disconnect();
              }
            });
            
            if (trustpilotWidgetRef.current) {
              observer.observe(trustpilotWidgetRef.current, {
                childList: true,
                subtree: true,
              });
            }
            
            // Try multiple times as widget loads asynchronously
            setTimeout(() => applyTrustpilotStyles(), 500);
            setTimeout(() => applyTrustpilotStyles(), 1000);
            setTimeout(() => applyTrustpilotStyles(), 2000);
            setTimeout(() => applyTrustpilotStyles(), 3000);
            setTimeout(() => {
              applyTrustpilotStyles();
              observer.disconnect();
            }, 5000);
          } catch (e) {
            console.error("Error initializing Trustpilot widget:", e);
          }
        } else if (attempts < maxAttempts) {
          // Script not loaded yet or widget not in DOM, try again after a short delay
          setTimeout(initTrustpilot, 100);
        } else {
          console.warn("Trustpilot script not loaded after maximum attempts");
        }
      };

      // Start initialization after DOM is ready
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        setTimeout(initTrustpilot, 300);
      });
    }
  }, [step, vehicleData?.runsAndDrives]);

  // Load component options when zone is selected
  useEffect(() => {
    if (damageZone) {
      const loadComponents = async () => {
        const components = await getComponentList(damageZone);
        setComponentOptions(components);
        setDamageComponent(""); // Reset component when zone changes
        setDamageType(""); // Reset type when zone changes
        setFaultOptions([]);
      };
      loadComponents();
    } else {
      setComponentOptions([]);
      setDamageComponent("");
      setDamageType("");
      setFaultOptions([]);
    }
  }, [damageZone]);

  // Load fault type options when component is selected
  useEffect(() => {
    if (damageComponent) {
      const loadFaultTypes = async () => {
        const faults = await getFaultTypeList(damageComponent);
        setFaultOptions(faults);
        setDamageType(""); // Reset type when component changes
      };
      loadFaultTypes();
    } else {
      setFaultOptions([]);
      setDamageType("");
    }
  }, [damageComponent]);

  useEffect(() => {
    if (showAdditionalQuestions && contentRef.current) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Also scroll to form container
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [showAdditionalQuestions]);

  useEffect(() => {
    // Only proceed if make actually changed
    if (watchMake === previousMakeRef.current) {
      return;
    }

    // Update the ref
    previousMakeRef.current = watchMake || "";

    // Load models when make changes
    const loadModels = async () => {
      if (watchMake) {
        setLoading(true);
        // Reset model when make changes
        setValue("model", "");
        try {
          const modelsData = await getModelsByMake(vehicleData.year,watchMake);
          setModels(modelsData);
        } catch (error) {
          console.error("Error loading models:", error);
          setModels([]); // Clear models on error
        } finally {
          setLoading(false);
        }
      } else {
        // Clear models if no make is selected
        setModels([]);
        setValue("model", "");
      }
    };

    loadModels();
  }, [watchMake, setValue]);

  const handleVehicleSubmit = (data) => {
    // Save only the 3 initial data fields: year, make, and model
    updateVehicleData({
      year: data.year,
      make: data.make,
      model: data.model,
    });

    
    // Track form submission for analytics
    trackFormSubmit("vehicle_info", {
      vehicle_year: data.year,
      vehicle_make: data.make,
      vehicle_model: data.model,
    });

    // Navigate to step 2 (Series & Body) - URL changes to /valuation/vehicledetails
    updateStepAndNavigate(2);
  };

  const handleSeriesBodySubmit = (data) => {
    // Track form submission for analytics
    trackFormSubmit("series_body", {
      vehicle_series: data.series || null,
      vehicle_body_type: data.bodyType || null,
    });

    CustomerDetailJourney({
      "series": data.series,
      "bodyStyle": data.bodyType,
    }, customerJourneyId).then(response => {
      const cleanResponse = cleanObject(response);
      updateVehicleData({...vehicleData, ...cleanResponse});  
      setStep(3);
      updateStepAndNavigate(3);
    }).catch(error => {
      console.error("Error updating customer journey:", error);
    });

    // Navigate to step 3 (Vehicle Condition) - URL changes to /valuation/vehiclecondition
    
  };

  // Handle adding damage
  const handleAddDamage = () => {
    if (damageZone && damageComponent && damageType) {
      const newDamage = {
        zone: damageZone,
        component: damageComponent,
        type: damageType,
        zoneLabel: zoneOptions.find((z) => z.value === damageZone)?.label || "",
        componentLabel:
          componentOptions.find((c) => c.value === damageComponent)?.label ||
          "",
        typeLabel:
          faultOptions.find((f) => f.value === damageType)?.label || "",
      };
      setDamageList([...damageList, newDamage]);
      // Reset form
      setDamageZone("");
      setDamageComponent("");
      setDamageType("");
      setComponentOptions([]);
      setFaultOptions([]);
    }
  };

  // Handle removing damage
  const handleRemoveDamage = (index) => {
    setDamageList(damageList.filter((_, i) => i !== index));
  };

  const handleVehicleConditionSubmit = (data) => {
    if(data.email == ""){
      data = getValues();
    }
    
    // If runsAndDrives is "No", or hasIssues is "Yes", or hasAccident is "Yes", show additional questions
    if (
      data.runsAndDrives === "No" ||
      data.hasIssues === "Yes" ||
      data.hasAccident === "Yes"
    ) {
      // Save basic data first
      updateVehicleData({
        ...vehicleData,
        runsAndDrives: data.runsAndDrives,
        hasIssues: data.hasIssues,
        hasAccident: data.hasAccident,
        hasClearTitle: data.hasClearTitle,
        odometer: data.odometer,
      });
      // Show additional questions
      setShowAdditionalQuestions(true);
    } else {
      // If "Yes", advance directly to step 4
      
      updateUserInfo({
        zipCode: data.zipCode,
        email: data.email,
        phone: data.phone || "",
        receiveSMS: data.receiveSMS || false,
      });

      // Track form submission for analytics
      trackFormSubmit("vehicle_condition", {
        runs_and_drives: data.runsAndDrives,
        has_issues: data.hasIssues,
        has_accident: data.hasAccident,
        has_clear_title: data.hasClearTitle,
        odometer: data.odometer,
      });
      
      

      // await getValuationVehicle(vehicleData.customerVehicleId).then(valuationVehicle => {
      //   console.log("-----------------valuationVehicle--------------------------------", valuationVehicle);
      // });
      
      // Navigate to appointment step (step 4) - URL changes to /valuation/appointment
      
    }

    if(data.email !== ""){
      localStorage.setItem("dataUpdateCustomerJourney", JSON.stringify({
        "mileage": data.odometer,
        "zipCode": data.zipCode,
        "email": data.email,
        "isFinancedOrLeased": data.hasClearTitle === "Yes" ? true : false,
        "carIsDriveable": data.runsAndDrives === "Yes" ? true : false,
        "hasDamage": data.hasIssues === "Yes" ? true : false,
        "hasBeenInAccident": data.hasAccident === "Yes" ? true : false,
        "optionalPhoneNumber": formatPhone(data.phone),
        "customerHasOptedIntoSmsMessages": data.receiveSMS,
        "captchaWasDisplayed": data.captchaMode
      }));
    }

    const idjourney = customerJourneyId || localStorage.getItem("customerJourneyId");
    UpdateCustomerJourney({
      "mileage": data.odometer,
      "zipCode": data.zipCode,
      "email": data.email,
      "isFinancedOrLeased": data.hasClearTitle === "Yes" ? true : false,
      "carIsDriveable": data.runsAndDrives === "Yes" ? true : false,
      "hasDamage": data.hasIssues === "Yes" ? true : false,
      "hasBeenInAccident": data.hasAccident === "Yes" ? true : false,
      "optionalPhoneNumber": formatPhone(data.phone),
      "customerHasOptedIntoSmsMessages": data.receiveSMS,
      "captchaWasDisplayed": data.captchaMode
    }, idjourney).then(response => {
      const cleanData = cleanObject(response);
      
      
      
      updateVehicleData({
        ...vehicleData,
        ...cleanData
      });

      localStorage.setItem("dataVehicleCondition", JSON.stringify({
        ...vehicleData,
        ...cleanData
      }));

      

      saveValuationVehicle({
        "cvid":cleanData.customerVehicleId,
        "mileage": data.odometer,
        "zipCode": data.zipCode,
        "email": data.email,
        "isFinancedOrLeased": data.hasClearTitle === "Yes" ? true : false,
        "carIsDriveable": data.runsAndDrives === "Yes" ? true : false,
        "hasDamage": data.hasIssues === "Yes" ? true : false,
        "hasBeenInAccident": data.hasAccident === "Yes" ? true : false,
        "optionalPhoneNumber": formatPhone(data.phone),
        "customerJourneyId": customerJourneyId,
        "customerHasOptedIntoSmsMessages": data.receiveSMS,
        "captchaMode": "true"
      }).then(response => {
        if(response != null){
          setLoadingValuation(false);
          setValuation({formattedValue:formatUSD(response.valuationAmount)});
          getBranchesDataByZipMakeModel(data.zipCode, cleanData.customerVehicleId)
        }else{
          setValue("zipCode", "");
          setError("zipCode", {
            type: "manual",
            message: "Please enter the ZIP code closest to where you intend to sell the vehicle",
          });
          
        }
      }).catch(error => {
        console.error("Error saving valuation vehicle:", error);
      });


    }).catch(error => {
      console.error("Error updating customer journey:", error);
    });
    sessionStorage.setItem("vehicleData", JSON.stringify(vehicleData));
  };

  const getBranchesDataByZipMakeModel = (zipCode, customerVehicleId) => {
      getBranchesByCustomerVehicle(zipCode, customerVehicleId).then(branchesHours => {
        const branchesHoursData = branchesHours.physical.map(branch => {
          let obj = [];
          const days = getNext12Days();
          for(var i = 0; i < days.length; i++){
            const fechaHora = branch.timeSlots[`${days[i]}T00:00:00`];     
            const objData =    {
              closeTime: fechaHora ? convertTo12Hour(fechaHora[fechaHora.length - 1].timeSlot24Hour) : "",
              date: days[i],
              dayOfWeek: getDayName(days[i]),
              isExceptional: false,
              openTime: fechaHora ? convertTo12Hour(fechaHora[0].timeSlot24Hour) : "",
              type: fechaHora ? "open" : "closed"
            };    
            if(objData.type === "open"){
              obj.push(objData);
              obj.push({...objData, openTime: "01:00 PM"});
            }else{
              obj.push(objData);
            }
          }

          return {
              address1: "",
              address2: "",
              branchEmail: "",
              branchId: branch.branchId,
              branchManagerName: "",
              branchName: branch.branchName,
              branchPhone: branch.telephone,
              city: branch.city,
              distanceMiles: branch.distanceInMiles,
              latitude: "",
              longitude: "",
              type:"branch",
              operationHours: obj
          }
        });

        if(branchesHours?.mobile?.branchId){
          const branch = branchesHours.mobile;
          let obj = [];
            const days = getNext12Days();
            for(var i = 0; i < days.length; i++){
              const fechaHora = branch.timeSlots[`${days[i]}T00:00:00`];     
              const objData =    {
                closeTime: "08:00 PM",
                date: days[i],
                dayOfWeek: getDayName(days[i]),
                isExceptional: false,
                openTime: "09:00 AM",
                type: "open"
              };    
              if(objData.type === "open"){
                obj.push(objData);
                obj.push({...objData, openTime: "01:00 PM"});
              }else{
                obj.push(objData);
              }
            }
            
            branchesHoursData.unshift({
              address1: "",
              address2: "",
              branchEmail: "",
              branchId: branch.branchId,
              branchManagerName: "",
              branchName: branch.branchName,
              branchPhone: branch.telephone,
              city: branch.city,
              distanceMiles: branch.distanceInMiles,
              latitude: "",
              longitude: "",
              type:"home",
              operationHours: obj
          });
        }
        
        setBranchesData(branchesHoursData);

        getBrancheById(branchesHoursData[0].branchId).then(branch => {
          setFirstBranch(branch);
        });

        sessionStorage.setItem("branchesHours", JSON.stringify(branchesHours));
        setBranchesHours(branchesHours);
        updateStepAndNavigate(4);
      }).catch(error => {
        console.error("Error getting branches:", error);
      });
  }

  // Handler for submitting additional questions
  const handleAdditionalQuestionsSubmit = (data) => {
    // If runsAndDrives is "No", show no towing modal
    if (data.runsAndDrives === "No") {
      setShowNoTowingModal(true);
      return;
    }

    // If "Yes", continue normally
    // Use existing user info from previous step instead of form data
    const contactEmail = vehicleData?.email || userInfo?.email;
    const contactPhone = vehicleData?.phone || userInfo?.phone || null;
    const contactZipCode = vehicleData?.zipCode || userInfo?.zipCode;
    const contactReceiveSMS =
      vehicleData?.receiveSMS || userInfo?.receiveSMS || false;

    updateVehicleData({
      ...vehicleData,
      runsAndDrives: data.runsAndDrives,
      hasFloodTheftSalvage: data.hasFloodTheftSalvage,
      hasTaxiDrivingSchoolLawEnforcement:
        data.hasTaxiDrivingSchoolLawEnforcement,
      odometerChanged: data.odometerChanged,
      reportedAccident: data.reportedAccident,
      // Keep existing user info from previous step
      zipCode: contactZipCode,
      email: contactEmail,
      phone: contactPhone,
      receiveSMS: contactReceiveSMS,
      damages: damageList,
    });

    // Also update userInfo to ensure contact data is available in confirmation page
    if (contactEmail || contactPhone || contactZipCode) {
      updateUserInfo({
        email: contactEmail || userInfo?.email || "",
        phone: contactPhone || userInfo?.phone || "",
        zipCode: contactZipCode || userInfo?.zipCode || "",
        receiveSMS: contactReceiveSMS || userInfo?.receiveSMS || false,
      });
    }

    setShowAdditionalQuestions(false);

    // Track form submission for analytics
    trackFormSubmit("additional_questions", {
      runs_and_drives: data.runsAndDrives,
      has_flood_theft_salvage: data.hasFloodTheftSalvage,
      has_taxi_driving_school: data.hasTaxiDrivingSchoolLawEnforcement,
      odometer_changed: data.odometerChanged,
      reported_accident: data.reportedAccident,
      damages_count: damageList.length,
    });

    // Navigate to appointment step (step 4) - URL changes to /valuation/appointment
    updateStepAndNavigate(4);
  };

  // Handler to continue after modal
  const handleContinueAfterModal = () => {
    setShowNoTowingModal(false);
    // Save data and continue
    const formData = getValues();

    // Get contact info from form or existing data
    const contactEmail =
      formData.email || vehicleData?.email || userInfo?.email;
    const contactPhone =
      formData.phone || vehicleData?.phone || userInfo?.phone || null;
    const contactZipCode =
      formData.zipCode || vehicleData?.zipCode || userInfo?.zipCode;
    const contactReceiveSMS =
      formData.receiveSMS !== undefined
        ? formData.receiveSMS
        : vehicleData?.receiveSMS || userInfo?.receiveSMS || false;

    updateVehicleData({
      ...vehicleData,
      runsAndDrives: formData.runsAndDrives,
      hasFloodTheftSalvage: formData.hasFloodTheftSalvage,
      hasTaxiDrivingSchoolLawEnforcement:
        formData.hasTaxiDrivingSchoolLawEnforcement,
      odometerChanged: formData.odometerChanged,
      reportedAccident: formData.reportedAccident,
      zipCode: contactZipCode,
      email: contactEmail,
      phone: contactPhone,
      receiveSMS: contactReceiveSMS,
      damages: damageList,
    });

    // Update userInfo to ensure contact data is available in confirmation page
    updateUserInfo({
      zipCode: contactZipCode || userInfo?.zipCode || "",
      email: contactEmail || userInfo?.email || "",
      phone: contactPhone || userInfo?.phone || "",
      receiveSMS: contactReceiveSMS || userInfo?.receiveSMS || false,
    });

    setShowAdditionalQuestions(false);

    // Track form submission for analytics
    trackFormSubmit("additional_questions_modal", {
      runs_and_drives: formData.runsAndDrives,
      has_flood_theft_salvage: formData.hasFloodTheftSalvage,
      has_taxi_driving_school: formData.hasTaxiDrivingSchoolLawEnforcement,
      odometer_changed: formData.odometerChanged,
      reported_accident: formData.reportedAccident,
      damages_count: damageList.length,
    });
    // Navigate to appointment step (step 4) - URL changes to /valuation/appointment
    updateStepAndNavigate(4);
  };

  const handleSlotClick = (slotData) => {
    const brchHours = branchesHours.length > 0 ? branchesHours : JSON.parse(sessionStorage.getItem("branchesHours"));
    console.log("---- brchHours ---", brchHours);
    console.log("---- slotData ---", slotData);
    const findP = brchHours.physical.find(branch => branch.branchId === slotData.locationId);
    const findM = brchHours.mobile.branchId === slotData.locationId ? brchHours.mobile : null;
    const brnc = findP ? findP : findM;
    const timeSlot = brnc.timeSlots[`${slotData.date}T00:00:00`];
    setBranchesHoursSelected(timeSlot ? timeSlot : null);
    setSelectedSlot(slotData);
    setIsModalOpen(true);
  };

  const handleAppointmentConfirm = (appointmentData) => {
    
    console.log("---- appointmentData ---", appointmentData);
    console.log("---- VEHICLE DATA ---", vehicleData);
    
    setSelectedAppointment(appointmentData);
    setIsModalOpen(false);
    setSelectedSlot(null);

    // Update appointment info in context
    updateAppointmentInfo(appointmentData);

    // Track appointment confirmation for analytics
    trackAppointmentConfirm({
      date: appointmentData.date,
      time: appointmentData.time || appointmentData.specificTime?.timeSlot24Hour,
      location: appointmentData.location,
      locationId: appointmentData.locationId,
    });

    // Track appointment slot selection for analytics
    trackFormSubmit("appointment_slot_selected", {
      appointment_date: appointmentData.date,
      appointment_time: appointmentData.time,
      appointment_location: appointmentData.location,
    });


    

    
    const branchSelect = branchesData.find(branch => branch.branchId === appointmentData.locationId);

    const secret = OTPAuth.Secret.fromUTF8(`${vehicleData.customerVehicleId}${otpSecret}`);
    const totp = new OTPAuth.TOTP({ secret });
    const otpCode = totp.generate();

      console.log("---- otpCode ---", otpCode);console.log("OTP Code:", otpCode);
    createAppointment({
      "customerVehicleId": vehicleData.customerVehicleId,
      "branchId": appointmentData.locationId,
      "date": appointmentData.date,
      "timeSlotId": appointmentData.specificTime.timeSlotId,
      "customerPhoneNumber": formatPhone(appointmentData.contactInfo.telephone),
      "customerFirstName": appointmentData.contactInfo.firstName,
      "customerLastName": appointmentData.contactInfo.lastName,
      "email": vehicleData.email,
      "address1": branchSelect.address1,
      "address2": branchSelect.address2,
      "city": appointmentData.location,
      "model": vehicleData.model,
      "visitId": vehicleData.vid,
      "otpCode": otpCode
    }).then(response => {
      console.log("---- response ---", response);
      updateVehicleData({
        ...vehicleData,
        branchInfo: branchSelect,
      });
      updateAppointmentInfo(selectedAppointment);
      navigate(`/valuation/confirmation/${customerJourneyId}`, { replace: true });
    }).catch(error => {
      updateVehicleData({
        ...vehicleData,
        branchInfo: branchSelect,
      });
      updateAppointmentInfo(selectedAppointment);
      alert("Error creating appointment");
      navigate(`/valuation/confirmation/${customerJourneyId}`, { replace: true });
      console.error("Error creating appointment:", error);
    });

  };

  // const handleFinalSubmit = () => {
  //   if (selectedAppointment) {
  //     updateAppointmentInfo(selectedAppointment);

  //     // Track appointment confirmation for analytics
  //     trackAppointmentConfirm({
  //       date: selectedAppointment.date,
  //       time: selectedAppointment.time || selectedAppointment.specificTime?.timeSlot24Hour,
  //       location: selectedAppointment.location,
  //       locationId: selectedAppointment.locationId,
  //     });

  //     // Navigate to confirmation page - URL changes to /valuation/confirmation
  //     // This URL change will be detected by Google Tag Manager and GA4
  //     navigate("/valuation/confirmation", { replace: true });
  //   }
  // };

  const handleSearchByZip = (zipCode) => {
    
    setValue("zipCode", zipCode);
    handleVehicleConditionSubmit(getValues());
    if (searchZip.trim()) {
      // Branch search by ZIP code logic can be implemented here
      // For now, this is a placeholder for future functionality
      console.log("Branch search by ZIP not yet implemented:", searchZip);
    }
  };

  // If step === 1, show only ValuationTabs section (hide header, footer, and other content)
  if (step === 1) {
    return (
      <ValuationTabs
        activeTab={0}
        onTabChange={(tabIndex) => {
          // If user switches tabs, navigate back to home
          if (tabIndex !== 0) {
            navigate("/");
          }
        }}
        onMakeModelSubmit={(vehicleDetails) => {
          updateVehicleData(vehicleDetails);
          // Update step immediately before navigation to prevent showing step 1 again
          setStep(2);
          navigate("/valuation/vehicledetails");
        }}
        onVinSubmit={(vehicleInfo) => {
          updateVehicleData(vehicleInfo);
          navigate("/sell-by-vin");
        }}
        onPlateSubmit={(_state, _plate) => {
          navigate("/sell-by-plate");
        }}
        onOpenVinHelp={() => {}}
        hideHeaderAndTabs={true}
      />
    );
  }

  return (
    <div className="section-container pt-4 pb-8 md:pt-4 md:pb-12 relative overflow-hidden">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-200/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Improved: More vertical padding */}
      <div
        className="max-w-6xl mx-auto relative z-10 w-full"
        ref={contentRef}
        style={{ maxWidth: "100%", boxSizing: "border-box" }}
      >
        {/* Header: Improved spacing and glass design */}
        {step !== 4 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-2xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 tracking-tight">
            Vehicle Condition
            </h1>
          </motion.div>
        )}

        {/* Progress Bar */}
        {step !== 4 && (
          <ProgressBar
            currentStep={step}
            totalSteps={4}
            steps={[
              "Vehicle Info",
              "Series & Body",
              "Vehicle Condition",
              "Schedule Visit",
            ]}
          />
        )}

        <div
          className={`grid ${step === 4 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"} gap-4 lg:gap-12 container-cards-info w-full`}
          style={{ maxWidth: "100%", boxSizing: "border-box" }}
        >
          {/* Improved: More space between cards */}
          {/* Form Section */}
          <div
            className={step === 4 ? "w-full max-w-7xl mx-auto" : ""}
            style={{ maxWidth: "100%", boxSizing: "border-box" }}
          >
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
                      Tell Us About Your Vehicle
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Fill in the details below and see your car preview update
                      automatically
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit(handleVehicleSubmit)}
                    className="space-y-7"
                  >
                    {/* If data comes from HomePage, show confirmed summary */}
                    {vehicleData && !showEditForm ? (
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
                            <div className="text-sm text-gray-600">
                              Year: {vehicleData.year}
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-green-800">
                            Continue to get your instant offer!
                          </p>
                        </div>

                        {/* Added unique ID for automation testing */}
                        <Button
                          type="button"
                          className="w-full mt-6"
                          onClick={() => updateStepAndNavigate(2)}
                          icon={ArrowRight}
                          iconPosition="right"
                          id="continue-to-step-2-button"
                        >
                          Continue
                        </Button>

                        <button
                          type="button"
                          onClick={() => setShowEditForm(true)}
                          className="w-full text-sm text-gray-600 hover:text-gray-900 underline mt-3"
                          id="edit-vehicle-details-button"
                        >
                          Need to change vehicle? Edit details
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Step 1: Only Year, Make and Model if no data comes or if editing */}
                        {/* Added unique IDs for automation testing */}
                        <Select
                          label="Year"
                          options={years}
                          placeholder="Select Model Year"
                          error={errors.year?.message}
                          id="year-select"
                          onChange={(e) => {
                            const newYear = e.target.value;
                            loadMakes(newYear);
                          }}
                          {...register("year", {
                            required: "Year is required",
                          })}
                        />

                        <Controller
                          name="make"
                          control={control}
                          rules={{ required: "Make is required" }}
                          render={({ field, fieldState }) => (
                            <Select
                              label="Make"
                              options={makes}
                              placeholder="Select Make"
                              disabled={!watchYear || loading}
                              error={fieldState.error?.message}
                              id="make-select"
                              value={field.value}
                              name={field.name}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              onChange={(e) => {
                                const newMake = e.target.value;
                                // Update react-hook-form first
                                field.onChange(newMake);
                                // Update selectedMake immediately for Model field enablement
                                setSelectedMake(newMake);
                                // Reset model when make changes
                                setValue("model", "");
                              }}
                            />
                          )}
                        />

                        <Select
                          label="Model"
                          options={models}
                          placeholder={
                            selectedMake ? "Select Model" : "Select make first"
                          }
                          disabled={!selectedMake}
                          error={errors.model?.message}
                          id="model-select"
                          {...register("model", {
                            required: "Model is required",
                          })}
                        />

                        {showEditForm && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowEditForm(false);
                              // Reset form values to original data
                              setValue("year", vehicleData?.year || "");
                              setValue("make", vehicleData?.make || "");
                              setValue("model", vehicleData?.model || "");
                            }}
                            className="w-full text-sm text-gray-600 hover:text-gray-900 underline mt-2"
                            id="cancel-edit-vehicle-button"
                          >
                            Cancel edit
                          </button>
                        )}

                        {/* Added unique ID for automation testing */}
                        <Button
                          type="submit"
                          className="w-full mt-6"
                          icon={ArrowRight}
                          iconPosition="right"
                          id="continue-from-step-1-button"
                        >
                          Continue
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
                  <div className="mb-3">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                      Series & Body Type
                    </h2>
                  </div>

                  <form
                    onSubmit={handleSubmit(handleSeriesBodySubmit)}
                    className="space-y-7"
                  >
                    {/* Added unique IDs for automation testing */}
                    
                    <Select
                      label="Select Series"
                      options={ listSeries[0] ? [...new Set(listSeries.map(item => (item.series)))] : [] }
                      placeholder="Select Series"
                      error={errors.series?.message}
                      value={SerieSelected}
                      disabled={listSeries.length === 0 || [...new Set(listSeries.map(item => (item.series)))].length === 1}
                      id="series-select"
                      {...register("series")}
                      onChange={(e) => {
                        setSerieSelected(e.target.value);
                        if(e.target.value !== ""){
                          setValue("series", e.target.value);
                        }else{
                          setValue("series", "");
                        }
                        
                        setListBodyTypes( e.target.value === '' ? [] : listSeries.filter(item => item.series === e.target.value));                        
                      }}
                    />


                    <Select
                      label="Select Body Type ---"
                      options={listBodyTypes[0] ? listBodyTypes.map(item => (item.bodystyle)) : []}
                      placeholder="Select body type ---"
                      error={errors.bodyType?.message}
                      value={BodyTypeSelected}
                      disabled={listBodyTypes.length === 0 || listBodyTypes.length === 1}
                      id="body-type-select"
                      {...register("bodyType", {
                        required: "Body type is required",
                      })}
                      onChange={(e) => {
                        const newBodyType = e.target.value;
                        if(newBodyType !== ""){
                          setValue("bodyType", newBodyType);
                          // watchSeries || !watchBodyType
                        }else{
                          setValue("bodyType", "");
                        }
                        setBodyTypeSelected(newBodyType);
                        const valueImage = listBodyTypes.find(item => item.bodystyle === newBodyType)?.imageUrl || "";
                        loadImage(valueImage)
                      }}
                    />

                    <div className="pt-4">
                      {/* Added unique IDs for automation testing */}
                      <Button
                        type="submit"
                        className={`w-full ${
                          !watchSeries || !watchBodyType
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        icon={ArrowRight}
                        iconPosition="right"
                        id="continue-to-step-3-button"
                        disabled={!watchSeries || !watchBodyType}
                        style={{
                          background:
                            !watchSeries || !watchBodyType
                              ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                              : "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                          color: "#FFFFFF",
                          borderColor: !watchSeries || !watchBodyType ? "#9ca3af" : "#000000",
                        }}
                      >
                        Continue To Step 3
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
            {step === 3 && !showAdditionalQuestions && (
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
                      Vehicle Condition & Your Information
                    </h2>
                  </div>

                  <form
                    onSubmit={handleSubmit(handleVehicleConditionSubmit)}
                    className="space-y-7"
                  >
                    {/* Vehicle Condition Questions */}
                    <div className="space-y-6 pb-6 border-b border-gray-200">
                      <div>
                        <label className="label mb-3 block">
                          Does Your Car Run and Drive?
                        </label>
                        <div className="flex gap-4">
                          {/* Added unique IDs for automation testing */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="Yes"
                              id="runs-and-drives-yes-radio"
                              {...register("runsAndDrives", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="No"
                              id="runs-and-drives-no-radio"
                              {...register("runsAndDrives", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700 font-bold">No</span>
                          </label>
                        </div>
                        {errors.runsAndDrives && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.runsAndDrives.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="label mb-3 block">
                          Does Your Car Have Cosmetic or Mechanical Issues?
                        </label>
                        <div className="flex gap-4">
                          {/* Added unique IDs for automation testing */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="Yes"
                              id="has-issues-yes-radio"
                              {...register("hasIssues", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="No"
                              id="has-issues-no-radio"
                              {...register("hasIssues", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700 font-bold">No</span>
                          </label>
                        </div>
                        {errors.hasIssues && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.hasIssues.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="label mb-3 block">
                          Has Your Car Ever Been in an Accident?
                        </label>
                        <div className="flex gap-4">
                          {/* Added unique IDs for automation testing */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="Yes"
                              id="has-accident-yes-radio"
                              {...register("hasAccident", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="No"
                              id="has-accident-no-radio"
                              {...register("hasAccident", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700 font-bold">No</span>
                          </label>
                        </div>
                        {errors.hasAccident && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.hasAccident.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="label mb-3 block">
                          Do You Have a Clear Title?
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Select &quot;No&quot; if Your Vehicle is Leased or
                          Financed.
                        </p>
                        <div className="flex gap-4">
                          {/* Added unique IDs for automation testing */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="Yes"
                              id="has-clear-title-yes-radio"
                              {...register("hasClearTitle", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="No"
                              id="has-clear-title-no-radio"
                              {...register("hasClearTitle", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700 font-bold">No</span>
                          </label>
                        </div>
                        {errors.hasClearTitle && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.hasClearTitle.message}
                          </span>
                        )}
                      </div>

                      {/* Added unique IDs for automation testing */}
                      <Input
                        label="What Does the Odometer Read?"
                        type="number"
                        inputMode="numeric"
                        placeholder="Enter Vehicle Mileage"
                        error={errors.odometer?.message}
                        id="odometer-input"
                        {...register("odometer", {
                          required: "Odometer reading is required",
                          min: {
                            value: 0,
                            message: "Odometer must be positive",
                          },
                        })}
                      />
                    </div>

                    {/* User Information */}
                    <div className="space-y-6">
                      {/* Added unique IDs for automation testing */}
                      <Input
                        label="ZIP Code"
                        placeholder="Enter ZIP Code"
                        type="tel"
                        inputMode="numeric"
                        maxLength={5}
                        error={errors.zipCode?.message}
                        id="zip-code-input"
                        {...register("zipCode", {
                          required: "ZIP code is required",
                          pattern: {
                            value: /^\d{5}$/,
                            message: "Invalid ZIP code",
                          },
                        })}
                      />

                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="Enter Email Address"
                        error={errors.email?.message}
                        id="email-input"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                      />

                      <Controller
                        name="phone"
                        control={control}
                        rules={{
                          validate: (value) => {
                            if (!value || value.trim() === "") {
                              return true; // Optional field, no error if empty
                            }
                            const digits = getDigitsOnly(value);
                            if (digits.length !== 10) {
                              return "Phone number must be 10 digits";
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
                            value={field.value || ""}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                            onBlur={field.onBlur}
                          />
                        )}
                      />

                      <label className={`flex items-center gap-3 ${!watchPhone || getDigitsOnly(watchPhone || "").length !== 10 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                        {/* Added unique ID for automation testing */}
                        <input
                          type="checkbox"
                          id="receive-sms-checkbox"
                          {...register("receiveSMS")}
                          disabled={!watchPhone || getDigitsOnly(watchPhone || "").length !== 10}
                          className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="text-gray-600 text-sm">
                          Receive text (SMS) messages about your valuation*
                        </span>
                      </label>
                    </div>

                    <div className="pt-4">
                      {/* Added unique IDs for automation testing */}
                      <Button
                        type="submit"
                        className={`w-full ${
                          !watchRunsAndDrives ||
                          !watchHasIssues ||
                          !watchHasAccident ||
                          !watchHasClearTitle ||
                          !watchOdometer ||
                          !watchZipCode ||
                          !watchEmail
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        icon={ArrowRight}
                        iconPosition="right"
                        id="submit-vehicle-info-button"
                        disabled={
                          !watchRunsAndDrives ||
                          !watchHasIssues ||
                          !watchHasAccident ||
                          !watchHasClearTitle ||
                          !watchOdometer ||
                          !watchZipCode ||
                          !watchEmail
                        }
                        style={{
                          background:
                            !watchRunsAndDrives ||
                            !watchHasIssues ||
                            !watchHasAccident ||
                            !watchHasClearTitle ||
                            !watchOdometer ||
                            !watchZipCode ||
                            !watchEmail
                              ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                              : "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                          color: "#FFFFFF",
                          borderColor:
                            !watchRunsAndDrives ||
                            !watchHasIssues ||
                            !watchHasAccident ||
                            !watchHasClearTitle ||
                            !watchOdometer ||
                            !watchZipCode ||
                            !watchEmail
                              ? "#9ca3af"
                              : "#000000",
                        }}
                      >
                        See Your Valuation
                      </Button>
                    </div>

                    {/* Wizard Footer - Disclosure Information */}
                    <div id="wizard-footer" className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                      {/* Email Disclosure */}
                      <p className="email-disclosure text-xs text-gray-600 leading-relaxed">
                        By entering your email address, you will receive confirmation
                        of your vehicle valuation by email. You may receive future
                        emails about your vehicle valuation and webuyanycar.com
                        services. You may unsubscribe using the links provided or by
                        contacting us directly. Refer to our{" "}
                        <a
                          href="https://www.webuyanycarusa.com/privacypolicy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800 underline"
                        >
                          Privacy Policy
                        </a>{" "}
                        for full disclosure.
                      </p>

                      {/* SMS Disclosure */}
                      <div id="sms-disclosure-footer">
                        <p className="disclosure text-xs text-gray-600 leading-relaxed">
                          <sup>*</sup> By checking this box you consent to receive text
                          (SMS) messages about your valuation. You may opt out at any
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
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Additional questions form when runsAndDrives === "No" */}
            {showAdditionalQuestions && (
              <motion.div
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="space-y-6"
                ref={contentRef}
              >
                <div
                  className="rounded-3xl p-5 md:p-8 lg:p-12 transition-all duration-500 relative overflow-hidden"
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
                      Additional Vehicle Information
                    </h2>
                  </div>

                  <form
                    onSubmit={handleSubmit(handleAdditionalQuestionsSubmit)}
                    className="space-y-7"
                  >
                    {/* Additional questions */}
                    <div className="space-y-6 pb-6 border-b border-gray-200">
                      <div>
                        <label className="label mb-3 block">
                          Does your car run and drive?
                        </label>
                        <div className="flex gap-4">
                          {/* Added unique IDs for automation testing */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="Yes"
                              id="additional-runs-and-drives-yes-radio"
                              {...register("runsAndDrives", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="No"
                              id="additional-runs-and-drives-no-radio"
                              {...register("runsAndDrives", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700 font-bold">No</span>
                          </label>
                        </div>
                        {errors.runsAndDrives && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.runsAndDrives.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="label mb-3 block">
                          Is there history on your vehicle resulting from flood,
                          theft recovery or salvage loss?
                        </label>
                        <div className="flex gap-4">
                          {/* Added unique IDs for automation testing */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="Yes"
                              id="flood-theft-salvage-yes-radio"
                              {...register("hasFloodTheftSalvage", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="No"
                              id="flood-theft-salvage-no-radio"
                              {...register("hasFloodTheftSalvage", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700 font-bold">No</span>
                          </label>
                        </div>
                        {errors.hasFloodTheftSalvage && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.hasFloodTheftSalvage.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="label mb-3 block">
                          Has your car ever been used as a taxi, driving school
                          car or for law enforcement purposes?
                        </label>
                        <div className="flex gap-4">
                          {/* Added unique IDs for automation testing */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="Yes"
                              id="taxi-driving-school-law-enforcement-yes-radio"
                              {...register(
                                "hasTaxiDrivingSchoolLawEnforcement",
                                { required: "This field is required" },
                              )}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="No"
                              id="taxi-driving-school-law-enforcement-no-radio"
                              {...register(
                                "hasTaxiDrivingSchoolLawEnforcement",
                                { required: "This field is required" },
                              )}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700 font-bold">No</span>
                          </label>
                        </div>
                        {errors.hasTaxiDrivingSchoolLawEnforcement && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.hasTaxiDrivingSchoolLawEnforcement.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="label mb-3 block">
                          Has the odometer ever been changed?
                        </label>
                        <div className="flex gap-4">
                          {/* Added unique IDs for automation testing */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="Yes"
                              id="odometer-changed-yes-radio"
                              {...register("odometerChanged", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="No"
                              id="odometer-changed-no-radio"
                              {...register("odometerChanged", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700 font-bold">No</span>
                          </label>
                        </div>
                        {errors.odometerChanged && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.odometerChanged.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="label mb-3 block">
                          Has your vehicle ever been in a reported accident?
                        </label>
                        <div className="flex gap-4">
                          {/* Added unique IDs for automation testing */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="Yes"
                              id="reported-accident-yes-radio"
                              {...register("reportedAccident", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="No"
                              id="reported-accident-no-radio"
                              {...register("reportedAccident", {
                                required: "This field is required",
                              })}
                              className="w-5 h-5 text-primary-600"
                            />
                            <span className="text-gray-700 font-bold">No</span>
                          </label>
                        </div>
                        {errors.reportedAccident && (
                          <span className="text-red-500 text-sm mt-1">
                            {errors.reportedAccident.message}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Damage section */}
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Please Tell Us About Any Damage
                      </h3>
                      <div className="space-y-4">
                        {/* Added unique IDs for automation testing */}
                        <Select
                          label="Which Part of the Vehicle is Damaged?"
                          options={zoneOptions}
                          placeholder="Which Part of the Vehicle is Damaged?"
                          value={damageZone}
                          onChange={(e) => setDamageZone(e.target.value)}
                          id="damage-zone-select"
                        />

                        <Select
                          label="What Has Been Damaged?"
                          options={componentOptions}
                          placeholder="What Has Been Damaged?"
                          value={damageComponent}
                          onChange={(e) => setDamageComponent(e.target.value)}
                          disabled={!damageZone}
                          id="damage-component-select"
                        />

                        <Select
                          label="Please Select the Type of Damage"
                          options={faultOptions}
                          placeholder="Please Select the Type of Damage"
                          value={damageType}
                          onChange={(e) => setDamageType(e.target.value)}
                          disabled={!damageComponent}
                          id="damage-type-select"
                        />

                        {/* Added unique ID for automation testing */}
                        <Button
                          type="button"
                          onClick={handleAddDamage}
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
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                              Added Damages:
                            </h4>
                            {damageList.map((damage, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200"
                              >
                                <div className="flex-1">
                                  <span className="text-sm md:text-base text-gray-800 font-medium">
                                    {damage.zoneLabel} - {damage.componentLabel}{" "}
                                    - {damage.typeLabel}
                                  </span>
                                </div>
                                {/* Added unique ID for automation testing */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDamage(index)}
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

                    <div className="flex gap-4 pt-4">
                      {/* Added unique IDs for automation testing */}
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowAdditionalQuestions(false)}
                        icon={ArrowLeft}
                        id="back-from-additional-questions-button"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className={`flex-1 ${
                          !watchRunsAndDrives ||
                          !watchHasFloodTheftSalvage ||
                          !watchHasTaxiDrivingSchoolLawEnforcement ||
                          !watchOdometerChanged ||
                          !watchReportedAccident
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        icon={ArrowRight}
                        iconPosition="right"
                        id="submit-additional-questions-button"
                        disabled={
                          !watchRunsAndDrives ||
                          !watchHasFloodTheftSalvage ||
                          !watchHasTaxiDrivingSchoolLawEnforcement ||
                          !watchOdometerChanged ||
                          !watchReportedAccident
                        }
                        style={{
                          background:
                            !watchRunsAndDrives ||
                            !watchHasFloodTheftSalvage ||
                            !watchHasTaxiDrivingSchoolLawEnforcement ||
                            !watchOdometerChanged ||
                            !watchReportedAccident
                              ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                              : "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                          color: "#FFFFFF",
                          borderColor:
                            !watchRunsAndDrives ||
                            !watchHasFloodTheftSalvage ||
                            !watchHasTaxiDrivingSchoolLawEnforcement ||
                            !watchOdometerChanged ||
                            !watchReportedAccident
                              ? "#9ca3af"
                              : "#000000",
                        }}
                      >
                        See Your Valuation
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Modal de No Towing Service */}
            {showNoTowingModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowNoTowingModal(false)}
                />

                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md bg-white rounded-lg shadow-2xl z-10 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Content */}
                  <div className="p-6 md:p-8">
                    <div className="text-center mb-6">
                      <p className="text-base md:text-lg text-gray-900 leading-relaxed">
                        Sorry, we don&apos;t offer a towing service.
                        <br />
                        We&apos;ll be happy to buy your vehicle at
                        <br />
                        any webuyanycar.com branch when
                        <br />
                        you arrange delivery.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      {/* Added unique ID for automation testing */}
                      <button
                        onClick={handleContinueAfterModal}
                        className="px-6 py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-800 transition-colors duration-200"
                        id="continue-after-no-towing-modal-button"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
            
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="space-y-6"
              >
                {/* Show special information if vehicle does NOT run */}
                {vehicleData?.runsAndDrives === "No" ? (
                  <>
                    {/* Special information for vehicles that don't run */}
                    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contenido principal - 2 columnas */}
                        <div className="lg:col-span-2 space-y-6">
                          <div>
                            <p className="text-lg md:text-xl text-gray-900 mb-4 leading-relaxed">
                              Thank you for confirming your vehicle does{" "}
                              <strong>NOT</strong> run and drive. To give you an
                              estimate of value* we need to understand more
                              about your vehicle.
                            </p>
                            <p className="text-base md:text-lg text-gray-800 mb-4 leading-relaxed">
                              Please contact your local Branch Manager{" "}
                              <strong>Annie Thomas</strong> at We Buy Any Car
                              <sup>®</sup> Pompano Beach by calling{" "}
                              <a
                                href="tel:9545460418"
                                className="text-blue-600 hover:text-blue-800 underline font-semibold"
                              >
                                (954) 546-0418
                              </a>
                              . Once we know the specific problem (e.g., dead
                              battery, bad transmission), we can provide a
                              better estimate.
                            </p>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
                              <p className="text-base text-gray-800 leading-relaxed">
                                <strong>Keep in mind</strong> that we do buy
                                non-running vehicles but do not offer a towing
                                service. You will need to make your own
                                arrangements to bring the vehicle to your local
                                We Buy Any Car<sup>®</sup> branch for
                                appraisal.
                              </p>
                            </div>
                            <p className="text-base text-gray-700 mt-6">
                              If you made a mistake and the vehicle{" "}
                              <strong>does</strong> run and drive,{" "}
                              {/* Added unique ID for automation testing */}
                              <button
                                onClick={() => {
                                  // Clear all data and navigate to start fresh
                                  resetData();
                                  navigate("/");
                                  // Scroll to main element after page loads
                                  setTimeout(() => {
                                    const mainElement =
                                      document.querySelector("main.flex-grow");
                                    if (mainElement) {
                                      mainElement.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      });
                                    }
                                  }, 300);
                                }}
                                className="text-blue-600 hover:text-blue-800 underline font-semibold"
                                id="restart-valuation-button"
                              >
                                click here
                              </button>{" "}
                              to get a new valuation.
                            </p>
                          </div>
                        </div>

                        {/* Trust badges - Columna derecha */}
                        <div className="lg:col-span-1 space-y-4">
                          {/* BBB Badge */}
                          <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
                            <div className="text-xs font-bold mb-2">BBB</div>
                            <div className="text-xs font-semibold">
                              ACCREDITED
                            </div>
                            <div className="text-xs font-semibold">
                              BUSINESS
                            </div>
                          </div>

                          {/* Trustpilot Badge */}
                          <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
                            <div className="flex items-center justify-center gap-1 mb-2">
                              <span className="text-green-600 text-lg">★</span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className="text-green-600 text-sm"
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-900 mb-1">
                                TrustScore 4.9
                              </div>
                              <div className="text-xs text-gray-600">
                                68,037 opiniones
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Valuation Banner - Only if vehicle DOES run */}
                    <div
                      className="rounded-3xl p-5 md:p-8 lg:p-12 transition-all duration-500 relative overflow-visible md:overflow-visible w-full"
                      style={{
                        background:
                          "linear-gradient(135deg, #20B24D 0%, #1a9a3e 50%, #20B24D 100%)",
                        boxShadow:
                          "0 20px 60px 0 rgba(8, 162, 70, 0.3), 0 8px 24px 0 rgba(8, 162, 70, 0.2)",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        zIndex: isModalOpen ? 0 : "auto",
                        position: isModalOpen ? "relative" : "relative",
                        paddingTop: 0,
                        overflow: "visible",
                      }}
                    >
                      {/* Decorative elements */}
                      <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                      </div>

                      <div className="relative z-10">
                        {/* Contenido principal: Layout vertical en mobile, horizontal en desktop */}
                        <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-5 md:gap-8" style={{ alignItems: "start" }}>
                          {/* Left: Logo - Desktop only */}
                          <div className="hidden md:flex justify-center order-2 md:order-1">
                            <div id="logo">
                              <a
                                id="top-logo"
                                href="/"
                                title="We Buy Any Car"
                                className="block bg-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-shadow"
                              >
                                <img
                                  src={`${import.meta.env.BASE_URL || "/"}logo.png`}
                                  alt="We Buy Any Car Logo"
                                  className="h-10 md:h-14 w-auto object-contain"
                                  style={{ height: "30px" }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              </a>

                              <div id="cars-purchased">
                              <span className="wbac-font">
                                  <span className="big-number">430,000+</span>cars purchased
                              </span>
                          </div>
                            </div>
                          </div>

                          {/* Mobile: Trust badges arriba, Desktop: Right */}
                          <div className="hidden md:flex flex-col items-center md:items-start gap-3 order-2 md:order-3 w-full md:w-auto" style={{ alignSelf: "start", paddingTop: "20px" }}>
                            {/* BBB Badge - Solo imagen */}
                            <a
                              href="http://www.bbb.org/washington-dc-eastern-pa/business-reviews/auto-dealers-used-cars/webuyanycar-com-in-media-pa-235989197/#bbbonlineclick"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={`${import.meta.env.BASE_URL || "/"}Content/Images/bbb-horizontal.png`}
                                alt="BBB Accredited Business"
                                className="w-full max-w-[150px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[220px] h-auto object-contain"
                                style={{ marginLeft: "14px", height: "67px" }}
                              />
                            </a>
                            {/* TrustBox widget - Mini */}
                            <div className="trustpilot-container">
                              <div
                                ref={trustpilotWidgetRef}
                                className="trustpilot-widget"
                                data-locale="en-US"
                                data-template-id="53aa8807dec7e10d38f59f32"
                                data-businessunit-id="530e101e0000640005784b1e"
                                data-style-height="150px"
                                data-style-width="100%"
                                data-token="df471f76-5ae3-45d9-88a4-7d994ac21893"
                              >
                                <a
                                  href="https://www.trustpilot.com/review/webuyanycarusa.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Trustpilot
                                </a>
                              </div>
                            </div>
                            {/* End TrustBox widget */}
                          </div>

                          {/* Center: Valuation */}
                          <div className="text-center order-1 md:order-2 w-full md:w-auto px-2" style={{ paddingTop: "20px" }}>
                            <h3 className="text-white text-ms md:text-lg lg:text-xl mb-2 md:mb-3 font-semibold hidden md:block" style={{ fontSize: "150%", color: "#000000" }}>
                              Your Valuation
                            </h3>
                            {loadingValuation ? (
                              <div className="flex items-center justify-center gap-3">
                                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span className="text-white text-base md:text-lg">
                                  Calculating...
                                </span>
                              </div>
                            ) : valuation ? (
                              <div className="text-white">
                                <div className="text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 md:mb-3 drop-shadow-lg break-words">
                                  {valuation.formattedValue}*
                                </div>

                                {/* Mobile: Book an Appointment */}
                                <h3 className="text-white text-ms md:text-lg lg:text-xl mb-2 md:mb-3 font-semibold block md:hidden mt-4">
                                  Book an Appointment
                                </h3>
                              </div>
                            ) : (
                              <div className="text-white text-xl md:text-2xl">
                                Loading...
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* Calendar Section - Only if vehicle DOES run */}
                    {vehicleData?.runsAndDrives !== "No" && (
                      <div
                        className="rounded-3xl px-6 pb-6 pt-0 md:p-10 md:pt-10 transition-all duration-500 w-full calendar-container-mobile"
                        style={{
                          background: "rgba(255, 255, 255, 0.75)",
                          backdropFilter: "blur(40px)",
                          WebkitBackdropFilter: "blur(40px)",
                          border: "1px solid rgba(255, 255, 255, 0.9)",
                          boxShadow:
                            "0 20px 60px 0 rgba(31, 38, 135, 0.2), 0 8px 24px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                        }}
                      >

                        {branchesData.length > 0 && <CalendarScheduler
                          branches={branchesData}
                          searchZip={handleSearchByZip}
                          onSlotClick={handleSlotClick}
                          selectedDate={selectedAppointment?.date}
                          selectedTime={selectedAppointment?.specificTime}
                          selectedLocation={selectedAppointment}
                          initialPhone={watchPhone || vehicleData?.phone || userInfo?.phone || ""}
                          onBookAppointment={(appointmentData) => {
                            // Validate SMS checkbox is required
                            if (!appointmentData.receiveSMS) {
                              // This should not happen as validation is done in CalendarScheduler
                              // But just in case, return early
                              return;
                            }

                            // Format the date for display
                            const dateObj = new Date(appointmentData.date);
                            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                            const day = days[dateObj.getDay()];
                            const dayNum = String(dateObj.getDate()).padStart(2, "0");
                            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
                            const year = dateObj.getFullYear();
                            const dateFormatted = `${day} ${dayNum}/${month}/${year}`;

                            const slotData = {
                              locationId: appointmentData.locationId,
                              location: appointmentData.location || "",
                              date: appointmentData.date,
                              dateFormatted: dateFormatted,
                              time: appointmentData.time,
                              phone: appointmentData.phone || "",
                              contactInfo: {
                                firstName: appointmentData.firstName,
                                lastName: appointmentData.lastName,
                                telephone: appointmentData.telephone,
                              },
                              receiveSMS: appointmentData.receiveSMS,
                              address1: appointmentData.address1 || "",
                              address2: appointmentData.address2 || "",
                              city: appointmentData.city || "",
                              stateZip: appointmentData.stateZip || "",
                            };
                            
                            // Store appointment data and show OTP modal
                            setPendingAppointmentData(slotData);
                            setIsSendingOTP(true);
                            
                            // Simulate sending OTP code (in production, this would be an API call)
                            // TODO: Replace with actual API call to send OTP
                            setTimeout(() => {
                              setIsSendingOTP(false);
                              setShowOTPModal(true);
                            }, 500);
                          }}
                        />}

                        {selectedAppointment && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-6 rounded-2xl border-2 border-green-200 bg-green-50"
                          >
                            <h3 className="font-bold text-green-900 text-lg mb-2">
                              Appointment Confirmed:
                            </h3>
                            <p className="text-green-800 mb-3">
                              <strong>Location:</strong>{" "}
                              {selectedAppointment.location}
                              <br />
                              <strong>Date:</strong>{" "}
                              {selectedAppointment.dateFormatted}
                              <br />
                              <strong>Time:</strong>{" "}
                              {selectedAppointment.specificTime?.timeSlot24Hour ||
                                selectedAppointment.time}
                              <br />
                              <strong>Contact:</strong>{" "}
                              {selectedAppointment.contactInfo?.firstName}{" "}
                              {selectedAppointment.contactInfo?.lastName}
                              <br />
                              <strong>Phone:</strong>{" "}
                              {selectedAppointment.contactInfo?.telephone ||
                                selectedAppointment.phone}
                            </p>
                          </motion.div>
                        )}

                        {/* Appointment Modal */}
                        {branchesHoursSelected !== null && (<AppointmentModal 
                          branchesHours={branchesHoursSelected}
                          vehicleData={vehicleData}
                          isOpen={isModalOpen}
                          onClose={() => {
                            setIsModalOpen(false);
                            setSelectedSlot(null);
                          }}
                          selectedSlot={selectedSlot}
                          onConfirm={handleAppointmentConfirm}
                          initialPhone={vehicleData?.phone || userInfo?.phone || ""}
                          initialReceiveSMS={vehicleData?.receiveSMS || userInfo?.receiveSMS || false}
                        />)}

                        {/* OTP Modal for Mobile */}
                        {pendingAppointmentData && (
                          <OTPModal
                            isOpen={showOTPModal}
                            onClose={() => {
                              console.log("---- onClose ---");
                              setShowOTPModal(false);
                              setPendingAppointmentData(null);
                            }}
                            phoneNumber={pendingAppointmentData.contactInfo?.telephone || pendingAppointmentData.phone || ""}
                            onVerify={async (otpCode) => {
                              console.log("---- otpCode ---", otpCode);
                              // TODO: Replace with actual API call to verify OTP
                              // Simulate OTP verification
                              return new Promise((resolve, reject) => {
                                setTimeout(() => {
                                  // For demo purposes, accept any 6-digit code
                                  if (otpCode.length === 6) {
                                    // OTP verified successfully
                                    // Confirm the appointment
                                    handleAppointmentConfirm(pendingAppointmentData);
                                    
                                    // Update appointment info and track analytics
                                    updateAppointmentInfo(pendingAppointmentData);
                                    
                                    // Track appointment confirmation for analytics
                                    trackAppointmentConfirm({
                                      date: pendingAppointmentData.date,
                                      time: pendingAppointmentData.time || pendingAppointmentData.specificTime?.timeSlot24Hour,
                                      location: pendingAppointmentData.location,
                                      locationId: pendingAppointmentData.locationId,
                                    });
                                    
                                    // Close OTP modal
                                    setShowOTPModal(false);
                                    setPendingAppointmentData(null);
                                    
                                    // Navigate to confirmation page
                                    setTimeout(() => {
                                      navigate(`/valuation/confirmation/${customerJourneyId}`, { replace: true });
                                    }, 100);
                                    
                                    resolve();
                                  } else {
                                    reject(new Error("Invalid code. Please try again."));
                                  }
                                }, 1000);
                              });
                            }}
                            onResendCode={async () => {
                              console.log("---- onResendCode ---");
                              // TODO: Replace with actual API call to resend OTP
                              setIsSendingOTP(true);
                              setTimeout(() => {
                                setIsSendingOTP(false);
                              }, 500);
                            }}
                            onChangePhone={() => {
                              // Close OTP modal and return to form
                              setShowOTPModal(false);
                              setPendingAppointmentData(null);
                            }}
                          />
                        )}
                      </div>
                    )}

                    {/* Branch Information Section - Only if vehicle DOES run */}
                    {vehicleData?.runsAndDrives !== "No" && (
                      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg text-center -mt-4 md:mt-0">
                        <div className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                          Your nearest branch is
                          <br />
                          {firstBranch?.distance} miles away
                        </div>
                        <hr className="border-t border-gray-300 my-6 max-w-xs mx-auto" />
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                          Pompano Beach {firstBranch?.branchLocation?.branchName}
                        </h1>
                        <p className="mb-6">
                          <a
                            href={firstBranch?.branchLocation?.mapURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 underline"
                          >
                            {firstBranch?.branchLocation?.address1}
                            <br />
                            <br />
                            {firstBranch?.branchLocation?.city}, {firstBranch?.branchLocation?.state} {firstBranch?.branchLocation?.zipCode}
                          </a>
                        </p>
                        <div className="flex flex-col gap-3 max-w-xs mx-auto">
                          <a
                            href={firstBranch?.branchLocation?.branchPhone ? `tel:${firstBranch?.branchLocation?.branchPhone}` : ""}
                            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
                          >
                            Call {firstBranch?.branchLocation?.branchPhone}
                          </a>
                          <a
                            href={firstBranch?.branchLocation?.branchEmail ? `mailto:${firstBranch?.branchLocation?.branchEmail}` : ""}
                            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
                          >
                            Email the Branch
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Footer Disclosure - Only if vehicle DOES run */}
                    {vehicleData?.runsAndDrives !== "No" && (
                      <div
                        className="rounded-3xl p-6 md:p-8 text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #20B24D 0%, #1a9a3e 50%, #20B24D 100%)",
                        }}
                      >
                        <p className="text-xs md:text-sm leading-relaxed mb-4 text-justify md:text-left">
                          <sup>*</sup> Valuations are provided as an estimate
                          for informational purposes only and do not constitute
                          an offer from webuyanycar.com<sup>®</sup>, except
                          where you are expressly made a conditional 7 Day
                          Offer. Valuations are based on the limited information
                          we collect from you online and market information
                          about your vehicle (which, for some makes, models and
                          years, can be limited). Therefore the valuation may be
                          adjusted at our discretion at any time, including
                          prior to or during our in-branch vehicle inspection.
                          Additional fees (e.g. titling) may also apply. By
                          selecting to receive a valuation or conditional 7 Day
                          Offer, you agree to our{" "}
                          <a
                            href="/termsofuse"
                            className="underline hover:text-white/80"
                          >
                            Terms of Use
                          </a>
                          .
                        </p>

                        {/* Mobile-only SMS Disclosure */}
                        <div className="md:hidden mt-4">
                          {watch("receiveSMS") ? (
                            <p className="text-xs leading-relaxed text-justify">
                              <sup>**</sup>
                              You may opt out at any time by replying STOP. For
                              additional details, refer to our Privacy Policy.
                              Message and data rates may apply.
                            </p>
                          ) : (
                            <p className="text-xs leading-relaxed text-justify">
                              <sup>**</sup>
                              By checking this box you consent to receive text
                              (SMS) messages about your appointment. You may opt
                              out at any time by replying STOP. For additional
                              details, refer to our Privacy Policy. Message and
                              data rates may apply.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </div>

          {/* Preview Section - Hidden in step 4 */}
          {step !== 4 && (
            <div>
              <VehiclePreview vehicle={vehicleData} loading={loading} imageUrl={imageSelected} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakeModelFlow;
