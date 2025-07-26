import {
  setPersistence,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  config,
  user,
  db,
} from "../../../firebase/Firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  checkLockoutStatus,
  recordFailedAttempt,
  resetLoginAttempts,
  getLockoutMessage,
  MAX_LOGIN_ATTEMPTS,
  initializeLoginTracking,
} from "../../../utils/loginAttempts";

// Import React dependencies
import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../../AuthContext";

import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

function Login() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState("");

  const cancelButtonRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleReset = async (event) => {
    event.preventDefault();

    try {
      await sendPasswordResetEmail(config.auth, email);
      setResetSent(true);
      alert("Email has been sent");
    } catch (error) {
      console.error(error.message);
    }
  };

  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);

  const authenticate = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setLockoutMessage("");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Check if user is locked out before attempting login
    const lockoutStatus = await checkLockoutStatus(email);

    if (lockoutStatus.isLocked) {
      setLockoutMessage(
        `Account is locked due to too many failed attempts. Please try again in ${lockoutStatus.remainingMinutes} minutes.`
      );
      setIsLoading(false);
      return;
    }

    try {
      const userCredentials = await signInWithEmailAndPassword(
        config.auth,
        email,
        password
      );

      // Successful login - reset attempts
      await resetLoginAttempts(email);

      const uid = userCredentials.user.uid;
      const userRef = doc(db, "userLogins", uid);

      // Fetch previous login info
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.lastLogin) {
          alert(
            `Last login was on: ${new Date(
              data.lastLogin.toDate()
            ).toLocaleString()}`
          );
        }
      }

      // Update login time
      await setDoc(
        userRef,
        {
          lastLogin: new Date(),
        },
        { merge: true }
      );

      // Extract account type from email domain
      const emailParts = email.split("@");
      const domainParts = emailParts[1].split(".");
      const accountType = domainParts[domainParts.length - 2];
      user.accountType = accountType;
      user.uid = userCredentials.user.uid;
      user.credentials = userCredentials;

      setIsLoggedIn(true);

      if (user.accountType === "clinic") {
        navigate("/clinic");
      } else if (user.accountType === "patient") {
        navigate("/patient");
      } else if (user.accountType === "locator") {
        navigate("/locator");
      } else if (user.accountType === "admin") {
        navigate("/admin");
      } else if (user.accountType === "cad") {
        navigate("/clinic-admin");
      } else if (user.accountType === "staff") {
        navigate("/clinic-staff");
      } else {
        navigate("/patient");
      }
    } catch (error) {
      try {
        // Record failed attempt
        await recordFailedAttempt(email);

        // Check lockout status after recording the attempt
        const updatedLockoutStatus = await checkLockoutStatus(email);

        // Get user-friendly message
        const message = getLockoutMessage(updatedLockoutStatus);
        setLockoutMessage(message);
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
        setLockoutMessage("Invalid username and/or password.");
      }

      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="loginPage" className="flex justify-center items-center h-screen w-screen">
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon
                          className="h-6 w-6 text-red-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Reset your Password!
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Assuming you enter a verified email address, an email will be sent to you containing a link to reset your password.
                          </p>
                          <br />
                          {resetSent ? (
                            <p>Password reset email sent. Check your inbox.</p>
                          ) : (
                            <form onSubmit={handleReset}>
                              <label htmlFor="email">Enter your email:</label>
                              <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ marginLeft: "20px" }}
                                placeholder="Enter your Email Address"
                              />
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                      onClick={(event) => {
                        setOpen(false);
                        handleReset(event);
                      }}
                      style={{ marginLeft: "20px" }}
                    >
                      Send Reset Password Link
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="w-screen h-3/4">
        <div className="mb-5">
          <h1 className="enriqueta text-center text-2xl">Health Center System</h1>
        </div>

        <form
          id="shadow"
          action=""
          className="bg-slate-50 h-max lg:w-2/6 sm:w-5/12 w-full rounded-lg place-items-center p-10 mx-auto"
        >
          <h1 className="exo font-bold text-xl mb-4">Sign in to your account</h1>
          <label htmlFor="email" className="lato text-sm mt-10">Your email</label>
          <input
            type="text"
            id="email"
            placeholder="Email"
            className="rounded-lg border block w-full mb-5 h-9 mx-auto ps-4"
          />
          <label htmlFor="password" className="lato text-sm mt-10">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            className="rounded-lg border block w-full h-9 mx-auto mb-5 ps-4"
          />
          <a
            className="block w-full mx-auto text-blue-600 text-center mb-5 hover:underline"
            onClick={() => {
              setOpen(true);
            }}
          >
            Reset / Forgot Password?
          </a>

          {lockoutMessage && (
            <div className="mb-4 p-3 rounded-lg text-sm font-medium text-center">
              {lockoutMessage.includes("locked") ? (
                <div className="bg-red-100 text-red-700 border border-red-300">
                  {lockoutMessage}
                </div>
              ) : lockoutMessage.includes("remaining") ? (
                <div className="bg-yellow-100 text-yellow-700 border border-yellow-300">
                  {lockoutMessage}
                </div>
              ) : (
                <div className="bg-red-100 text-red-700 border border-red-300">
                  {lockoutMessage}
                </div>
              )}
            </div>
          )}

          <button
            onClick={authenticate}
            disabled={isLoading}
            className={`rounded-full w-full h-10 font-bold lato text-slate-50 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-600"
            }`}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;