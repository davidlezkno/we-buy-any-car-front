/**
 * Application Configuration
 * Centralized configuration following Open/Closed Principle (OCP)
 */

// Application Info
export const APP_NAME = 'We Buy Any Car';
export const APP_TAGLINE = 'Fast & Easy Car Selling';
export const SUPPORT_PHONE = '1-800-555-0100';
export const SUPPORT_EMAIL = 'support@webuyanycar.com';

// API Configuration
export const API_ENDPOINTS = {
  NHTSA_BASE: 'https://vpic.nhtsa.dot.gov/api/vehicles',
  NHTSA_VIN: 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues',
  NHTSA_MODELS: 'https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake',
};

// US States
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

// Vehicle Colors
export const VEHICLE_COLORS = [
  'Black',
  'White',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Brown',
  'Gold',
  'Beige',
  'Purple',
  'Other',
];

// Popular Car Makes
export const POPULAR_MAKES = [
  'Toyota',
  'Ford',
  'Honda',
  'Chevrolet',
  'Nissan',
  'Tesla',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Volkswagen',
  'Hyundai',
  'Kia',
  'Mazda',
  'Subaru',
  'Jeep',
  'Ram',
  'GMC',
  'Lexus',
  'Acura',
  'Infiniti',
  'Dodge',
  'Cadillac',
  'Buick',
  'Lincoln',
  'Volvo',
  'Porsche',
  'Land Rover',
  'Jaguar',
  'Genesis',
];

// Appointment Configuration
export const APPOINTMENT_TIME_SLOTS = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM',
];

export const APPOINTMENT_STEPS = ['Choose Type', 'Details', 'Confirmation'];

export const HOME_APPOINTMENT_BENEFITS = [
  'Professional appraiser comes to you',
  'Complete inspection at your location',
  'Same-day offer available',
  'Free service with no obligations',
  'Safe and secure process',
];

// Language Configuration
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  LANGUAGE: 'wbac_language',
  VEHICLE_DATA: 'wbac_vehicle_data',
  USER_INFO: 'wbac_user_info',
};

