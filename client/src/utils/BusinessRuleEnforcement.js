import {
  useAuthorization,
  canPerformAction,
  validateWorkflow,
  canAccessPatientData,
} from "./AuthorizationManager";

/**
 * Custom hook for business rule enforcement
 * Provides functions to validate business logic throughout the application
 */
export const useBusinessRules = () => {
  const { userRole, user } = useAuthorization();

  /**
   * Check if user can perform a specific action
   * @param {string} action - Action to check
   * @returns {boolean} - Whether user can perform the action
   */
  const canPerform = (action) => {
    return canPerformAction(userRole, action);
  };

  /**
   * Validate a business workflow
   * @param {string} workflow - Workflow to validate
   * @param {Object} data - Data for validation
   * @returns {Object} - Validation result
   */
  const validateWorkflowRule = (workflow, data = {}) => {
    return validateWorkflow(userRole, workflow, data);
  };

  /**
   * Check if user can access patient data
   * @param {string} patientId - Patient ID
   * @returns {boolean} - Whether user can access the data
   */
  const canAccessPatient = (patientId) => {
    return canAccessPatientData(
      userRole,
      patientId,
      user?.email
    );
  };

  /**
   * Enforce business rule with error handling
   * @param {string} rule - Rule to enforce
   * @param {Object} data - Data for rule validation
   * @returns {Object} - Result with success status and message
   */
  const enforceRule = (rule, data = {}) => {
    try {
      switch (rule) {
        case "patient_registration":
          return validateWorkflowRule(
            "patient_registration",
            data
          );

        case "appointment_scheduling":
          return validateWorkflowRule(
            "appointment_scheduling",
            data
          );

        case "medical_record_access":
          return validateWorkflowRule(
            "medical_record_access",
            data
          );

        case "staff_creation":
          if (!canPerform("create_staff")) {
            return {
              success: false,
              message:
                "Insufficient privileges to create staff accounts",
            };
          }
          return { success: true };

        case "admin_actions":
          if (!canPerform("manage_system")) {
            return {
              success: false,
              message:
                "Insufficient privileges for administrative actions",
            };
          }
          return { success: true };

        default:
          return {
            success: false,
            message: "Unknown business rule",
          };
      }
    } catch (error) {
      console.error(
        "Business rule enforcement error:",
        error
      );
      return {
        success: false,
        message: "Business rule validation failed",
      };
    }
  };

  /**
   * Get user's allowed actions
   * @returns {Array} - List of actions user can perform
   */
  const getAllowedActions = () => {
    const actionPermissions = {
      admin: [
        "create_clinic_admin",
        "create_staff",
        "unlock_accounts",
        "view_all_data",
        "delete_users",
        "manage_system",
      ],
      cad: [
        "create_staff",
        "manage_clinic_data",
        "view_clinic_reports",
        "manage_patients",
      ],
      staff: [
        "create_patients",
        "view_patient_data",
        "update_patient_records",
        "schedule_appointments",
      ],
      gmail: [
        "view_own_data",
        "update_own_info",
        "schedule_own_appointments",
      ],
      locator: ["view_clinic_locations", "search_clinics"],
    };

    return actionPermissions[userRole] || [];
  };

  return {
    canPerform,
    validateWorkflowRule,
    canAccessPatient,
    enforceRule,
    getAllowedActions,
    userRole,
  };
};

/**
 * Higher-order component for business rule enforcement
 * @param {React.Component} Component - Component to wrap
 * @param {string} requiredAction - Action required to access the component
 * @returns {React.Component} - Wrapped component with business rule enforcement
 */
export const withBusinessRuleEnforcement = (
  Component,
  requiredAction
) => {
  return function BusinessRuleProtectedComponent(props) {
    const { canPerform, enforceRule } = useBusinessRules();

    // Check if user can perform the required action
    if (!canPerform(requiredAction)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You don't have permission to access this
              resource.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
