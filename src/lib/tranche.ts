import type { CommissionVoucher } from '../types';

/** Every client has exactly one Broker-role voucher per tranche, so that role's Released count is the canonical release count. */
export function releasedTranchesForClient(clientId: string, vouchers: CommissionVoucher[]): number {
  return vouchers.filter((v) => v.clientId === clientId && v.role === 'Broker' && v.status === 'Released').length;
}
