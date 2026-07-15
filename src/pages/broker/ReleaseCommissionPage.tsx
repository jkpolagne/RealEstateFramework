import { useEffect, useState } from 'react';
import type { CommissionVoucher } from '../../types';
import { getCommissionVouchers, releaseVoucher } from '../../services/commissionVoucherService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { formatPHP } from '../../lib/format';
import { VoucherDetailsModal } from '../../components/shared/VoucherDetailsModal';

export function ReleaseCommissionPage() {
  const { displayName } = useConsultantSession();
  const [vouchers, setVouchers] = useState<CommissionVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [viewingVoucher, setViewingVoucher] = useState<CommissionVoucher | null>(null);

  function refresh() {
    setLoading(true);
    getCommissionVouchers().then((result) => {
      setVouchers(result.filter((v) => v.status === 'Signed'));
      setLoading(false);
    });
  }

  useEffect(refresh, []);

  async function handleRelease(id: string) {
    setActingId(id);
    await releaseVoucher(id, displayName);
    refresh();
    setActingId(null);
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Release Commission</h1>
        <p className="text-muted">Vouchers signed by the consultant, awaiting your release.</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading vouchers...</p>
      ) : vouchers.length === 0 ? (
        <p className="text-muted">No vouchers awaiting release.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Consultant</th>
                <th>Role</th>
                <th>Release</th>
                <th>Net Receivable</th>
                <th>Signed Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => (
                <tr key={voucher.id}>
                  <td className="admin-table-name">{voucher.buyerName}</td>
                  <td>{voucher.consultantName}</td>
                  <td>{voucher.role}</td>
                  <td>
                    {voucher.releaseNumber} of {voucher.totalReleases}
                  </td>
                  <td>{formatPHP(voucher.netCommissionReceivable)}</td>
                  <td>{voucher.signedDate}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setViewingVoucher(voucher)}>
                        View Details
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={actingId === voucher.id}
                        onClick={() => handleRelease(voucher.id)}
                      >
                        {actingId === voucher.id ? 'Releasing...' : 'Release'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewingVoucher && <VoucherDetailsModal voucher={viewingVoucher} onClose={() => setViewingVoucher(null)} />}
    </div>
  );
}
