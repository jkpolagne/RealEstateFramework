import { useEffect, useState } from 'react';
import type { Client, CommissionVoucher } from '../../types';
import { getClientsBySalesManager, getClientsBySalesPerson } from '../../services/clientService';
import { getVouchersByConsultant } from '../../services/commissionVoucherService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { StatTile } from '../../components/shared/StatTile';
import { formatPHP } from '../../lib/format';

function monthLabel(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
}

export function PerformancePage() {
  const { consultantId, role } = useConsultantSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [vouchers, setVouchers] = useState<CommissionVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = role === 'Sales Manager' ? getClientsBySalesManager(consultantId) : getClientsBySalesPerson(consultantId);
    Promise.all([fetchClients, getVouchersByConsultant(consultantId)]).then(([clientResult, voucherResult]) => {
      setClients(clientResult);
      setVouchers(voucherResult);
      setLoading(false);
    });
  }, [consultantId, role]);

  const totalSalesAmount = clients.reduce((sum, c) => sum + c.salePrice, 0);
  const directSaleClients = clients.filter((c) => c.saleType === 'Direct').length;

  const now = new Date();
  const thisMonthCommission = vouchers
    .filter((v) => v.status === 'Released' && v.releasedDate && new Date(v.releasedDate).getMonth() === now.getMonth() && new Date(v.releasedDate).getFullYear() === now.getFullYear())
    .reduce((sum, v) => sum + v.netCommissionReceivable, 0);

  const releasedByMonth = new Map<string, { count: number; total: number }>();
  for (const voucher of vouchers) {
    if (voucher.status !== 'Released' || !voucher.releasedDate) continue;
    const key = voucher.releasedDate.slice(0, 7);
    const existing = releasedByMonth.get(key);
    if (existing) {
      existing.count += 1;
      existing.total += voucher.netCommissionReceivable;
    } else {
      releasedByMonth.set(key, { count: 1, total: voucher.netCommissionReceivable });
    }
  }
  const monthlyRows = [...releasedByMonth.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Performance</h1>
        </div>
        <p className="text-muted">Loading performance data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Performance</h1>
        <p className="text-muted">Your sales and commission performance over time.</p>
      </div>

      <div className="stat-tile-row">
        <StatTile label="Total clients" value={String(clients.length)} />
        <StatTile label="Total sales amount" value={formatPHP(totalSalesAmount)} accent />
        <StatTile label="Direct sale clients" value={String(directSaleClients)} />
        <StatTile label="Commission this month" value={formatPHP(thisMonthCommission)} />
      </div>

      <div className="card admin-dashboard-panel">
        <h3>Monthly performance trend</h3>
        {monthlyRows.length === 0 ? (
          <p className="text-muted">No released commission yet.</p>
        ) : (
          <table className="admin-table admin-table-plain">
            <thead>
              <tr>
                <th>Month</th>
                <th>Vouchers released</th>
                <th>Commission released</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map(([key, row]) => (
                <tr key={key}>
                  <td className="admin-table-name">{monthLabel(`${key}-01`)}</td>
                  <td>{row.count}</td>
                  <td>{formatPHP(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
