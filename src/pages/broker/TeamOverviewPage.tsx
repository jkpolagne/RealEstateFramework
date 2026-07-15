import { useEffect, useState } from 'react';
import type { Client, ConsultantAccount } from '../../types';
import { getConsultantAccountsByRole } from '../../services/consultantAccountService';
import { getClients } from '../../services/clientService';
import { formatPHP } from '../../lib/format';

export function TeamOverviewPage() {
  const [salesManagers, setSalesManagers] = useState<ConsultantAccount[]>([]);
  const [salesPersons, setSalesPersons] = useState<ConsultantAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getConsultantAccountsByRole('Sales Manager'), getConsultantAccountsByRole('Sales Person'), getClients()]).then(
      ([smResult, spResult, clientResult]) => {
        setSalesManagers(smResult);
        setSalesPersons(spResult);
        setClients(clientResult);
        setLoading(false);
      },
    );
  }, []);

  if (loading) {
    return (
      <div>
        <div className="admin-page-header">
          <h1>Team Overview</h1>
        </div>
        <p className="text-muted">Loading team overview...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Team Overview</h1>
        <p className="text-muted">Every Sales Manager's team, sized by clients and sales volume.</p>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sales Manager</th>
              <th>Team Size</th>
              <th>Total Clients</th>
              <th>Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {salesManagers.map((sm) => {
              const teamSize = salesPersons.filter((sp) => sp.assignedUnderId === sm.id).length;
              const teamClients = clients.filter((c) => c.salesManagerId === sm.id);
              const totalSales = teamClients.reduce((sum, c) => sum + c.salePrice, 0);
              return (
                <tr key={sm.id}>
                  <td className="admin-table-name">
                    {sm.firstName} {sm.lastName}
                  </td>
                  <td>{teamSize} Sales Person{teamSize === 1 ? '' : 's'}</td>
                  <td>{teamClients.length}</td>
                  <td>{formatPHP(totalSales)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
