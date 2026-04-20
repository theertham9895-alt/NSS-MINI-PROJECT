import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

import Landing from './pages/Landing';
import StudentDashboard from './pages/StudentDashboard';
import StudentActivities from './pages/StudentActivities';
import StudentAttendance from './pages/StudentAttendance';
import StudentCertificates from './pages/StudentCertificates';
import StudentProfile from './pages/StudentProfile';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import CoordinatorStudents from './pages/CoordinatorStudents';
import CoordinatorActivities from './pages/CoordinatorActivities';
import CoordinatorAttendance from './pages/CoordinatorAttendance';
import CoordinatorCertificates from './pages/CoordinatorCertificates';
import CoordinatorSettings from './pages/CoordinatorSettings';

// Protected route — checks token and role
function ProtectedRoute({ element, requiredRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/" replace />;

  if (requiredRole === 'student' && role !== 'student') {
    return <Navigate to="/coordinator" replace />;
  }

  if (requiredRole === 'admin' && role !== 'admin') {
    return <Navigate to="/student" replace />;
  }

  return element;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />

        {/* Student Routes — only accessible if role = student */}
        <Route path="/student" element={<ProtectedRoute element={<StudentDashboard />} requiredRole="student" />} />
        <Route path="/student/activities" element={<ProtectedRoute element={<StudentActivities />} requiredRole="student" />} />
        <Route path="/student/attendance" element={<ProtectedRoute element={<StudentAttendance />} requiredRole="student" />} />
        <Route path="/student/certificates" element={<ProtectedRoute element={<StudentCertificates />} requiredRole="student" />} />
        <Route path="/student/profile" element={<ProtectedRoute element={<StudentProfile />} requiredRole="student" />} />

        {/* Coordinator Routes — only accessible if role = admin */}
        <Route path="/coordinator" element={<ProtectedRoute element={<CoordinatorDashboard />} requiredRole="admin" />} />
        <Route path="/coordinator/students" element={<ProtectedRoute element={<CoordinatorStudents />} requiredRole="admin" />} />
        <Route path="/coordinator/activities" element={<ProtectedRoute element={<CoordinatorActivities />} requiredRole="admin" />} />
        <Route path="/coordinator/attendance" element={<ProtectedRoute element={<CoordinatorAttendance />} requiredRole="admin" />} />
        <Route path="/coordinator/certificates" element={<ProtectedRoute element={<CoordinatorCertificates />} requiredRole="admin" />} />
        <Route path="/coordinator/settings" element={<ProtectedRoute element={<CoordinatorSettings />} requiredRole="admin" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;