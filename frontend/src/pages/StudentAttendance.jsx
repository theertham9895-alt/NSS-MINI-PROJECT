import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Badge from '../components/Badge';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function StudentAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Student');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || 'Student');
    setUserEmail(localStorage.getItem('userEmail') || '');
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/attendance/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAttendanceRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load attendance:', err);
      setAttendanceRecords([]);
    }
    setLoading(false);
  };

  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const totalHours = attendanceRecords
    .filter(r => r.status === 'present')
    .reduce((sum, r) => sum + (r.event?.hours || 0), 0);
  const attendanceRate = attendanceRecords.length > 0
    ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;

  if (loading) {
    return (
      <div>
        <Sidebar role="student" userName="Student" userEmail="" />
        <main className="main-layout">
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading attendance...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="student" userName={userName} userEmail={userEmail} />

      <main className="main-layout">
        <header className="page-header">
          <h1>My Attendance</h1>
        </header>

        <div className="page-content">
          {/* Stats */}
          <div className="stats-grid">
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <div className="stat-card">
                  <div className="icon-box icon-box-lg icon-box-primary">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="stat-label">Total Hours</p>
                    <p className="stat-value">{totalHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <div className="stat-card">
                  <div className="icon-box icon-box-lg icon-box-success">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="stat-label">Present</p>
                    <p className="stat-value">{presentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <div className="stat-card">
                  <div className="icon-box icon-box-lg" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: 'var(--color-error)' }}>
                    <XCircle size={24} />
                  </div>
                  <div>
                    <p className="stat-label">Absent</p>
                    <p className="stat-value">{absentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <div className="stat-card">
                  <div className="icon-box icon-box-lg icon-box-accent">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <p className="stat-label">Attendance Rate</p>
                    <p className="stat-value">{attendanceRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length === 0 ? (
                <div className="empty-state">
                  <Clock size={64} className="empty-state-icon" />
                  <p className="empty-state-title">No attendance records yet</p>
                  <p className="empty-state-description">
                    Your attendance will appear here once coordinator marks it
                  </p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record._id}>
                        <td style={{ fontWeight: 500 }}>
                          {record.event?.title || 'N/A'}
                        </td>
                        <td>
                          {record.event?.date
                            ? new Date(record.event.date).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })
                            : 'N/A'}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {record.event?.location || 'N/A'}
                        </td>
                        <td>
                          <Badge variant={record.status === 'present' ? 'primary' : 'error'}>
                            {record.status}
                          </Badge>
                        </td>
                        <td>
                          <span style={{ color: record.status === 'present' ? 'var(--color-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>
                            {record.status === 'present' ? `+${record.event?.hours || 0}h` : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default StudentAttendance;