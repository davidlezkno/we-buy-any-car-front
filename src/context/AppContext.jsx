/**
 * App Context - Global application state management
 * Implements Single Responsibility Principle (SRP) and Dependency Inversion Principle (DIP)
 */

import { createContext, useCallback, useContext, useState } from 'react';

const AppContext = createContext(null);

/**
 * Hook to access app context
 * @returns {Object} App context value
 * @throws {Error} If used outside AppProvider
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    return null;
  }
  return context;
};

/**
 * App Provider Component
 * Manages global application state including vehicle, user, and appointment data
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AppProvider = ({ children }) => {
  const [vehicleData, setVehicleData] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    zipCode: '',
  });
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');

  const updateVehicleData = useCallback((data) => {
    setVehicleData((prev) => (prev ? { ...prev, ...data } : data));
  }, []);

  const updateUserInfo = useCallback((data) => {
    setUserInfo((prev) => ({ ...prev, ...data }));
  }, []);

  const updateAppointmentInfo = useCallback((data) => {
    setAppointmentInfo((prev) => (prev ? { ...prev, ...data } : data));
  }, []);

  const resetData = useCallback(() => {
    setVehicleData(null);
    setUserInfo({
      name: '',
      email: '',
      phone: '',
      zipCode: '',
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
