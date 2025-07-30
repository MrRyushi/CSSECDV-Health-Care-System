import React, {
  createContext,
  useState,
  useEffect,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { config } from "./firebase/Firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isInSetup, setIsInSetup] = useState(false);

  useEffect(() => {
    // Listen to Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(
      config.auth,
      (user) => {
        if (user) {
          // User is signed in
          setIsLoggedIn(true);
        } else {
          // User is signed out
          setIsLoggedIn(false);
          setIsInSetup(false); // Reset setup state when user logs out
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        loading,
        isInSetup,
        setIsInSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
