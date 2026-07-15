import type { VisitRequest } from '../types';
import { visitRequests } from '../mocks/visitRequests';
import { properties } from '../mocks/properties';
import { consultantLinks } from '../mocks/consultantLinks';
import { delay } from '../lib/delay';
import { recordNotification } from './notificationService';

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

export async function getVisitRequests(): Promise<VisitRequest[]> {
  await delay();
  return visitRequests;
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

  const property = properties.find((p) => p.id === input.propertyId);
  const sourceLink = input.sourceLinkId ? consultantLinks.find((l) => l.id === input.sourceLinkId) : null;
  const propertyLabel = property?.name ?? 'a property';
  const sourceSuffix = sourceLink ? ` (via ${sourceLink.consultantName})` : '';
  recordNotification('New visit request', `${input.fullName} requested a visit for ${propertyLabel}${sourceSuffix}.`);

  return visitRequest;
}

export async function updateVisitRequestStatus(
  id: string,
  status: 'Approved' | 'Declined',
): Promise<VisitRequest> {
  await delay(300);
  const visitRequest = visitRequests.find((v) => v.id === id);
  if (!visitRequest) throw new Error('Visit request not found');
  visitRequest.status = status;
  return visitRequest;
}
