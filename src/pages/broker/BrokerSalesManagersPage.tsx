import { useEffect, useState } from 'react';
import type { Client, ConsultantAccount } from '../../types';
import { getConsultantAccountsByRole } from '../../services/consultantAccountService';
import { getClients } from '../../services/clientService';
import { formatPHP } from '../../lib/format';

function performanceBadge(totalSales: number): { label: string; className: string } {
  if (totalSales >= 5_000_000) return { label: 'Top Performer', className: 'badge-available' };
  if (totalSales >= 1_000_000) return { label: 'Steady', className: 'badge-reserved' };
  return { label: 'Needs Support', className: 'badge-sold' };
}

export function BrokerSalesManagersPage() {
  const [salesManagers, setSalesManagers] = useState<ConsultantAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getConsultantAccountsByRole('Sales Manager'), getClients()]).then(([smResult, clientResult]) => {
      setSalesManagers(smResult);
      setClients(clientResult);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Sales Managers</h1>
        <p className="text-muted">Your Sales Managers and their team's performance.</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading Sales Managers...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Total Clients</th>
                <th>Total Sales</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {salesManagers.map((sm) => {
                const smClients = clients.filter((c) => c.salesManagerId === sm.id);
                const totalSales = smClients.reduce((sum, c) => sum + c.salePrice, 0);
                const badge = performanceBadge(totalSales);
                return (
                  <tr key={sm.id}>
                    <td className="admin-table-name">
                      {sm.firstName} {sm.lastName}
                    </td>
                    <td className="text-muted">{sm.email}</td>
                    <td>{smClients.length}</td>
                    <td>{formatPHP(totalSales)}</td>
                    <td>
                      <span className={`badge ${badge.className}`}>{badge.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
