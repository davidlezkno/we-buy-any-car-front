/**
 * User-related type definitions
 */

export interface UserInfo {
  name: string;
  email: string;
  phone: string;
  zipCode: string;
  firstName?: string;
  lastName?: string;
  receiveSMS?: boolean;
}

export interface OTPData {
  phone: string;
  code: string;
  verified: boolean;
}

