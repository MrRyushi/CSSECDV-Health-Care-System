# 🏥 Health Care System Web App

A secure, role-based healthcare management platform built with **React**, **Firebase**, and **Node.js**. This system supports multiple user roles such as Website Administrator, Product Manager (Staff), and Customer (Patient), and includes robust authentication, authorization, and input validation features.

---

## ✅ Pre-Demo Requirements

### 👥 Test Accounts

| Role                | Email                                  | Password              |
|---------------------|----------------------------------------|-----------------------|
| Website Admin       | `admindb@healthcare.admin.com`         | `Passwordpassword123.` |
| Product Manager     | `oro1027chimaru@healthcare.cad.com`    | `Passwordpassword123.` |
| Clinic Staff        | `jp.matchmo@healthcare.staff.com`      | `Passwordpassword123.` |
| Patient (Customer)  | `jptmarcellana@gmail.com`              | `Passwordpassword123.` |

> ⚠️ These accounts are pre-created for demo purposes. Please do not share credentials externally.

---

## 💻 How to Run the Application

### 1. Navigate to the `client` folder
```bash
cd client
```
### 2. Install Dependencites
```bash
npm install
```
### 3. Start Development Server
```bash
npm install
```
The application will run on: http://localhost:3000

## Tech Stack
- Frontend: React.js
- Backend: Node.js (Express)
- Auth & Hosting: Firebase Authentication & Firebase Hosting

## 🔐 Security Features Implemented
🔑 Authentication
✅ Required for all pages and resources (except designated public pages)
✅ Secure authentication failure handling (no detail exposure)
✅ Passwords stored as strong, salted one-way hashes (via Firebase Auth)
✅ Error messages use generic wording (e.g., "Invalid username and/or password")
✅ Enforced password complexity and length policies (via Firebase rules)
✅ Passwords are masked during input (••••••)
✅ Temporary account lockout after 5 failed login attempts
✅ No password reuse allowed
✅ Password age policy: at least 1 day before change
✅ Users are informed of last login (successful/unsuccessful)
✅ Re-authentication required before critical operations (e.g., changing password)
✅ Password reset questions avoided (Firebase uses secure email reset flow)

🛂 Authorization / Access Control
✅ Centralized access control component
✅ Role-based route guarding (admin, staff, patient)
✅ Access control failures handled securely
✅ Enforced business logic flows and role-specific permissions

🧪 Data Validation
✅ All invalid inputs are rejected (not just sanitized)
✅ Strict validation on data type, range, and length
✅ Prevents malformed or unexpected input from being processed

⚠️ Error Handling and Logging
✅ No debug info or stack traces shown to users
✅ Custom error pages and messages
✅ Logging covers:

✔️ Input validation failures
✔️ Authentication attempts (success/failure)
✔️ Access control violations

✅ Logs restricted to website administrators only