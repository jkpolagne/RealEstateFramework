import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../../components/super-admin/Sidebar';
import { getCompanies } from '../../services/companyService';

export function SuperAdminLayout() {
  const [companyCount, setCompanyCount] = useState<number | null>(null);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    getCompanies().then((companies) => {
      setCompanyCount(companies.length);
      setActiveCount(companies.filter((c) => c.status === 'active').length);
    });
    // Re-tally on every in-app navigation so counts stay current after creating/updating a company.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h2>Platform Administration</h2>
            <p className="text-muted">
              {companyCount == null
                ? 'Loading platform overview...'
                : `${companyCount} registered ${companyCount === 1 ? 'company' : 'companies'} · ${activeCount} active`}
            </p>
          </div>
          <Link to="/" className="btn btn-outline btn-sm">
            View Public Site ↗
          </Link>
        </header>
        <main className="admin-content scroll-y">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
