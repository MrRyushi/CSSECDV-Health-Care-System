/**
 * Comprehensive Logging System
 * Logs security events and restricts access to administrators only
 *
 * CONSOLE LOGGING (Development Only):
 * - All security events are automatically logged to console in development mode
 * - To view all logs in console, run: viewLogsInConsole() in browser console
 * - Logs are color-coded by severity level for easy identification
 * - No admin dashboard needed - everything is visible in browser console
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

  // Convert to plain object for Firestore
  toJSON() {
    return {
      timestamp: this.timestamp,
      event: this.event,
      severity: this.severity,
      details: this.details,
      userId: this.userId,
      userRole: this.userRole,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      sessionId: this.sessionId,
    };
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
        logEntry.toJSON()
      );

      // Enhanced console logging for development
      if (process.env.NODE_ENV === "development") {
        const logStyle = {
          critical: "color: #dc2626; font-weight: bold;",
          error: "color: #ea580c; font-weight: bold;",
          warning: "color: #d97706; font-weight: bold;",
          info: "color: #2563eb; font-weight: bold;",
          debug: "color: #059669; font-weight: bold;",
        };

        console.group(
          `🔒 Security Log - ${logEntry.event}`
        );
        console.log(
          `%c${logEntry.severity.toUpperCase()}`,
          logStyle[logEntry.severity] || "color: #6b7280;"
        );
        console.log(
          "📅 Timestamp:",
          new Date(logEntry.timestamp).toLocaleString()
        );
        console.log(
          "👤 User ID:",
          logEntry.userId || "N/A"
        );
        console.log(
          "🎭 User Role:",
          logEntry.userRole || "N/A"
        );
        console.log("📋 Details:", logEntry.details);
        console.groupEnd();
      }
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
// Development helper function to view logs in console
export const viewLogsInConsole = async () => {
  if (process.env.NODE_ENV === "development") {
    try {
      const logsQuery = query(
        collection(db, "securityLogs"),
        orderBy("timestamp", "desc"),
        limit(50)
      );

      const querySnapshot = await getDocs(logsQuery);
      const logsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.group("🔍 Security Logs (Last 50)");
      logsData.forEach((log, index) => {
        const logStyle = {
          critical: "color: #dc2626; font-weight: bold;",
          error: "color: #ea580c; font-weight: bold;",
          warning: "color: #d97706; font-weight: bold;",
          info: "color: #2563eb; font-weight: bold;",
          debug: "color: #059669; font-weight: bold;",
        };

        console.group(`#${index + 1} - ${log.event}`);
        console.log(
          `%c${log.severity.toUpperCase()}`,
          logStyle[log.severity] || "color: #6b7280;"
        );
        console.log(
          "📅 Timestamp:",
          new Date(log.timestamp).toLocaleString()
        );
        console.log("👤 User ID:", log.userId || "N/A");
        console.log("🎭 User Role:", log.userRole || "N/A");
        console.log("📋 Details:", log.details);
        console.groupEnd();
      });
      console.groupEnd();
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  } else {
    console.log(
      "viewLogsInConsole() is only available in development mode"
    );
  }
};

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
