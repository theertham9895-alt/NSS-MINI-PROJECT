import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { getActivities, getStudents } from '../services/api';
import { CheckCircle, XCircle, Clock, Save } from 'lucide-react';

function CoordinatorAttendance() {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    getActivities().then(data => setActivities(Array.isArray(data) ? data : []));
    getStudents().then(data => setStudents(Array.isArray(data) ? data : []));
  }, []);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedActivity) return;
    setSaving(true);
    setSavedMsg('');
    const token = localStorage.getItem('token');

    try {
      // Save attendance for each student
      for (const student of students) {
        const status = attendance[student._id] || 'present';
        await fetch('http://localhost:5000/api/attendance/mark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            eventId: selectedActivity._id,
            studentId: student._id,
            status
          })
        });
      }
      setSavedMsg('✅ Attendance saved successfully!');
    } catch (err) {
      setSavedMsg('❌ Failed to save attendance');
    }
    setSaving(false);
  };

  const getStatus = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    const diff = date - today;
    if (diff > 86400000) return 'upcoming';
    if (diff > -86400000) return 'ongoing';
    return 'completed';
  };

  return (
    <div>
      <Sidebar role="coordinator" userName="Coordinator" userEmail="coordinator@example.com" />

      <main className="main-layout">
        <header className="page-header">
          <h1>Mark Attendance</h1>
          {selectedActivity && students.length > 0 && (
            <Button onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Attendance'}
            </Button>
          )}
        </header>

        <div className="page-content">

          {/* Success/Error Message */}
          {savedMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              backgroundColor: savedMsg.includes('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)',
              border: `1px solid ${savedMsg.includes('✅') ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)'}`,
              color: savedMsg.includes('✅') ? '#22c55e' : '#ef4444',
              fontSize: '14px'
            }}>
              {savedMsg}
            </div>
          )}

          {/* Select Activity */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader>
              <CardTitle>Select Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  No activities found. Create an activity first.
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activities.map((activity) => {
                    const status = getStatus(activity.date);
                    return (
                      <Button
                        key={activity._id}
                        variant={selectedActivity?._id === activity._id ? 'primary' : 'outline'}
                        onClick={() => {
                          setSelectedActivity(activity);
                          setAttendance({});
                          setSavedMsg('');
                        }}
                      >
                        {activity.title}
                        <Badge variant={
                          status === 'upcoming' ? 'warning' :
                          status === 'ongoing' ? 'primary' : 'outline'
                        } style={{ marginLeft: '8px' }}>
                          {status}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Table */}
          {selectedActivity && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedActivity.title} — {students.length} students
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="empty-state">
                    <Clock size={64} className="empty-state-icon" />
                    <p className="empty-state-title">No students registered</p>
                    <p className="empty-state-description">Add students first to mark attendance</p>
                  </div>
                ) : (
                  <>
                    {/* Quick actions */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      <Button size="sm" variant="outline" onClick={() => {
                        const all = {};
                        students.forEach(s => all[s._id] = 'present');
                        setAttendance(all);
                      }}>
                        ✅ Mark All Present
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        const all = {};
                        students.forEach(s => all[s._id] = 'absent');
                        setAttendance(all);
                      }}>
                        ❌ Mark All Absent
                      </Button>
                    </div>

                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Roll No</th>
                          <th>Department</th>
                          <th>Status</th>
                          <th>Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => {
                          const status = attendance[student._id] || 'present';
                          return (
                            <tr key={student._id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div className="avatar avatar-sm avatar-primary">
                                    {student.name?.charAt(0)?.toUpperCase()}
                                  </div>
                                  <p style={{ fontWeight: 500 }}>{student.name}</p>
                                </div>
                              </td>
                              <td>{student.rollNumber}</td>
                              <td>{student.department}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <Button
                                    size="sm"
                                    variant={status === 'present' ? 'primary' : 'outline'}
                                    onClick={() => handleStatusChange(student._id, 'present')}
                                  >
                                    <CheckCircle size={14} /> Present
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={status === 'absent' ? 'primary' : 'outline'}
                                    onClick={() => handleStatusChange(student._id, 'absent')}
                                    style={status === 'absent' ? { backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' } : {}}
                                  >
                                    <XCircle size={14} /> Absent
                                  </Button>
                                </div>
                              </td>
                              <td>
                                <Badge variant={status === 'present' ? 'primary' : 'outline'}>
                                  {status === 'present' ? `+${selectedActivity.hours || 0}h` : '-'}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Save button at bottom too */}
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                      <Button onClick={handleSave} disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Attendance'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {!selectedActivity && (
            <Card>
              <CardContent>
                <div className="empty-state">
                  <Clock size={64} className="empty-state-icon" />
                  <p className="empty-state-title">Select an activity</p>
                  <p className="empty-state-description">Choose an activity above to mark attendance</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default CoordinatorAttendance;