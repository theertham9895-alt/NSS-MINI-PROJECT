import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

import Landing from './pages/Landing';
import StudentDashboard from './pages/StudentDashboard';
import StudentActivities from './pages/StudentActivities';
import StudentAttendance from './pages/StudentAttendance';
import StudentCertificates from './pages/StudentCertificates';
import StudentNotifications from './pages/StudentNotifications';
import StudentProfile from './pages/StudentProfile';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import CoordinatorStudents from './pages/CoordinatorStudents';
import CoordinatorActivities from './pages/CoordinatorActivities';
import CoordinatorAttendance from './pages/CoordinatorAttendance';
import CoordinatorCertificates from './pages/CoordinatorCertificates';
import CoordinatorSettings from './pages/CoordinatorSettings';
import { connectSocket, disconnectSocket } from './services/socket';
import { getMyNotifications } from './services/api';

// Protected route — checks token and role
function ProtectedRoute({ element, requiredRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  if (!token) return <Navigate to="/" replace />;

  if (requiredRole === 'student' && role !== 'student') {
    return <Navigate to="/coordinator" replace />;
  }

  if (requiredRole === 'admin' && !['admin', 'coordinator'].includes(role)) {
    return <Navigate to="/student" replace />;
  }

  return element;
}

function App() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'student') {
      localStorage.setItem('unreadNotifications', '0');
      return;
    }

    const syncInitialUnread = async () => {
      const list = await getMyNotifications();
      const unread = Array.isArray(list) ? list.filter((n) => !n.isRead).length : 0;
      localStorage.setItem('unreadNotifications', String(unread));
      window.dispatchEvent(new CustomEvent('notifications:count', { detail: unread }));

      const shownKey = `shownNotifIds:${localStorage.getItem('userRole')}:${localStorage.getItem('userEmail')}`;
      const shownIds = new Set(JSON.parse(localStorage.getItem(shownKey) || '[]'));

      if (Array.isArray(list) && list.length > 0) {
        // Show only unread notifications never shown as toasts before.
        const unreadItems = list.filter((n) => !n.isRead && !shownIds.has(n._id)).slice(0, 3);
        if (unreadItems.length > 0) {
          unreadItems.forEach((item) => shownIds.add(item._id));
          localStorage.setItem(shownKey, JSON.stringify(Array.from(shownIds)));

          setToasts((prev) => ([
            ...prev,
            ...unreadItems.map((item) => ({
              ...item,
              toastId: `initial-${item._id}-${Date.now()}`
            }))
          ]));
        }
      }
    };
    syncInitialUnread();

    const socket = connectSocket(token);
    if (!socket) return;

    const onNotification = (payload) => {
      const shownKey = `shownNotifIds:${localStorage.getItem('userRole')}:${localStorage.getItem('userEmail')}`;
      const shownIds = new Set(JSON.parse(localStorage.getItem(shownKey) || '[]'));
      shownIds.add(payload._id);
      localStorage.setItem(shownKey, JSON.stringify(Array.from(shownIds)));

      setToasts((prev) => [...prev, { ...payload, toastId: `${payload._id}-${Date.now()}` }]);
      const current = Number(localStorage.getItem('unreadNotifications') || 0);
      const next = current + 1;
      localStorage.setItem('unreadNotifications', String(next));
      window.dispatchEvent(new CustomEvent('notifications:count', { detail: next }));
    };

    socket.on('notification:new', onNotification);
    return () => {
      socket.off('notification:new', onNotification);
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return undefined;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3500);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <BrowserRouter>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map((toast) => (
          <div
            key={toast.toastId}
            style={{
              minWidth: '280px',
              maxWidth: '340px',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>{toast.title}</p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{toast.message}</p>
          </div>
        ))}
      </div>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />

        {/* Student Routes — only accessible if role = student */}
        <Route path="/student" element={<ProtectedRoute element={<StudentDashboard />} requiredRole="student" />} />
        <Route path="/student/activities" element={<ProtectedRoute element={<StudentActivities />} requiredRole="student" />} />
        <Route path="/student/attendance" element={<ProtectedRoute element={<StudentAttendance />} requiredRole="student" />} />
        <Route path="/student/certificates" element={<ProtectedRoute element={<StudentCertificates />} requiredRole="student" />} />
        <Route path="/student/notifications" element={<ProtectedRoute element={<StudentNotifications />} requiredRole="student" />} />
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