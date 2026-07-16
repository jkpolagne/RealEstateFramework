import type { Client, CommissionVoucher, VoucherRole } from '../types';
import { commissionVouchers } from '../mocks/commissionVouchers';
import { developers } from '../mocks/developers';
import { consultantAccounts } from '../mocks/consultantAccounts';
import { delay } from '../lib/delay';
import { tranchesEligible, checklistTrancheCap, checklistPhaseStatus } from '../lib/checklist';
import { computeVoucherAmounts } from '../lib/commissionVoucher';
import { persistAll } from '../lib/persist';
import { recordConsultantNotification } from './consultantNotificationService';

export async function getCommissionVouchers(companyId: string): Promise<CommissionVoucher[]> {
  await delay();
  return commissionVouchers.filter((v) => v.companyId === companyId);
}

export async function getVouchersByConsultant(consultantId: string): Promise<CommissionVoucher[]> {
  await delay();
  return commissionVouchers.filter((v) => v.consultantId === consultantId);
}

export async function getVouchersByClient(clientId: string): Promise<CommissionVoucher[]> {
  await delay();
  return commissionVouchers.filter((v) => v.clientId === clientId);
}

export interface ReleasableTranche {
  client: Client;
  role: VoucherRole;
  consultantId: string;
  releaseNumber: number;
}

function entitledRoles(client: Client): { role: VoucherRole; consultantId: string }[] {
  const roles: { role: VoucherRole; consultantId: string }[] = [
    { role: 'Broker', consultantId: client.brokerId },
    { role: 'Sales Manager', consultantId: client.salesManagerId },
  ];
  if (client.saleType === 'Referred' && client.salesPersonId) {
    roles.push({ role: 'Sales Person', consultantId: client.salesPersonId });
  }
  return roles;
}

/**
 * Tranches whose payment threshold has been reached but that don't have a voucher yet, for whichever role
 * is the client's direct/front-line consultant — the Sales Person on a Referred sale, or the Sales Manager
 * herself on a Direct sale (she's the one who handled that client, so her cut is manual too in that case).
 * The Broker is always auto-issued; on a Referred sale the Sales Manager's override cut is also auto-issued
 * since she isn't the one who did the work for that particular client (see issueAutoVoucherIfNeeded).
 */
export function computeReleasableTranches(allClients: Client[], allVouchers: CommissionVoucher[]): ReleasableTranche[] {
  const releasable: ReleasableTranche[] = [];

  for (const client of allClients) {
    const paymentEligible = tranchesEligible(client.paymentProgressPercent, client.totalTranches);
    const checklistCap = checklistTrancheCap(client.requirementsChecklist);
    const eligible = Math.min(paymentEligible, checklistCap);
    if (eligible === 0) continue;

    const manualRoles = entitledRoles(client).filter(
      (r) => r.role !== 'Broker' && !(r.role === 'Sales Manager' && client.saleType === 'Referred'),
    );
    for (const { role, consultantId } of manualRoles) {
      const releasedForRole = allVouchers.filter((v) => v.clientId === client.id && v.role === role).length;
      for (let releaseNumber = releasedForRole + 1; releaseNumber <= eligible; releaseNumber++) {
        releasable.push({ client, role, consultantId, releaseNumber });
      }
    }
  }

  return releasable;
}

export interface HeldTranche {
  client: Client;
  releaseNumber: number;
  checklistStatus: ReturnType<typeof checklistPhaseStatus>;
}

/** Tranches whose payment threshold is reached but that are held back because the requirements checklist isn't caught up yet. */
export function computeHeldTranches(allClients: Client[], allVouchers: CommissionVoucher[]): HeldTranche[] {
  const held: HeldTranche[] = [];

  for (const client of allClients) {
    const paymentEligible = tranchesEligible(client.paymentProgressPercent, client.totalTranches);
    const checklistCap = checklistTrancheCap(client.requirementsChecklist);
    if (paymentEligible <= checklistCap) continue;

    const releasedForBroker = allVouchers.filter((v) => v.clientId === client.id && v.role === 'Broker').length;
    const nextReleaseNumber = Math.max(checklistCap, releasedForBroker) + 1;
    if (nextReleaseNumber > client.totalTranches) continue;

    held.push({ client, releaseNumber: nextReleaseNumber, checklistStatus: checklistPhaseStatus(client.requirementsChecklist) });
  }

  return held;
}

export function developerRate(developerId: string, saleType: Client['saleType'], role: VoucherRole): number {
  const developer = developers.find((d) => d.id === developerId)!;
  if (saleType === 'Direct') {
    return role === 'Broker' ? developer.directSale.brokerPercent : developer.directSale.salesManagerPercent;
  }
  if (role === 'Broker') return developer.referredSale.brokerPercent;
  if (role === 'Sales Manager') return developer.referredSale.salesManagerPercent;
  return developer.referredSale.salesPersonPercent;
}

/** Live preview of the amounts a Create Commission Voucher form would produce, before submitting. */
export function previewVoucherAmounts(client: Client, role: VoucherRole, adcom: number) {
  const rate = developerRate(client.developerId, client.saleType, role);
  const amounts = computeVoucherAmounts(client.salePrice, rate, client.totalTranches, adcom);
  return { rate, ...amounts };
}

export interface CreateVoucherInput {
  client: Client;
  role: VoucherRole;
  consultantId: string;
  consultantName: string;
  releaseNumber: number;
  blockLot: string;
  checkNumber: string;
  bank: string;
  adcom: number;
  dateDisbursed: string;
}

