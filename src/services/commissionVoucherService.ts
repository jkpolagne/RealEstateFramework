import type { Client, CommissionVoucher, VoucherRole } from '../types';
import { commissionVouchers } from '../mocks/commissionVouchers';
import { developers } from '../mocks/developers';
import { delay } from '../lib/delay';
import { tranchesEligible } from '../lib/checklist';
import { computeVoucherAmounts } from '../lib/commissionVoucher';
import { recordConsultantNotification } from './consultantNotificationService';

export async function getCommissionVouchers(): Promise<CommissionVoucher[]> {
  await delay();
  return commissionVouchers;
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

/** Tranches whose payment threshold has been reached but that don't have a voucher yet, for every entitled role. */
export function computeReleasableTranches(allClients: Client[], allVouchers: CommissionVoucher[]): ReleasableTranche[] {
  const releasable: ReleasableTranche[] = [];

  for (const client of allClients) {
    const eligible = tranchesEligible(client.paymentProgressPercent, client.totalTranches);
    if (eligible === 0) continue;

    for (const { role, consultantId } of entitledRoles(client)) {
      const releasedForRole = allVouchers.filter((v) => v.clientId === client.id && v.role === role).length;
      for (let releaseNumber = releasedForRole + 1; releaseNumber <= eligible; releaseNumber++) {
        releasable.push({ client, role, consultantId, releaseNumber });
      }
    }
  }

  return releasable;
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

/** Broker fills out this form once a tranche is releasable — most amounts are computed from the developer's rate. */
export async function createCommissionVoucher(input: CreateVoucherInput): Promise<CommissionVoucher> {
  await delay(500);
  const { client, role, consultantId, consultantName, releaseNumber, blockLot, checkNumber, bank, adcom, dateDisbursed } = input;
  const developer = developers.find((d) => d.id === client.developerId)!;
  const rate = developerRate(client.developerId, client.saleType, role);
  const amounts = computeVoucherAmounts(client.salePrice, rate, client.totalTranches, adcom);

  const voucher: CommissionVoucher = {
    id: `voucher-${Date.now()}`,
    clientId: client.id,
    developerId: client.developerId,
    developerName: developer.name,
    role,
    consultantId,
    consultantName,
    releaseNumber,
    totalReleases: client.totalTranches,
    ratePercent: rate,
    dateDisbursed,
    paidTo: consultantName,
    buyerName: client.fullName,
    rsDate: client.addedDate,
    ntcp: client.salePrice,
    blockLot,
    checkNumber,
    bank,
    ...amounts,
    grossCommissionReleasedFrom: `${developer.name} — Tranche ${releaseNumber} of ${client.totalTranches}`,
    approvedByBroker: null,
    // A Broker-role voucher has no separate signer — the Broker who creates it is also its recipient,
    // and there's no "Sign Voucher" page in the Broker portal for them to sign their own commission.
    receivedByConsultant: role === 'Broker' ? consultantName : null,
    signatureDataUrl: null,
    status: role === 'Broker' ? 'Signed' : 'Pending Signature',
    signedDate: role === 'Broker' ? new Date().toISOString().slice(0, 10) : null,
    releasedDate: null,
    disputeReason: null,
    createdAt: new Date().toISOString(),
  };
  commissionVouchers.push(voucher);

  if (role === 'Broker') {
    recordConsultantNotification(
      consultantId,
      'Voucher ready to release',
      `Your commission voucher for ${voucher.buyerName} (release ${releaseNumber} of ${client.totalTranches}) is ready to release.`,
    );
  } else {
    recordConsultantNotification(
      consultantId,
      'Voucher awaiting signature',
      `A commission voucher for ${voucher.buyerName} (release ${releaseNumber} of ${client.totalTranches}) is ready for your signature.`,
    );
  }

  return voucher;
}

export async function signVoucher(id: string, consultantName: string, signatureDataUrl: string): Promise<CommissionVoucher> {
  await delay(300);
  const voucher = commissionVouchers.find((v) => v.id === id);
  if (!voucher) throw new Error('Voucher not found');
  voucher.status = 'Signed';
  voucher.receivedByConsultant = consultantName;
  voucher.signatureDataUrl = signatureDataUrl;
  voucher.signedDate = new Date().toISOString().slice(0, 10);
  return voucher;
}

export async function disputeVoucher(id: string, reason: string): Promise<CommissionVoucher> {
  await delay(300);
  const voucher = commissionVouchers.find((v) => v.id === id);
  if (!voucher) throw new Error('Voucher not found');
  voucher.status = 'Disputed';
  voucher.disputeReason = reason;
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
    voucher.consultantId,
    'Commission released',
    `Your commission for ${voucher.buyerName} (release ${voucher.releaseNumber} of ${voucher.totalReleases}) has been released.`,
  );

  return voucher;
}
