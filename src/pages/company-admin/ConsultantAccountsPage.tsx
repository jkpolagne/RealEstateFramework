import { useEffect, useState } from 'react';
import type { ConsultantAccount, ConsultantRole } from '../../types';
import { getConsultantAccounts } from '../../services/consultantAccountService';
import { AddConsultantAccountForm } from '../../components/company-admin/AddConsultantAccountForm';

type RoleFilter = 'all' | ConsultantRole;
type StatusFilter = 'all' | 'active' | 'inactive';

export function ConsultantAccountsPage() {
  const [accounts, setAccounts] = useState<ConsultantAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  function refresh() {
    setLoading(true);
    getConsultantAccounts().then((result) => {
      setAccounts(result);
      setLoading(false);
    });
  }

  useEffect(refresh, []);

  function supervisorName(id: string | null): string {
    if (!id) return '—';
    const supervisor = accounts.find((a) => a.id === id);
    return supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : '—';
  }

  const filtered = accounts.filter((account) => {
    if (roleFilter !== 'all' && account.role !== roleFilter) return false;
    if (statusFilter !== 'all' && account.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const fullName = `${account.firstName} ${account.middleName} ${account.lastName}`.toLowerCase();
      if (!fullName.includes(q) && !account.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1>Consultant Accounts</h1>
        <p className="text-muted">Brokers, Sales Managers, and Sales Persons for this company.</p>
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}>
          <option value="all">All roles</option>
          <option value="Broker">Broker</option>
          <option value="Sales Manager">Sales Manager</option>
          <option value="Sales Person">Sales Person</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          Add Consultant
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading consultant accounts...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Assigned Under</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted admin-table-empty">
                    No consultant accounts match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((account) => (
                  <tr key={account.id}>
                    <td className="admin-table-name">
                      {account.firstName} {account.middleName} {account.lastName}
                    </td>
                    <td className="text-muted">{account.email}</td>
                    <td>{account.contactNumber}</td>
                    <td>{account.role}</td>
                    <td>{supervisorName(account.assignedUnderId)}</td>
                    <td>
                      <span className={`badge ${account.status === 'active' ? 'badge-available' : 'badge-reserved'}`}>
                        {account.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && <AddConsultantAccountForm onClose={() => setShowAddForm(false)} onAdded={refresh} />}
    </div>
  );
}
