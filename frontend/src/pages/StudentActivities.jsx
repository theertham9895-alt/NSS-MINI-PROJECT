import React, { useState ,useEffect} from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Input from '../components/Input';
import { getActivities } from '../services/api';
import { Calendar, MapPin, Clock, Users, Search } from 'lucide-react';

function StudentActivities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    getActivities().then(data => setActivities(Array.isArray(data) ? data : []));
  }, []);
  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || activity.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <Sidebar role="student" userName="Student" userEmail="student@example.com" />

      <main className="main-layout">
        <header className="page-header">
          <h1>Activities</h1>
        </header>

        <div className="page-content">
          {/* Search and Filter */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div className="input-with-icon" style={{ flex: 1, minWidth: '250px' }}>
              <Search size={18} className="input-icon" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                variant={filter === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={filter === 'upcoming' ? 'primary' : 'outline'}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button 
                variant={filter === 'ongoing' ? 'primary' : 'outline'}
                onClick={() => setFilter('ongoing')}
              >
                Ongoing
              </Button>
              <Button 
                variant={filter === 'completed' ? 'primary' : 'outline'}
                onClick={() => setFilter('completed')}
              >
                Completed
              </Button>
            </div>
          </div>

          {/* Activities Grid */}
          {filteredActivities.length === 0 ? (
            <Card>
              <CardContent>
                <div className="empty-state">
                  <Calendar size={64} className="empty-state-icon" />
                  <p className="empty-state-title">No activities found</p>
                  <p className="empty-state-description">Try changing your search or filter</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
              {filteredActivities.map((activity) => (
                <Card key={activity.id} hover>
                  <CardHeader>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <CardTitle>{activity.title}</CardTitle>
                      <Badge variant={
                        activity.status === 'upcoming' ? 'warning' :
                        activity.status === 'ongoing' ? 'primary' : 'outline'
                      }>
                        {activity.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      {activity.description}
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <Calendar size={16} />
                        {new Date(activity.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <MapPin size={16} />
                        {activity.location}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <Clock size={16} />
                        {activity.duration} hours
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <Users size={16} />
                        {activity.registeredCount} / {activity.maxParticipants} registered
                      </div>
                    </div>

                    {activity.status === 'upcoming' && (
                      <Button fullWidth>
                        Register for Activity
                      </Button>
                    )}
                    {activity.status === 'completed' && (
                      <Button variant="outline" fullWidth>
                        View Details
                      </Button>
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

export default StudentActivities;