/**
 * Context-related type definitions
 */

import { VehicleData } from './vehicle';
import { UserInfo } from './user';
import { AppointmentInfo } from './appointment';

export interface AppContextValue {
  vehicleData: VehicleData | null;
  userInfo: UserInfo;
  appointmentInfo: AppointmentInfo | null;
  loading: boolean;
  language: string;
  updateVehicleData: (data: Partial<VehicleData>) => void;
  updateUserInfo: (data: Partial<UserInfo>) => void;
  updateAppointmentInfo: (data: Partial<AppointmentInfo>) => void;
  resetData: () => void;
  setLoading: (loading: boolean) => void;
  setLanguage: (language: string) => void;
}

export interface AppState {
  vehicle: VehicleData | null;
  user: UserInfo;
  appointment: AppointmentInfo | null;
  loading: boolean;
  language: string;
}

export type AppAction =
  | { type: 'SET_VEHICLE'; payload: VehicleData | null }
  | { type: 'UPDATE_VEHICLE'; payload: Partial<VehicleData> }
  | { type: 'SET_USER'; payload: UserInfo }
  | { type: 'UPDATE_USER'; payload: Partial<UserInfo> }
  | { type: 'SET_APPOINTMENT'; payload: AppointmentInfo | null }
  | { type: 'UPDATE_APPOINTMENT'; payload: Partial<AppointmentInfo> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'RESET_DATA' };

