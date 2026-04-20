import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { Award, Download, Calendar } from 'lucide-react';

function StudentCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/certificates/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCertificates(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load certificates:', err);
    }
    setLoading(false);
  };

  const handleDownload = (cert) => {
    if (!cert.fileUrl) {
      alert('⚠️ No certificate file uploaded yet. Please contact your coordinator.');
      return;
    }
    const link = document.createElement('a');
    link.href = `http://localhost:5000${cert.fileUrl}`;
    link.target = '_blank';
    link.download = `NSS_Certificate_${cert.title || 'certificate'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="student" />
        <main className="main-layout">
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading certificates...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="student" />
      <main className="main-layout">
        <header className="page-header">
          <h1>My Certificates</h1>
        </header>

        <div className="page-content">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Certificates</p>
                <p style={{ fontSize: '32px', fontWeight: 700 }}>{certificates.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Participation</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {certificates.filter(c => c.type === 'Participation').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Achievement</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-accent)' }}>
                  {certificates.filter(c => c.type === 'Achievement').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Certificates Grid */}
          {certificates.length === 0 ? (
            <Card>
              <CardContent>
                <div className="empty-state">
                  <Award size={64} className="empty-state-icon" />
                  <p className="empty-state-title">No certificates yet</p>
                  <p className="empty-state-description">
                    Participate in NSS activities to earn certificates.
                    They will appear here once issued by the coordinator.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {certificates.map((cert) => (
                <Card key={cert._id}>
                  <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="icon-box icon-box-lg icon-box-primary">
                        <Award size={24} />
                      </div>
                      <span style={{
                        fontSize: '12px', padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: cert.type === 'Achievement'
                          ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)',
                        color: cert.type === 'Achievement'
                          ? 'var(--color-warning)' : 'var(--color-primary)'
                      }}>
                        {cert.type}
                      </span>
                    </div>
                    <CardTitle style={{ marginTop: '16px' }}>{cert.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      📋 {cert.activity?.title || cert.activityTitle || 'NSS Activity'}
                    </p>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px'
                    }}>
                      <Calendar size={14} />
                      {new Date(cert.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </div>

                    {cert.fileUrl ? (
                      <Button variant="outline" fullWidth onClick={() => handleDownload(cert)}>
                        <Download size={16} /> Download Certificate
                      </Button>
                    ) : (
                      <div style={{
                        padding: '10px', textAlign: 'center',
                        borderRadius: '8px', fontSize: '13px',
                        backgroundColor: 'rgba(45,45,74,0.5)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)'
                      }}>
                        ⏳ Certificate file not uploaded yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentCertificates;