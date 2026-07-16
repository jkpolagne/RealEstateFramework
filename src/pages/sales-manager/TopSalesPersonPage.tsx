import { useEffect, useState } from 'react';
import type { Client, ConsultantAccount } from '../../types';
import { getConsultantAccountsByRole } from '../../services/consultantAccountService';
import { getClients } from '../../services/clientService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { formatPHP } from '../../lib/format';
import { RankedList } from '../../components/shared/RankedList';

export function TopSalesPersonPage() {
  const { consultantId, companyId } = useConsultantSession();
  const [salesPersons, setSalesPersons] = useState<ConsultantAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getConsultantAccountsByRole(companyId, 'Sales Person'), getClients(companyId)]).then(([spResult, clientResult]) => {
      setSalesPersons(spResult.filter((sp) => sp.assignedUnderId === consultantId));
      setClients(clientResult);
      setLoading(false);
    });
  }, [consultantId, companyId]);

  const ranked = salesPersons
    .map((sp) => ({
      id: sp.id,
      name: `${sp.firstName} ${sp.lastName}`,
      totalSales: clients.filter((c) => c.salesPersonId === sp.id).reduce((sum, c) => sum + c.salePrice, 0),
    }))
    .sort((a, b) => b.totalSales - a.totalSales);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Top Sales Person</h1>
        <p className="text-muted">Recognition ranking of your team's Sales Persons by total sales.</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading rankings...</p>
      ) : (
        <div className="card admin-dashboard-panel admin-top-consultants">
          <RankedList rows={ranked.map((row) => ({ id: row.id, name: row.name, value: formatPHP(row.totalSales) }))} />
        </div>
      )}
    </div>
  );
}
