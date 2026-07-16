import { useEffect, useState } from 'react';
import type { Developer } from '../../types';
import { getAllDevelopers, deleteDeveloper } from '../../services/developerService';
import { DeveloperForm } from '../../components/company-admin/DeveloperForm';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

type StatusFilter = 'all' | 'active' | 'inactive';

export function ManageDevelopersPage() {
  const { session } = useAuth();
  const companyId = session!.companyId!;
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [deletingDeveloper, setDeletingDeveloper] = useState<Developer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    getAllDevelopers(companyId).then((result) => {
      setDevelopers(result);
      setLoading(false);
    });
  }

  useEffect(refresh, [companyId]);

  async function handleDelete() {
    if (!deletingDeveloper) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteDeveloper(deletingDeveloper.id);
      setDeletingDeveloper(null);
      refresh();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setDeleting(false);
    }
  }

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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted admin-table-empty">
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
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingDeveloper(developer)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setDeletingDeveloper(developer);
                            setDeleteError(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && <DeveloperForm onClose={() => setShowAddForm(false)} onSaved={refresh} />}
      {editingDeveloper && (
        <DeveloperForm developer={editingDeveloper} onClose={() => setEditingDeveloper(null)} onSaved={refresh} />
      )}
      {deletingDeveloper && (
        <ConfirmDialog
          title="Delete Developer"
          message={`Are you sure you want to delete "${deletingDeveloper.name}"? This cannot be undone.`}
          confirming={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => setDeletingDeveloper(null)}
        />
      )}
    </div>
  );
}
