import type { Client, CommissionVoucher, VoucherRole } from '../types';
import { clients } from './clients';
import { developers } from './developers';
import { properties } from './properties';
import { consultantAccounts } from './consultantAccounts';
import { computeVoucherAmounts } from '../lib/commissionVoucher';
import { BLOCK_LOT_BY_PROPERTY } from '../lib/blockLot';

const BROKER_NAME = 'Jann Kevin Belarmino';

function developerRate(developerId: string, saleType: Client['saleType'], role: VoucherRole): number {
  const developer = developers.find((d) => d.id === developerId)!;
  if (saleType === 'Direct') {
    return role === 'Broker' ? developer.directSale.brokerPercent : developer.directSale.salesManagerPercent;
  }
  if (role === 'Broker') return developer.referredSale.brokerPercent;
  if (role === 'Sales Manager') return developer.referredSale.salesManagerPercent;
  return developer.referredSale.salesPersonPercent;
}

function consultantName(id: string): string {
  const c = consultantAccounts.find((a) => a.id === id);
  return c ? `${c.firstName} ${c.lastName}` : 'Unknown Consultant';
}

interface BuildVoucherInput {
  client: Client;
  role: VoucherRole;
  consultantId: string;
  releaseNumber: number;
  checkNumber: string;
  bank: string;
  disbursedDate: string;
  signedDate: string;
}

let voucherSeq = 0;

function buildReleasedVoucher(input: BuildVoucherInput): CommissionVoucher {
  voucherSeq += 1;
  const { client, role, consultantId, releaseNumber, checkNumber, bank, disbursedDate, signedDate } = input;
  const developer = developers.find((d) => d.id === client.developerId)!;
  const property = properties.find((p) => p.id === client.propertyId);
  const rate = developerRate(client.developerId, client.saleType, role);
  const amounts = computeVoucherAmounts(client.salePrice, rate, client.totalTranches);
  const name = consultantName(consultantId);

  return {
    id: `voucher-${voucherSeq}`,
    clientId: client.id,
    developerId: client.developerId,
    developerName: developer.name,
    role,
    consultantId,
    consultantName: name,
    releaseNumber,
    totalReleases: client.totalTranches,
    ratePercent: rate,
    dateDisbursed: disbursedDate,
    paidTo: name,
    buyerName: client.fullName,
    rsDate: client.addedDate,
    ntcp: client.salePrice,
    blockLot: BLOCK_LOT_BY_PROPERTY[client.propertyId] ?? (property ? property.name : 'N/A'),
    checkNumber,
    bank,
    ...amounts,
    grossCommissionReleasedFrom: `${developer.name} — Tranche ${releaseNumber} of ${client.totalTranches}`,
    approvedByBroker: BROKER_NAME,
    receivedByConsultant: name,
    status: 'Released',
    signedDate,
    releasedDate: disbursedDate,
    disputeReason: null,
    createdAt: signedDate,
  };
}

const carlo = clients.find((c) => c.id === 'client-carlo-reyes')!;
const ronaldo = clients.find((c) => c.id === 'client-ronaldo-mendiola')!;
const angeline = clients.find((c) => c.id === 'client-angeline-bautista')!;

export const commissionVouchers: CommissionVoucher[] = [
  // Carlo Reyes — Bank Financing, 2 of 4 tranches released, Referred (Broker + Sales Manager + Sales Person)
  ...[1, 2].flatMap((releaseNumber) =>
    (['Broker', 'Sales Manager', 'Sales Person'] as VoucherRole[]).map((role) =>
      buildReleasedVoucher({
        client: carlo,
        role,
        consultantId: role === 'Broker' ? carlo.brokerId : role === 'Sales Manager' ? carlo.salesManagerId : carlo.salesPersonId!,
        releaseNumber,
        checkNumber: `CHK-${1000 + releaseNumber * 3 + ['Broker', 'Sales Manager', 'Sales Person'].indexOf(role)}`,
        bank: 'BDO Naga City Branch',
        disbursedDate: releaseNumber === 1 ? '2026-06-25' : '2026-07-12',
        signedDate: releaseNumber === 1 ? '2026-06-24' : '2026-07-11',
      }),
    ),
  ),

  // Ronaldo Mendiola — In-House, all 4 of 4 tranches released, Direct (Broker + Sales Manager only)
  ...[1, 2, 3, 4].flatMap((releaseNumber) =>
    (['Broker', 'Sales Manager'] as VoucherRole[]).map((role) =>
      buildReleasedVoucher({
        client: ronaldo,
        role,
        consultantId: role === 'Broker' ? ronaldo.brokerId : ronaldo.salesManagerId,
        releaseNumber,
        checkNumber: `CHK-${2000 + releaseNumber * 2 + ['Broker', 'Sales Manager'].indexOf(role)}`,
        bank: 'Metrobank Naga City Branch',
        disbursedDate: `2026-0${releaseNumber + 2}-20`,
        signedDate: `2026-0${releaseNumber + 2}-18`,
      }),
    ),
  ),

  // Angeline Bautista — Cash, single tranche released, Referred (Broker + Sales Manager + Sales Person)
  ...(['Broker', 'Sales Manager', 'Sales Person'] as VoucherRole[]).map((role) =>
    buildReleasedVoucher({
      client: angeline,
      role,
      consultantId:
        role === 'Broker' ? angeline.brokerId : role === 'Sales Manager' ? angeline.salesManagerId : angeline.salesPersonId!,
      releaseNumber: 1,
      checkNumber: `CHK-3${['Broker', 'Sales Manager', 'Sales Person'].indexOf(role)}01`,
      bank: 'BPI Pili Branch',
      disbursedDate: '2026-07-09',
      signedDate: '2026-07-09',
    }),
  ),
];
