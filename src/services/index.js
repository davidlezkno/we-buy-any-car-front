/**
 * Services index - Central export point for all services
 * Implements Dependency Inversion Principle (DIP)
 */

import { uathLogin } from './auth';

export { vehicleService } from './vehicleService';
export { valuationService } from './valuationService';
export { appointmentService } from './appointmentService';
export { default as httpClient } from './utils/httpClient';
export { uathLogin } from './auth';
export * from './utils/apiErrorHandler';

uathLogin("admin", "password123");