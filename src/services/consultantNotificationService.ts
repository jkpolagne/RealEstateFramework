import type { ConsultantNotification } from '../types';
import { consultantNotifications } from '../mocks/consultantNotifications';
import { delay } from '../lib/delay';
import { persistAll } from '../lib/persist';

/** companyId is required so an 'all' (broker-wide) announcement from one company never leaks into another company's feed. */
export async function getNotificationsForConsultant(consultantId: string, companyId: string): Promise<ConsultantNotification[]> {
  await delay();
  return consultantNotifications
    .filter((n) => n.companyId === companyId && (n.recipientId === consultantId || n.recipientId === 'all'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markConsultantNotificationRead(id: string): Promise<void> {
  await delay(150);
  const notification = consultantNotifications.find((n) => n.id === id);
  if (notification) notification.read = true;
  persistAll();
}

export async function markAllConsultantNotificationsRead(consultantId: string, companyId: string): Promise<void> {
  await delay(200);
  consultantNotifications.forEach((n) => {
    if (n.companyId === companyId && (n.recipientId === consultantId || n.recipientId === 'all')) n.read = true;
  });
  persistAll();
}

export function recordConsultantNotification(companyId: string, recipientId: string, title: string, message: string): void {
  consultantNotifications.unshift({
    id: `cnotif-${Date.now()}`,
    companyId,
    recipientId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export async function sendBrokerAnnouncement(companyId: string, title: string, message: string): Promise<void> {
  await delay(400);
  recordConsultantNotification(companyId, 'all', title, message);
  persistAll();
}

/** Fans an announcement out to specific recipients — used by a Sales Manager messaging just their own team. */
export async function sendAnnouncementToRecipients(companyId: string, recipientIds: string[], title: string, message: string): Promise<void> {
  await delay(400);
  for (const id of recipientIds) {
    recordConsultantNotification(companyId, id, title, message);
  }
  persistAll();
}
