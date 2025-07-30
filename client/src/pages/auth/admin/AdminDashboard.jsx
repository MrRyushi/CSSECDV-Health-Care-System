import {
  config,
  signInAuth,
} from "../../../firebase/Firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signOut,
  getAuth,
} from "firebase/auth";

import RequiredAsterisk from "./components/asterisk";
import emailjs, { send } from "emailjs-com";
import { useState, useEffect } from "react";
import ChangePasswordPopup from "../components/ChangePasswordPopup";
import {
  validateEmail as validateEmailField,
  validatePassword,
} from "../../../utils/DataValidation";

function AdminDashboard() {
  const [showPopup, setShowPopup] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    emailFormatted: "",
    password: "",
    clinicName: "",
  });

  function formatEmail(email) {
    // Split the email address into the local part and the domain part
    const [localPart, domain] = email.split("@");

    // Create the new email address by concatenating the local part and the new domain
    const newEmail = `${localPart}@healthcare.cad.com`;

    return newEmail;
  }

  function formatClinicName(clinicName) {
    return clinicName.toLowerCase().replace(/ /g, "_");
  }

  function validateEmail(email) {
    const validation = validateEmailField(
      email,
      "gmail.com"
    );
    return validation.success;
  }

  function isPasswordComplex(password) {
    const validation = validatePassword(password);
    return validation.success;
  }

  async function initializeClinic(e) {
    e.preventDefault();

    const firstName = e.target["first-name"].value;
    const lastName = e.target["last-name"].value;
    const email = e.target["email"].value;
    const password = e.target["password"].value;
    const clinicName =
      e.target["clinicName"].value.toLowerCase();

    if (!isPasswordComplex(password)) {
      alert(
        "Password must be at least 12 characters long and include an uppercase letter, lowercase letter, number, and special character."
      );
      return;
    }

    const clinicNameFormatted =
      formatClinicName(clinicName);
    const emailFormatted = formatEmail(
      email,
      clinicNameFormatted
    );

    // Update the formData state
    setFormData({
      ...formData,
      firstName,
      lastName,
      email,
      emailFormatted,
      password,
      clinicName,
    });
  }

  useEffect(() => {
    if (formData.email) {
      try {
        // CREATE USER
        if (!validateEmail(formData.email)) {
          alert(
            "Invalid email domain. Please use an email address with the domain 'gmail.com'"
          );
        } else {
          // Prevent auto sign in
          createUserWithEmailAndPassword(
            signInAuth.auth,
            formData.emailFormatted,
            formData.password
          )
            .then((userCredential) => {
              // Add a new document
              setDoc(
                doc(
                  config.firestore,
                  formData.clinicName,
                  "admin"
                ),
                {
                  firstname: formData.firstName,
                  lastname: formData.lastName,
                  email: formData.email,
                }
              );
              // Save admin user uid and information
              setDoc(
                doc(
                  config.firestore,
                  "clinicAdmins",
                  userCredential.user.uid
                ),
                {
                  clinicName: formData.clinicName,
                }
              );
              // Signed up
              const user = userCredential.user;
              sendEmail();
              // SignOut 2nd authentication
              signOut(getAuth(signInAuth.auth))
                .then(() => {
                  // Sign-out successful.
                })
                .catch((error) => {
                  // An error happened.
                });
              // ...
            })
            .catch((error) => {
              // Log error securely without exposing details
              console.error("Admin user creation failed");

              if (
                error.code == "auth/email-already-exists"
              ) {
                alert("Email address is already in use");
              } else if (
                error.code == "auth/weak-password"
              ) {
                alert(
                  "Password does not meet security requirements"
                );
              } else {
                alert(
                  "Failed to create admin account. Please try again."
                );
              }
            });
        }

        // EMAIL CREDENTIALS
        function sendEmail() {
          console.log("Sending email with data:", formData);
          emailjs
            .send(
              "service_wck5i1f",
              "template_odoejph",
              formData,
              "ylfQTgllFvn4pU4Yw"
            )
            .then(
              (result) => {
                console.log("Email sent:", result.text);
                alert("Email sent successfully!");
              },
              (error) => {
                console.error(
                  "Email error details:",
                  error
                );
                console.error(
                  "Email error text:",
                  error.text
                );
                alert(
                  "Failed to send email. Check console for details."
                );
              }
            );
        }
      } catch (error) {
        console.error("Error initializing clinic:", error);
      }
    }
  }, [formData]);

  return (
    <div className="h-screen flex justify-center items-center shadow-2xl drop-shadow-2xl border border-black">
      <div>
        <div>
          <div className="flex items-start justify-between p-4 border-b rounded-t bg-blue-800">
            <h3 className="text-xl font-semibold text-white-900 dark:text-white">
              Register an Admin
            </h3>
          </div>
          <form
            className="mx-auto h-max bg-slate-50 p-12 exo"
            onSubmit={initializeClinic}
          >
            <div className="border-b border-gray-900/10 pb-12 h-3/5">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    First name <RequiredAsterisk />
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="first-name"
                      id="first-name"
                      autoComplete="given-name"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Last name <RequiredAsterisk />
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="last-name"
                      id="last-name"
                      autoComplete="last-name"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email <RequiredAsterisk />
                  </label>
                  <div className="mt-2">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="clinicName"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Clinic Name <RequiredAsterisk />
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="clinicName"
                      id="clinicName"
                      autoComplete="clinicName"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-full">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Password <RequiredAsterisk />
                  </label>
                  <div className="mt-2">
                    <input
                      type="password"
                      name="password"
                      id="password"
                      autoComplete="current-password"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-3"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button className="rounded-md bg-indigo-600 p-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="mt-3">
          <button
            className="text-center hover:underline underline-offset-4 w-full"
            onClick={() => setShowPopup(true)}
          >
            Change Password
          </button>
          {showPopup && (
            <ChangePasswordPopup
              onClose={() => setShowPopup(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
