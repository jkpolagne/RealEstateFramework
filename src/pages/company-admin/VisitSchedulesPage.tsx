import { useEffect, useState } from 'react';
import type { ConsultantLink, Property, VisitRequest } from '../../types';
import { getVisitRequests, updateVisitRequestStatus } from '../../services/visitService';
import { getAllPropertiesForAdmin } from '../../services/propertyService';
import { getConsultantLinks } from '../../services/consultantLinkService';
import { useAuth } from '../../context/AuthContext';

type StatusFilter = 'all' | 'Pending' | 'Approved' | 'Declined';

function formatPreferredVisit(visit: VisitRequest): string {
  const date = new Date(`${visit.preferredDate}T00:00:00`).toLocaleDateString('en-PH', { dateStyle: 'medium' });
  return `${date} at ${visit.preferredTime}`;
}

function statusBadgeClass(status: VisitRequest['status']): string {
  if (status === 'Approved') return 'badge-available';
  if (status === 'Declined') return 'badge-sold';
  return 'badge-reserved';
}

export function VisitSchedulesPage() {
  const { session } = useAuth();
  const companyId = session!.companyId!;
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [consultantLinks, setConsultantLinks] = useState<ConsultantLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actingId, setActingId] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    Promise.all([getVisitRequests(companyId), getAllPropertiesForAdmin(companyId), getConsultantLinks(companyId)]).then(
      ([visitResult, propertyResult, linkResult]) => {
        setVisitRequests([...visitResult].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setProperties(propertyResult);
        setConsultantLinks(linkResult);
        setLoading(false);
      },
    );
  }

  useEffect(refresh, [companyId]);

  async function handleAction(id: string, status: 'Approved' | 'Declined') {
    setActingId(id);
    await updateVisitRequestStatus(id, status);
    refresh();
    setActingId(null);
  }

  function propertyName(propertyId: string): string {
    return properties.find((p) => p.id === propertyId)?.name ?? 'Unknown property';
  }

  function sourceLabel(visit: VisitRequest): string {
    const link = consultantLinks.find((l) => l.id === visit.sourceLinkId);
    if (!link) return 'Unknown';
    return link.role === 'Sales Person' ? `Referred — ${link.consultantName}` : `Direct — ${link.consultantName}`;
  }

  const filtered = visitRequests.filter((visit) => {
    if (statusFilter !== 'all' && visit.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!visit.fullName.toLowerCase().includes(q) && !propertyName(visit.propertyId).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1>Visit Schedules</h1>
        <p className="text-muted">Property visit requests submitted through the public site — including past history.</p>
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Search by requester or property..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">All statuses (history)</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Declined">Declined</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Loading visit requests...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">No visit requests match your filters.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Requester</th>
                <th>Property</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Preferred Visit</th>
                <th>Source</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((visit) => (
                <tr key={visit.id}>
                  <td className="admin-table-name">{visit.fullName}</td>
                  <td>{propertyName(visit.propertyId)}</td>
                  <td className="text-muted">{visit.email}</td>
                  <td>{visit.phone}</td>
                  <td>{formatPreferredVisit(visit)}</td>
                  <td>{sourceLabel(visit)}</td>
                  <td>
                    <span className={`badge ${statusBadgeClass(visit.status)}`}>{visit.status}</span>
                  </td>
                  <td>
                    {visit.status === 'Pending' && (
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={actingId === visit.id}
                          onClick={() => handleAction(visit.id, 'Approved')}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          disabled={actingId === visit.id}
                          onClick={() => handleAction(visit.id, 'Declined')}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
