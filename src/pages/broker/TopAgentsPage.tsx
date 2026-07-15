import { useEffect, useState } from 'react';
import type { Client, ConsultantAccount } from '../../types';
import { getConsultantAccounts } from '../../services/consultantAccountService';
import { getClients } from '../../services/clientService';
import { formatPHP } from '../../lib/format';
import { RankedList } from '../../components/shared/RankedList';

export function TopAgentsPage() {
  const [consultants, setConsultants] = useState<ConsultantAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getConsultantAccounts(), getClients()]).then(([consultantResult, clientResult]) => {
      setConsultants(consultantResult.filter((c) => c.role !== 'Broker'));
      setClients(clientResult);
      setLoading(false);
    });
  }, []);

  const ranked = consultants
    .map((c) => {
      const isManager = c.role === 'Sales Manager';
      const myClients = clients.filter((client) => (isManager ? client.salesManagerId === c.id : client.salesPersonId === c.id));
      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        subtitle: c.role,
        totalSales: myClients.reduce((sum, client) => sum + client.salePrice, 0),
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Top Agents</h1>
        <p className="text-muted">Recognition ranking across Sales Managers and Sales Persons — not tied to payouts.</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading rankings...</p>
      ) : (
        <div className="card admin-dashboard-panel admin-top-consultants">
          <RankedList
            rows={ranked.map((row) => ({ id: row.id, name: row.name, subtitle: row.subtitle, value: formatPHP(row.totalSales) }))}
          />
        </div>
      )}
    </div>
  );
}
