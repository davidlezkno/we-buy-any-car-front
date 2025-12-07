/**
 * Google Tag Manager and Google Analytics 4 Tracking Utility
 *
 * This utility provides functions to track page views and custom events
 * for GTM and GA4 integration.
 *
 * Features:
 * - Automatic page view tracking on route changes
 * - Custom event tracking with dataLayer pushes
 * - Support for GA4 measurement ID
 * - Descriptive page titles and paths for analytics
 */

/**
 * Initialize dataLayer if it doesn't exist
 * This ensures GTM can track events even if GTM script loads after this code
 */
if (typeof window !== "undefined" && !window.dataLayer) {
  window.dataLayer = [];
}

/**
 * Push event to dataLayer for GTM tracking
 * @param {string} eventName - Name of the event (e.g., 'page_view', 'valuation_complete')
 * @param {Object} eventData - Additional data to send with the event
 */
export const pushToDataLayer = (eventName, eventData = {}) => {
  if (typeof window === "undefined" || !window.dataLayer) {
    console.warn("dataLayer not available");
    return;
  }

  const dataLayerEvent = {
    event: eventName,
    ...eventData,
  };

  window.dataLayer.push(dataLayerEvent);

  // Also send to GA4 if gtag is available
  if (window.gtag && typeof window.gtag === "function") {
    window.gtag("event", eventName, eventData);
  }
};

/**
 * Track a page view for GTM and GA4
 * This should be called whenever the route changes
 *
 * @param {string} pagePath - The URL path (e.g., '/valuation/vehicledetails')
 * @param {string} pageTitle - Descriptive page title (e.g., 'Valuation - Vehicle Details')
 * @param {Object} additionalData - Additional data to include in the page view
 */
export const trackPageView = (pagePath, pageTitle, additionalData = {}) => {
  // Update document title for better analytics reporting
  if (typeof document !== "undefined") {
    document.title = pageTitle;
  }

  // Push page_view event to dataLayer for GTM
  pushToDataLayer("page_view", {
    page_path: pagePath,
    page_title: pageTitle,
    page_location:
      typeof window !== "undefined" ? window.location.href : pagePath,
    ...additionalData,
  });

  // Send to GA4 if gtag is available
  if (window.gtag && typeof window.gtag === "function") {
    window.gtag("config", window.GA4_MEASUREMENT_ID || "GA_MEASUREMENT_ID", {
      page_path: pagePath,
      page_title: pageTitle,
      ...additionalData,
    });
  }
};

/**
 * Track valuation step progression
 * @param {number} step - Current step number (1-4)
 * @param {string} stepName - Descriptive step name
 * @param {Object} vehicleData - Current vehicle data (optional)
 */
export const trackValuationStep = (step, stepName, vehicleData = {}) => {
  const stepPaths = {
    1: "/valuation",
    2: "/valuation/vehicledetails",
    3: "/valuation/vehiclecondition",
    4: "/secure/bookappointment",
  };

  const stepTitles = {
    1: "Valuation - Vehicle Information",
    2: "Valuation - Series & Body",
    3: "Valuation - Vehicle Condition",
    4: "Valuation - Appointment Scheduling",
  };

  const pagePath = stepPaths[step] || "/valuation";
  const pageTitle = stepTitles[step] || `Valuation - Step ${step}`;

  trackPageView(pagePath, pageTitle, {
    valuation_step: step,
    valuation_step_name: stepName,
    vehicle_year: vehicleData?.year || null,
    vehicle_make: vehicleData?.make || null,
    vehicle_model: vehicleData?.model || null,
  });
};

/**
 * Track valuation completion
 * @param {Object} valuationData - Valuation result data
 */
export const trackValuationComplete = (valuationData) => {
  pushToDataLayer("valuation_complete", {
    valuation_amount: valuationData.valuation || null,
    vehicle_year: valuationData.year || null,
    vehicle_make: valuationData.make || null,
    vehicle_model: valuationData.model || null,
    vehicle_odometer: valuationData.odometer || null,
  });
};

/**
 * Track appointment confirmation
 * @param {Object} appointmentData - Appointment details
 */
export const trackAppointmentConfirm = (appointmentData) => {
  pushToDataLayer("appointment_confirm", {
    appointment_date: appointmentData.date || null,
    appointment_time: appointmentData.time || null,
    appointment_location: appointmentData.location || null,
    appointment_location_id: appointmentData.locationId || null,
  });
};

/**
 * Track form submission events
 * @param {string} formName - Name of the form (e.g., 'vehicle_info', 'vehicle_condition')
 * @param {Object} formData - Form data submitted
 */
export const trackFormSubmit = (formName, formData = {}) => {
  pushToDataLayer("form_submit", {
    form_name: formName,
    ...formData,
  });
};
