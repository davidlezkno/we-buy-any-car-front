/**
 * Vehicle-related type definitions
 */

export interface VehicleData {
  vin?: string;
  make?: string;
  model?: string;
  year?: string;
  trim?: string;
  series?: string;
  bodyClass?: string;
  bodyStyle?: string;
  engineSize?: string;
  fuelType?: string;
  transmission?: string;
  driveType?: string;
  vehicleType?: string;
  manufacturer?: string;
  color?: string;
  odometer?: string;
  mileage?: string;
  runsAndDrives?: string;
  hasIssues?: string;
  hasAccident?: string;
  hasClearTitle?: string;
  plate?: string;
  state?: string;
  registrationStatus?: string;
}

export interface VehicleValuation {
  success: boolean;
  valuation: number;
  currency: string;
  formattedValue: string;
  timestamp: string;
  vehicleInfo: {
    year: string;
    make: string;
    model: string;
    mileage: number;
    condition: {
      runsAndDrives: string;
      hasIssues: string;
      hasAccident: string;
      hasClearTitle: string;
    };
  };
  error?: string;
}

export interface VehicleImage {
  url: string;
  alt?: string;
}

export interface ComponentOption {
  value: string;
  label: string;
}

export interface FaultTypeOption {
  value: string;
  label: string;
}

