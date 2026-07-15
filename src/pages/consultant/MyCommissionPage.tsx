import { useEffect, useState } from 'react';
import type { CommissionVoucher } from '../../types';
import { getVouchersByConsultant } from '../../services/commissionVoucherService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { StatTile } from '../../components/shared/StatTile';
import { formatPHP } from '../../lib/format';

function statusBadgeClass(status: CommissionVoucher['status']): string {
  if (status === 'Released') return 'badge-available';
  if (status === 'Signed') return 'badge-reserved';
  if (status === 'Disputed') return 'badge-sold';
  return 'badge-neutral';
}

export function MyCommissionPage() {
  const { consultantId } = useConsultantSession();
  const [vouchers, setVouchers] = useState<CommissionVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVouchersByConsultant(consultantId).then((result) => {
      setVouchers(result);
      setLoading(false);
    });
  }, [consultantId]);

  const needsSignature = vouchers.filter((v) => v.status === 'Pending Signature').length;
  const eligibleForProcessing = vouchers.filter((v) => v.status === 'Signed').length;
  const commissionReleased = vouchers.filter((v) => v.status === 'Released').reduce((sum, v) => sum + v.netCommissionReceivable, 0);

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>My Commission</h1>
        </div>
        <p className="text-muted">Loading commission records...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>My Commission</h1>
        <p className="text-muted">Every commission voucher issued to you.</p>
      </div>

      <div className="stat-tile-row">
        <StatTile label="Total vouchers" value={String(vouchers.length)} />
        <StatTile label="Needs signature" value={String(needsSignature)} />
        <StatTile label="Eligible for processing" value={String(eligibleForProcessing)} />
        <StatTile label="Commission released" value={formatPHP(commissionReleased)} accent />
      </div>

      {vouchers.length === 0 ? (
        <p className="text-muted">No commission vouchers yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Release</th>
                <th>Rate</th>
                <th>Net Receivable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => (
                <tr key={voucher.id}>
                  <td className="admin-table-name">{voucher.buyerName}</td>
                  <td>
                    {voucher.releaseNumber} of {voucher.totalReleases}
                  </td>
                  <td>{voucher.ratePercent}%</td>
                  <td>{formatPHP(voucher.netCommissionReceivable)}</td>
                  <td>
                    <span className={`badge ${statusBadgeClass(voucher.status)}`}>{voucher.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
