import type { Client, EmploymentStatus, PaymentMethod, PaymentRecord } from '../types';
import { clients } from '../mocks/clients';
import { paymentRecords } from '../mocks/paymentRecords';
import { delay } from '../lib/delay';
import { tranchesEligible, checklistTrancheCap, buildRequirementsChecklist } from '../lib/checklist';
import { persistAll } from '../lib/persist';
import { recordConsultantNotification } from './consultantNotificationService';
import { issueAutoVoucherIfNeeded } from './commissionVoucherService';

export async function getClients(companyId: string): Promise<Client[]> {
  await delay();
  return clients.filter((c) => c.companyId === companyId);
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

export interface SetUpClientInput {
  clientId: string;
  paymentMethod: PaymentMethod;
  employmentStatus: EmploymentStatus | null;
}

/** Turns a Pending Setup lead into an Active, payable client: picks the payment method, builds the requirements checklist, and starts milestone tracking. */
export async function setUpClient(input: SetUpClientInput): Promise<Client> {
  await delay(400);
  const client = clients.find((c) => c.id === input.clientId);
  if (!client) throw new Error('Client not found');

  const employmentStatus = input.paymentMethod === 'Bank Financing' ? input.employmentStatus : null;
  client.paymentMethod = input.paymentMethod;
  client.employmentStatus = employmentStatus;
  client.totalTranches = input.paymentMethod === 'Cash' ? 1 : 4;
  client.requirementsChecklist = buildRequirementsChecklist(input.paymentMethod, employmentStatus);
  client.status = 'Active';

  persistAll();
  return client;
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
  proofImage: string;
  uploadedById: string;
}

export interface RecordPaymentResult {
  client: Client;
  newTranchesDue: number;
  voucherHeldForRequirements: boolean;
}

/** Recomputes payment progress from cumulative payments; notifies the broker if a new tranche threshold is crossed. */
export async function recordPayment(input: RecordPaymentInput): Promise<RecordPaymentResult> {
  await delay(500);
  const client = clients.find((c) => c.id === input.clientId);
  if (!client) throw new Error('Client not found');

  const before = tranchesEligible(client.paymentProgressPercent, client.totalTranches);

  const record: PaymentRecord = { id: `payment-${Date.now()}`, companyId: client.companyId, ...input, createdAt: new Date().toISOString() };
  paymentRecords.push(record);

  const totalPaid = paymentRecords.filter((p) => p.clientId === client.id).reduce((sum, p) => sum + p.amount, 0);
  client.paymentProgressPercent = Math.min(100, Math.round((totalPaid / client.salePrice) * 100));

  const after = tranchesEligible(client.paymentProgressPercent, client.totalTranches);
  const newTranchesDue = after - before;
  const checklistCap = checklistTrancheCap(client.requirementsChecklist);
  const voucherHeldForRequirements = newTranchesDue > 0 && after > checklistCap;

  if (newTranchesDue > 0) {
    if (!voucherHeldForRequirements) {
      recordConsultantNotification(
        client.companyId,
        client.brokerId,
        'Voucher due',
        `${client.fullName}'s payment crossed a new milestone — tranche ${after} of ${client.totalTranches} is now eligible for a commission voucher.`,
      );
    } else {
      recordConsultantNotification(
        client.companyId,
        client.brokerId,
        'Payment milestone reached — requirements pending',
        `${client.fullName}'s payment crossed the tranche ${after} of ${client.totalTranches} milestone, but the voucher is held until their requirements checklist is caught up.`,
      );
    }
  }

  const cappedBefore = Math.min(before, checklistCap);
  const cappedAfter = Math.min(after, checklistCap);
  for (let r = cappedBefore + 1; r <= cappedAfter; r++) {
    issueAutoVoucherIfNeeded(client, 'Broker', r);
    if (client.saleType === 'Referred') issueAutoVoucherIfNeeded(client, 'Sales Manager', r);
  }

  persistAll();
  return { client, newTranchesDue, voucherHeldForRequirements };
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

  const paymentEligible = tranchesEligible(client.paymentProgressPercent, client.totalTranches);
  const before = Math.min(paymentEligible, checklistTrancheCap(client.requirementsChecklist));

  item.checked = checked;
  item.verifiedBy = checked ? verifiedBy : null;
  item.verifiedDate = checked ? new Date().toISOString().slice(0, 10) : null;

  const after = Math.min(paymentEligible, checklistTrancheCap(client.requirementsChecklist));
  if (after > before) {
    recordConsultantNotification(
      client.companyId,
      client.brokerId,
      'Voucher due',
      `${client.fullName}'s requirements are now caught up — tranche ${after} of ${client.totalTranches} is eligible for a commission voucher.`,
    );
    for (let r = before + 1; r <= after; r++) {
      issueAutoVoucherIfNeeded(client, 'Broker', r);
      if (client.saleType === 'Referred') issueAutoVoucherIfNeeded(client, 'Sales Manager', r);
    }
  }

  persistAll();
  return client;
}

export async function updateClientContact(clientId: string, notes: string): Promise<Client> {
  await delay(300);
  const client = clients.find((c) => c.id === clientId);
  if (!client) throw new Error('Client not found');
  client.lastContactedDate = new Date().toISOString().slice(0, 10);
  client.notes = notes;
  persistAll();
  return client;
}
