import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from '../services/api';
import { Bell, CheckCheck } from 'lucide-react';

function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncUnreadCount = (list) => {
    const unread = list.filter((item) => !item.isRead).length;
    localStorage.setItem('unreadNotifications', String(unread));
    window.dispatchEvent(new CustomEvent('notifications:count', { detail: unread }));
  };

  const loadNotifications = useCallback(async () => {
    const data = await getMyNotifications();
    const list = Array.isArray(data) ? data : [];
    setNotifications(list);
    syncUnreadCount(list);
    setLoading(false);
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    const updated = notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    syncUnreadCount(updated);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    syncUnreadCount(updated);
  };

  return (
    <div>
      <Sidebar role="student" />
      <main className="main-layout">
        <header className="page-header">
          <h1>Notifications</h1>
          <Button variant="outline" onClick={handleMarkAllRead} disabled={notifications.length === 0}>
            <CheckCheck size={16} /> Mark All Read
          </Button>
        </header>

        <div className="page-content">
          <Card>
            <CardHeader>
              <CardTitle>My Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading notifications...</p>
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <Bell size={56} className="empty-state-icon" />
                  <p className="empty-state-title">No notifications yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: item.isRead ? 'transparent' : 'rgba(80, 160, 255, 0.08)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{item.title}</p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.message}</p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '6px' }}>
                            {new Date(item.createdAt).toLocaleString('en-IN')}
                          </p>
                        </div>
                        {!item.isRead && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkRead(item._id)}>
                            Mark Read
                          </Button>
                        )}
                      </div>
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

export default StudentNotifications;
