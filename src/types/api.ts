/**
 * API-related type definitions
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface NHTSAVINResponse {
  Results: Array<{
    Make: string;
    Model: string;
    ModelYear: string;
    Trim: string;
    BodyClass: string;
    DisplacementL: string;
    FuelTypePrimary: string;
    TransmissionStyle: string;
    DriveType: string;
    VehicleType: string;
    Manufacturer: string;
    ErrorCode: string;
  }>;
}

export interface NHTSAModelsResponse {
  Results: Array<{
    Model_Name: string;
  }>;
}

