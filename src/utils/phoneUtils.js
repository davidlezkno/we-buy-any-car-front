/**
 * Phone number utility functions
 * Implements Single Responsibility Principle (SRP)
 */

/**
 * Extract only digits from phone number
 * @param {string} phone - Phone number string
 * @returns {string} Digits only
 */
export const getDigitsOnly = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

/**
 * Format phone number as (XXX) XXX XXXX
 * @param {string} phone - Phone number string
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  const digits = getDigitsOnly(phone);
  const limitedDigits = digits.slice(0, 10);

  if (limitedDigits.length === 0) return '';
  if (limitedDigits.length <= 3) return `(${limitedDigits}`;
  if (limitedDigits.length <= 6) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  }
  return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)} ${limitedDigits.slice(6)}`;
};

/**
 * Validate phone number (10 digits)
 * @param {string} phone - Phone number string
 * @returns {boolean} Whether phone is valid
 */
export const isValidPhone = (phone) => {
  const digits = getDigitsOnly(phone);
  return digits.length === 10;
};

/**
 * Format phone for API (digits only with country code if needed)
 * @param {string} phone - Phone number string
 * @returns {string} API-formatted phone
 */
export const formatPhoneForApi = (phone) => {
  const digits = getDigitsOnly(phone);
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  return digits;
};
