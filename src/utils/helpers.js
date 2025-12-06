// Utility Helper Functions

/**
 * Format currency as USD
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};


export const convertTo12Hour = (time) => {
  let [hour, minutes] = time.split(":");
  hour = parseInt(hour);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // convierte 0 → 12 y 13–23 → 1–11

  return `${hour.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

export const getDayName = (dateString) => {
  const date = new Date(dateString);

  const days = [
    "Sunday",    // 0
    "Monday",    // 1
    "Tuesday",   // 2
    "Wednesday", // 3
    "Thursday",  // 4
    "Friday",    // 5
    "Saturday"   // 6
  ];

  return days[date.getDay() + 1];
}

export const getGoogleMapsEmbedUrl = (lat, lng) => {
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v${Date.now()}`;
}

export const isMobileDevice = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return isMobile;
}

export const getPeriod = (time) => {
  // time debe venir en formato "HH:MM AM/PM"
  const [hourMinute, modifier] = time.split(" ");
  let [hour] = hourMinute.split(":");
  hour = parseInt(hour, 10);

  // Convertir a formato 24 horas
  if (modifier === "PM" && hour !== 12) hour += 12;
  if (modifier === "AM" && hour === 12) hour = 0;

  // Determinar periodo
  if (hour >= 5 && hour < 12) return "Morning";    
  if (hour >= 12 && hour < 19) return "Afternoon"; 
  return "Evening";                                
}

export const getNext12Days = () => {
  const dates = [];
  const today = new Date();

  for (let i = 0; i <= 6; i++) {
    const newDate = new Date();
    newDate.setDate(today.getDate() + i);

    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");

    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
}

export const random3Digits = () => {
  const num = Math.floor(100 + Math.random() * 900);
  return num.toString();
}
  
export const random10Digits = () => {
  const numero = Math.floor(1000000000 + Math.random() * 9000000000);
  return numero;
}

export const formatPhone = (phone) =>{
  return phone.replace(/\D/g, "");
}

export const formatUSD = (value) => {
  const num = Number(value);
  if (isNaN(num)) return "$0";

  return (
    "$" +
    num
      .toFixed(0) // sin decimales
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );
}


export const cleanObject = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key, value]) =>
      value !== null && value !== ""
    )
  );

/**
 * Format number with commas
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat("en-US").format(number);
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

/**
 * Validate VIN format
 */
export const isValidVIN = (vin) => {
  if (!vin || vin.length !== 17) return false;
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

/**
 * Validate ZIP code
 */
export const isValidZipCode = (zip) => {
  const zipRegex = /^\d{5}$/;
  return zipRegex.test(zip);
};

/**
 * Get current date in YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Get minimum date (today)
 */
export const getMinDate = () => {
  return getCurrentDate();
};

/**
 * Get maximum date (90 days from now)
 */
export const getMaxDate = (daysAhead = 90) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split("T")[0];
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Scroll to top smoothly
 */
export const scrollToTop = (smooth = true) => {
  window.scrollTo({
    top: 0,
    behavior: smooth ? "smooth" : "auto",
  });
};

/**
 * Cookie Management Utilities
 * Using js-cookie library for secure cookie handling
 */
import Cookies from 'js-cookie';

/**
 * Set a cookie with secure defaults
 * @param {string} key - Cookie name
 * @param {any} value - Value to store (will be JSON stringified if object)
 * @param {object} options - Cookie options (expires, path, domain, secure, sameSite)
 * @returns {boolean} Success status
 */
export const setCookie = (key, value, options = {}) => {
  try {
    const defaultOptions = {
      expires: 7, // 7 days default
      path: '/',
      sameSite: 'strict', // CSRF protection
      secure: window.location.protocol === 'https:', // Only in HTTPS
      ...options,
    };

    // Stringify if value is an object
    const cookieValue = typeof value === 'object' ? JSON.stringify(value) : value;
    
    Cookies.set(key, cookieValue, defaultOptions);
    return true;
  } catch (error) {
    console.error(`Error setting cookie "${key}":`, error);
    return false;
  }
};

/**
 * Get a cookie value
 * @param {string} key - Cookie name
 * @param {boolean} parseJson - Whether to parse JSON (default: true)
 * @returns {any} Cookie value or null
 */
export const getCookie = (key, parseJson = true) => {
  try {
    const value = Cookies.get(key);
    if (!value) return null;

    // Try to parse as JSON if it looks like JSON
    if (parseJson && (value.startsWith('{') || value.startsWith('['))) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  } catch (error) {
    console.error(`Error getting cookie "${key}":`, error);
    return null;
  }
};

/**
 * Remove a cookie
 * @param {string} key - Cookie name
 * @param {object} options - Cookie options (path, domain)
 * @returns {boolean} Success status
 */
export const removeCookie = (key, options = {}) => {
  try {
    const defaultOptions = {
      path: '/',
      ...options,
    };
    Cookies.remove(key, defaultOptions);
    return true;
  } catch (error) {
    console.error(`Error removing cookie "${key}":`, error);
    return false;
  }
};

/**
 * Check if a cookie exists
 * @param {string} key - Cookie name
 * @returns {boolean} Whether cookie exists
 */
export const hasCookie = (key) => {
  return Cookies.get(key) !== undefined;
};

/**
 * Save to local storage
 */
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
};

/**
 * Get from local storage
 */
export const getFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return null;
  }
};

/**
 * Remove from local storage
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error removing from localStorage:", error);
    return false;
  }
};

/**
 * Check if mobile device
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    return false;
  }
};

/**
 * Download text as file
 */
export const downloadAsFile = (
  content,
  filename,
  contentType = "text/plain",
) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Calculate estimated value (simple algorithm)
 */
export const calculateEstimatedValue = (vehicleData) => {
  const baseValues = {
    2024: 40000,
    2023: 35000,
    2022: 30000,
    2021: 25000,
    2020: 20000,
    2019: 18000,
    2018: 16000,
    2017: 14000,
    2016: 12000,
    2015: 10000,
  };

  const year = parseInt(vehicleData.year);
  let baseValue = baseValues[year] || 8000;

  // Adjust for mileage
  if (vehicleData.mileage) {
    const mileage = parseInt(vehicleData.mileage);
    if (mileage < 30000) baseValue *= 1.2;
    else if (mileage > 100000) baseValue *= 0.7;
  }

  // Add some randomness
  const variance = (Math.random() - 0.5) * 0.2;
  return Math.round(baseValue * (1 + variance));
};

export default {
  formatCurrency,
  formatNumber,
  formatPhoneNumber,
  isValidVIN,
  isValidEmail,
  isValidZipCode,
  getCurrentDate,
  getMinDate,
  getMaxDate,
  formatDate,
  capitalize,
  generateId,
  debounce,
  scrollToTop,
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  setCookie,
  getCookie,
  removeCookie,
  hasCookie,
  isMobile,
  copyToClipboard,
  downloadAsFile,
  calculateEstimatedValue,
};
