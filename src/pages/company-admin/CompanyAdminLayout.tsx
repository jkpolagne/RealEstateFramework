import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/company-admin/Sidebar';
import { PortalSwitcher } from '../../components/shared/PortalSwitcher';

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
          <div className="admin-topbar-actions">
            <PortalSwitcher current="company-admin" />
            <Link to="/" className="btn btn-outline btn-sm">
              View Public Site ↗
            </Link>
          </div>
        </header>
        <main className="admin-content scroll-y">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
