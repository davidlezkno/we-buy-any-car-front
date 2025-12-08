// ValuationTabs centralizes the three valuation entry points while keeping business logic encapsulated.
import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Car, Check, MapPin, Search } from "lucide-react";
import Button from "../UI/Button";
import Input from "../UI/Input";
import Select from "../UI/Select";
import Tabs from "../UI/Tabs";
import {
  getModelsByMake,
  getVehicleMakes,
  getVehicleYears,
  decodeVIN,
} from "../../services/api";
import { US_STATES } from "../../utils/constants";
import { createCustomerJourneyByVin } from "../../services/vehicleService";
import { useNavigate } from "react-router-dom";


const ValuationTabs = ({
  activeTab,
  onTabChange,
  onMakeModelSubmit,
  onVinSubmit,
  onPlateSubmit,
  onOpenVinHelp,
  hideHeaderAndTabs = false,
}) => {
  const navigate = useNavigate();
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [years, setYears] = useState([]);

  const [vinValue, setVinValue] = useState("");
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState(null);

  const [plateValue, setPlateValue] = useState("");
  const [plateState, setPlateState] = useState("");

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

  const loadModels = async (make) => {
    if(!selectedYear || !make){
      setModels([]);
      return;
    }
    const modelsData = await getModelsByMake(selectedYear,make);
    setModels(modelsData);
  };

  const handleMakeModelClick = useCallback(() => {
    if (!selectedYear || !selectedMake || !selectedModel) {
      return;
    }

    //7d50abcd-ed4e-40db-a1d3-b59c58f85415

    onMakeModelSubmit({
      year: selectedYear,
      make: selectedMake,
      model: selectedModel,
    });
  }, [onMakeModelSubmit, selectedMake, selectedModel, selectedYear]);

  const handleVinValueSubmit = () => {
    if (vinValue.length !== 17) {
      return;
    }else{
      onVinSubmit(vinValue);
    }
  }

  const handlePlateSubmit = (_state, _plate) => {
    if (!plateState || !plateValue) {
      return;
    }else{
      onPlateSubmit(plateState, plateValue);
    }
  }

  const tabs = useMemo(
    () => [
      {
        id: "make-model",
        label: "Make & Model",
        icon: Car,
        content: (
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
              <div className="relative">
                <div className="flex items-start md:items-center gap-3 md:gap-4">
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center text-white font-bold text-xl md:text-2xl lg:text-3xl flex-shrink-0 relative overflow-hidden transition-all duration-500 ${
                      selectedYear ? "scale-110" : ""
                    }`}
                    style={
                      selectedYear
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 1))",
                            backdropFilter: "blur(30px) saturate(180%)",
                            WebkitBackdropFilter: "blur(30px) saturate(180%)",
                            border: "2px solid rgba(255, 255, 255, 0.6)",
                            boxShadow:
                              "0 12px 48px 0 rgba(239, 68, 68, 0.6), 0 6px 24px 0 rgba(239, 68, 68, 0.5), 0 0 0 4px rgba(239, 68, 68, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)",
                            position: "relative",
                            animation: "pulse 2s ease-in-out infinite",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.95))",
                            backdropFilter: "blur(30px) saturate(180%)",
                            WebkitBackdropFilter: "blur(30px) saturate(180%)",
                            border: "2px solid rgba(255, 255, 255, 0.4)",
                            boxShadow:
                              "0 8px 32px 0 rgba(239, 68, 68, 0.4), 0 4px 16px 0 rgba(239, 68, 68, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)",
                            position: "relative",
                          }
                    }
                  >
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%)",
                      }}
                    />
                    <span className="relative z-10 drop-shadow-lg">1</span>
                  </div>
                  <div className="flex-1 min-w-0 relative">
                    <Select
                      options={years}
                      placeholder="Select Model Year"
                      value={selectedYear}
                      onChange={(event) => {
                        setSelectedYear(event.target.value)
                        loadMakes(event.target.value.toString());
                      }}
                      disabled={years.length === 0}
                      id="homepage-year-select"
                      checkmark={
                        selectedYear ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 15,
                            }}
                          >
                            <div
                              className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shadow-lg"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(34, 197, 94, 1), rgba(22, 163, 74, 1))",
                                border: "2px solid rgba(255, 255, 255, 0.8)",
                                boxShadow:
                                  "0 4px 12px 0 rgba(34, 197, 94, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
                              }}
                            >
                              <Check
                                className="w-4 h-4 md:w-5 md:h-5 text-white"
                                strokeWidth={3}
                              />
                            </div>
                          </motion.div>
                        ) : null
                      }
                    />
                  </div>
                </div>
                
              </div>

              <div className="relative">
                <div className="flex items-start md:items-center gap-3 md:gap-4">
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center text-white font-bold text-xl md:text-2xl lg:text-3xl flex-shrink-0 relative overflow-hidden transition-all duration-500 ${
                      selectedMake ? "scale-110" : ""
                    }`}
                    style={
                      selectedMake
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(250, 204, 21, 0.95), rgba(234, 179, 8, 1))",
                            backdropFilter: "blur(30px) saturate(180%)",
                            WebkitBackdropFilter: "blur(30px) saturate(180%)",
                            border: "2px solid rgba(255, 255, 255, 0.6)",
                            boxShadow:
                              "0 12px 48px 0 rgba(250, 204, 21, 0.6), 0 6px 24px 0 rgba(250, 204, 21, 0.5), 0 0 0 4px rgba(250, 204, 21, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)",
                            position: "relative",
                            animation: "pulse 2s ease-in-out infinite",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, rgba(250, 204, 21, 0.9), rgba(234, 179, 8, 0.95))",
                            backdropFilter: "blur(30px) saturate(180%)",
                            WebkitBackdropFilter: "blur(30px) saturate(180%)",
                            border: "2px solid rgba(255, 255, 255, 0.4)",
                            boxShadow:
                              "0 8px 32px 0 rgba(250, 204, 21, 0.4), 0 4px 16px 0 rgba(250, 204, 21, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)",
                            position: "relative",
                          }
                    }
                  >
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%)",
                      }}
                    />
                    <span className="relative z-10 drop-shadow-lg">2</span>
                  </div>
                  <div className="flex-1 min-w-0 relative">
                    <Select
                      options={makes}
                      placeholder="Select Make"
                      value={selectedMake}
                      disabled={!selectedYear || makes.length === 0}
                      onChange={(event) => {
                        setSelectedMake(event.target.value);
                        loadModels(event.target.value);
                      }}
                      id="homepage-make-select"
                      checkmark={
                        selectedMake ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 15,
                            }}
                          >
                            <div
                              className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shadow-lg"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(34, 197, 94, 1), rgba(22, 163, 74, 1))",
                                border: "2px solid rgba(255, 255, 255, 0.8)",
                                boxShadow:
                                  "0 4px 12px 0 rgba(34, 197, 94, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
                              }}
                            >
                              <Check
                                className="w-4 h-4 md:w-5 md:h-5 text-white"
                                strokeWidth={3}
                              />
                            </div>
                          </motion.div>
                        ) : null
                      }
                    />
                  </div>
                </div>
                
              </div>

              <div className="relative">
                <div className="flex items-start md:items-center gap-3 md:gap-4">
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center text-white font-bold text-xl md:text-2xl lg:text-3xl flex-shrink-0 relative overflow-hidden transition-all duration-500 ${
                      selectedModel ? "scale-110" : ""
                    }`}
                    style={
                      selectedModel
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 1))",
                            backdropFilter: "blur(30px) saturate(180%)",
                            WebkitBackdropFilter: "blur(30px) saturate(180%)",
                            border: "2px solid rgba(255, 255, 255, 0.6)",
                            boxShadow:
                              "0 12px 48px 0 rgba(34, 197, 94, 0.6), 0 6px 24px 0 rgba(34, 197, 94, 0.5), 0 0 0 4px rgba(34, 197, 94, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)",
                            position: "relative",
                            animation: "pulse 2s ease-in-out infinite",
                          }
                        : {
                            background:
                              "linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.95))",
                            backdropFilter: "blur(30px) saturate(180%)",
                            WebkitBackdropFilter: "blur(30px) saturate(180%)",
                            border: "2px solid rgba(255, 255, 255, 0.4)",
                            boxShadow:
                              "0 8px 32px 0 rgba(34, 197, 94, 0.4), 0 4px 16px 0 rgba(34, 197, 94, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 0 rgba(0, 0, 0, 0.1)",
                            position: "relative",
                          }
                    }
                  >
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%)",
                      }}
                    />
                    <span className="relative z-10 drop-shadow-lg">3</span>
                  </div>
                  <div className="flex-1 min-w-0 relative">
                    <Select
                      options={models}
                      placeholder="Select Model"
                      disabled={!selectedMake || models.length === 0}
                      value={selectedModel}
                      onChange={(event) => {
                        setSelectedModel(event.target.value)
                      }}
                      id="homepage-model-select"
                      checkmark={
                        selectedModel ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 15,
                            }}
                          >
                            <div
                              className="w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shadow-lg"
                              style={{
                                background:
                                  "linear-gradient(135deg, rgba(34, 197, 94, 1), rgba(22, 163, 74, 1))",
                                border: "2px solid rgba(255, 255, 255, 0.8)",
                                boxShadow:
                                  "0 4px 12px 0 rgba(34, 197, 94, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
                              }}
                            >
                              <Check
                                className="w-4 h-4 md:w-5 md:h-5 text-white"
                                strokeWidth={3}
                              />
                            </div>
                          </motion.div>
                        ) : null
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6 md:mt-10">
              <Button
                size="lg"
                className="px-6 md:px-10 py-3 md:py-4 text-base md:text-lg font-bold w-full md:w-auto"
                disabled={!selectedYear || !selectedMake || !selectedModel}
                onClick={handleMakeModelClick}
                icon={ArrowRight}
                iconPosition="right"
                id="value-my-car-make-model-button"
                style={{
                  background:
                    "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                  color: "#FFFFFF",
                  borderColor: "#000000",
                }}
              >
                VALUE MY CAR *
              </Button>
            </div>
          </div>
        ),
      },
      {
        id: "vin",
        label: "VIN",
        icon: Search,
        content: (
          <div className="space-y-6 md:space-y-8">
            <div className="max-w-2xl mx-auto">
              <Input
                label="VIN Number"
                placeholder="Enter 17-character VIN"
                icon={Search}
                maxLength={17}
                value={vinValue}
                onChange={(event) =>
                  setVinValue(event.target.value.toUpperCase())
                }
                id="homepage-vin-input"
              />
              <div className="mt-3 text-center">
                <button
                  onClick={() => onOpenVinHelp(vinValue)}
                  className="text-primary-600 hover:text-primary-700 underline text-sm md:text-base font-semibold"
                  id="where-can-i-find-vin-button"
                >
                  Where Can I Find My VIN?
                </button>
              </div>
              <div className="mt-4 md:mt-6 text-center">
                <Button
                  size="lg"
                  className="px-6 md:px-10 py-3 md:py-4 text-base md:text-lg font-bold w-full md:w-auto"
                  disabled={vinValue.length !== 17 || vinLoading}
                  loading={vinLoading}
                  onClick={handleVinValueSubmit}
                  icon={ArrowRight}
                  iconPosition="right"
                  id="value-my-car-vin-button"
                  style={{
                    background:
                      "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                    color: "#FFFFFF",
                    borderColor: "#000000",
                  }}
                >
                  VALUE MY CAR *
                </Button>
                {vinError && (
                  <p className="mt-3 text-sm text-red-600">{vinError}</p>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "plate",
        label: "Plate",
        icon: MapPin,
        content: (
          <div className="space-y-6 md:space-y-8">
            <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
              <div className="grid grid-cols-[6fr_4fr] md:grid-cols-2 gap-4 md:gap-6">
                <Input
                  label="License Plate Number"
                  placeholder="License Plate"
                  value={plateValue}
                  onChange={(event) =>
                    setPlateValue(event.target.value.toUpperCase())
                  }
                  id="homepage-plate-input"
                />
                <Select
                  label="State"
                  options={US_STATES}
                  placeholder="State"
                  value={plateState}
                  onChange={(event) => setPlateState(event.target.value)}
                  id="homepage-plate-state-select"
                />
              </div>
              <div className="mt-4 md:mt-6 text-center">
                <Button
                  size="lg"
                  className="px-6 md:px-10 py-3 md:py-4 text-base md:text-lg font-bold w-full md:w-auto"
                  disabled={!plateState || !plateValue}
                  onClick={() => handlePlateSubmit(plateState, plateValue)}
                  icon={ArrowRight}
                  iconPosition="right"
                  id="value-my-car-plate-button"
                  style={{
                    background:
                      "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                    color: "#FFFFFF",
                    borderColor: "#000000",
                  }}
                >
                  VALUE MY CAR *
                </Button>
              </div>
            </div>
          </div>
        ),
      },
    ],
    [handleMakeModelClick, handlePlateSubmit, handleVinValueSubmit, loadModels, makes, models, onOpenVinHelp, plateState, plateValue, selectedMake, selectedModel, selectedYear, vinError, vinLoading, vinValue, years],
  );

  return (
    <section className="bg-gray-100 pt-0 pb-0">
      <div className="section-container !pt-4 !pb-4 md:!pt-6 md:!pb-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {!hideHeaderAndTabs && (
            <div className="text-center">
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                For the Most Accurate Valuation,{" "}
                <button
                  onClick={() => onTabChange(1)}
                  className="text-primary-600 hover:text-primary-700 underline font-semibold"
                  id="enter-your-vin-link-button"
                >
                  Enter Your VIN
                </button>{" "}
                or{" "}
                <button
                  onClick={() => onTabChange(2)}
                  className="text-primary-600 hover:text-primary-700 underline font-semibold"
                  id="enter-your-plate-link-button"
                >
                  Plate
                </button>
              </p>
            </div>
          )}
          <div className="p-4 md:p-6 lg:p-8">
            {!hideHeaderAndTabs ? (
              <Tabs
                activeTab={activeTab}
                onTabChange={onTabChange}
                tabs={tabs}
                defaultTab={0}
              />
            ) : (
              <div className="space-y-6 md:space-y-8">
                <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
                  {tabs[activeTab]?.content}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default memo(ValuationTabs);
