import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Client, CommissionVoucher } from '../../types';
import { getClientsBySalesManager, getClientsBySalesPerson } from '../../services/clientService';
import { getVouchersByConsultant } from '../../services/commissionVoucherService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { StatTile } from '../../components/shared/StatTile';
import { formatPHP } from '../../lib/format';
import { releasedTranchesForClient } from '../../lib/tranche';

export function DashboardPage() {
  const { consultantId, role, displayName } = useConsultantSession();
  const isManager = role === 'Sales Manager';
  const basePath = isManager ? '/sales-manager' : '/sales-person';

  const [clients, setClients] = useState<Client[]>([]);
  const [vouchers, setVouchers] = useState<CommissionVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = isManager ? getClientsBySalesManager(consultantId) : getClientsBySalesPerson(consultantId);
    Promise.all([fetchClients, getVouchersByConsultant(consultantId)]).then(([clientResult, voucherResult]) => {
      setClients(clientResult);
      setVouchers(voucherResult);
      setLoading(false);
    });
  }, [consultantId, isManager]);

  const primaryCount = isManager ? clients.filter((c) => c.salesPersonId === null).length : clients.length;
  const secondaryCount = isManager ? clients.length : clients.filter((c) => c.paymentProgressPercent < 100).length;
  const vouchersToSign = vouchers.filter((v) => v.status === 'Pending Signature').length;
  const releasedCommission = vouchers.filter((v) => v.status === 'Released').reduce((sum, v) => sum + v.netCommissionReceivable, 0);

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
        <p className="text-muted">Welcome back, {displayName.split(' ')[0]}.</p>
      </div>

      <div className="stat-tile-row">
        <StatTile label={isManager ? 'My direct clients' : 'My total clients'} value={String(primaryCount)} accent />
        <StatTile label={isManager ? 'Team total clients' : 'Active clients'} value={String(secondaryCount)} />
        <StatTile label="Vouchers to sign" value={String(vouchersToSign)} />
        <StatTile label="My released commission" value={formatPHP(releasedCommission)} />
      </div>

      <div className="card admin-dashboard-panel">
        <div className="admin-dashboard-panel-header">
          <h3>Payment milestone tracker</h3>
          <Link to={`${basePath}/monitor-clients`} className="btn btn-outline btn-sm">
            View All
          </Link>
        </div>
        {clients.length === 0 ? (
          <p className="text-muted">No clients yet.</p>
        ) : (
          <ul className="admin-activity-list">
            {clients.slice(0, 5).map((client) => {
              const released = releasedTranchesForClient(client.id, vouchers);
              return (
                <li key={client.id}>
                  <div>
                    <p className="admin-activity-title">{client.fullName}</p>
                    <p className="text-muted">{client.paymentMethod}</p>
                  </div>
                  <div className="tranche-progress tranche-progress-compact">
                    <span className="text-muted">
                      Tranche {released} of {client.totalTranches}
                    </span>
                    <div className="tranche-bar">
                      <div className="tranche-bar-fill" style={{ width: `${(released / client.totalTranches) * 100}%` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
