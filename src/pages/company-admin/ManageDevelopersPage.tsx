import { useEffect, useState } from 'react';
import type { Developer } from '../../types';
import { getAllDevelopers } from '../../services/developerService';
import { AddDeveloperForm } from '../../components/company-admin/AddDeveloperForm';

type StatusFilter = 'all' | 'active' | 'inactive';

export function ManageDevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  function refresh() {
    setLoading(true);
    getAllDevelopers().then((result) => {
      setDevelopers(result);
      setLoading(false);
    });
  }

  useEffect(refresh, []);

  const filtered = developers.filter((developer) => {
    if (statusFilter !== 'all' && developer.status !== statusFilter) return false;
    if (search && !developer.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1>Manage Developers</h1>
        <p className="text-muted">Developer partners and their commission rate agreements.</p>
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Search developers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          Add Developer
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading developers...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Developer</th>
                <th>Total Cut</th>
                <th>Direct Sale (Broker / SM)</th>
                <th>Referred Sale (Broker / SM / SP)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted admin-table-empty">
                    No developers match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((developer) => (
                  <tr key={developer.id}>
                    <td className="admin-table-name">{developer.name}</td>
                    <td>{developer.totalCutPercent}%</td>
                    <td>
                      {developer.directSale.brokerPercent}% / {developer.directSale.salesManagerPercent}%
                    </td>
                    <td>
                      {developer.referredSale.brokerPercent}% / {developer.referredSale.salesManagerPercent}% /{' '}
                      {developer.referredSale.salesPersonPercent}%
                    </td>
                    <td>
                      <span className={`badge ${developer.status === 'active' ? 'badge-available' : 'badge-reserved'}`}>
                        {developer.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && <AddDeveloperForm onClose={() => setShowAddForm(false)} onAdded={refresh} />}
    </div>
  );
}
