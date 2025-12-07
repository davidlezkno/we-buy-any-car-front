/**
 * Legacy API file - Re-exports from new service structure
 * Maintains backward compatibility while using new SOLID-based services
 * @deprecated Use individual services from services/index.js instead
 */

// Re-export from new service structure for backward compatibility
export {
  vehicleService,
  valuationService,
  appointmentService,
} from './index';

// Re-export individual functions for backward compatibility
export {
  decodeVIN,
  decodeLicensePlate,
  getVehicleMakes,
  getModelsByMake,
  getVehicleYears,
  getVehicleImage,
  getComponentList,
  getFaultTypeList,
} from './vehicleService';

export {
  getVehicleValuation,
  submitVehicleOffer,
} from './valuationService';

export {
  findNearbyStores,
  bookAppointment,
  getAvailableTimeSlots,
} from './appointmentService';

// Export httpClient as default for backward compatibility
export { default } from './utils/httpClient';
