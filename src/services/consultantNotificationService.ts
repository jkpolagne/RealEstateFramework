import type { ConsultantNotification } from '../types';
import { consultantNotifications } from '../mocks/consultantNotifications';
import { delay } from '../lib/delay';

export async function getNotificationsForConsultant(consultantId: string): Promise<ConsultantNotification[]> {
  await delay();
  return consultantNotifications
    .filter((n) => n.recipientId === consultantId || n.recipientId === 'all')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markConsultantNotificationRead(id: string): Promise<void> {
  await delay(150);
  const notification = consultantNotifications.find((n) => n.id === id);
  if (notification) notification.read = true;
}

export async function markAllConsultantNotificationsRead(consultantId: string): Promise<void> {
  await delay(200);
  consultantNotifications.forEach((n) => {
    if (n.recipientId === consultantId || n.recipientId === 'all') n.read = true;
  });
}

export function recordConsultantNotification(recipientId: string, title: string, message: string): void {
  consultantNotifications.unshift({
    id: `cnotif-${Date.now()}`,
    recipientId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export async function sendBrokerAnnouncement(title: string, message: string): Promise<void> {
  await delay(400);
  recordConsultantNotification('all', title, message);
}

/** Fans an announcement out to specific recipients — used by a Sales Manager messaging just their own team. */
export async function sendAnnouncementToRecipients(recipientIds: string[], title: string, message: string): Promise<void> {
  await delay(400);
  for (const id of recipientIds) {
    recordConsultantNotification(id, title, message);
  }
}
