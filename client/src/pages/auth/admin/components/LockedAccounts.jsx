import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../../firebase/Firebase";
import { unlockAccount } from "../../../../utils/loginAttempts";

const LockedAccounts = () => {
  const [lockedAccounts, setLockedAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState({});

  useEffect(() => {
    fetchLockedAccounts();
  }, []);

  const fetchLockedAccounts = async () => {
    try {
      setLoading(true);
      const loginAttemptsRef = collection(
        db,
        "loginAttempts"
      );
      const q = query(
        loginAttemptsRef,
        where("isLocked", "==", true)
      );
      const querySnapshot = await getDocs(q);

      const accounts = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        accounts.push({
          id: doc.id,
          email: doc.id,
          attempts: data.attempts || 0,
          lockoutUntil: data.lockoutUntil,
          lastFailedAttempt: data.lastFailedAttempt,
          ...data,
        });
      });

      setLockedAccounts(accounts);
    } catch (error) {
      console.error(
        "Error fetching locked accounts:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockAccount = async (email) => {
    try {
      setUnlocking((prev) => ({ ...prev, [email]: true }));
      await unlockAccount(email);

      // Remove from local state
      setLockedAccounts((prev) =>
        prev.filter((account) => account.email !== email)
      );

      alert(
        `Account ${email} has been unlocked successfully.`
      );
    } catch (error) {
      console.error("Error unlocking account:", error);
      alert("Failed to unlock account. Please try again.");
    } finally {
      setUnlocking((prev) => ({ ...prev, [email]: false }));
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  const getRemainingTime = (lockoutUntil) => {
    if (!lockoutUntil) return "N/A";
    const now = Date.now();
    const remaining = lockoutUntil - now;

    if (remaining <= 0) return "Expired";

    const minutes = Math.ceil(remaining / (60 * 1000));
    return `${minutes} minutes`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">
          Loading locked accounts...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Locked Accounts
        </h2>
        <button
          onClick={fetchLockedAccounts}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {lockedAccounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            No accounts are currently locked.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failed Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lockout Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Failed Attempt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lockedAccounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {account.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.attempts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(account.lockoutUntil)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getRemainingTime(account.lockoutUntil)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(account.lastFailedAttempt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() =>
                        handleUnlockAccount(account.email)
                      }
                      disabled={unlocking[account.email]}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        unlocking[account.email]
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {unlocking[account.email]
                        ? "Unlocking..."
                        : "Unlock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LockedAccounts;
