import React, { useState, useEffect } from "react";
import {
  getRandomSecurityQuestions,
  validateSecurityAnswer,
  verifySecurityAnswer,
  hashSecurityAnswer,
} from "../utils/SecurityQuestions";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/Firebase";
import { useSecurityLogging } from "../utils/LoggingSystem";
import { updatePassword } from "firebase/auth";
import { config } from "../firebase/Firebase";

/**
 * Security Questions Password Reset Component
 * Implements secure password reset using security questions
 * Avoids common answers like "The Bible" for "favorite book"
 */
const SecurityQuestionsReset = ({
  email: initialEmail,
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState(1); // 1: email, 2: questions, 3: new password
  const [email, setEmail] = useState(initialEmail || "");
  const [userSecurityQuestions, setUserSecurityQuestions] =
    useState([]);
  const [answers, setAnswers] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const { logEvent, logSystemError } = useSecurityLogging();

  // Prevent back button and navigation during password reset
  useEffect(() => {
    // Push current state to prevent back navigation
    window.history.pushState(
      null,
      null,
      window.location.href
    );

    // Handle back button attempts
    const handlePopState = (event) => {
      // Prevent going back
      window.history.pushState(
        null,
        null,
        window.location.href
      );
      // Show warning to user
      alert(
        "⚠️ Password Reset Required: You must complete the password reset process before proceeding. Please continue with the reset process."
      );
    };

    // Handle page refresh/close attempts
    const handleBeforeUnload = (event) => {
      const message =
        "⚠️ Password Reset Required: You must complete the password reset. Are you sure you want to leave?";
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    // Add event listeners
    window.addEventListener("popstate", handlePopState);
    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    // Cleanup function
    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, []);

  // Step 1: Verify email and get user's security questions
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Find user by email in Firestore
      const usersRef = doc(db, "userLogins", email);
      const userDoc = await getDoc(usersRef);

      if (!userDoc.exists()) {
        setError(
          "No account found with this email address."
        );
        return;
      }

      const userData = userDoc.data();

      if (
        !userData.securityQuestions ||
        userData.securityQuestions.length === 0
      ) {
        setError(
          "This account does not have security questions set up. Please contact support."
        );
        return;
      }

      setUserSecurityQuestions(userData.securityQuestions);
      setUserId(userDoc.id);
      setStep(2);

      // Log security questions access attempt
      await logEvent(
        "security_questions_accessed",
        "info",
        { email }
      );
    } catch (error) {
      setError("An error occurred. Please try again.");
      await logSystemError(
        error,
        "security-questions-email-verification"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate security question answers
  const handleAnswersSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate all answers
      for (const question of userSecurityQuestions) {
        const answer = answers[question.id];
        if (!answer || answer.trim() === "") {
          setError(`Please answer all security questions.`);
          return;
        }

        const validation = validateSecurityAnswer(
          question.id,
          answer
        );
        if (!validation.success) {
          setError(validation.message);
          return;
        }
      }

      // Verify answers against stored hashes
      const usersRef = doc(db, "userLogins", userId);
      const userDoc = await getDoc(usersRef);
      const userData = userDoc.data();

      for (const question of userSecurityQuestions) {
        const providedAnswer = answers[question.id];
        const storedHash =
          userData.securityAnswers[question.id];

        const isCorrect = await verifySecurityAnswer(
          providedAnswer,
          storedHash
        );
        if (!isCorrect) {
          setError(
            "One or more security answers are incorrect."
          );
          await logEvent(
            "security_questions_failed",
            "warning",
            {
              email,
              questionId: question.id,
            }
          );
          return;
        }
      }

      // All answers correct, proceed to password reset
      setStep(3);
      await logEvent("security_questions_passed", "info", {
        email,
      });
    } catch (error) {
      setError("An error occurred. Please try again.");
      await logSystemError(
        error,
        "security-questions-validation"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set new password
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 12) {
      setError(
        "Password must be at least 12 characters long."
      );
      return;
    }

    // Check password complexity
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-{}[\]|:;"'<>,.?/~`]).{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      // Update password in Firebase Auth
      if (config.auth.currentUser) {
        await updatePassword(
          config.auth.currentUser,
          newPassword
        );
      }

      // Update password reset info in Firestore
      const usersRef = doc(db, "userLogins", userId);
      await updateDoc(usersRef, {
        passwordResetAt: new Date(),
        lastPasswordChange: new Date(),
      });

      await logEvent("password_reset_success", "info", {
        email,
      });

      // Show success message and redirect to login
      alert(
        "Password reset successfully! You will be redirected to login."
      );
      onSuccess("Password reset successfully!");
    } catch (error) {
      setError(
        "Failed to reset password. Please try again."
      );
      await logSystemError(error, "password-reset-update");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  if (step === 1) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Password Reset
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          Enter your email address to reset your password
          using security questions.
        </p>

        <form onSubmit={handleEmailSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Security Questions
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          Please answer your security questions to reset
          your password.
        </p>

        <form onSubmit={handleAnswersSubmit}>
          {userSecurityQuestions.map((question, index) => (
            <div key={question.id} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {index + 1}. {question.question}
              </label>
              <input
                type="text"
                value={answers[question.id] || ""}
                onChange={(e) =>
                  handleAnswerChange(
                    question.id,
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your answer"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Please provide a specific answer (at least 3
                characters).
              </p>
            </div>
          ))}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Answers"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Set New Password
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          Create a new secure password for your account.
        </p>

        <form onSubmit={handlePasswordReset}>
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 12 characters with uppercase,
              lowercase, number, and special character.
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return null;
};

export default SecurityQuestionsReset;
