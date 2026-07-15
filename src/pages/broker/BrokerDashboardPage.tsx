import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Client, CommissionVoucher, ConsultantAccount } from '../../types';
import { getConsultantAccounts } from '../../services/consultantAccountService';
import { getClients } from '../../services/clientService';
import { getCommissionVouchers, computeReleasableTranches } from '../../services/commissionVoucherService';
import { StatTile } from '../../components/shared/StatTile';
import { formatPHP } from '../../lib/format';

export function BrokerDashboardPage() {
  const [consultants, setConsultants] = useState<ConsultantAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vouchers, setVouchers] = useState<CommissionVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getConsultantAccounts(), getClients(), getCommissionVouchers()]).then(([consultantResult, clientResult, voucherResult]) => {
      setConsultants(consultantResult);
      setClients(clientResult);
      setVouchers(voucherResult);
      setLoading(false);
    });
  }, []);

  const totalSalesManagers = consultants.filter((c) => c.role === 'Sales Manager').length;
  const totalSalesPersons = consultants.filter((c) => c.role === 'Sales Person').length;
  const releasable = computeReleasableTranches(clients, vouchers);

  const now = new Date();
  const releasedThisMonth = vouchers
    .filter(
      (v) =>
        v.status === 'Released' &&
        v.releasedDate &&
        new Date(v.releasedDate).getMonth() === now.getMonth() &&
        new Date(v.releasedDate).getFullYear() === now.getFullYear(),
    )
    .reduce((sum, v) => sum + v.netCommissionReceivable, 0);

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Dashboard</h1>
        </div>
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p className="text-muted">Overview of your team and commission activity.</p>
      </div>

      <div className="stat-tile-row">
        <StatTile label="Total Sales Managers" value={String(totalSalesManagers)} />
        <StatTile label="Total Sales Persons" value={String(totalSalesPersons)} />
        <StatTile label="Eligible commission requests" value={String(releasable.length)} accent />
        <StatTile label="Commission released this month" value={formatPHP(releasedThisMonth)} />
      </div>

      <div className="card admin-dashboard-panel">
        <div className="admin-dashboard-panel-header">
          <h3>Releasable commissions</h3>
          <Link to="/broker/releasable-commission" className="btn btn-outline btn-sm">
            View All
          </Link>
        </div>
        {releasable.length === 0 ? (
          <p className="text-muted">No tranches are currently due for a voucher.</p>
        ) : (
          <table className="admin-table admin-table-plain">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Role</th>
                <th>Release</th>
              </tr>
            </thead>
            <tbody>
              {releasable.slice(0, 5).map((item) => (
                <tr key={`${item.client.id}-${item.role}-${item.releaseNumber}`}>
                  <td className="admin-table-name">{item.client.fullName}</td>
                  <td>{item.role}</td>
                  <td>
                    {item.releaseNumber} of {item.client.totalTranches}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card admin-dashboard-panel">
        <h3>Team overview</h3>
        <dl className="admin-team-breakdown">
          <div>
            <dt>Total clients across the team</dt>
            <dd>{clients.length}</dd>
          </div>
          <div>
            <dt>Total sales volume</dt>
            <dd>{formatPHP(clients.reduce((sum, c) => sum + c.salePrice, 0))}</dd>
          </div>
          <div>
            <dt>Vouchers released to date</dt>
            <dd>{vouchers.filter((v) => v.status === 'Released').length}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
