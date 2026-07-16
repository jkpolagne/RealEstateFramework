import type { Client, ConsultantLink, VisitRequest } from '../types';
import { visitRequests } from '../mocks/visitRequests';
import { properties } from '../mocks/properties';
import { consultantLinks } from '../mocks/consultantLinks';
import { consultantAccounts } from '../mocks/consultantAccounts';
import { clients } from '../mocks/clients';
import { delay } from '../lib/delay';
import { persistAll } from '../lib/persist';
import { recordNotification } from './notificationService';

export interface ScheduleVisitInput {
  propertyId: string;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  /** A consultant referral link is required to schedule a visit — every client enters the system through one. */
  sourceLinkId: string;
}

export async function getVisitRequests(companyId: string): Promise<VisitRequest[]> {
  await delay();
  return visitRequests.filter((v) => v.companyId === companyId);
}

interface Assignment {
  saleType: Client['saleType'];
  brokerId: string;
  salesManagerId: string;
  salesPersonId: string | null;
}

/** A Sales Person's link makes a Referred sale (broker + sales manager + sales person share); a Sales Manager's link makes a Direct sale (broker + sales manager only). */
function resolveAssignment(sourceLink: ConsultantLink): Assignment {
  if (sourceLink.role === 'Sales Person') {
    const salesPerson = consultantAccounts.find((c) => c.id === sourceLink.consultantId);
    const salesManager = salesPerson?.assignedUnderId
      ? consultantAccounts.find((c) => c.id === salesPerson.assignedUnderId)
      : undefined;
    const broker = salesManager?.assignedUnderId
      ? consultantAccounts.find((c) => c.id === salesManager.assignedUnderId)
      : undefined;
    if (!salesPerson || !salesManager || !broker) throw new Error('This consultant link is missing its reporting chain.');
    return { saleType: 'Referred', brokerId: broker.id, salesManagerId: salesManager.id, salesPersonId: salesPerson.id };
  }

  const salesManager = consultantAccounts.find((c) => c.id === sourceLink.consultantId);
  const broker = salesManager?.assignedUnderId
    ? consultantAccounts.find((c) => c.id === salesManager.assignedUnderId)
    : undefined;
  if (!salesManager || !broker) throw new Error('This consultant link is missing its reporting chain.');
  return { saleType: 'Direct', brokerId: broker.id, salesManagerId: salesManager.id, salesPersonId: null };
}

/** Reuses an existing lead for the same person + property instead of creating duplicates on repeat visit requests. */
function findOrCreateClient(input: ScheduleVisitInput, assignment: Assignment, companyId: string): Client {
  const existing = clients.find(
    (c) => c.email.toLowerCase() === input.email.toLowerCase() && c.propertyId === input.propertyId,
  );
  if (existing) return existing;

  const property = properties.find((p) => p.id === input.propertyId);
  if (!property) throw new Error('Property not found');

  const client: Client = {
    id: `client-${Date.now()}`,
    companyId,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    employmentStatus: null,
    propertyId: input.propertyId,
    developerId: property.developerId,
    salePrice: property.price,
    saleType: assignment.saleType,
    paymentMethod: null,
    totalTranches: 0,
    brokerId: assignment.brokerId,
    salesManagerId: assignment.salesManagerId,
    salesPersonId: assignment.salesPersonId,
    addedDate: new Date().toISOString().slice(0, 10),
    paymentProgressPercent: 0,
    requirementsChecklist: [],
    lastContactedDate: null,
    notes: '',
    status: 'Pending Setup',
  };
  clients.push(client);
  return client;
}

/** Creates/finds the buyer's Client record from the referring consultant link, then logs the Visit Request for approval. */
export async function submitVisitRequest(input: ScheduleVisitInput): Promise<VisitRequest> {
  await delay(500);

  const sourceLink = consultantLinks.find((l) => l.id === input.sourceLinkId);
  if (!sourceLink) throw new Error('A valid consultant referral link is required to schedule a visit.');

  const assignment = resolveAssignment(sourceLink);
  const client = findOrCreateClient(input, assignment, sourceLink.companyId);

  const visitRequest: VisitRequest = {
    id: `visit-${Date.now()}`,
    companyId: sourceLink.companyId,
    propertyId: input.propertyId,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    notes: input.notes,
    status: 'Pending',
    sourceLinkId: input.sourceLinkId,
    clientId: client.id,
    createdAt: new Date().toISOString(),
  };

  visitRequests.push(visitRequest);

  const property = properties.find((p) => p.id === input.propertyId);
  const propertyLabel = property?.name ?? 'a property';
  recordNotification(sourceLink.companyId, 'New visit request', `${input.fullName} requested a visit for ${propertyLabel} (via ${sourceLink.consultantName}).`);

  persistAll();
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
  persistAll();
  return visitRequest;
}
