/**
 * Comprehensive Logging System
 * Logs security events and restricts access to administrators only
 */

import { db } from "../firebase/Firebase";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuthorization } from "./AuthorizationManager";
import { USER_ROLES } from "./AuthorizationManager";
import { useState, useEffect } from "react";

// Log event types
export const LOG_EVENTS = {
  // Authentication events
  LOGIN_ATTEMPT: "login_attempt",
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILURE: "login_failure",
  LOGOUT: "logout",
  PASSWORD_RESET: "password_reset",
  ACCOUNT_LOCKED: "account_locked",
  ACCOUNT_UNLOCKED: "account_unlocked",

  // Authorization events
  ACCESS_DENIED: "access_denied",
  UNAUTHORIZED_ACCESS: "unauthorized_access",
  ROLE_VIOLATION: "role_violation",
  PRIVILEGE_ESCALATION: "privilege_escalation",

  // Validation events
  INPUT_VALIDATION_FAILURE: "input_validation_failure",
  DATA_VALIDATION_ERROR: "data_validation_error",

  // System events
  SYSTEM_ERROR: "system_error",
  DATABASE_ERROR: "database_error",
  NETWORK_ERROR: "network_error",

  // User management events
  USER_CREATED: "user_created",
  USER_UPDATED: "user_updated",
  USER_DELETED: "user_deleted",

  // Data access events
  DATA_ACCESSED: "data_accessed",
  DATA_MODIFIED: "data_modified",
  DATA_DELETED: "data_deleted",

  // Security events
  SUSPICIOUS_ACTIVITY: "suspicious_activity",
  BRUTE_FORCE_ATTEMPT: "brute_force_attempt",
  SQL_INJECTION_ATTEMPT: "sql_injection_attempt",
  XSS_ATTEMPT: "xss_attempt",
};

// Log severity levels
export const LOG_SEVERITY = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
  CRITICAL: "critical",
};

/**
 * Log entry structure
 */
class LogEntry {
  constructor(
    event,
    severity,
    details = {},
    userId = null,
    userRole = null
  ) {
    this.timestamp = new Date().toISOString();
    this.event = event;
    this.severity = severity;
    this.details = details;
    this.userId = userId;
    this.userRole = userRole;
    this.ipAddress = this.getClientIP();
    this.userAgent = navigator.userAgent;
    this.sessionId = this.getSessionId();
  }

  getClientIP() {
    // In a real application, this would be obtained from the server
    // For now, we'll use a placeholder
    return "client-ip-placeholder";
  }

  getSessionId() {
    // Generate a session ID for tracking
    return (
      sessionStorage.getItem("sessionId") ||
      this.generateSessionId()
    );
  }

  generateSessionId() {
    const sessionId =
      "session_" +
      Date.now() +
      "_" +
      Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("sessionId", sessionId);
    return sessionId;
  }
}

/**
 * Main logging class
 */
class SecurityLogger {
  constructor() {
    this.logsCollection = "securityLogs";
    this.isEnabled = true;
  }

