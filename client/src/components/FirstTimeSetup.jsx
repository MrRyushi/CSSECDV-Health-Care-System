import React, { useState, useEffect } from "react";
import {
  getRandomSecurityQuestions,
  validateSecurityAnswer,
  hashSecurityAnswer,
} from "../utils/SecurityQuestions";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/Firebase";
import { useSecurityLogging } from "../utils/LoggingSystem";
import { updatePassword } from "firebase/auth";
import { config } from "../firebase/Firebase";

/**
 * First Time Setup Component
 * Handles password change and security questions setup for new users
 * Required for all users on their first login
 */
const FirstTimeSetup = ({ user, onComplete }) => {
  const [step, setStep] = useState(1); // 1: password change, 2: security questions
  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [securityQuestions, setSecurityQuestions] =
    useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { logEvent, logSystemError } = useSecurityLogging();

  useEffect(() => {
    // Generate security questions for the user
    const questions = getRandomSecurityQuestions(3);
    setSecurityQuestions(questions);
  }, []);

  // Step 1: Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate passwords
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      if (newPassword.length < 8) {
        setError(
          "Password must be at least 8 characters long"
        );
        return;
      }

      // Update password in Firebase Auth
      await updatePassword(user, newPassword);

      // Log successful password change
      await logEvent("password_changed", "info", {
        userId: user.uid,
        userEmail: user.email,
        context: "first_time_setup",
      });

      // Move to security questions step
      setStep(2);
    } catch (error) {
      const errorMessage =
        error.code === "auth/wrong-password"
          ? "Current password is incorrect"
          : "Failed to update password. Please try again.";
      setError(errorMessage);

      await logSystemError(
        error,
        "first-time-password-change"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Set up security questions
  const handleSecurityQuestionsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate all answers
      const validationErrors = [];
      const hashedAnswers = {};

      for (const question of securityQuestions) {
        const answer = answers[question.id];
        if (!answer || answer.trim() === "") {
          validationErrors.push(
            `Please answer: ${question.question}`
          );
          continue;
        }

        const validation = validateSecurityAnswer(
          question.id,
          answer
        );
        if (!validation.success) {
          validationErrors.push(
            `${question.question}: ${validation.message}`
          );
          continue;
        }

        // Hash the answer for secure storage
        hashedAnswers[question.id] =
          await hashSecurityAnswer(answer);
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join("\n"));
        return;
      }

      // Store security questions and answers in Firestore
      const userRef = doc(db, "userLogins", user.uid);
      await updateDoc(userRef, {
        securityQuestions: securityQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          category: q.category,
        })),
        securityAnswers: hashedAnswers,
        firstTimeSetupCompleted: true,
        setupCompletedAt: new Date(),
      });

      // Log successful security questions setup
      await logEvent("security_questions_setup", "info", {
        userId: user.uid,
        userEmail: user.email,
        questionsCount: securityQuestions.length,
      });

      // Complete setup
      onComplete();
    } catch (error) {
      setError(
        "Failed to save security questions. Please try again."
      );
      await logSystemError(
        error,
        "first-time-security-questions"
      );
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Welcome! Let's Set Up Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              For security reasons, please change your
              temporary password
            </p>
          </div>

          <form
            className="mt-8 space-y-6"
            onSubmit={handlePasswordChange}
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Password (Temporary)
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your temporary password"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your new password"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Set Up Security Questions
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              These will be used for password reset if
              needed
            </p>
          </div>

          <form
            className="mt-8 space-y-6"
            onSubmit={handleSecurityQuestionsSubmit}
          >
            <div className="space-y-4">
              {securityQuestions.map((question, index) => (
                <div key={question.id}>
                  <label
                    htmlFor={question.id}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {index + 1}. {question.question}
                  </label>
                  <input
                    id={question.id}
                    name={question.id}
                    type="text"
                    required
                    value={answers[question.id] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your answer"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Please provide a specific answer (at
                    least 3 characters)
                  </p>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded whitespace-pre-line">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {loading ? "Setting Up..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default FirstTimeSetup;
