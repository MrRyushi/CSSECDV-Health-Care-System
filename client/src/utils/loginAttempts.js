import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/Firebase";

// Constants for lockout functionality
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Check if a user account is currently locked out
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Object containing lockout status and remaining attempts
 */
export const checkLockoutStatus = async (email) => {
  try {
    const loginAttemptsRef = doc(
      db,
      "loginAttempts",
      email
    );
    const loginAttemptsDoc = await getDoc(loginAttemptsRef);

    if (loginAttemptsDoc.exists()) {
      const data = loginAttemptsDoc.data();
      const now = Date.now();

      // Check if user is currently locked out
      if (
        data.isLocked &&
        data.lockoutUntil &&
        now < data.lockoutUntil
      ) {
        const remainingTime = Math.ceil(
          (data.lockoutUntil - now) / (60 * 1000)
        );
        return {
          isLocked: true,
          remainingMinutes: remainingTime,
          attempts: data.attempts || 0,
        };
      }

      // If lockout period has expired, reset the lockout
      if (
        data.isLocked &&
        data.lockoutUntil &&
        now >= data.lockoutUntil
      ) {
        await updateDoc(loginAttemptsRef, {
          isLocked: false,
          attempts: 0,
          lockoutUntil: null,
        });
        return { isLocked: false, attempts: 0 };
      }

      return {
        isLocked: false,
        attempts: data.attempts || 0,
      };
    }

    return { isLocked: false, attempts: 0 };
  } catch (error) {
    console.error("Error checking lockout status:", error);
    return { isLocked: false, attempts: 0 };
  }
};

/**
 * Record a failed login attempt for a user
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Object containing updated lockout status
 */
export const recordFailedAttempt = async (email) => {
  try {
    const loginAttemptsRef = doc(
      db,
      "loginAttempts",
      email
    );
    const loginAttemptsDoc = await getDoc(loginAttemptsRef);

    if (loginAttemptsDoc.exists()) {
      const data = loginAttemptsDoc.data();
      const newAttempts = (data.attempts || 0) + 1;

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Lock the account
        const lockoutUntil = Date.now() + LOCKOUT_DURATION;
        await updateDoc(loginAttemptsRef, {
          attempts: newAttempts,
          isLocked: true,
          lockoutUntil: lockoutUntil,
          lastFailedAttempt: Date.now(),
        });

        return {
          isLocked: true,
          attempts: newAttempts,
          lockoutUntil: lockoutUntil,
        };
      } else {
        // Just increment attempts
        await updateDoc(loginAttemptsRef, {
          attempts: newAttempts,
          lastFailedAttempt: Date.now(),
        });

        return {
          isLocked: false,
          attempts: newAttempts,
        };
      }
    } else {
      // Create new document for first failed attempt
      await setDoc(loginAttemptsRef, {
        attempts: 1,
        isLocked: false,
        lastFailedAttempt: Date.now(),
      });

      return {
        isLocked: false,
        attempts: 1,
      };
    }
  } catch (error) {
    console.error("Error recording failed attempt:", error);
    throw error;
  }
};

/**
 * Reset login attempts for a user after successful login
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export const resetLoginAttempts = async (email) => {
  try {
    const loginAttemptsRef = doc(
      db,
      "loginAttempts",
      email
    );
    const loginAttemptsDoc = await getDoc(loginAttemptsRef);

    if (loginAttemptsDoc.exists()) {
      // Update existing document
      await updateDoc(loginAttemptsRef, {
        attempts: 0,
        isLocked: false,
        lockoutUntil: null,
        lastSuccessfulLogin: Date.now(),
      });
    } else {
      // Create new document for successful login tracking
      await setDoc(loginAttemptsRef, {
        attempts: 0,
        isLocked: false,
        lockoutUntil: null,
        lastSuccessfulLogin: Date.now(),
      });
    }
  } catch (error) {
    console.error("Error resetting login attempts:", error);
    throw error;
  }
};

/**
 * Get a user-friendly message based on lockout status
 * @param {Object} lockoutStatus - Result from checkLockoutStatus
 * @returns {string} - User-friendly message
 */
export const getLockoutMessage = (lockoutStatus) => {
  if (lockoutStatus.isLocked) {
    return `Account is locked due to too many failed attempts. Please try again in ${lockoutStatus.remainingMinutes} minutes.`;
  }

  const remainingAttempts =
    MAX_LOGIN_ATTEMPTS - lockoutStatus.attempts;
  if (remainingAttempts > 0 && lockoutStatus.attempts > 0) {
    return `Invalid username and/or password. ${remainingAttempts} attempts remaining before account lockout.`;
  }

  return "Invalid username and/or password.";
};

/**
 * Manually unlock a user account (for admin use)
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export const unlockAccount = async (email) => {
  try {
    const loginAttemptsRef = doc(
      db,
      "loginAttempts",
      email
    );
    const loginAttemptsDoc = await getDoc(loginAttemptsRef);

    if (loginAttemptsDoc.exists()) {
      // Update existing document
      await updateDoc(loginAttemptsRef, {
        attempts: 0,
        isLocked: false,
        lockoutUntil: null,
        manuallyUnlocked: true,
        unlockedAt: Date.now(),
      });
    } else {
      // Create new document for unlocked account
      await setDoc(loginAttemptsRef, {
        attempts: 0,
        isLocked: false,
        lockoutUntil: null,
        manuallyUnlocked: true,
        unlockedAt: Date.now(),
      });
    }
  } catch (error) {
    console.error("Error unlocking account:", error);
    throw error;
  }
};

/**
 * Initialize login attempts tracking for a user (creates document if it doesn't exist)
 * @param {string} email - User's email address
 * @returns {Promise<void>}
 */
export const initializeLoginTracking = async (email) => {
  try {
    const loginAttemptsRef = doc(
      db,
      "loginAttempts",
      email
    );
    const loginAttemptsDoc = await getDoc(loginAttemptsRef);

    if (!loginAttemptsDoc.exists()) {
      // Create initial document for new user
      await setDoc(loginAttemptsRef, {
        attempts: 0,
        isLocked: false,
        lockoutUntil: null,
        initializedAt: Date.now(),
      });
    }
  } catch (error) {
    console.error(
      "Error initializing login tracking:",
      error
    );
    throw error;
  }
};
