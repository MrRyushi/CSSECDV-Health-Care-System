import { useState, useCallback } from "react";
import {
  validateField,
  validateFormData,
  logValidationFailure,
} from "./DataValidation";

/**
 * Custom hook for form validation
 * Ensures all validation failures result in input rejection without sanitizing
 */
export const useFormValidation = (initialData = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Update a single field with validation
   * @param {string} fieldName - Name of the field to update
   * @param {any} value - New value for the field
   * @param {boolean} validateImmediately - Whether to validate immediately
   */
  const updateField = useCallback(
    (fieldName, value, validateImmediately = false) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      // Clear error for this field when user starts typing
      setErrors((prev) => ({
        ...prev,
        [fieldName]: null,
      }));

      // Validate immediately if requested
      if (validateImmediately) {
        validateField(fieldName, value);
      }
    },
    []
  );

  /**
   * Validate a single field
   * @param {string} fieldName - Name of the field to validate
   * @returns {Object} - Validation result
   */
  const validateSingleField = useCallback(
    (fieldName) => {
      const value = formData[fieldName];
      const validation = validateField(fieldName, value);

      if (!validation.success) {
        // Log validation failure for security monitoring
        logValidationFailure(
          fieldName,
          value,
          validation.message
        );

        setErrors((prev) => ({
          ...prev,
          [fieldName]: validation.message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: null,
        }));
      }

      return validation;
    },
    [formData]
  );

  /**
   * Validate all fields in the form
   * @returns {Object} - Validation result
   */
  const validateAllFields = useCallback(() => {
    setIsValidating(true);

    const validation = validateFormData(formData);

    if (!validation.success) {
      // Log all validation failures
      Object.entries(validation.errors).forEach(
        ([fieldName, message]) => {
          logValidationFailure(
            fieldName,
            formData[fieldName],
            message
          );
        }
      );

      setErrors(validation.errors);
    } else {
      setErrors({});
    }

    setIsValidating(false);
    return validation;
  }, [formData]);

  /**
   * Validate specific fields
   * @param {Array} fieldNames - Array of field names to validate
   * @returns {Object} - Validation result
   */
  const validateFields = useCallback(
    (fieldNames) => {
      const fieldErrors = {};
      let isValid = true;

      fieldNames.forEach((fieldName) => {
        const validation = validateField(
          fieldName,
          formData[fieldName]
        );

        if (!validation.success) {
          logValidationFailure(
            fieldName,
            formData[fieldName],
            validation.message
          );
          fieldErrors[fieldName] = validation.message;
          isValid = false;
        }
      });

      setErrors((prev) => ({
        ...prev,
        ...fieldErrors,
      }));

      return {
        success: isValid,
        errors: fieldErrors,
      };
    },
    [formData]
  );

  /**
   * Reset form data and errors
   */
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  /**
   * Check if form is valid (no errors)
   * @returns {boolean} - Whether form is valid
   */
  const isFormValid = useCallback(() => {
    return (
      Object.keys(errors).length === 0 ||
      Object.values(errors).every((error) => error === null)
    );
  }, [errors]);

  /**
   * Get error for a specific field
   * @param {string} fieldName - Name of the field
   * @returns {string|null} - Error message or null
   */
  const getFieldError = useCallback(
    (fieldName) => {
      return errors[fieldName] || null;
    },
    [errors]
  );

  /**
   * Handle form submission with validation
   * @param {Function} onSubmit - Function to call if validation passes
   * @returns {boolean} - Whether submission was successful
   */
  const handleSubmit = useCallback(
    (onSubmit) => {
      const validation = validateAllFields();

      if (validation.success) {
        onSubmit(formData);
        return true;
      } else {
        // Reject submission - do not proceed with invalid data
        return false;
      }
    },
    [formData, validateAllFields]
  );

  return {
    formData,
    errors,
    isValidating,
    updateField,
    validateSingleField,
    validateAllFields,
    validateFields,
    resetForm,
    isFormValid,
    getFieldError,
    handleSubmit,
  };
};

/**
 * Higher-order component for form validation
 * @param {React.Component} Component - Component to wrap
 * @param {Object} validationRules - Validation rules for the form
 * @returns {React.Component} - Wrapped component with validation
 */
export const withFormValidation = (
  Component,
  validationRules = {}
) => {
  return function ValidatedComponent(props) {
    const validation = useFormValidation(
      props.initialData || {}
    );

    return <Component {...props} validation={validation} />;
  };
};
