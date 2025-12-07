/**
 * Valuation Mapper - Maps between frontend and backend data models
 * Solves the contract mismatch between OpenAPI models and frontend usage
 */

/**
 * Map frontend vehicle data to backend ValuationModel
 * @param {Object} frontendData - Frontend vehicle and user data
 * @returns {Object} Backend-compatible ValuationModel
 */
export const mapToValuationModel = (frontendData) => {
  return {
    cvid: frontendData.customerVehicleId || null,
    mileage: frontendData.odometer || frontendData.mileage || 0,
    zipCode: frontendData.zipCode || '',
    email: frontendData.email || '',
    isFinancedOrLeased: frontendData.hasClearTitle === 'No',
    carIsDriveable: frontendData.runsAndDrives === 'Yes',
    hasDamage: frontendData.hasIssues === 'Yes',
    hasBeenInAccident: frontendData.hasAccident === 'Yes',
    optionalPhoneNumber: frontendData.phone || null,
    customerJourneyId: frontendData.customerJourneyId || null,
    customerHasOptedIntoSmsMessages: frontendData.receiveSMS || false,
    captchaMode: 'true',
  };
};

/**
 * Map backend valuation response to frontend format
 * @param {Object} backendData - Backend valuation response
 * @returns {Object} Frontend-compatible valuation data
 */
export const mapFromValuationResponse = (backendData) => {
  return {
    customerVehicleId: backendData.customerVehicleId || backendData.cvid,
    valuationAmount: backendData.valuationAmount || backendData.valuation,
    formattedValue: backendData.formattedValue || `$${backendData.valuationAmount?.toLocaleString()}`,
    timestamp: backendData.timestamp || new Date().toISOString(),
  };
};

/**
 * Map frontend vehicle condition data to backend format
 * @param {Object} conditionData - Frontend condition data
 * @returns {Object} Backend-compatible condition data
 */
export const mapToVehicleConditionModel = (conditionData) => {
  return {
    odometer: conditionData.odometer || 0,
    zipCode: conditionData.zipCode || '',
    email: conditionData.email || '',
    phone: conditionData.phone || null,
    hasClearTitle: conditionData.hasClearTitle === 'Yes',
    runsAndDrives: conditionData.runsAndDrives === 'Yes',
    hasIssues: conditionData.hasIssues === 'Yes',
    hasAccident: conditionData.hasAccident === 'Yes',
    receiveSMS: conditionData.receiveSMS || false,
  };
};

export const valuationMapper = {
  mapToValuationModel,
  mapFromValuationResponse,
  mapToVehicleConditionModel,
};
