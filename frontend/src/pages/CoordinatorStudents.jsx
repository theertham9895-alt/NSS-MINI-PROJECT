import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { getStudents, registerUser } from '../services/api';
import { Plus, Search, Users, X, Trash2, Mail, BookOpen, Calendar } from 'lucide-react';

function CoordinatorStudents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({
    name: '', email: '', rollNo: '', department: '', year: ''
  });

  const loadStudents = () => {
    getStudents().then(data => setStudents(Array.isArray(data) ? data : []));
  };

  useEffect(() => { loadStudents(); }, []);

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5000/api/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedStudent(null);
      loadStudents();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const userResult = await registerUser({
      name: newStudent.name,
      email: newStudent.email,
      password: newStudent.rollNo,
      role: 'student'
    });

    if (userResult.error || !userResult.user) {
      setError(userResult.message || 'Failed to register student. Email may already exist.');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/students/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userResult.user._id,
          rollNumber: newStudent.rollNo,
          department: newStudent.department,
          year: parseInt(newStudent.year)
        })
      });
    } catch (err) {
      console.error('Student profile error:', err);
    }

    setLoading(false);
    setShowAddForm(false);
    setNewStudent({ name: '', email: '', rollNo: '', department: '', year: '' });
    loadStudents();
  };

  return (
    <div>
      <Sidebar role="coordinator" userName="Coordinator" userEmail="coordinator@example.com" />

      <main className="main-layout">
        <header className="page-header">
          <h1>Students</h1>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> Add Student
          </Button>
        </header>

        <div className="page-content">
          {/* Stats */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Volunteers</p>
                <p style={{ fontSize: '32px', fontWeight: 700 }}>{students.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Active This Month</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary)' }}>{students.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Avg. Service Hours</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-accent)' }}>
                  {students.length > 0
                    ? Math.round(students.reduce((sum, s) => sum + (s.totalHours || 0), 0) / students.length)
                    : 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="input-with-icon" style={{ marginBottom: '24px' }}>
            <Search size={18} className="input-icon" />
            <Input
              placeholder="Search students by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle>All Students ({filteredStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="empty-state">
                  <Users size={64} className="empty-state-icon" />
                  <p className="empty-state-title">No students registered yet</p>
                  <p className="empty-state-description">Click "Add Student" to register your first volunteer</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus size={16} /> Add First Student
                  </Button>
                </div>
              ) : (
                <div>
                  {filteredStudents.map((student) => (
                    <div key={student._id} className="student-item">
                      <div className="student-info">
                        <div className="avatar avatar-md avatar-primary">
                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="student-name">{student.name}</p>
                          <p className="student-meta">{student.rollNumber} — {student.department}</p>
                        </div>
                      </div>
                      <div className="student-actions">
                        <Badge>{student.totalHours || 0}h</Badge>
                        <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                          View
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          style={{ color: 'var(--color-error)' }}
                          onClick={() => handleDeleteStudent(student._id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* VIEW STUDENT MODAL */}
        {selectedStudent && (
          <div className="modal-overlay">
            <div className="modal">
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CardTitle>Student Details</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedStudent(null)}>
                      <X size={20} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div className="avatar avatar-primary" style={{ width: '64px', height: '64px', fontSize: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-primary)' }}>
                      {selectedStudent.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{selectedStudent.name}</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{selectedStudent.email}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(45,45,74,0.5)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <BookOpen size={14} color="var(--color-primary)" />
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Roll Number</p>
                      </div>
                      <p style={{ fontWeight: 600 }}>{selectedStudent.rollNumber || 'N/A'}</p>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(45,45,74,0.5)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <BookOpen size={14} color="var(--color-primary)" />
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Department</p>
                      </div>
                      <p style={{ fontWeight: 600 }}>{selectedStudent.department || 'N/A'}</p>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(45,45,74,0.5)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Calendar size={14} color="var(--color-primary)" />
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Year</p>
                      </div>
                      <p style={{ fontWeight: 600 }}>Year {selectedStudent.year || 'N/A'}</p>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(45,45,74,0.5)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Mail size={14} color="var(--color-primary)" />
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Service Hours</p>
                      </div>
                      <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{selectedStudent.totalHours || 0} / 120 hrs</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <p style={{ fontSize: '14px' }}>NSS Hours Progress</p>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{selectedStudent.totalHours || 0}/120</p>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'rgba(45,45,74,0.8)', borderRadius: '4px' }}>
                      <div style={{
                        height: '8px', borderRadius: '4px',
                        backgroundColor: 'var(--color-primary)',
                        width: `${Math.min(((selectedStudent.totalHours || 0) / 120) * 100, 100)}%`
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="outline" fullWidth onClick={() => setSelectedStudent(null)}>Close</Button>
                    <Button
                      fullWidth
                      style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                      onClick={() => handleDeleteStudent(selectedStudent._id)}
                    >
                      <Trash2 size={16} /> Delete Student
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ADD STUDENT MODAL */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <Card>
                <CardHeader><CardTitle>Add New Student</CardTitle></CardHeader>
                <CardContent>
                  {error && (
                    <div style={{ color: 'red', marginBottom: '12px', fontSize: '14px' }}>⚠️ {error}</div>
                  )}
                  <form onSubmit={handleAddStudent}>
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <label className="input-label">Full Name</label>
                      <Input name="name" value={newStudent.name} onChange={handleInputChange} placeholder="Enter student name" required />
                    </div>
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <label className="input-label">Email</label>
                      <Input name="email" type="email" value={newStudent.email} onChange={handleInputChange} placeholder="student@college.edu" required />
                    </div>
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <label className="input-label">Roll Number</label>
                      <Input name="rollNo" value={newStudent.rollNo} onChange={handleInputChange} placeholder="e.g., IEAXEIT001" required />
                    </div>
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <label className="input-label">Department</label>
                      <Input name="department" value={newStudent.department} onChange={handleInputChange} placeholder="e.g., Information Technology" required />
                    </div>
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <label className="input-label">Year</label>
                      <Input name="year" type="number" value={newStudent.year} onChange={handleInputChange} placeholder="1-4" required />
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      💡 Student's default password will be their Roll Number
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} fullWidth>Cancel</Button>
                      <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Adding...' : 'Add Student'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CoordinatorStudents;