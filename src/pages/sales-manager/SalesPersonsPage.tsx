import { useEffect, useState } from 'react';
import type { Client, ConsultantAccount, ConsultantLink } from '../../types';
import { getConsultantAccountsByRole } from '../../services/consultantAccountService';
import { getClients } from '../../services/clientService';
import { getConsultantLinks } from '../../services/consultantLinkService';
import { useConsultantSession } from '../../context/ConsultantSessionContext';
import { formatPHP } from '../../lib/format';
import { SalesPersonDetailModal } from '../../components/sales-manager/SalesPersonDetailModal';

function performanceBadge(totalSales: number): { label: string; className: string } {
  if (totalSales >= 2_000_000) return { label: 'Top Performer', className: 'badge-available' };
  if (totalSales >= 500_000) return { label: 'Steady', className: 'badge-reserved' };
  return { label: 'Needs Support', className: 'badge-sold' };
}

export function SalesPersonsPage() {
  const { consultantId } = useConsultantSession();
  const [salesPersons, setSalesPersons] = useState<ConsultantAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [links, setLinks] = useState<ConsultantLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<ConsultantAccount | null>(null);

  useEffect(() => {
    Promise.all([getConsultantAccountsByRole('Sales Person'), getClients(), getConsultantLinks()]).then(
      ([spResult, clientResult, linkResult]) => {
        setSalesPersons(spResult.filter((sp) => sp.assignedUnderId === consultantId));
        setClients(clientResult);
        setLinks(linkResult);
        setLoading(false);
      },
    );
  }, [consultantId]);

  function clientsFor(spId: string): Client[] {
    return clients.filter((c) => c.salesPersonId === spId);
  }

  function linkFor(spId: string): ConsultantLink | undefined {
    return links.find((l) => l.consultantId === spId);
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Sales Persons</h1>
        <p className="text-muted">Monitor the clients and sales performance of every Sales Person on your team.</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading team roster...</p>
      ) : salesPersons.length === 0 ? (
        <p className="text-muted">No Sales Persons assigned to your team yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Clients</th>
                <th>Status</th>
                <th>Sales Amount</th>
                <th>Performance</th>
                <th>Link</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {salesPersons.map((sp, i) => {
                const spClients = clientsFor(sp.id);
                const totalSales = spClients.reduce((sum, c) => sum + c.salePrice, 0);
                const link = linkFor(sp.id);
                const badge = performanceBadge(totalSales);
                return (
                  <tr key={sp.id}>
                    <td>{i + 1}</td>
                    <td className="admin-table-name">
                      {sp.firstName} {sp.lastName}
                    </td>
                    <td className="text-muted">{sp.email}</td>
                    <td>{sp.contactNumber}</td>
                    <td>{spClients.length}</td>
                    <td>
                      <span className={`badge ${sp.status === 'active' ? 'badge-available' : 'badge-reserved'}`}>
                        {sp.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{formatPHP(totalSales)}</td>
                    <td>
                      <span className={`badge ${badge.className}`}>{badge.label}</span>
                    </td>
                    <td className="admin-table-link">{link ? `?ref=${link.slug}` : '—'}</td>
                    <td>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setViewing(sp)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewing && <SalesPersonDetailModal salesPerson={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
