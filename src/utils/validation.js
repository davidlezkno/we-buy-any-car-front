/**
 * Validation Rules and Messages
 * Implements Open/Closed Principle (OCP) - Easy to extend with new rules
 */

export const VALIDATION_RULES = {
  email: {
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Invalid email address',
    required: true,
  },
  phone: {
    pattern: /^[\d\s\-()]+$/,
    message: 'Invalid phone number',
    required: true,
  },
  zipCode: {
    pattern: /^\d{5}$/,
    message: 'Invalid zip code (must be 5 digits)',
    required: true,
  },
  vin: {
    pattern: /^[A-HJ-NPR-Z0-9]{17}$/i,
    message: 'Invalid VIN (must be 17 characters)',
    required: true,
  },
  required: {
    message: 'This field is required',
    required: true,
  },
};

/**
 * Validate a value against a rule
 * @param {any} value - Value to validate
 * @param {Object} rule - Validation rule
 * @returns {string|null} Error message or null if valid
 */
export function validateField(value, rule) {
  if (rule.required && (!value || value.trim() === '')) {
    return rule.message || 'This field is required';
  }

  if (rule.pattern && value && !rule.pattern.test(value)) {
    return rule.message || 'Invalid format';
  }

  if (rule.min && value && value.length < rule.min) {
    return `Minimum ${rule.min} characters required`;
  }

  if (rule.max && value && value.length > rule.max) {
    return `Maximum ${rule.max} characters allowed`;
  }

  return null;
}

