import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { User, Mail, Phone, BookOpen, Hash, Calendar, Edit2, Save, X } from 'lucide-react';

function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/students/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const studentData = await res.json();

      const attRes = await fetch('http://localhost:5000/api/attendance/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const attData = await attRes.json();
      const presentCount = Array.isArray(attData)
        ? attData.filter(a => a.status === 'present').length : 0;

      const fullProfile = {
        name: studentData.user?.name || localStorage.getItem('userName') || 'Student',
        email: studentData.user?.email || localStorage.getItem('userEmail') || '',
        phone: studentData.phone || '',
        department: studentData.department || 'N/A',
        rollNo: studentData.rollNumber || 'N/A',
        year: studentData.year || 'N/A',
        totalHours: studentData.totalHours || 0,
        activitiesAttended: presentCount
      };

      setProfile(fullProfile);
      setEditData(fullProfile);
    } catch (err) {
      console.error('Failed to load profile:', err);
      const fallback = {
        name: localStorage.getItem('userName') || 'Student',
        email: localStorage.getItem('userEmail') || '',
        phone: '', department: 'N/A',
        rollNo: 'N/A', year: 'N/A',
        totalHours: 0, activitiesAttended: 0
      };
      setProfile(fallback);
      setEditData(fallback);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/students/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone: editData.phone })
      });
      setProfile({ ...profile, phone: editData.phone });
      setIsEditing(false);
    } catch (err) {
      setProfile({ ...profile, phone: editData.phone });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profile });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="student" userName="Student" userEmail="" />
        <main className="main-layout">
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading profile...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="student" userName={profile.name} userEmail={profile.email} />
      <main className="main-layout">
        <header className="page-header">
          <h1>My Profile</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 size={16} /> Edit Profile
            </Button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" onClick={handleCancel}>
                <X size={16} /> Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save size={16} /> Save Changes
              </Button>
            </div>
          )}
        </header>

        <div className="page-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>

            {/* Profile Card */}
            <Card>
              <CardContent style={{ paddingTop: '24px', textAlign: 'center' }}>
                <div className="avatar avatar-lg avatar-primary" style={{ margin: '0 auto 16px' }}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>{profile.name}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{profile.rollNo}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{profile.department}</p>

                {/* Hours Progress */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>NSS Hours</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{profile.totalHours}/120</p>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(45,45,74,0.8)', borderRadius: '3px' }}>
                    <div style={{
                      height: '6px', borderRadius: '3px',
                      backgroundColor: 'var(--color-primary)',
                      width: `${Math.min((profile.totalHours / 120) * 100, 100)}%`
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>{profile.totalHours}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hours</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-accent)' }}>{profile.activitiesAttended}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Activities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card>
              <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
              <CardContent>
                {isEditing ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* LOCKED FIELDS */}
                    <div className="input-group">
                      <label className="input-label">
                        Full Name <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>(locked)</span>
                      </label>
                      <Input name="name" value={editData.name} disabled />
                    </div>
                    <div className="input-group">
                      <label className="input-label">
                        Email <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>(locked)</span>
                      </label>
                      <Input name="email" value={editData.email} disabled />
                    </div>
                    <div className="input-group">
                      <label className="input-label">
                        Roll Number <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>(locked)</span>
                      </label>
                      <Input name="rollNo" value={editData.rollNo} disabled />
                    </div>
                    <div className="input-group">
                      <label className="input-label">
                        Department <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>(locked)</span>
                      </label>
                      <Input name="department" value={editData.department} disabled />
                    </div>
                    <div className="input-group">
                      <label className="input-label">
                        Year <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>(locked)</span>
                      </label>
                      <Input name="year" value={editData.year} disabled />
                    </div>

                    {/* ONLY EDITABLE FIELD */}
                    <div className="input-group">
                      <label className="input-label">
                        Phone <span style={{ fontSize: '11px', color: 'var(--color-primary)' }}>(editable)</span>
                      </label>
                      <Input name="phone" value={editData.phone} onChange={handleInputChange} placeholder="+91 9876543210" />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <InfoItem icon={<User size={18} />} label="Full Name" value={profile.name} />
                    <InfoItem icon={<Mail size={18} />} label="Email" value={profile.email} />
                    <InfoItem icon={<Hash size={18} />} label="Roll Number" value={profile.rollNo} />
                    <InfoItem icon={<BookOpen size={18} />} label="Department" value={profile.department} />
                    <InfoItem icon={<Calendar size={18} />} label="Year" value={`Year ${profile.year}`} />
                    <InfoItem icon={<Phone size={18} />} label="Phone" value={profile.phone || 'Not set'} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <div className="icon-box icon-box-md" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '14px', fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}

export default StudentProfile;