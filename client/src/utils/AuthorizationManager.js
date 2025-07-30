import { onAuthStateChanged } from "firebase/auth";
import { config } from "../firebase/Firebase";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// User roles and their access levels
export const USER_ROLES = {
  ADMIN: "admin",
  CLINIC_ADMIN: "cad",
  STAFF: "staff",
  PATIENT: "gmail",
  LOCATOR: "locator",
};

// Define which routes each role can access
export const ROLE_ACCESS = {
  [USER_ROLES.ADMIN]: [
    "/admin",
    "/clinic-admin",
    "/clinic-admin/stafflist",
    "/clinic-staff",
    "/clinic-staff/patientlist",
    "/clinic-staff/clinic-visits",
    "/patient",
    "/patient/personal-information",
    "/patient/record-diagnoses",
    "/patient/PersonalInfo",
  ],
  [USER_ROLES.CLINIC_ADMIN]: [
    "/clinic-admin",
    "/clinic-admin/stafflist",
    "/clinic-staff",
    "/clinic-staff/patientlist",
    "/clinic-staff/clinic-visits",
  ],
  [USER_ROLES.STAFF]: [
    "/clinic-staff",
    "/clinic-staff/patientlist",
    "/clinic-staff/clinic-visits",
  ],
  [USER_ROLES.PATIENT]: [
    "/patient",
    "/patient/personal-information",
    "/patient/record-diagnoses",
    "/patient/PersonalInfo",
  ],
  [USER_ROLES.LOCATOR]: ["/locator"],
};

/**
 * Extract user role from email domain
 * @param {string} email - User's email address
 * @returns {string} - User role
 */
export const getUserRole = (email) => {
  if (!email) return null;

  const emailParts = email.split("@");
  if (emailParts.length !== 2) return null;

  const domainParts = emailParts[1].split(".");
  if (domainParts.length < 2) return null;

  // Get the second-to-last part of the domain
  const accountType = domainParts[domainParts.length - 2];
  return accountType;
};

/**
 * Check if user has access to a specific route
 * @param {string} userRole - User's role
 * @param {string} route - Route to check access for
 * @returns {boolean} - Whether user has access
 */
export const hasRouteAccess = (userRole, route) => {
  if (!userRole || !route) return false;

  const allowedRoutes = ROLE_ACCESS[userRole];
  if (!allowedRoutes) return false;

  return allowedRoutes.includes(route);
};

/**
 * Get the default redirect route for a user role
 * @param {string} userRole - User's role
 * @returns {string} - Default route for the role
 */
export const getDefaultRoute = (userRole) => {
  const defaultRoutes = {
    [USER_ROLES.ADMIN]: "/admin",
    [USER_ROLES.CLINIC_ADMIN]: "/clinic-admin",
    [USER_ROLES.STAFF]: "/clinic-staff",
    [USER_ROLES.PATIENT]: "/patient",
    [USER_ROLES.LOCATOR]: "/locator",
  };

  return defaultRoutes[userRole] || "/login";
};

/**
 * Centralized authorization hook
 * @returns {Object} - Authorization state and functions
 */
