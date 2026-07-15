import type { ConsultantNotification } from '../types';

/** Newest first — recipientId is a consultantId, or 'all' for a broker-wide announcement. */
export const consultantNotifications: ConsultantNotification[] = [
  {
    id: 'cnotif-1',
    recipientId: 'consultant-jann-kevin',
    title: 'Voucher due',
    message: "Carlo Reyes's payment crossed a new milestone — tranche 3 of 4 is now eligible for a commission voucher.",
    read: false,
    createdAt: '2026-07-10T10:05:00.000Z',
  },
  {
    id: 'cnotif-2',
    recipientId: 'consultant-sean-rey',
    title: 'Commission released',
    message: 'Your commission for Carlo Reyes (release 2 of 4) has been released.',
    read: true,
    createdAt: '2026-07-12T09:00:00.000Z',
  },
  {
    id: 'cnotif-3',
    recipientId: 'all',
    title: 'Monthly sales huddle',
    message: 'Team meeting this Friday, 3PM at the Advench Realty office — bring your pipeline updates.',
    read: false,
    createdAt: '2026-07-13T08:00:00.000Z',
  },
];
