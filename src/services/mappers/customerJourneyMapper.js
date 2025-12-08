/**
 * Customer Journey Mapper - Maps between frontend and backend data models
 * Ensures consistent data transformation across the application
 */

/**
 * Map backend customer journey response to frontend format
 * @param {Object} backendData - Backend customer journey data
 * @returns {Object} Frontend-compatible customer journey data
 */
export const mapFromCustomerJourneyResponse = (backendData) => {
  if (!backendData) return null;

  return {
    customerJourneyId: backendData.customerJourneyId || backendData.id,
    customerVehicleId: backendData.customerVehicleId || backendData.cvid,
    year: backendData.year,
    make: backendData.make,
    model: backendData.model,
    series: backendData.series || backendData.trim,
    body: backendData.body || backendData.bodyType,
    zipCode: backendData.zipCode,
    email: backendData.email,
    phone: backendData.phone || backendData.optionalPhoneNumber,
    odometer: backendData.odometer || backendData.mileage,
    carIsDriveable: backendData.carIsDriveable,
    hasDamage: backendData.hasDamage || backendData.hasIssues,
    hasBeenInAccident: backendData.hasBeenInAccident || backendData.hasAccident,
    isFinancedOrLeased: backendData.isFinancedOrLeased,
    valuationAmount: backendData.valuationAmount,
    visitId: backendData.visitId,
  };
};

/**
 * Map frontend vehicle details to backend format
 * @param {Object} frontendData - Frontend vehicle details
 * @returns {Object} Backend-compatible vehicle details
 */
export const mapToVehicleDetailsModel = (frontendData) => {
  return {
    series: frontendData.series || frontendData.trim,
    body: frontendData.bodyType || frontendData.body,
  };
};

/**
 * Map frontend vehicle condition to backend format
 * @param {Object} frontendData - Frontend condition data
 * @returns {Object} Backend-compatible condition data
 */
export const mapToVehicleConditionUpdate = (frontendData) => {
  return {
    odometer: frontendData.odometer || 0,
    zipCode: frontendData.zipCode || '',
    email: frontendData.email || '',
    optionalPhoneNumber: frontendData.phone || null,
    carIsDriveable: frontendData.runsAndDrives === 'Yes',
    hasDamage: frontendData.hasIssues === 'Yes',
    hasBeenInAccident: frontendData.hasAccident === 'Yes',
    isFinancedOrLeased: frontendData.hasClearTitle === 'No',
    customerHasOptedIntoSmsMessages: frontendData.receiveSMS || false,
  };
};

export const customerJourneyMapper = {
  mapFromCustomerJourneyResponse,
  mapToVehicleDetailsModel,
  mapToVehicleConditionUpdate,
};
