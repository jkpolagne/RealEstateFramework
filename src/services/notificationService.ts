import type { Notification } from '../types';
import { notifications } from '../mocks/notifications';
import { delay } from '../lib/delay';

export async function getNotifications(): Promise<Notification[]> {
  await delay();
  return notifications;
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(150);
  const notification = notifications.find((n) => n.id === id);
  if (notification) notification.read = true;
}

export async function markAllNotificationsRead(): Promise<void> {
  await delay(200);
  notifications.forEach((n) => {
    n.read = true;
  });
}

export function recordNotification(title: string, message: string): void {
  notifications.unshift({ id: `notif-${Date.now()}`, title, message, read: false, createdAt: new Date().toISOString() });
}

/** Used by a Broker flagging something (e.g. a new property or quotation needed) directly to the Company Admin inbox. */
export async function notifyCompanyAdmin(title: string, message: string): Promise<void> {
  await delay(400);
  recordNotification(title, message);
}