function buildVoucherBase(
  client: Client,
  role: VoucherRole,
  consultantId: string,
  consultantName: string,
  releaseNumber: number,
  extras: { blockLot: string; checkNumber: string; bank: string; adcom: number; dateDisbursed: string },
): CommissionVoucher {
  const developer = developers.find((d) => d.id === client.developerId)!;
  const rate = developerRate(client.developerId, client.saleType, role);
  const amounts = computeVoucherAmounts(client.salePrice, rate, client.totalTranches, extras.adcom);

  return {
    id: `voucher-${Date.now()}-${role.replace(/\s/g, '')}`,
    companyId: client.companyId,
    clientId: client.id,
    developerId: client.developerId,
    developerName: developer.name,
    role,
    consultantId,
    consultantName,
    releaseNumber,
    totalReleases: client.totalTranches,
    ratePercent: rate,
    dateDisbursed: extras.dateDisbursed,
    paidTo: consultantName,
    buyerName: client.fullName,
    rsDate: client.addedDate,
    ntcp: client.salePrice,
    blockLot: extras.blockLot,
    checkNumber: extras.checkNumber,
    bank: extras.bank,
    ...amounts,
    grossCommissionReleasedFrom: `${developer.name} — Tranche ${releaseNumber} of ${client.totalTranches}`,
    approvedByBroker: null,
    receivedByConsultant: null,
    signatureDataUrl: null,
    status: 'Pending Signature',
    signedDate: null,
    releasedDate: null,
    disputeReason: null,
    createdAt: new Date().toISOString(),
  };
}

/** Broker fills out this form once a tranche is releasable — most amounts are computed from the developer's rate. */
export async function createCommissionVoucher(input: CreateVoucherInput): Promise<CommissionVoucher> {
  await delay(500);
  const { client, role, consultantId, consultantName, releaseNumber, blockLot, checkNumber, bank, adcom, dateDisbursed } = input;
  const voucher = buildVoucherBase(client, role, consultantId, consultantName, releaseNumber, {
    blockLot,
    checkNumber,
    bank,
    adcom,
    dateDisbursed,
  });
  commissionVouchers.push(voucher);

  recordConsultantNotification(
    client.companyId,
    consultantId,
    'Voucher awaiting signature',
    `A commission voucher for ${voucher.buyerName} (release ${releaseNumber} of ${client.totalTranches}) is ready for your signature.`,
  );

  persistAll();
  return voucher;
}

/**
 * The Broker's and Sales Manager's own commission shares are never a manual step — the moment a tranche
 * becomes eligible (payment threshold reached AND requirements caught up), their voucher is created and
 * released automatically. Only the Sales Person's cut (Referred sales only) still goes through the
 * Broker's manual Create Commission Voucher + signature flow.
 */
export function issueAutoVoucherIfNeeded(client: Client, role: 'Broker' | 'Sales Manager', releaseNumber: number): void {
  const alreadyExists = commissionVouchers.some(
    (v) => v.clientId === client.id && v.role === role && v.releaseNumber === releaseNumber,
  );
  if (alreadyExists) return;

  const consultantId = role === 'Broker' ? client.brokerId : client.salesManagerId;
  const consultant = consultantAccounts.find((c) => c.id === consultantId);
  const consultantName = consultant ? `${consultant.firstName} ${consultant.lastName}`.trim() : role;

  const broker = consultantAccounts.find((c) => c.id === client.brokerId);
  const brokerName = broker ? `${broker.firstName} ${broker.lastName}`.trim() : 'Broker';

  const today = new Date().toISOString().slice(0, 10);
  const voucher = buildVoucherBase(client, role, consultantId, consultantName, releaseNumber, {
    blockLot: '',
    checkNumber: 'AUTO',
    bank: 'Auto-processed',
    adcom: 0,
    dateDisbursed: today,
  });
  voucher.status = 'Released';
  voucher.receivedByConsultant = consultantName;
  voucher.approvedByBroker = brokerName;
  voucher.signedDate = today;
  voucher.releasedDate = today;
  commissionVouchers.push(voucher);
}

export async function signVoucher(id: string, consultantName: string, signatureDataUrl: string): Promise<CommissionVoucher> {
  await delay(300);
  const voucher = commissionVouchers.find((v) => v.id === id);
  if (!voucher) throw new Error('Voucher not found');
  voucher.status = 'Signed';
  voucher.receivedByConsultant = consultantName;
  voucher.signatureDataUrl = signatureDataUrl;
  voucher.signedDate = new Date().toISOString().slice(0, 10);
  persistAll();
  return voucher;
}

export async function disputeVoucher(id: string, reason: string): Promise<CommissionVoucher> {
  await delay(300);
  const voucher = commissionVouchers.find((v) => v.id === id);
  if (!voucher) throw new Error('Voucher not found');
  voucher.status = 'Disputed';
  voucher.disputeReason = reason;
  persistAll();
  return voucher;
}

export async function releaseVoucher(id: string, brokerName: string): Promise<CommissionVoucher> {
  await delay(400);
  const voucher = commissionVouchers.find((v) => v.id === id);
  if (!voucher) throw new Error('Voucher not found');
  const releasedDate = new Date().toISOString().slice(0, 10);
  voucher.status = 'Released';
  voucher.approvedByBroker = brokerName;
  voucher.releasedDate = releasedDate;
  voucher.dateDisbursed = releasedDate;

  recordConsultantNotification(
    voucher.companyId,
    voucher.consultantId,
    'Commission released',
    `Your commission for ${voucher.buyerName} (release ${voucher.releaseNumber} of ${voucher.totalReleases}) has been released.`,
  );

  persistAll();
  return voucher;
}
