import type { Client, PaymentRecord } from '../types';
import { clients } from '../mocks/clients';
import { paymentRecords } from '../mocks/paymentRecords';
import { delay } from '../lib/delay';
import { tranchesEligible } from '../lib/checklist';
import { recordConsultantNotification } from './consultantNotificationService';

export async function getClients(): Promise<Client[]> {
  await delay();
  return clients;
}

export async function getClientById(id: string): Promise<Client | undefined> {
  await delay();
  return clients.find((c) => c.id === id);
}

export async function getClientsByBroker(brokerId: string): Promise<Client[]> {
  await delay();
  return clients.filter((c) => c.brokerId === brokerId);
}

export async function getClientsBySalesManager(salesManagerId: string): Promise<Client[]> {
  await delay();
  return clients.filter((c) => c.salesManagerId === salesManagerId);
}

export async function getClientsBySalesPerson(salesPersonId: string): Promise<Client[]> {
  await delay();
  return clients.filter((c) => c.salesPersonId === salesPersonId);
}

export async function getPaymentRecordsByClient(clientId: string): Promise<PaymentRecord[]> {
  await delay();
  return paymentRecords
    .filter((p) => p.clientId === clientId)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
}

export interface RecordPaymentInput {
  clientId: string;
  amount: number;
  paymentDate: string;
  method: string;
  referenceNumber: string;
  uploadedById: string;
}

export interface RecordPaymentResult {
  client: Client;
  newTranchesDue: number;
}

/** Recomputes payment progress from cumulative payments; notifies the broker if a new tranche threshold is crossed. */
export async function recordPayment(input: RecordPaymentInput): Promise<RecordPaymentResult> {
  await delay(500);
  const client = clients.find((c) => c.id === input.clientId);
  if (!client) throw new Error('Client not found');

  const before = tranchesEligible(client.paymentProgressPercent, client.totalTranches);

  const record: PaymentRecord = { id: `payment-${Date.now()}`, ...input, createdAt: new Date().toISOString() };
  paymentRecords.push(record);

  const totalPaid = paymentRecords.filter((p) => p.clientId === client.id).reduce((sum, p) => sum + p.amount, 0);
  client.paymentProgressPercent = Math.min(100, Math.round((totalPaid / client.salePrice) * 100));

  const after = tranchesEligible(client.paymentProgressPercent, client.totalTranches);
  const newTranchesDue = after - before;

  if (newTranchesDue > 0) {
    recordConsultantNotification(
      client.brokerId,
      'Voucher due',
      `${client.fullName}'s payment crossed a new milestone — tranche ${after} of ${client.totalTranches} is now eligible for a commission voucher.`,
    );
  }

  return { client, newTranchesDue };
}

export async function updateChecklistItem(
  clientId: string,
  itemId: string,
  checked: boolean,
  verifiedBy: string,
): Promise<Client> {
  await delay(300);
  const client = clients.find((c) => c.id === clientId);
  if (!client) throw new Error('Client not found');
  const item = client.requirementsChecklist.find((i) => i.id === itemId);
  if (!item) throw new Error('Checklist item not found');
  item.checked = checked;
  item.verifiedBy = checked ? verifiedBy : null;
  item.verifiedDate = checked ? new Date().toISOString().slice(0, 10) : null;
  return client;
}

export async function updateClientContact(clientId: string, notes: string): Promise<Client> {
  await delay(300);
  const client = clients.find((c) => c.id === clientId);
  if (!client) throw new Error('Client not found');
  client.lastContactedDate = new Date().toISOString().slice(0, 10);
  client.notes = notes;
  return client;
}
