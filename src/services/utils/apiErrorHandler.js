/**
 * API Error Handler - Centralized error handling utilities
 */

/**
 * Formats API errors into user-friendly messages
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export function formatApiError(error) {
  if (error.response) {
    const { status, data } = error.response;
    
    // Try to get error message from response
    if (data?.message) {
      return data.message;
    }
    
    // Fallback to status-based messages
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
  
  if (error.request) {
    return 'Network error. Please check your connection.';
  }
  
  return error.message || 'An unexpected error occurred.';
}

/**
 * Checks if error is a network error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export function isNetworkError(error) {
  return !error.response && error.request;
}

/**
 * Checks if error is a timeout error
 * @param {Error} error - The error object
 * @returns {boolean}
 */
export function isTimeoutError(error) {
  return error.code === 'ECONNABORTED' || error.message.includes('timeout');
}

