import { useEffect, useState } from 'react';
import type { CommissionVoucher, VoucherStatus } from '../../types';
import { getCommissionVouchers } from '../../services/commissionVoucherService';
import { formatPHP } from '../../lib/format';
import { VoucherDetailsModal } from '../../components/shared/VoucherDetailsModal';

type StatusFilter = 'all' | VoucherStatus;

function statusBadgeClass(status: VoucherStatus): string {
  if (status === 'Released') return 'badge-available';
  if (status === 'Signed') return 'badge-reserved';
  if (status === 'Disputed') return 'badge-sold';
  return 'badge-neutral';
}

export function AllCommissionVouchersPage() {
  const [vouchers, setVouchers] = useState<CommissionVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewingVoucher, setViewingVoucher] = useState<CommissionVoucher | null>(null);

  useEffect(() => {
    getCommissionVouchers().then((result) => {
      setVouchers([...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    });
  }, []);

  const filtered = vouchers.filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!v.buyerName.toLowerCase().includes(q) && !v.consultantName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1>All Commission Vouchers</h1>
        <p className="text-muted">Full history of every commission voucher generated.</p>
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Search by buyer or consultant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">All statuses</option>
          <option value="Pending Signature">Pending Signature</option>
          <option value="Signed">Signed</option>
          <option value="Disputed">Disputed</option>
          <option value="Released">Released</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Loading vouchers...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">No vouchers match your filters.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Developer</th>
                <th>Consultant</th>
                <th>Role</th>
                <th>Release</th>
                <th>Net Receivable</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((voucher) => (
                <tr key={voucher.id}>
                  <td className="admin-table-name">{voucher.buyerName}</td>
                  <td>{voucher.developerName}</td>
                  <td>{voucher.consultantName}</td>
                  <td>{voucher.role}</td>
                  <td>
                    {voucher.releaseNumber} of {voucher.totalReleases}
                  </td>
                  <td>{formatPHP(voucher.netCommissionReceivable)}</td>
                  <td>
                    <span className={`badge ${statusBadgeClass(voucher.status)}`}>{voucher.status}</span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setViewingVoucher(voucher)}>
                      View Details
                    </button>
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
