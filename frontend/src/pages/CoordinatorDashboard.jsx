import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { getActivities, getStudents } from '../services/api';
import { Users, Calendar, Clock, Award, Plus, ArrowRight } from 'lucide-react';

function CoordinatorDashboard() {
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    getActivities().then(data => setActivities(Array.isArray(data) ? data : []));
    getStudents().then(data => setStudents(Array.isArray(data) ? data : []));
  }, []);

  const totalStudents = students.length;
  const totalActivities = activities.length;
  const upcomingActivities = activities.filter(a => a.status === 'upcoming').length;
  const completedActivities = activities.filter(a => a.status === 'completed').length;

  return (
    <div>
      <Sidebar role="coordinator" userName="Coordinator" userEmail="coordinator@example.com" />

      <main className="main-layout">
        <header className="page-header">
          <h1>Dashboard</h1>
          <Link to="/coordinator/activities">
            <Button>
              <Plus size={16} />
              New Activity
            </Button>
          </Link>
        </header>

        <div className="page-content">
          {/* Welcome */}
          <div className="welcome-banner">
            <h2>Welcome, Coordinator</h2>
            <p>Manage NSS activities, monitor volunteers, and track progress.</p>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <div className="stat-card">
                  <div className="icon-box icon-box-lg icon-box-primary">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="stat-label">Total Volunteers</p>
                    <p className="stat-value">{totalStudents}</p>
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
                    <p className="stat-label">Total Activities</p>
                    <p className="stat-value">{totalActivities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <div className="stat-card">
                  <div className="icon-box icon-box-lg icon-box-warning">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="stat-label">Upcoming</p>
                    <p className="stat-value">{upcomingActivities}</p>
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
                    <p className="stat-label">Completed</p>
                    <p className="stat-value">{completedActivities}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Two Column */}
          <div className="dashboard-grid">
            {/* Recent Activities */}
            <Card>
              <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <CardTitle>Recent Activities</CardTitle>
                <Link to="/coordinator/activities">
                  <Button variant="ghost" size="sm">
                    View all <ArrowRight size={14} />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activities.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-info">
                        <div className={`activity-status ${activity.status}`}></div>
                        <div>
                          <p className="activity-title">{activity.title}</p>
                          <p className="activity-meta">
                            {new Date(activity.date).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <span className={`badge badge-${
                        activity.status === 'upcoming' ? 'warning' :
                        activity.status === 'ongoing' ? 'primary' : 'outline'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card style={{ marginTop: '24px' }}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="quick-actions">
                <Link to="/coordinator/students">
                  <Button variant="outline" className="quick-action-btn" fullWidth>
                    <Users size={20} />
                    <span>Add Student</span>
                  </Button>
                </Link>
                <Link to="/coordinator/activities">
                  <Button variant="outline" className="quick-action-btn" fullWidth>
                    <Calendar size={20} />
                    <span>Create Activity</span>
                  </Button>
                </Link>
                <Link to="/coordinator/attendance">
                  <Button variant="outline" className="quick-action-btn" fullWidth>
                    <Clock size={20} />
                    <span>Mark Attendance</span>
                  </Button>
                </Link>
                <Link to="/coordinator/certificates">
                  <Button variant="outline" className="quick-action-btn" fullWidth>
                    <Award size={20} />
                    <span>Issue Certificate</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default CoordinatorDashboard;