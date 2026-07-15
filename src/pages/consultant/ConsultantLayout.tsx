import { Link, Outlet } from 'react-router-dom';
import { Sidebar, type ConsultantNavItem } from '../../components/consultant/Sidebar';
import { ConsultantSessionProvider, type ConsultantSession } from '../../context/ConsultantSessionContext';
import { PortalSwitcher, type PortalKey } from '../../components/shared/PortalSwitcher';

interface ConsultantLayoutProps {
  session: ConsultantSession;
  basePath: string;
  navItems: ConsultantNavItem[];
}

const PORTAL_KEY_BY_ROLE: Record<ConsultantSession['role'], PortalKey> = {
  Broker: 'broker',
  'Sales Manager': 'sales-manager',
  'Sales Person': 'sales-person',
};

export function ConsultantLayout({ session, basePath, navItems }: ConsultantLayoutProps) {
  return (
    <ConsultantSessionProvider session={session}>
      <div className="admin-layout">
        <Sidebar brandSub={session.role} basePath={basePath} items={navItems} />
        <div className="admin-main">
          <header className="admin-topbar">
            <div>
              <h2>{session.displayName}</h2>
              <p className="text-muted">{session.role} — Advench Realty</p>
            </div>
            <div className="admin-topbar-actions">
              <PortalSwitcher current={PORTAL_KEY_BY_ROLE[session.role]} />
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
    </ConsultantSessionProvider>
  );
}
