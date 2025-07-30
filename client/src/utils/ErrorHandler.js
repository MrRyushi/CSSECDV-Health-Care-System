/**
 * Comprehensive Error Handling System
 * Provides secure error handling without exposing debugging information
 */

// Error types for categorization
export const ERROR_TYPES = {
  AUTHENTICATION: "authentication",
  AUTHORIZATION: "authorization",
  VALIDATION: "validation",
  NETWORK: "network",
  DATABASE: "database",
  SYSTEM: "system",
  UNKNOWN: "unknown",
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

/**
 * Generic error messages that don't expose system details
 */
export const GENERIC_ERROR_MESSAGES = {
  [ERROR_TYPES.AUTHENTICATION]: {
    [ERROR_SEVERITY.LOW]:
      "Authentication failed. Please try again.",
    [ERROR_SEVERITY.MEDIUM]:
      "Authentication error. Please check your credentials.",
    [ERROR_SEVERITY.HIGH]:
      "Authentication system error. Please contact support.",
    [ERROR_SEVERITY.CRITICAL]:
      "System authentication error. Please try again later.",
  },
  [ERROR_TYPES.AUTHORIZATION]: {
    [ERROR_SEVERITY.LOW]: "Access denied.",
    [ERROR_SEVERITY.MEDIUM]: "Insufficient permissions.",
    [ERROR_SEVERITY.HIGH]:
      "Authorization error. Please contact administrator.",
    [ERROR_SEVERITY.CRITICAL]:
      "System authorization error.",
  },
  [ERROR_TYPES.VALIDATION]: {
    [ERROR_SEVERITY.LOW]: "Invalid input provided.",
    [ERROR_SEVERITY.MEDIUM]: "Data validation failed.",
    [ERROR_SEVERITY.HIGH]: "Input validation error.",
    [ERROR_SEVERITY.CRITICAL]: "System validation error.",
  },
  [ERROR_TYPES.NETWORK]: {
    [ERROR_SEVERITY.LOW]: "Network connection issue.",
    [ERROR_SEVERITY.MEDIUM]:
      "Connection error. Please try again.",
    [ERROR_SEVERITY.HIGH]:
      "Network error. Please check your connection.",
    [ERROR_SEVERITY.CRITICAL]: "System connection error.",
  },
  [ERROR_TYPES.DATABASE]: {
    [ERROR_SEVERITY.LOW]: "Data operation failed.",
    [ERROR_SEVERITY.MEDIUM]: "Database operation error.",
    [ERROR_SEVERITY.HIGH]: "Data system error.",
    [ERROR_SEVERITY.CRITICAL]: "System data error.",
  },
  [ERROR_TYPES.SYSTEM]: {
    [ERROR_SEVERITY.LOW]: "System operation failed.",
    [ERROR_SEVERITY.MEDIUM]: "System error occurred.",
    [ERROR_SEVERITY.HIGH]:
      "System error. Please try again.",
    [ERROR_SEVERITY.CRITICAL]: "Critical system error.",
  },
  [ERROR_TYPES.UNKNOWN]: {
    [ERROR_SEVERITY.LOW]: "An error occurred.",
    [ERROR_SEVERITY.MEDIUM]:
      "An unexpected error occurred.",
    [ERROR_SEVERITY.HIGH]:
      "System error. Please try again.",
    [ERROR_SEVERITY.CRITICAL]: "Critical error occurred.",
  },
};

/**
 * Determine error type from error object
 * @param {Error} error - Error object
 * @returns {string} - Error type
 */
export const getErrorType = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;

  const errorMessage = error.message?.toLowerCase() || "";
  const errorCode = error.code?.toLowerCase() || "";

  // Authentication errors
  if (
    errorCode.includes("auth") ||
    errorMessage.includes("auth") ||
    errorMessage.includes("login") ||
    errorMessage.includes("password")
  ) {
    return ERROR_TYPES.AUTHENTICATION;
  }

  // Authorization errors
  if (
    errorMessage.includes("permission") ||
    errorMessage.includes("access") ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("forbidden")
  ) {
    return ERROR_TYPES.AUTHORIZATION;
  }

  // Validation errors
  if (
    errorMessage.includes("validation") ||
    errorMessage.includes("invalid") ||
    errorMessage.includes("required") ||
    errorMessage.includes("format")
  ) {
    return ERROR_TYPES.VALIDATION;
  }

  // Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("timeout")
  ) {
    return ERROR_TYPES.NETWORK;
  }

  // Database errors
  if (
    errorMessage.includes("database") ||
    errorMessage.includes("firestore") ||
    errorMessage.includes("firebase") ||
    errorMessage.includes("data")
  ) {
    return ERROR_TYPES.DATABASE;
  }

  return ERROR_TYPES.UNKNOWN;
};

