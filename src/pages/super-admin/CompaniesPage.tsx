import { useEffect, useState } from 'react';
import type { Company, CompanyAdminAccount } from '../../types';
import { getCompanies, updateCompanyStatus } from '../../services/companyService';
import { getCompanyAdmins } from '../../services/companyAdminService';
import { CompanyCard } from '../../components/super-admin/CompanyCard';
import { CompanyDetailModal } from '../../components/super-admin/CompanyDetailModal';

type StatusFilter = 'all' | 'active' | 'inactive';

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyAdmins, setCompanyAdmins] = useState<CompanyAdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);

  function refresh() {
    setLoading(true);
    Promise.all([getCompanies(), getCompanyAdmins()]).then(([companyResult, adminResult]) => {
      setCompanies(companyResult);
      setCompanyAdmins(adminResult);
      setLoading(false);
    });
  }

  useEffect(refresh, []);

  async function handleToggleStatus(company: Company) {
    setTogglingId(company.id);
    await updateCompanyStatus(company.id, company.status === 'active' ? 'inactive' : 'active');
    refresh();
    setTogglingId(null);
  }

  const filtered = companies.filter((company) => {
    if (statusFilter !== 'all' && company.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!company.name.toLowerCase().includes(q) && !company.code.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1>Companies</h1>
        <p className="text-muted">Every company registered on the RealPortal platform.</p>
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Search by company name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Loading companies...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">No companies match your filters.</p>
      ) : (
        <div className="company-grid">
          {filtered.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              adminCount={companyAdmins.filter((a) => a.companyId === company.id).length}
              onToggleStatus={handleToggleStatus}
              onViewDetails={setViewingCompany}
              toggling={togglingId === company.id}
            />
          ))}
        </div>
      )}

      {viewingCompany && (
        <CompanyDetailModal
          company={viewingCompany}
          admins={companyAdmins.filter((a) => a.companyId === viewingCompany.id)}
          onClose={() => setViewingCompany(null)}
        />
      )}
    </div>
  );
}
