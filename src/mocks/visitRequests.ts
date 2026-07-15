import type { VisitRequest } from '../types';

/** Mutated at runtime by visitService — seeded here, then Property Seeker submissions push onto it. */
export const visitRequests: VisitRequest[] = [
  {
    id: 'visit-1',
    propertyId: 'prop-lot14-greenview',
    fullName: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    phone: '0917-111-2222',
    preferredDate: '2026-07-20',
    preferredTime: '10:00',
    notes: 'Interested in the lot dimensions and titling process.',
    status: 'Pending',
    sourceLinkId: null,
    createdAt: '2026-07-12T09:00:00.000Z',
  },
  {
    id: 'visit-2',
    propertyId: 'prop-unit4b-riverside',
    fullName: 'Carlo Reyes',
    email: 'carlo.reyes@gmail.com',
    phone: '0917-222-3333',
    preferredDate: '2026-07-22',
    preferredTime: '14:00',
    notes: 'Would like to see the unit in person before reserving.',
    status: 'Pending',
    sourceLinkId: null,
    createdAt: '2026-07-13T11:30:00.000Z',
  },
  {
    id: 'visit-3',
    propertyId: 'prop-lot22-sunrise',
    fullName: 'Rafael Dizon',
    email: 'rafael.dizon@gmail.com',
    phone: '0917-333-4444',
    preferredDate: '2026-07-19',
    preferredTime: '09:30',
    notes: '',
    status: 'Pending',
    sourceLinkId: 'link-1',
    createdAt: '2026-07-14T08:15:00.000Z',
  },
];
