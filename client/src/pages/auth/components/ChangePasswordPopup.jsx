import React, { useState } from "react";
import {
  getAuth,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import bcrypt from "bcryptjs";

const ChangePasswordPopup = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] =
    useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isReauthenticating, setIsReauthenticating] =
    useState(true);
  const db = getFirestore();

  const PASSWORD_HISTORY_LIMIT = 5;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const handleReauthentication = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Re-authentication successful, proceed to password change
      setIsReauthenticating(false);
      setError("");
    } catch (err) {
      setError(
        "Current password is incorrect. Please try again."
      );
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    const userRef = doc(db, "users", user.uid);

    if (newPassword.length < 12) {
      setError(
        "Password must be at least 12 characters long."
      );
      return;
    }

    try {
      const docSnap = await getDoc(userRef);
      const userData = docSnap.exists()
        ? docSnap.data()
        : {};
      const passwordHistory =
        userData.passwordHistory || [];
      const lastChanged = userData.lastPasswordChange;

      // 🔐 Check if 24 hours have passed
      if (lastChanged) {
        const now = Date.now();
        const diff = now - lastChanged;

        if (diff < ONE_DAY_MS) {
          const hoursLeft = Math.ceil(
            (ONE_DAY_MS - diff) / (60 * 60 * 1000)
          );
          setError(
            `You can only change your password once every 24 hours. Try again in ${hoursLeft} hour(s).`
          );
          return;
        }
      }

      // 🧂 Hash new password
      const newHash = await bcrypt.hash(newPassword, 10);

      // ⛔ Check if reused
      const reuseResults = await Promise.all(
        passwordHistory.map((ph) =>
          bcrypt.compare(newPassword, ph.hash)
        )
      );
      const isReused = reuseResults.some(
        (result) => result === true
      );

      if (isReused) {
        setError("You cannot reuse a recent password.");
        return;
      }

      // ✅ Update Firebase password
      await updatePassword(user, newPassword);

      // 📝 Update Firestore: save hash + last changed timestamp
      const updatedHistory = [
        { hash: newHash, changedAt: Date.now() },
        ...passwordHistory,
      ].slice(0, PASSWORD_HISTORY_LIMIT);

      await setDoc(
        userRef,
        {
          passwordHistory: updatedHistory,
          lastPasswordChange: Date.now(),
        },
        { merge: true }
      );

      setSuccess(
        "Password updated successfully. You can change it again in 24 hours."
      );
      setError("");

      // Reset form
      setNewPassword("");
      setIsReauthenticating(true);
      setCurrentPassword("");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        setError(
          "For security reasons, please log out and log back in before changing your password."
        );
      } else {
        setError(err.message || "An error occurred.");
      }
      setSuccess("");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <h2>Change Password</h2>
        {isReauthenticating ? (
          <form onSubmit={handleReauthentication}>
            <p
              style={{
                marginBottom: "10px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              Please enter your current password to
              continue.
            </p>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Continue
            </button>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Update Password
            </button>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </form>
        )}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && (
          <p style={{ color: "green" }}>{success}</p>
        )}
      </div>
    </div>
  );
};

// Same style object as before...
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popup: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
  },
  button: {
    padding: "8px 12px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    marginRight: "8px",
  },
  cancelButton: {
    padding: "8px 12px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
  },
};

export default ChangePasswordPopup;
