/**
 * Error Handler Service
 * Centralized error handling for API calls and application errors
 */

/**
 * Error types for classification
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Custom Application Error class
 */
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, statusCode = null, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Classify error based on status code or error type
 */
export const classifyError = (error) => {
  // Network errors
  if (!navigator.onLine) {
    return ErrorTypes.NETWORK;
  }

  // Axios/Fetch errors
  if (error.response) {
    const status = error.response.status;
    
    if (status === 400) return ErrorTypes.VALIDATION;
    if (status === 401) return ErrorTypes.AUTHENTICATION;
    if (status === 403) return ErrorTypes.AUTHORIZATION;
    if (status === 404) return ErrorTypes.NOT_FOUND;
    if (status >= 500) return ErrorTypes.SERVER;
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ErrorTypes.TIMEOUT;
  }

  // Network errors
  if (error.message === 'Network Error' || !error.response) {
    return ErrorTypes.NETWORK;
  }

  return ErrorTypes.UNKNOWN;
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
  const errorType = classifyError(error);

  const messages = {
    [ErrorTypes.NETWORK]: 'Unable to connect. Please check your internet connection and try again.',
    [ErrorTypes.VALIDATION]: 'Please check your input and try again.',
    [ErrorTypes.AUTHENTICATION]: 'Your session has expired. Please log in again.',
    [ErrorTypes.AUTHORIZATION]: 'You do not have permission to perform this action.',
    [ErrorTypes.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorTypes.SERVER]: 'Our servers are experiencing issues. Please try again later.',
    [ErrorTypes.TIMEOUT]: 'The request took too long. Please try again.',
    [ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  };

  return messages[errorType] || messages[ErrorTypes.UNKNOWN];
};

/**
 * Handle API errors with retry logic
 */
export const handleApiError = async (error, retryFn = null, maxRetries = 2) => {
  const errorType = classifyError(error);
  const statusCode = error.response?.status || null;
  const message = getUserFriendlyMessage(error);

  // Create structured error
  const appError = new AppError(message, errorType, statusCode, error);

  // Log error (in production, send to logging service)
  console.error('API Error:', {
    type: errorType,
    message,
    statusCode,
    url: error.config?.url,
    timestamp: appError.timestamp,
  });

  // Retry logic for network and timeout errors
  if (retryFn && (errorType === ErrorTypes.NETWORK || errorType === ErrorTypes.TIMEOUT)) {
    if (maxRetries > 0) {
      console.log(`Retrying... (${maxRetries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      try {
        return await retryFn();
      } catch (retryError) {
        return handleApiError(retryError, retryFn, maxRetries - 1);
      }
    }
  }

  throw appError;
};

/**
 * Wrap async function with error handling
 */
export const withErrorHandling = (fn, options = {}) => {
  const { onError, showNotification = true, maxRetries = 2 } = options;

  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const handledError = await handleApiError(
        error,
        () => fn(...args),
        maxRetries
      );

      if (onError) {
        onError(handledError);
      }

      if (showNotification && window.showToast) {
        window.showToast(handledError.message, 'error');
      }

      throw handledError;
    }
  };
};

/**
 * Log error to external service (placeholder)
 */
export const logErrorToService = (error, context = {}) => {
  // TODO: Implement logging to external service (Sentry, LogRocket, etc.)
  console.error('Error logged:', {
    error,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  });
};
