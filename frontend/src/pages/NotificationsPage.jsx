import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, Clock, ArrowRight } from 'lucide-react';
import { formatDateTime } from '../lib/utils';
import { storageService } from '../lib/storageService';

export default function NotificationsPage() {
  const { notifications, currentUser, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const userNotifications = notifications.filter((n) => {
    if (filterUnreadOnly && n.read) return false;
    return true;
  });

  const handleNotificationClick = (item) => {
    storageService.markNotificationAsRead(item.id);
    if (item.listingId) {
      if (currentUser?.role === 'DONOR') {
        navigate(`/donor/listings/${item.listingId}`);
      } else if (currentUser?.role === 'NGO') {
        navigate(`/ngo/listings/${item.listingId}`);
      } else if (currentUser?.role === 'VOLUNTEER') {
        navigate(`/volunteer/tasks/${item.listingId}`);
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1.25rem 4rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Alerts & Activity
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '2px' }}>
            Notification Inbox (FR-NOT-01)
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={markAllNotificationsRead}
            style={{ gap: '4px' }}
          >
            <CheckCheck size={16} />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter tab */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`chip ${!filterUnreadOnly ? 'active' : ''}`}
          onClick={() => setFilterUnreadOnly(false)}
        >
          All Activity ({notifications.length})
        </button>
        <button
          type="button"
          className={`chip ${filterUnreadOnly ? 'active' : ''}`}
          onClick={() => setFilterUnreadOnly(true)}
        >
          Unread Only ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {userNotifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Bell size={36} style={{ color: 'var(--text-light)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>No Notifications</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            You're all caught up! New listings, claims, and delivery tasks will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {userNotifications.map((item) => (
            <div
              key={item.id}
              className="card card-hoverable"
              onClick={() => handleNotificationClick(item)}
              style={{
                cursor: 'pointer',
                borderLeft: `4px solid ${item.read ? 'var(--border)' : 'var(--primary)'}`,
                background: item.read ? 'white' : '#F9FDF9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!item.read && (
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                  )}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: item.read ? 600 : 800, color: 'var(--text-main)', margin: 0 }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    • {formatDateTime(item.createdAt)}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', margin: 0 }}>
                  {item.message}
                </p>
              </div>

              <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
