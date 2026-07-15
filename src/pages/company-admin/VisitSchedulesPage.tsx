import { useEffect, useState } from 'react';
import type { Property, VisitRequest } from '../../types';
import { getVisitRequests, updateVisitRequestStatus } from '../../services/visitService';
import { getAllPropertiesForAdmin } from '../../services/propertyService';
import { getConsultantLinkById } from '../../services/consultantLinkService';

type StatusFilter = 'all' | 'Pending' | 'Approved' | 'Declined';

export function VisitSchedulesPage() {
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Pending');
  const [actingId, setActingId] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    Promise.all([getVisitRequests(), getAllPropertiesForAdmin()]).then(([visitResult, propertyResult]) => {
      setVisitRequests([...visitResult].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setProperties(propertyResult);
      setLoading(false);
    });
  }

  useEffect(refresh, []);

  async function handleAction(id: string, status: 'Approved' | 'Declined') {
    setActingId(id);
    await updateVisitRequestStatus(id, status);
    refresh();
    setActingId(null);
  }

  function propertyName(propertyId: string): string {
    return properties.find((p) => p.id === propertyId)?.name ?? 'Unknown property';
  }

  const filtered = visitRequests.filter((v) => statusFilter === 'all' || v.status === statusFilter);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Visit Schedules</h1>
        <p className="text-muted">Property visit requests submitted through the public site.</p>
      </div>

      <div className="admin-toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Declined">Declined</option>
          <option value="all">All statuses</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Loading visit requests...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">No visit requests match this filter.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Requester</th>
                <th>Property</th>
                <th>Contact</th>
                <th>Preferred Visit</th>
                <th>Source</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((visit) => (
                <VisitRow
                  key={visit.id}
                  visit={visit}
                  propertyLabel={propertyName(visit.propertyId)}
                  acting={actingId === visit.id}
                  onAction={handleAction}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function VisitRow({
  visit,
  propertyLabel,
  acting,
  onAction,
}: {
  visit: VisitRequest;
  propertyLabel: string;
  acting: boolean;
  onAction: (id: string, status: 'Approved' | 'Declined') => void;
}) {
  const [sourceLabel, setSourceLabel] = useState('Direct');

  useEffect(() => {
    if (!visit.sourceLinkId) {
      setSourceLabel('Direct');
      return;
    }
    let cancelled = false;
    getConsultantLinkById(visit.sourceLinkId).then((link) => {
      if (!cancelled) setSourceLabel(link ? `Referred — ${link.consultantName}` : 'Referred');
    });
    return () => {
      cancelled = true;
    };
  }, [visit.sourceLinkId]);

  return (
    <tr>
      <td className="admin-table-name">{visit.fullName}</td>
      <td>{propertyLabel}</td>
      <td className="text-muted">
        {visit.email}
        <br />
        {visit.phone}
      </td>
      <td>
        {new Date(`${visit.preferredDate}T00:00:00`).toLocaleDateString('en-PH', { dateStyle: 'medium' })} at{' '}
        {visit.preferredTime}
      </td>
      <td>{sourceLabel}</td>
      <td>
        <span
          className={`badge ${
            visit.status === 'Approved' ? 'badge-available' : visit.status === 'Declined' ? 'badge-sold' : 'badge-reserved'
          }`}
        >
          {visit.status}
        </span>
      </td>
      <td>
        {visit.status === 'Pending' && (
          <div className="admin-row-actions">
            <button type="button" className="btn btn-primary btn-sm" disabled={acting} onClick={() => onAction(visit.id, 'Approved')}>
              Accept
            </button>
            <button type="button" className="btn btn-outline btn-sm" disabled={acting} onClick={() => onAction(visit.id, 'Declined')}>
              Decline
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