export const useAuthorization = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      config.auth,
      (authUser) => {
        try {
          if (authUser) {
            const role = getUserRole(authUser.email);

            // Validate role exists
            if (
              !role ||
              !Object.values(USER_ROLES).includes(role)
            ) {
              console.error(
                "Invalid user role detected:",
                role
              );
              setError("Invalid user role");
              setUser(null);
              setUserRole(null);
              return;
            }

            setUser(authUser);
            setUserRole(role);
            setError(null);

            // Log successful authorization
            console.log("User authorized successfully:", {
              email: authUser.email,
              role,
            });
          } else {
            setUser(null);
            setUserRole(null);
          }
        } catch (err) {
          // Log error securely without exposing details
          console.error("Authorization error occurred");
          setError("Authorization failed");
          setUser(null);
          setUserRole(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const isAuthenticated = !!user;
  const isAuthorized = (route) =>
    hasRouteAccess(userRole, route);
  const getDefaultRedirect = () =>
    getDefaultRoute(userRole);

  return {
    user,
    userRole,
    loading,
    error,
    isAuthenticated,
    isAuthorized,
    getDefaultRedirect,
  };
};

/**
 * Business rule validation functions
 */

/**
 * Check if user can access patient data
 * @param {string} userRole - User's role
 * @param {string} patientId - Patient ID to access
 * @param {string} userEmail - User's email (for clinic staff validation)
 * @returns {boolean} - Whether user can access the patient data
 */
export const canAccessPatientData = (
  userRole,
  patientId,
  userEmail = null
) => {
  // Admin can access all patient data
  if (userRole === USER_ROLES.ADMIN) {
    return true;
  }

  // Clinic admin can access all patient data in their clinic
  if (userRole === USER_ROLES.CLINIC_ADMIN) {
    return true; // Would need clinic validation logic here
  }

  // Staff can access patient data in their clinic
  if (userRole === USER_ROLES.STAFF) {
    return true; // Would need clinic validation logic here
  }

  // Patients can only access their own data
  if (userRole === USER_ROLES.PATIENT) {
    // This would need to be validated against the actual patient ID
    return true; // Simplified for now
  }

  return false;
};

/**
 * Check if user can perform administrative actions
 * @param {string} userRole - User's role
 * @param {string} action - Action to perform
 * @returns {boolean} - Whether user can perform the action
 */
export const canPerformAction = (userRole, action) => {
  const actionPermissions = {
    [USER_ROLES.ADMIN]: [
      "create_clinic_admin",
      "create_staff",
      "unlock_accounts",
      "view_all_data",
      "delete_users",
      "manage_system",
    ],
    [USER_ROLES.CLINIC_ADMIN]: [
      "create_staff",
      "manage_clinic_data",
      "view_clinic_reports",
      "manage_patients",
    ],
    [USER_ROLES.STAFF]: [
      "create_patients",
      "view_patient_data",
      "update_patient_records",
      "schedule_appointments",
    ],
    [USER_ROLES.PATIENT]: [
      "view_own_data",
      "update_own_info",
      "schedule_own_appointments",
    ],
    [USER_ROLES.LOCATOR]: [
      "view_clinic_locations",
      "search_clinics",
    ],
  };

  const allowedActions = actionPermissions[userRole] || [];
  return allowedActions.includes(action);
};

/**
 * Validate business workflow
 * @param {string} userRole - User's role
 * @param {string} workflow - Workflow to validate
 * @param {Object} data - Data for workflow validation
 * @returns {Object} - Validation result with success and message
 */
export const validateWorkflow = (
  userRole,
  workflow,
  data = {}
) => {
  // Example workflow validations
  switch (workflow) {
    case "patient_registration":
      if (
        userRole !== USER_ROLES.STAFF &&
        userRole !== USER_ROLES.CLINIC_ADMIN
      ) {
        return {
          success: false,
          message: "Only staff can register patients",
        };
      }
      if (
        !data.email ||
        !data.firstName ||
        !data.lastName
      ) {
        return {
          success: false,
          message: "Required patient information missing",
        };
      }
      return { success: true };

    case "appointment_scheduling":
      if (userRole === USER_ROLES.PATIENT) {
        // Patients can only schedule their own appointments
        if (
          data.patientId &&
          data.patientId !== data.userId
        ) {
          return {
            success: false,
            message:
              "Patients can only schedule their own appointments",
          };
        }
      }
      return { success: true };

    case "medical_record_access":
      if (
        !canAccessPatientData(
          userRole,
          data.patientId,
          data.userEmail
        )
      ) {
        return {
          success: false,
          message: "Access denied to patient data",
        };
      }
      return { success: true };

    default:
      return {
        success: false,
        message: "Unknown workflow",
      };
  }
};

/**
 * Higher-order component for route protection
 * @param {React.Component} Component - Component to protect
 * @param {string} requiredRole - Role required to access the component
 * @returns {React.Component} - Protected component
 */
export const withAuthorization = (
  Component,
  requiredRole
) => {
  return function ProtectedComponent(props) {
    const {
      user,
      userRole,
      loading,
      isAuthenticated,
      isAuthorized,
      getDefaultRedirect,
    } = useAuthorization();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          navigate("/login");
        } else if (
          requiredRole &&
          userRole !== requiredRole
        ) {
          // User doesn't have the required role, redirect to their default route
          navigate(getDefaultRedirect());
        }
      }
    }, [
      loading,
      isAuthenticated,
      userRole,
      requiredRole,
      navigate,
      getDefaultRedirect,
    ]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return null; // Will redirect to login
    }

    if (requiredRole && userRole !== requiredRole) {
      return null; // Will redirect to default route
    }

    return <Component {...props} />;
  };
};
