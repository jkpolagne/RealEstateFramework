import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/super-admin/Sidebar';
import { getCompanies } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';

export function SuperAdminLayout() {
  const [companyCount, setCompanyCount] = useState<number | null>(null);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAuth();

  useEffect(() => {
    getCompanies().then((companies) => {
      setCompanyCount(companies.length);
      setActiveCount(companies.filter((c) => c.status === 'active').length);
    });
    // Re-tally on every in-app navigation so counts stay current after creating/updating a company.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!session || session.role !== 'Super Admin') {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

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
          <div className="admin-topbar-actions">
            <Link to="/" className="btn btn-outline btn-sm">
              View Public Site ↗
            </Link>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </header>
        <main className="admin-content scroll-y">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
