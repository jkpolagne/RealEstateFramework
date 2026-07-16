import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/company-admin/Sidebar';
import { useAuth } from '../../context/AuthContext';

export function CompanyAdminLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  if (!session || session.role !== 'Company Admin') {
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
            <h2>{session.companyName ?? 'Company Admin'}</h2>
            <p className="text-muted">{session.displayName} — Company Admin</p>
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
