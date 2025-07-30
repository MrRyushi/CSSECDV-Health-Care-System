/**
 * Comprehensive Data Validation Utility
 * Implements secure validation that rejects invalid input without sanitizing
 */

// Validation rules and constraints
export const VALIDATION_RULES = {
  // Name validation
  firstName: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    required: true,
  },
  lastName: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    required: true,
  },
  middleName: {
    minLength: 0,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]*$/,
    required: false,
  },

  // Email validation
  email: {
    minLength: 5,
    maxLength: 254,
    pattern:
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    required: true,
  },

  // Password validation
  password: {
    minLength: 12,
    maxLength: 128,
    pattern:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}[\]|:;"'<>,.?/~`]).{12,}$/,
    required: true,
  },

  // Phone number validation
  phoneNumber: {
    minLength: 10,
    maxLength: 15,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    required: true,
  },

  // Address validation
  streetAddress: {
    minLength: 5,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s,.-]+$/,
    required: true,
  },

  // Medical data validation
  bloodType: {
    allowedValues: [
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-",
    ],
    required: true,
  },
  sex: {
    allowedValues: ["Male", "Female", "Other"],
    required: true,
  },

  // Emergency contact validation
  emergencyContactName: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    required: true,
  },
  emergencyContactNumber: {
    minLength: 10,
    maxLength: 15,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    required: true,
  },

  // Medical history validation
  allergies: {
    minLength: 0,
    maxLength: 500,
    pattern: /^[a-zA-Z0-9\s,.-]*$/,
    required: false,
  },
  relativeName: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    required: true,
  },
  relationshipWithRelative: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    required: true,
  },
  relativeCondition: {
    minLength: 1,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s,.-]+$/,
    required: true,
  },
  relativeMedications: {
    minLength: 0,
    maxLength: 300,
    pattern: /^[a-zA-Z0-9\s,.-]*$/,
    required: false,
  },

  // Vaccination validation
  vaccineType: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s,.-]+$/,
    required: true,
  },
  vaccineBrand: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s,.-]+$/,
    required: true,
  },
  vaccineDate: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    required: true,
  },
  vaccineRemarks: {
    minLength: 0,
    maxLength: 300,
    pattern: /^[a-zA-Z0-9\s,.-]*$/,
    required: false,
  },

  // Medical history validation
  historyType: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s,.-]+$/,
    required: true,
  },
  historyDate: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    required: true,
  },
  historyRemarks: {
    minLength: 0,
    maxLength: 300,
    pattern: /^[a-zA-Z0-9\s,.-]*$/,
    required: false,
  },

  // Clinic name validation
  clinicName: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s,.-]+$/,
    required: true,
  },
};

/**
 * Validate a single field against its rules
 * @param {string} fieldName - Name of the field to validate
 * @param {any} value - Value to validate
 * @returns {Object} - Validation result with success and message
 */
export const validateField = (fieldName, value) => {
  const rules = VALIDATION_RULES[fieldName];

  if (!rules) {
    return {
      success: false,
      message: `No validation rules found for field: ${fieldName}`,
    };
  }

  // Check if required
  if (
    rules.required &&
    (!value || value.toString().trim() === "")
  ) {
    return {
      success: false,
      message: `${fieldName} is required`,
    };
  }

  // Skip validation for empty optional fields
  if (
    !rules.required &&
    (!value || value.toString().trim() === "")
  ) {
    return { success: true };
  }

  const stringValue = value.toString().trim();

  // Check length constraints
  if (
    rules.minLength !== undefined &&
    stringValue.length < rules.minLength
  ) {
    return {
      success: false,
      message: `${fieldName} must be at least ${rules.minLength} characters long`,
    };
  }

  if (
    rules.maxLength !== undefined &&
    stringValue.length > rules.maxLength
  ) {
    return {
      success: false,
      message: `${fieldName} must be no more than ${rules.maxLength} characters long`,
    };
  }

  // Check pattern
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return {
      success: false,
      message: `${fieldName} contains invalid characters`,
    };
  }

  // Check allowed values
  if (
    rules.allowedValues &&
    !rules.allowedValues.includes(stringValue)
  ) {
    return {
      success: false,
      message: `${fieldName} must be one of: ${rules.allowedValues.join(
        ", "
      )}`,
    };
  }

  // Check date format and range
  if (fieldName.includes("Date") && rules.pattern) {
    if (!rules.pattern.test(stringValue)) {
      return {
        success: false,
        message: `${fieldName} must be in YYYY-MM-DD format`,
      };
    }

    const date = new Date(stringValue);
    const now = new Date();
    const minDate = new Date("1900-01-01");

    if (isNaN(date.getTime())) {
      return {
        success: false,
        message: `${fieldName} is not a valid date`,
      };
    }

    if (date > now) {
      return {
        success: false,
        message: `${fieldName} cannot be in the future`,
      };
    }

    if (date < minDate) {
      return {
        success: false,
        message: `${fieldName} cannot be before 1900`,
      };
    }
  }

  return { success: true };
};

