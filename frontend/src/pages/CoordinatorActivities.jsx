import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import { getActivities, createActivity, deleteActivity } from '../services/api';
import { Plus, Calendar, MapPin, Clock, Users, Edit2, Trash2, X } from 'lucide-react';

function CoordinatorActivities() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    title: '', description: '', date: '',
    location: '', hours: '', maxParticipants: '', category: ''
  });

  const loadActivities = () => {
    getActivities().then(data => setActivities(Array.isArray(data) ? data : []));
  };

  useEffect(() => { loadActivities(); }, []);

  const getStatus = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    const diff = date - today;
    if (diff > 86400000) return 'upcoming';
    if (diff > -86400000) return 'ongoing';
    return 'completed';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditActivity(prev => ({ ...prev, [name]: value }));
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    await createActivity(newActivity);
    loadActivities();
    setShowAddForm(false);
    setNewActivity({ title: '', description: '', date: '', location: '', hours: '', maxParticipants: '', category: '' });
  };

  const handleEditActivity = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:5000/api/events/${editActivity._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editActivity)
      });
      loadActivities();
      setEditActivity(null);
    } catch (err) {
      console.error('Edit failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity?')) return;
    await deleteActivity(id);
    loadActivities();
  };

  return (
    <div>
      <Sidebar role="coordinator" userName="Coordinator" userEmail="coordinator@example.com" />
      <main className="main-layout">
        <header className="page-header">
          <h1>Activities</h1>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> Create Activity
          </Button>
        </header>

        <div className="page-content">
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total</p>
                <p style={{ fontSize: '32px', fontWeight: 700 }}>{activities.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Upcoming</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-warning)' }}>
                  {activities.filter(a => getStatus(a.date) === 'upcoming').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Ongoing</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {activities.filter(a => getStatus(a.date) === 'ongoing').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent style={{ paddingTop: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Completed</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {activities.filter(a => getStatus(a.date) === 'completed').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activities List */}
          <Card>
            <CardHeader><CardTitle>All Activities</CardTitle></CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={64} className="empty-state-icon" />
                  <p className="empty-state-title">No activities yet</p>
                  <p className="empty-state-description">Create your first NSS activity</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus size={16} /> Create Activity
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activities.map((activity) => {
                    const status = getStatus(activity.date);
                    return (
                      <div key={activity._id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px', borderRadius: '8px',
                        backgroundColor: 'rgba(45, 45, 74, 0.5)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div className="icon-box icon-box-lg icon-box-primary">
                            <Calendar size={24} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{activity.title}</h3>
                              <Badge variant={status === 'upcoming' ? 'warning' : status === 'ongoing' ? 'primary' : 'outline'}>
                                {status}
                              </Badge>
                              {activity.category && <Badge variant="outline">{activity.category}</Badge>}
                            </div>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={14} />
                                {new Date(activity.date).toLocaleDateString('en-IN')}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={14} /> {activity.location}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={14} /> {activity.hours}h
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Users size={14} /> Max: {activity.maxParticipants || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => setEditActivity({ ...activity, hours: activity.hours || '' })}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            style={{ color: 'var(--color-error)' }}
                            onClick={() => handleDelete(activity._id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ===== EDIT ACTIVITY MODAL ===== */}
        {editActivity && (
          <div className="modal-overlay">
            <div className="modal">
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CardTitle>Edit Activity</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setEditActivity(null)}>
                      <X size={20} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEditActivity}>
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <label className="input-label">Title</label>
                      <Input name="title" value={editActivity.title} onChange={handleEditInputChange} required />
                    </div>
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <label className="input-label">Description</label>
                      <Input name="description" value={editActivity.description} onChange={handleEditInputChange} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div className="input-group">
                        <label className="input-label">Date</label>
                        <Input name="date" type="date" value={editActivity.date?.split('T')[0]} onChange={handleEditInputChange} required />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Location</label>
                        <Input name="location" value={editActivity.location} onChange={handleEditInputChange} required />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                      <div className="input-group">
                        <label className="input-label">Hours</label>
                        <Input name="hours" type="number" value={editActivity.hours} onChange={handleEditInputChange} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Max Participants</label>
                        <Input name="maxParticipants" type="number" value={editActivity.maxParticipants} onChange={handleEditInputChange} />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Category</label>
                        <Input name="category" value={editActivity.category} onChange={handleEditInputChange} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Button type="button" variant="outline" onClick={() => setEditActivity(null)} fullWidth>Cancel</Button>
                      <Button type="submit" fullWidth>Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ===== CREATE ACTIVITY MODAL ===== */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal">
              <Card>
                <CardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CardTitle>Create New Activity</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
                      <X size={20} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddActivity}>
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <label className="input-label">Title</label>
                      <Input name="title" value={newActivity.title} onChange={handleInputChange} placeholder="e.g., Blood Donation Camp" required />
                    </div>
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <label className="input-label">Description</label>
                      <Input name="description" value={newActivity.description} onChange={handleInputChange} placeholder="Brief description" required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div className="input-group">
                        <label className="input-label">Date</label>
                        <Input name="date" type="date" value={newActivity.date} onChange={handleInputChange} required />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Location</label>
                        <Input name="location" value={newActivity.location} onChange={handleInputChange} placeholder="e.g., College Auditorium" required />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                      <div className="input-group">
                        <label className="input-label">Hours</label>
                        <Input name="hours" type="number" value={newActivity.hours} onChange={handleInputChange} placeholder="e.g., 4" required />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Max Participants</label>
                        <Input name="maxParticipants" type="number" value={newActivity.maxParticipants} onChange={handleInputChange} placeholder="e.g., 50" />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Category</label>
                        <Input name="category" value={newActivity.category} onChange={handleInputChange} placeholder="e.g., Health" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} fullWidth>Cancel</Button>
                      <Button type="submit" fullWidth>Create Activity</Button>
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

export default CoordinatorActivities;