  /**
   * Log a security event
   * @param {string} event - Event type
   * @param {string} severity - Severity level
   * @param {Object} details - Additional details
   * @param {string} userId - User ID (optional)
   * @param {string} userRole - User role (optional)
   */
  async logEvent(
    event,
    severity,
    details = {},
    userId = null,
    userRole = null
  ) {
    if (!this.isEnabled) return;

    try {
      const logEntry = new LogEntry(
        event,
        severity,
        details,
        userId,
        userRole
      );

      // Store in Firestore
      await addDoc(
        collection(db, this.logsCollection),
        logEntry
      );

      // Also log to console for development
      console.log("Security Log:", {
        timestamp: logEntry.timestamp,
        event: logEntry.event,
        severity: logEntry.severity,
        userId: logEntry.userId,
        userRole: logEntry.userRole,
      });
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  }

  /**
   * Log authentication attempt
   * @param {string} email - User email
   * @param {boolean} success - Whether login was successful
   * @param {string} reason - Failure reason (if applicable)
   */
  async logAuthenticationAttempt(
    email,
    success,
    reason = null
  ) {
    const event = success
      ? LOG_EVENTS.LOGIN_SUCCESS
      : LOG_EVENTS.LOGIN_FAILURE;
    const severity = success
      ? LOG_SEVERITY.INFO
      : LOG_SEVERITY.WARNING;

    await this.logEvent(event, severity, {
      email: email,
      success: success,
      reason: reason,
    });
  }

  /**
   * Log access control failure
   * @param {string} userId - User ID
   * @param {string} userRole - User role
   * @param {string} attemptedResource - Resource user tried to access
   * @param {string} requiredRole - Required role for the resource
   */
  async logAccessControlFailure(
    userId,
    userRole,
    attemptedResource,
    requiredRole
  ) {
    await this.logEvent(
      LOG_EVENTS.ACCESS_DENIED,
      LOG_SEVERITY.WARNING,
      {
        userId: userId,
        userRole: userRole,
        attemptedResource: attemptedResource,
        requiredRole: requiredRole,
      },
      userId,
      userRole
    );
  }

  /**
   * Log input validation failure
   * @param {string} fieldName - Field that failed validation
   * @param {string} validationError - Validation error message
   * @param {string} userId - User ID (optional)
   * @param {string} userRole - User role (optional)
   */
  async logValidationFailure(
    fieldName,
    validationError,
    userId = null,
    userRole = null
  ) {
    await this.logEvent(
      LOG_EVENTS.INPUT_VALIDATION_FAILURE,
      LOG_SEVERITY.WARNING,
      {
        fieldName: fieldName,
        validationError: validationError,
      },
      userId,
      userRole
    );
  }

  /**
   * Log suspicious activity
   * @param {string} activity - Description of suspicious activity
   * @param {Object} details - Additional details
   * @param {string} userId - User ID (optional)
   */
  async logSuspiciousActivity(
    activity,
    details = {},
    userId = null
  ) {
    await this.logEvent(
      LOG_EVENTS.SUSPICIOUS_ACTIVITY,
      LOG_SEVERITY.ERROR,
      {
        activity: activity,
        details: details,
      },
      userId
    );
  }

  /**
   * Log system error
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   * @param {string} userId - User ID (optional)
   */
  async logSystemError(error, context, userId = null) {
    await this.logEvent(
      LOG_EVENTS.SYSTEM_ERROR,
      LOG_SEVERITY.ERROR,
      {
        context: context,
        errorType: error?.constructor?.name || "Unknown",
        hasError: !!error,
      },
      userId
    );
  }
}

// Create singleton instance
export const securityLogger = new SecurityLogger();

/**
 * Hook for logging with user context
 */
export const useSecurityLogging = () => {
  const { user, userRole } = useAuthorization();

  const logEvent = async (
    event,
    severity,
    details = {}
  ) => {
    await securityLogger.logEvent(
      event,
      severity,
      details,
      user?.uid || null,
      userRole || null
    );
  };

  const logAuthenticationAttempt = async (
    email,
    success,
    reason = null
  ) => {
    await securityLogger.logAuthenticationAttempt(
      email,
      success,
      reason
    );
  };

  const logAccessControlFailure = async (
    attemptedResource,
    requiredRole
  ) => {
    await securityLogger.logAccessControlFailure(
      user?.uid || null,
      userRole || null,
      attemptedResource,
      requiredRole
    );
  };

  const logValidationFailure = async (
    fieldName,
    validationError
  ) => {
    await securityLogger.logValidationFailure(
      fieldName,
      validationError,
      user?.uid || null,
      userRole || null
    );
  };

  const logSuspiciousActivity = async (
    activity,
    details = {}
  ) => {
    await securityLogger.logSuspiciousActivity(
      activity,
      details,
      user?.uid || null
    );
  };

  const logSystemError = async (error, context) => {
    await securityLogger.logSystemError(
      error,
      context,
      user?.uid || null
    );
  };

  return {
    logEvent,
    logAuthenticationAttempt,
    logAccessControlFailure,
    logValidationFailure,
    logSuspiciousActivity,
    logSystemError,
  };
};

/**
 * Admin-only log viewer component
 */
export const LogViewer = () => {
  const { userRole } = useAuthorization();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const logsQuery = query(
        collection(db, "securityLogs"),
        orderBy("timestamp", "desc"),
        limit(100)
      );

      const querySnapshot = await getDocs(logsQuery);
      const logsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLogs(logsData);
    } catch (err) {
      setError("Failed to fetch logs");
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch logs if user is admin
    if (userRole === USER_ROLES.ADMIN) {
      fetchLogs();
    }
  }, [userRole]);

  // Only allow admins to view logs
  if (userRole !== USER_ROLES.ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Only administrators can view security logs.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div>Loading logs...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Security Logs
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border">
                Timestamp
              </th>
              <th className="px-4 py-2 border">Event</th>
              <th className="px-4 py-2 border">Severity</th>
              <th className="px-4 py-2 border">User ID</th>
              <th className="px-4 py-2 border">
                User Role
              </th>
              <th className="px-4 py-2 border">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2 border">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 border">
                  {log.event}
                </td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      log.severity === "critical"
                        ? "bg-red-100 text-red-800"
                        : log.severity === "error"
                        ? "bg-orange-100 text-orange-800"
                        : log.severity === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {log.severity}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  {log.userId || "N/A"}
                </td>
                <td className="px-4 py-2 border">
                  {log.userRole || "N/A"}
                </td>
                <td className="px-4 py-2 border">
                  <pre className="text-xs">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