/**
 * Validate multiple fields
 * @param {Object} data - Object containing field names and values
 * @returns {Object} - Validation result with success, errors, and messages
 */
export const validateFormData = (data) => {
  const errors = {};
  let isValid = true;

  for (const [fieldName, value] of Object.entries(data)) {
    const validation = validateField(fieldName, value);

    if (!validation.success) {
      errors[fieldName] = validation.message;
      isValid = false;
    }
  }

  return {
    success: isValid,
    errors: errors,
    message: isValid
      ? "All fields are valid"
      : "Validation failed",
  };
};

/**
 * Validate specific field types
 */

/**
 * Validate email format and domain
 * @param {string} email - Email to validate
 * @param {string} requiredDomain - Required domain (optional)
 * @returns {Object} - Validation result
 */
export const validateEmail = (
  email,
  requiredDomain = null
) => {
  const basicValidation = validateField("email", email);

  if (!basicValidation.success) {
    return basicValidation;
  }

  if (requiredDomain) {
    const domain = email.split("@")[1];
    if (domain !== requiredDomain) {
      return {
        success: false,
        message: `Email must use ${requiredDomain} domain`,
      };
    }
  }

  return { success: true };
};

/**
 * Validate password complexity
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
export const validatePassword = (password) => {
  return validateField("password", password);
};

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {Object} - Validation result
 */
export const validatePhoneNumber = (phoneNumber) => {
  return validateField("phoneNumber", phoneNumber);
};

/**
 * Validate date range
 * @param {string} date - Date to validate
 * @param {Date} minDate - Minimum allowed date
 * @param {Date} maxDate - Maximum allowed date
 * @returns {Object} - Validation result
 */
export const validateDateRange = (
  date,
  minDate = null,
  maxDate = null
) => {
  const dateValidation = validateField("historyDate", date);

  if (!dateValidation.success) {
    return dateValidation;
  }

  const dateObj = new Date(date);

  if (minDate && dateObj < minDate) {
    return {
      success: false,
      message: `Date cannot be before ${
        minDate.toISOString().split("T")[0]
      }`,
    };
  }

  if (maxDate && dateObj > maxDate) {
    return {
      success: false,
      message: `Date cannot be after ${
        maxDate.toISOString().split("T")[0]
      }`,
    };
  }

  return { success: true };
};

/**
 * Validate numeric range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {Object} - Validation result
 */
export const validateNumericRange = (value, min, max) => {
  const num = Number(value);

  if (isNaN(num)) {
    return {
      success: false,
      message: "Value must be a number",
    };
  }

  if (num < min) {
    return {
      success: false,
      message: `Value must be at least ${min}`,
    };
  }

  if (num > max) {
    return {
      success: false,
      message: `Value must be no more than ${max}`,
    };
  }

  return { success: true };
};

/**
 * Log validation failures for security monitoring
 * @param {string} fieldName - Name of the field that failed validation
 * @param {any} value - Value that failed validation
 * @param {string} message - Validation error message
 */
export const logValidationFailure = (
  fieldName,
  value,
  message
) => {
  // Import security logger dynamically to avoid circular dependencies
  import("./LoggingSystem")
    .then(({ securityLogger }) => {
      securityLogger.logValidationFailure(
        fieldName,
        message
      );
    })
    .catch(() => {
      // Fallback to console logging if security logger is not available
      console.log("Input validation failure:", {
        timestamp: new Date().toISOString(),
        field: fieldName,
        value:
          typeof value === "string"
            ? value.substring(0, 10) + "..."
            : "non-string",
        message: message,
        userAgent: navigator.userAgent,
      });
    });
};
