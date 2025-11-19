// Global context that stores valuation flow state and exposes shared actions.
import { createContext, useCallback, useContext, useState } from "react";

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [vehicleData, setVehicleData] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    zipCode: "",
  });
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");

  const updateVehicleData = useCallback((data) => {
    setVehicleData((prev) => ({ ...prev, ...data }));
  }, []);

  const updateUserInfo = useCallback((data) => {
    setUserInfo((prev) => ({ ...prev, ...data }));
  }, []);

  const updateAppointmentInfo = useCallback((data) => {
    setAppointmentInfo((prev) => ({ ...prev, ...data }));
  }, []);

  const resetData = useCallback(() => {
    setVehicleData(null);
    setUserInfo({
      name: "",
      email: "",
      phone: "",
      zipCode: "",
    });
    setAppointmentInfo(null);
  }, []);

  const value = {
    appointmentInfo,
    language,
    loading,
    resetData,
    setLanguage,
    setLoading,
    updateAppointmentInfo,
    updateUserInfo,
    updateVehicleData,
    userInfo,
    vehicleData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
