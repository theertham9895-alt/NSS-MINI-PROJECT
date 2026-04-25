import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { getStudents, getActivities } from '../services/api';
import { Award, Plus, X, Trash2, Eye } from 'lucide-react';

function CoordinatorCertificates() {
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certFile, setCertFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [newCertificate, setNewCertificate] = useState({
    studentId: '', activityId: '', title: '', type: 'Participation'
  });

  useEffect(() => {
    getStudents().then(data => setStudents(Array.isArray(data) ? data : []));
    getActivities().then(data => setActivities(Array.isArray(data) ? data : []));
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/certificates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCertificates(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate(prev => ({ ...prev, [name]: value }));
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    setUploading(true);
    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('studentId', newCertificate.studentId);
      formData.append('activityId', newCertificate.activityId);
      formData.append('title', newCertificate.title);
      formData.append('type', newCertificate.type);
      if (certFile) formData.append('certificate', certFile);

      const res = await fetch('http://localhost:5000/api/certificates', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        loadCertificates();
        setShowIssueForm(false);
        setNewCertificate({ studentId: '', activityId: '', title: '', type: 'Participation' });
        setCertFile(null);
        setSuccessMsg('✅ Certificate issued successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to issue certificate:', err);
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5000/api/certificates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadCertificates();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleView = (cert) => {
    if (cert.fileUrl) {
      window.open(`http://localhost:5000${cert.fileUrl}`, '_blank');
    } else {
      alert('No file uploaded for this certificate.');
    }
  };

  return (
    <div>
      <Sidebar role="coordinator" />
      <main className="main-layout">
        <header className="page-header">
          <h1>Certificates</h1>
          <Button onClick={() => setShowIssueForm(true)}>
            <Plus size={16} /> Issue Certificate
          </Button>
        </header>

        <div className="page-content">

          {/* Success Message */}
          {successMsg && (
            <div style={{
              padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
              backgroundColor: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#22c55e', fontSize: '14px'
            }}>
              {successMsg}
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Issued</p>
                <p style={{ fontSize: '32px', fontWeight: 700 }}>{certificates.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>This Month</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {certificates.filter(c => {
                    const d = new Date(c.createdAt);
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Students</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-warning)' }}>{students.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Certificates Table */}
          <Card>
            <CardHeader><CardTitle>Issued Certificates</CardTitle></CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="empty-state">
                  <Award size={64} className="empty-state-icon" />
                  <p className="empty-state-title">No certificates issued yet</p>
                  <p className="empty-state-description">Issue certificates to students for their participation</p>
                  <Button onClick={() => setShowIssueForm(true)}>
                    <Plus size={16} /> Issue First Certificate
                  </Button>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>File</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert) => (
                      <tr key={cert._id}>
                        <td style={{ fontWeight: 500 }}>{cert.studentName || 'N/A'}</td>
                        <td>{cert.title}</td>
                        <td>
                          <span style={{
                            fontSize: '12px', padding: '3px 8px',
                            borderRadius: '9999px',
                            backgroundColor: cert.type === 'Achievement'
                              ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)',
                            color: cert.type === 'Achievement'
                              ? 'var(--color-warning)' : 'var(--color-primary)'
                          }}>
                            {cert.type}
                          </span>
                        </td>
                        <td>{new Date(cert.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          {cert.fileUrl ? (
                            <span style={{ color: 'var(--color-primary)', fontSize: '13px' }}>✅ Uploaded</span>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>❌ No file</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button
                              variant="outline" size="sm"
                              onClick={() => handleView(cert)}
                              disabled={!cert.fileUrl}
                            >
                              <Eye size={14} /> View
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              style={{ color: 'var(--color-error)' }}
                              onClick={() => handleDelete(cert._id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Issue Certificate Modal */}
        {showIssueForm && (
          <div className="modal-overlay">
            <div className="modal">
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CardTitle>Issue Certificate</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowIssueForm(false)}>
                      <X size={20} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {students.length === 0 ? (
                    <div className="empty-state">
                      <Award size={48} className="empty-state-icon" />
                      <p className="empty-state-title">No students available</p>
                      <p className="empty-state-description">Add students first to issue certificates</p>
                      <Button variant="outline" onClick={() => setShowIssueForm(false)}>Close</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleIssueCertificate}>
                      <div className="input-group" style={{ marginBottom: '16px' }}>
                        <label className="input-label">Select Student</label>
                        <select name="studentId" value={newCertificate.studentId} onChange={handleInputChange} required className="input">
                          <option value="">Choose a student</option>
                          {students.map(s => (
                            <option key={s._id} value={s._id}>
                              {s.name} ({s.rollNumber})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="input-group" style={{ marginBottom: '16px' }}>
                        <label className="input-label">Select Activity</label>
                        <select name="activityId" value={newCertificate.activityId} onChange={handleInputChange} required className="input">
                          <option value="">Choose an activity</option>
                          {activities.map(a => (
                            <option key={a._id} value={a._id}>{a.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="input-group" style={{ marginBottom: '16px' }}>
                        <label className="input-label">Certificate Title</label>
                        <Input
                          name="title"
                          value={newCertificate.title}
                          onChange={handleInputChange}
                          placeholder="e.g., Blood Donation Camp Participation"
                          required
                        />
                      </div>

                      <div className="input-group" style={{ marginBottom: '16px' }}>
                        <label className="input-label">Certificate Type</label>
                        <select name="type" value={newCertificate.type} onChange={handleInputChange} className="input">
                          <option value="Participation">Participation</option>
                          <option value="Appreciation">Appreciation</option>
                          <option value="Achievement">Achievement</option>
                        </select>
                      </div>

                      <div className="input-group" style={{ marginBottom: '24px' }}>
                        <label className="input-label">
                          Upload Certificate File
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                            (PDF, JPG, PNG)
                          </span>
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setCertFile(e.target.files[0])}
                          style={{
                            width: '100%', padding: '10px',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '14px', cursor: 'pointer'
                          }}
                        />
                        {certFile && (
                          <p style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '6px' }}>
                            ✅ Selected: {certFile.name}
                          </p>
                        )}
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          💡 Student will be able to download this file from their portal
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Button type="button" variant="outline" onClick={() => setShowIssueForm(false)} fullWidth>
                          Cancel
                        </Button>
                        <Button type="submit" fullWidth disabled={uploading}>
                          <Award size={16} />
                          {uploading ? 'Uploading...' : 'Issue Certificate'}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CoordinatorCertificates;