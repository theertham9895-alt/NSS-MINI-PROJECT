const API_URL = 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const loginUser = async (email, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  } catch (err) { return { error: 'Server offline' }; }
};

export const registerUser = async (userData) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
    return res.json();
  } catch (err) { return { error: 'Server offline' }; }
};

export const getActivities = async () => {
  try {
    const res = await fetch(`${API_URL}/events`, { headers: authHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) { return []; }
};

export const createActivity = async (eventData) => {
  try {
    const res = await fetch(`${API_URL}/events`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(eventData) });
    return res.json();
  } catch (err) { return { error: 'Server offline' }; }
};

export const deleteActivity = async (id) => {
  try {
    const res = await fetch(`${API_URL}/events/${id}`, { method: 'DELETE', headers: authHeaders() });
    return res.json();
  } catch (err) { return { error: 'Server offline' }; }
};

export const getStudents = async () => {
  try {
    const res = await fetch(`${API_URL}/students`, { headers: authHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) { return []; }
};

export const getMyProfile = async () => {
  try {
    const res = await fetch(`${API_URL}/students/profile`, { headers: authHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) { return null; }
};

export const getDashboard = async () => {
  try {
    const res = await fetch(`${API_URL}/students/dashboard`, { headers: authHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) { return null; }
};

export const getMyAttendance = async () => {
  try {
    const res = await fetch(`${API_URL}/attendance/my`, { headers: authHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) { return []; }
};

export const markAttendance = async (eventId, studentId, status) => {
  try {
    const res = await fetch(`${API_URL}/attendance/mark`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ eventId, studentId, status }) });
    return res.json();
  } catch (err) { return { error: 'Server offline' }; }
};