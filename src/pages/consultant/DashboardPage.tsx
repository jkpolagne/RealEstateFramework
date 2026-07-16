import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Client, CommissionVoucher } from '../../types';
import { getClientsBySalesManager, getClientsBySalesPerson } from '../../services/clientService';
import { getVouchersByConsultant, getCommissionVouchers } from '../../services/commissionVoucherService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { StatTile } from '../../components/shared/StatTile';
import { formatPHP } from '../../lib/format';
import { releasedTranchesForClient } from '../../lib/tranche';
import { ConsultantLinkCard } from '../../components/consultant/ConsultantLinkCard';

export function DashboardPage() {
  const { consultantId, companyId, role, displayName } = useConsultantSession();
  const isManager = role === 'Sales Manager';
  const basePath = isManager ? '/sales-manager' : '/sales-person';

  const [clients, setClients] = useState<Client[]>([]);
  const [vouchers, setVouchers] = useState<CommissionVoucher[]>([]);
  const [allVouchers, setAllVouchers] = useState<CommissionVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = isManager ? getClientsBySalesManager(consultantId) : getClientsBySalesPerson(consultantId);
    Promise.all([fetchClients, getVouchersByConsultant(consultantId), getCommissionVouchers(companyId)]).then(
      ([clientResult, voucherResult, allVoucherResult]) => {
        setClients(clientResult);
        setVouchers(voucherResult);
        setAllVouchers(allVoucherResult);
        setLoading(false);
      },
    );
  }, [consultantId, companyId, isManager]);

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

      <ConsultantLinkCard consultantId={consultantId} />

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
              if (client.status === 'Pending Setup') {
                return (
                  <li key={client.id}>
                    <div>
                      <p className="admin-activity-title">{client.fullName}</p>
                      <p className="text-muted">New lead</p>
                    </div>
                    <span className="badge badge-reserved">Pending Setup</span>
                  </li>
                );
              }
              const released = releasedTranchesForClient(client.id, allVouchers);
              return (
                <li key={client.id}>
                  <div>
                    <p className="admin-activity-title">{client.fullName}</p>
                    <p className="text-muted">{client.paymentMethod}</p>
                  </div>
                  <div className="tranche-progress tranche-progress-compact">
                    <span className="text-muted">
                      Milestone {released} of {client.totalTranches} — {client.paymentProgressPercent}% paid
                    </span>
                    <div className="tranche-bar">
                      <div className="tranche-bar-fill" style={{ width: `${client.paymentProgressPercent}%` }} />
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
