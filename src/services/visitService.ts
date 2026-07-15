import type { VisitRequest } from '../types';
import { visitRequests } from '../mocks/visitRequests';
import { delay } from '../lib/delay';

export interface ScheduleVisitInput {
  propertyId: string;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  sourceLinkId: string | null;
}

/** Simulates creating/finding a Client record plus a Visit_Request record (status "Pending"). */
export async function submitVisitRequest(input: ScheduleVisitInput): Promise<VisitRequest> {
  await delay(500);

  const visitRequest: VisitRequest = {
    id: `visit-${Date.now()}`,
    propertyId: input.propertyId,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    notes: input.notes,
    status: 'Pending',
    sourceLinkId: input.sourceLinkId,
    createdAt: new Date().toISOString(),
  };

  visitRequests.push(visitRequest);
  return visitRequest;
}
