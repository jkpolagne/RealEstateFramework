import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ConsultantAccount, Property, VisitRequest } from '../../types';
import { getAllPropertiesForAdmin } from '../../services/propertyService';
import { getAllDevelopers } from '../../services/developerService';
import { getConsultantAccounts } from '../../services/consultantAccountService';
import { getVisitRequests } from '../../services/visitService';
import { StatTile } from '../../components/shared/StatTile';
import { useAuth } from '../../context/AuthContext';

export function DashboardPage() {
  const { session } = useAuth();
  const companyId = session!.companyId!;
  const [properties, setProperties] = useState<Property[]>([]);
  const [developerCount, setDeveloperCount] = useState(0);
  const [consultants, setConsultants] = useState<ConsultantAccount[]>([]);
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllPropertiesForAdmin(companyId), getAllDevelopers(companyId), getConsultantAccounts(companyId), getVisitRequests(companyId)]).then(
      ([propertyResult, developerResult, consultantResult, visitResult]) => {
        setProperties(propertyResult);
        setDeveloperCount(developerResult.length);
        setConsultants(consultantResult);
        setVisitRequests(
          [...visitResult].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        );
        setLoading(false);
      },
    );
  }, [companyId]);

  const pendingVisits = visitRequests.filter((v) => v.status === 'Pending');

  function propertyName(propertyId: string): string {
    return properties.find((p) => p.id === propertyId)?.name ?? 'Unknown property';
  }

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
        <p className="text-muted">Snapshot of Advench Realty's listings, team, and visit activity.</p>
      </div>

      <div className="stat-tile-row">
        <StatTile label="Total properties" value={String(properties.length)} accent />
        <StatTile label="Total developers" value={String(developerCount)} />
        <StatTile label="Total consultants" value={String(consultants.length)} />
        <StatTile label="Pending visit requests" value={String(pendingVisits.length)} />
      </div>

      <div className="admin-dashboard-grid">
        <div className="card admin-dashboard-panel">
          <div className="admin-dashboard-panel-header">
            <h3>Recent visit requests</h3>
            <Link to="/company-admin/visit-schedules" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          {visitRequests.length === 0 ? (
            <p className="text-muted">No visit requests yet.</p>
          ) : (
            <ul className="admin-activity-list">
              {visitRequests.slice(0, 5).map((visit) => (
                <li key={visit.id}>
                  <div>
                    <p className="admin-activity-title">{visit.fullName}</p>
                    <p className="text-muted">{propertyName(visit.propertyId)}</p>
                  </div>
                  <span
                    className={`badge ${
                      visit.status === 'Approved'
                        ? 'badge-available'
                        : visit.status === 'Declined'
                          ? 'badge-sold'
                          : 'badge-reserved'
                    }`}
                  >
                    {visit.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card admin-dashboard-panel">
          <div className="admin-dashboard-panel-header">
            <h3>Consultant team</h3>
            <Link to="/company-admin/consultant-accounts" className="btn btn-outline btn-sm">
              Manage
            </Link>
          </div>
          <dl className="admin-team-breakdown">
            <div>
              <dt>Brokers</dt>
              <dd>{consultants.filter((c) => c.role === 'Broker').length}</dd>
            </div>
            <div>
              <dt>Sales Managers</dt>
              <dd>{consultants.filter((c) => c.role === 'Sales Manager').length}</dd>
            </div>
            <div>
              <dt>Sales Persons</dt>
              <dd>{consultants.filter((c) => c.role === 'Sales Person').length}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
