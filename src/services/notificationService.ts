import type { Notification } from '../types';
import { notifications } from '../mocks/notifications';
import { delay } from '../lib/delay';
import { persistAll } from '../lib/persist';

export async function getNotifications(companyId: string): Promise<Notification[]> {
  await delay();
  return notifications.filter((n) => n.companyId === companyId);
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(150);
  const notification = notifications.find((n) => n.id === id);
  if (notification) notification.read = true;
  persistAll();
}

export async function markAllNotificationsRead(companyId: string): Promise<void> {
  await delay(200);
  notifications.filter((n) => n.companyId === companyId).forEach((n) => {
    n.read = true;
  });
  persistAll();
}

export function recordNotification(companyId: string, title: string, message: string): void {
  notifications.unshift({ id: `notif-${Date.now()}`, companyId, title, message, read: false, createdAt: new Date().toISOString() });
}

/** Used by a Broker flagging something (e.g. a new property or quotation needed) directly to the Company Admin inbox. */
export async function notifyCompanyAdmin(companyId: string, title: string, message: string): Promise<void> {
  await delay(400);
  recordNotification(companyId, title, message);
  persistAll();
}
