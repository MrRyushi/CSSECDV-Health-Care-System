import React from "react";
import { Navigate } from "react-router-dom";
import {
  useAuthorization,
  USER_ROLES,
} from "../utils/AuthorizationManager";
import { useSecurityLogging } from "../utils/LoggingSystem";

/**
 * Centralized Protected Route Component
 * Handles all authorization checks in one place
 * Implements secure failure handling
 */
const ProtectedRoute = ({
  children,
  requiredRole,
  fallbackRoute = "/login",
}) => {
  const {
    user,
    userRole,
    loading,
    isAuthenticated,
    getDefaultRedirect,
    error,
  } = useAuthorization();
  const { logAccessControlFailure } = useSecurityLogging();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle authorization errors securely
  if (error) {
    console.error("Access control failure:", error);
    // Log access control failure for security monitoring
    logAccessControlFailure(
      window.location.pathname,
      requiredRole
    );

    // Redirect to login without exposing error details
    return <Navigate to={fallbackRoute} replace />;
  }

  // User is not authenticated - redirect to login
  if (!isAuthenticated) {
    // Log unauthorized access attempt
    logAccessControlFailure(
      window.location.pathname,
      requiredRole
    );

    return <Navigate to={fallbackRoute} replace />;
  }

  // If no specific role is required, allow access
  if (!requiredRole) {
    return children;
  }

  // Check if user has the required role
  if (userRole !== requiredRole) {
    // Log access control failure
    logAccessControlFailure(
      window.location.pathname,
      requiredRole
    );

    // User doesn't have the required role - redirect to their default route
    const defaultRoute = getDefaultRedirect();
    return <Navigate to={defaultRoute} replace />;
  }

  // User is authenticated and has the required role - allow access
  return children;
};

export default ProtectedRoute;
