import React from "react";
import { Routes, Route } from "react-router-dom";

// Components
import Navbar from "./pages/noAuth/components/Navbar";
import Landing from "./pages/noAuth/landing/Landing";
import Information from "./pages/noAuth/information/Information";
import QA from "./pages/noAuth/qa/QA";
import Login from "./pages/noAuth/login/Login";
import Pdashboard from "./pages/auth/patient/Pdashboard";
import { AuthProvider } from "./AuthContext";
import Footer from "./pages/noAuth/components/Footer";
import Test from "./pages/auth/patient/Test";

// NEW CHANGES
import AdminDashboard from "./pages/auth/admin/AdminDashboard";
import ClinicAdminDashboard from "./pages/auth/clinicAdmin/ClinicAdminDashboard";
import StaffList from "./pages/auth/clinicAdmin/staffForm/StaffList";
import StaffDashboard from "./pages/auth/staff/StaffDashboard";
import PatientList from "./pages/auth/staff/patientForm/PatientList";
import PersonalInformation from "./pages/auth/patient/PersonalInformation";
import RecordDiagnoses from "./pages/auth/patient/RecordDiagnoses";
import PersonalInfo from "./pages/auth/patient/PersonalInfo";

import Policy from "./pages/noAuth/policies/Policy";
import Terms from "./pages/noAuth/policies/Terms";
import ClinicVisits from "./pages/auth/staff/ClinicVisits";

// Centralized Authorization
import ProtectedRoute from "./components/ProtectedRoute";
import { USER_ROLES } from "./utils/AuthorizationManager";

const App = () => {
  return (
    <AuthProvider>
      <div className="h-max w-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/aboutus"
            element={<Information />}
          />
          <Route path="/questions" element={<QA />} />
          <Route path="/login" element={<Login />} />
          <Route path="/policies" element={<Policy />} />
          <Route path="/tac" element={<Terms />} />
          {/* SUPER ADMIN ROUTES */}
          <Route
            exact
            path="/admin"
            element={
              <ProtectedRoute
                requiredRole={USER_ROLES.ADMIN}
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* CLINIC ADMIN ROUTES */}
          <Route
            exact
            path="/clinic-admin"
            element={
              <ProtectedRoute
                requiredRole={USER_ROLES.CLINIC_ADMIN}
              >
                <ClinicAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/clinic-admin/stafflist"
            element={
              <ProtectedRoute
                requiredRole={USER_ROLES.CLINIC_ADMIN}
              >
                <StaffList />
              </ProtectedRoute>
            }
          />

          {/* STAFF ROUTES */}
          <Route
            exact
            path="/clinic-staff"
            element={
              <ProtectedRoute
                requiredRole={USER_ROLES.STAFF}
              >
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            exact
            path="/clinic-staff/patientlist"
            element={
              <ProtectedRoute
                requiredRole={USER_ROLES.STAFF}
              >
                <PatientList />
              </ProtectedRoute>
            }
          />

          <Route
            exact
            path="/clinic-staff/clinic-visits"
            element={
              <ProtectedRoute
                requiredRole={USER_ROLES.STAFF}
              >
                <ClinicVisits />
              </ProtectedRoute>
            }
          />

          {/* PATIENT ROUTES */}
          <Route
            exact
            path="/patient/personal-information"
            element={
              <ProtectedRoute
                requiredRole={USER_ROLES.PATIENT}
              >
                <PersonalInformation />
              </ProtectedRoute>
            }
          />

          <Route
            exact
            path="/patient/record-diagnoses"
            element={
              <ProtectedRoute
                requiredRole={USER_ROLES.PATIENT}
              >
                <RecordDiagnoses />
              </ProtectedRoute>
            }
          />

          <Route
            exact
            path="/patient"
            element={
              <ProtectedRoute
                requiredRole={USER_ROLES.PATIENT}
              >
                <Pdashboard />
              </ProtectedRoute>
            }
          />

          <Route
            exact
            path="/patient/PersonalInfo"
            element={
              <ProtectedRoute
                requiredRole={USER_ROLES.PATIENT}
              >
                <PersonalInfo />
              </ProtectedRoute>
            }
          />

          <Route
            exact
            path="/test"
            element={
              <ProtectedRoute
                requiredRole={USER_ROLES.PATIENT}
              >
                <Test />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
