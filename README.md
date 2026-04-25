# NSS Mini Project Documentation

This repository contains a full-stack NSS (National Service Scheme) activity management system with:

- A React frontend in `frontend`
- A Node.js/Express backend in `backend`
- MongoDB as the data store
- JWT-based authentication

---

## 1. Project Goals

The application is designed to manage NSS workflows for two roles:

- `admin` (Coordinator): manages students, events, attendance, certificates, and profile settings
- `student`: views dashboard, activities, attendance, certificates, and profile

Primary business capabilities:

- Student onboarding and records
- Activity/event creation and tracking
- Attendance marking with automatic NSS hour updates
- Certificate issuance and downloadable proof documents

---

## 2. Tech Stack

### Frontend

- React (Create React App)
- React Router
- Lucide React (icons)
- Plain CSS (`global.css`, `components.css`, `pages.css`)

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- File upload handling (`multer`)
- CORS + dotenv

---

## 3. Repository Structure

```text
NSS-MINI-PROJECT/
  backend/
    config/
      db.js
    controllers/
      authController.js
      studentController.js
      eventController.js
      attendanceController.js
    middleware/
      auth.js
    models/
      User.js
      Student.js
      Event.js
      Attendance.js
      certificate.js
    routes/
      auth.js
      students.js
      events.js
      attendance.js
      certificate.js
    server.js
    package.json
    package-lock.json

  frontend/
    public/
      index.html
      manifest.json
      robots.txt
      nss.jpg
    src/
      components/
      pages/
      services/
      styles/
      App.js
      index.js
    package.json
    package-lock.json
```

---

## 4. Architecture Overview

### Request flow

1. User signs in from frontend (`/` page).
2. Backend validates credentials and returns JWT token.
3. Frontend stores token and user meta in `localStorage`.
4. Protected pages attach token as `Authorization: Bearer <token>`.
5. Backend `auth` middleware verifies token and allows route access.

### Data flow

- Frontend service layer in `frontend/src/services/api.js` calls backend APIs.
- Backend routes delegate logic to controllers/models.
- MongoDB stores users, students, events, attendance, certificates.
- Uploaded certificate files are served from `/uploads/certificates`.

---

## 5. Backend Internals

### Entry and middleware

- `backend/server.js`
  - Loads env vars via `dotenv`
  - Connects database via `connectDB()`
  - Enables CORS for `http://localhost:3000` and `http://localhost:3001`
  - Registers JSON parser
  - Serves static uploads under `/uploads`
  - Mounts route modules under `/api/*`

### Database models

- `User`
  - `name`, `email` (unique), `password`, `role: admin|student`
- `Student`
  - `user` reference, `rollNumber` (unique), `department`, `year`, `totalHours`
- `Event`
  - `title`, `description`, `date`, `location`, `hours`, `maxParticipants`, `category`, `createdBy`
- `Attendance`
  - `student`, `event`, `status: present|absent`
- `Certificate`
  - `student`, `activity`, `title`, `type`, `issuedBy`, `fileUrl`

### Route modules

- `/api/auth` -> register/login/update-profile
- `/api/students` -> student list/add/delete/profile/dashboard
- `/api/events` -> list/create/update/delete events
- `/api/attendance` -> mark attendance/get my attendance
- `/api/certificates` -> list/add/delete certificates + file upload

---

## 6. Frontend Internals

### App routing

`frontend/src/App.js` defines:

- Public route:
  - `/` -> `Landing`
- Student routes:
  - `/student`
  - `/student/activities`
  - `/student/attendance`
  - `/student/certificates`
  - `/student/profile`
- Coordinator routes:
  - `/coordinator`
  - `/coordinator/students`
  - `/coordinator/activities`
  - `/coordinator/attendance`
  - `/coordinator/certificates`
  - `/coordinator/settings`

Route protection uses token and `userRole` from `localStorage`.

### Reusable components

- `Button`, `Input`, `Card`, `Badge`, `Sidebar`
- `Sidebar` renders role-specific menu links

### API integration

- `frontend/src/services/api.js` contains reusable API calls:
  - auth (`loginUser`, `registerUser`)
  - events (`getActivities`, `createActivity`, `deleteActivity`)
  - students (`getStudents`, `getMyProfile`, `getDashboard`)
  - attendance (`getMyAttendance`, `markAttendance`)

---

## 7. Environment Setup

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_random_secret
PORT=5000
```

Notes:

- `MONGO_URI` is required for DB connection.
- `JWT_SECRET` is required for token signing/verification.
- `PORT` defaults to `5000` if omitted.

---

## 8. How to Run Correctly

Use two terminals.

### Terminal 1: Backend

```bash
cd backend
npm install
npm start
```

Expected logs:

- MongoDB connected
- Server running on `http://localhost:5000`

### Terminal 2: Frontend

```bash
cd frontend
npm install
npm start
```

Frontend opens at:

- `http://localhost:3000`

### Quick checks

- Backend health: `http://localhost:5000/`
- Frontend login page: `http://localhost:3000/`

---

## 9. Scripts

### Backend (`backend/package.json`)

- `npm start` -> starts backend server
- `npm run dev` -> currently uses a machine-specific hardcoded path and is not portable in this repo state

### Frontend (`frontend/package.json`)

- `npm start` -> development server
- `npm test` -> tests
- `npm run build` -> production build

---

## 10. Security and Reliability Notes

Current codebase works functionally, but for stronger production readiness:

- Add strict backend role authorization checks (`admin` vs `student`) per route
- Add request body validation (required fields, data types, ranges)
- Restrict upload size/types in multer config
- Avoid exposing raw database errors in API responses
- Move frontend API base URL to environment configuration

---

## 11. Related Docs

For endpoint-level API contract and Postman-ready request/response samples, see:

- `backend/API_CONTRACT.md`
