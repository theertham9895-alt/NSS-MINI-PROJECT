import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { getActivities } from '../services/api';
import { Clock, Calendar, TrendingUp, Award, ArrowRight } from 'lucide-react';

function StudentDashboard() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    serviceHours: 0, activities: 0,
    targetHours: 120, certificates: 0
  });
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    setUserName(localStorage.getItem('userName') || 'Student');
    loadDashboard();
    getActivities().then(data => setActivities(Array.isArray(data) ? data : []));
  }, []);

  const loadDashboard = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/students/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && !data.error) setStats(data);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    }
  };

  const getStatus = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    const diff = date - today;
    if (diff > 86400000) return 'upcoming';
    if (diff > -86400000) return 'ongoing';
    return 'completed';
  };

  const upcomingActivities = activities
    .filter(a => getStatus(a.date) === 'upcoming')
    .slice(0, 3);

  return (
    <div>
      <Sidebar role="student" />

      <main className="main-layout">
        <header className="page-header">
          <h1>Dashboard</h1>
        </header>

        <div className="page-content">
          {/* Welcome Banner */}
          <div className="welcome-banner">
            <h2>Welcome back, {userName}! 👋</h2>
            <p>Track your NSS activities and service hours here.</p>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <div className="stat-card">
                  <div className="icon-box icon-box-lg icon-box-primary">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="stat-label">Service Hours</p>
                    <p className="stat-value">{stats.serviceHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <div className="stat-card">
                  <div className="icon-box icon-box-lg icon-box-accent">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="stat-label">Activities</p>
                    <p className="stat-value">{stats.activities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <div className="stat-card">
                  <div className="icon-box icon-box-lg icon-box-warning">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="stat-label">Target Hours</p>
                    <p className="stat-value">{stats.targetHours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <div className="stat-card">
                  <div className="icon-box icon-box-lg icon-box-success">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="stat-label">Certificates</p>
                    <p className="stat-value">{stats.certificates}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress */}
          <Card style={{ marginBottom: '24px' }}>
            <CardHeader>
              <CardTitle>Service Hours Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Progress</span>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  {stats.serviceHours} / {stats.targetHours} hours
                </span>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${Math.min((stats.serviceHours / stats.targetHours) * 100, 100)}%` }}
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {stats.targetHours - stats.serviceHours} hours remaining to complete your NSS requirement
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Activities */}
          <Card>
            <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <CardTitle>Upcoming Activities</CardTitle>
              <Link to="/student/activities">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight size={14} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingActivities.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={48} className="empty-state-icon" />
                  <p className="empty-state-title">No upcoming activities</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingActivities.map((activity) => (
                    <div key={activity._id} className="activity-item">
                      <div className="activity-info">
                        <div className="icon-box icon-box-md icon-box-primary">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="activity-title">{activity.title}</p>
                          <p className="activity-meta">
                            {new Date(activity.date).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })} — {activity.location}
                          </p>
                        </div>
                      </div>
                      <Badge>{activity.hours}h</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;