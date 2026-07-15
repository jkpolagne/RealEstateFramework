import { useEffect, useState } from 'react';
import type { Notification } from '../../types';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService';

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    getNotifications().then((result) => {
      setNotifications(result);
      setLoading(false);
    });
  }

  useEffect(refresh, []);

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    refresh();
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    refresh();
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Notifications</h1>
        <p className="text-muted">System notifications for Advench Realty.</p>
      </div>

      <div className="admin-toolbar">
        <p className="text-muted admin-notification-count">
          {unreadCount === 0 ? 'All caught up' : `${unreadCount} unread`}
        </p>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
          Mark All as Read
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-muted">No notifications yet.</p>
      ) : (
        <div className="card notification-feed">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className={`notification-item${notification.read ? '' : ' notification-item-unread'}`}
              onClick={() => handleMarkRead(notification.id)}
              disabled={notification.read}
            >
              {!notification.read && <span className="notification-dot" />}
              <div className="notification-item-body">
                <p className="notification-item-title">{notification.title}</p>
                <p className="text-muted">{notification.message}</p>
              </div>
              <span className="text-muted notification-item-time">{formatTimestamp(notification.createdAt)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
