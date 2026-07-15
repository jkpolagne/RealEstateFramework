import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/company-admin/Sidebar';

export function CompanyAdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h2>Advench Realty</h2>
            <p className="text-muted">Naga City, Camarines Sur</p>
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
