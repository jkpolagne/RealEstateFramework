import type { Notification } from '../types';

/** Newest first — write-services (e.g. visitService) unshift new entries onto this array. */
export const notifications: Notification[] = [
  {
    id: 'notif-3',
    title: 'New visit request',
    message: 'Rafael Dizon requested a visit for Lot 22, Sunrise Heights (via Sean Rey Bonganay).',
    read: false,
    createdAt: '2026-07-14T08:15:00.000Z',
  },
  {
    id: 'notif-2',
    title: 'New visit request',
    message: 'Carlo Reyes requested a visit for Unit 4B, Riverside Homes.',
    read: false,
    createdAt: '2026-07-13T11:30:00.000Z',
  },
  {
    id: 'notif-1',
    title: 'New visit request',
    message: 'Maria Santos requested a visit for Lot 14, Greenview Estates.',
    read: true,
    createdAt: '2026-07-12T09:00:00.000Z',
  },
];
