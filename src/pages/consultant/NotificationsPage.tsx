import { useEffect, useState } from 'react';
import type { ConsultantNotification } from '../../types';
import {
  getNotificationsForConsultant,
  markAllConsultantNotificationsRead,
  markConsultantNotificationRead,
} from '../../services/consultantNotificationService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

export function NotificationsPage() {
  const { consultantId, companyId } = useConsultantSession();
  const [notifications, setNotifications] = useState<ConsultantNotification[]>([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    getNotificationsForConsultant(consultantId, companyId).then((result) => {
      setNotifications(result);
      setLoading(false);
    });
  }

  useEffect(refresh, [consultantId, companyId]);

  async function handleMarkRead(id: string) {
    await markConsultantNotificationRead(id);
    refresh();
  }

  async function handleMarkAllRead() {
    await markAllConsultantNotificationsRead(consultantId, companyId);
    refresh();
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Notifications</h1>
        <p className="text-muted">Voucher activity and team announcements.</p>
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
