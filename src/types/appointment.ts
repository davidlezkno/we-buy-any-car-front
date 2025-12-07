/**
 * Appointment-related type definitions
 */

export interface AppointmentInfo {
  date?: string;
  dateFormatted?: string;
  time?: string;
  specificTime?: string;
  location?: string;
  locationId?: string;
  uid?: string;
  type?: 'branch' | 'home';
  branchName?: string;
  branchAddress?: string;
  branchPhone?: string;
  branchEmail?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface AppointmentDate {
  date: string;
  formatted: string;
  available: boolean;
  timeSlots?: TimeSlot[];
}

export interface BranchInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  manager?: string;
  fullAddress: string;
  hours: Record<string, string>;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distance?: string;
  rating?: number;
}

