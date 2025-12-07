/**
 * Application Routes Configuration
 * Implements Open/Closed Principle (OCP) - Easy to extend with new routes
 */

export const ROUTES = {
  HOME: '/',
  VIN_FLOW: '/sell-by-vin',
  MAKE_MODEL_FLOW: '/sell-by-make-model',
  VALUATION: '/valuation',
  VALUATION_DETAILS: '/valuation/vehicledetails',
  VALUATION_CONDITION: '/valuation/vehiclecondition',
  VALUATION_APPOINTMENT: '/secure/bookappointment',
  VALUATION_CONFIRMATION: '/valuation/confirmation',
  LICENSE_PLATE_FLOW: '/sell-by-plate',
  APPOINTMENT_FLOW: '/appointment',
  CONFIRMATION: '/confirmation',
};

/**
 * Get route path by key
 * @param {string} key - Route key
 * @returns {string} Route path
 */
export function getRoute(key) {
  return ROUTES[key] || '/';
}