/**
 * Determine error severity
 * @param {Error} error - Error object
 * @param {string} errorType - Type of error
 * @returns {string} - Error severity
 */
export const getErrorSeverity = (error, errorType) => {
  if (!error) return ERROR_SEVERITY.MEDIUM;

  // Critical errors
  if (
    errorType === ERROR_TYPES.SYSTEM ||
    error.message?.includes("critical") ||
    error.code?.includes("critical")
  ) {
    return ERROR_SEVERITY.CRITICAL;
  }

  // High severity errors
  if (
    errorType === ERROR_TYPES.AUTHENTICATION ||
    errorType === ERROR_TYPES.AUTHORIZATION ||
    error.message?.includes("security") ||
    error.code?.includes("security")
  ) {
    return ERROR_SEVERITY.HIGH;
  }

  // Medium severity errors
  if (
    errorType === ERROR_TYPES.DATABASE ||
    errorType === ERROR_TYPES.NETWORK
  ) {
    return ERROR_SEVERITY.MEDIUM;
  }

  // Low severity errors
  if (errorType === ERROR_TYPES.VALIDATION) {
    return ERROR_SEVERITY.LOW;
  }

  return ERROR_SEVERITY.MEDIUM;
};

/**
 * Get generic error message
 * @param {Error} error - Error object
 * @returns {string} - Generic error message
 */
export const getGenericErrorMessage = (error) => {
  const errorType = getErrorType(error);
  const severity = getErrorSeverity(error, errorType);

  return GENERIC_ERROR_MESSAGES[errorType][severity];
};

/**
 * Handle error securely without exposing debugging information
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @param {Object} additionalData - Additional data to log
 */
export const handleError = (
  error,
  context = "unknown",
  additionalData = {}
) => {
  const errorType = getErrorType(error);
  const severity = getErrorSeverity(error, errorType);
  const genericMessage = getGenericErrorMessage(error);

  // Log error securely (without exposing sensitive details)
  console.error("Error occurred:", {
    timestamp: new Date().toISOString(),
    type: errorType,
    severity: severity,
    context: context,
    message: genericMessage,
    // Don't log the actual error object to avoid exposing sensitive info
    hasError: !!error,
    additionalData: additionalData,
  });

  // Return generic message for user display
  return {
    message: genericMessage,
    type: errorType,
    severity: severity,
    shouldRetry:
      severity === ERROR_SEVERITY.LOW ||
      severity === ERROR_SEVERITY.MEDIUM,
  };
};

/**
 * Handle async operations with error handling
 * @param {Function} asyncFunction - Async function to execute
 * @param {string} context - Context for error handling
 * @returns {Promise} - Promise with error handling
 */
export const handleAsyncOperation = async (
  asyncFunction,
  context = "async-operation"
) => {
  try {
    const result = await asyncFunction();
    return { success: true, data: result };
  } catch (error) {
    const errorInfo = handleError(error, context);
    return { success: false, error: errorInfo };
  }
};

/**
 * Global error boundary handler
 * @param {Error} error - Error object
 * @param {ErrorInfo} errorInfo - React error info
 */
export const handleGlobalError = (error, errorInfo) => {
  const errorData = handleError(error, "global-error", {
    componentStack: errorInfo?.componentStack
      ? "present"
      : "missing",
  });

  // Log to external service if needed
  // logToExternalService(errorData);

  return errorData;
};
