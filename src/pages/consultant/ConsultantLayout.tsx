import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, type ConsultantNavItem } from '../../components/consultant/Sidebar';
import { ConsultantSessionProvider, type ConsultantSession } from '../../context/ConsultantSessionContext';
import { useAuth } from '../../context/AuthContext';
import { getNotificationsForConsultant } from '../../services/consultantNotificationService';

interface ConsultantLayoutProps {
  session: ConsultantSession;
  basePath: string;
  navItems: ConsultantNavItem[];
}

export function ConsultantLayout({ session, basePath, navItems }: ConsultantLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getNotificationsForConsultant(session.consultantId, session.companyId).then((result) => {
      setUnreadCount(result.filter((n) => !n.read).length);
    });
    // Re-tally on every in-app navigation so the badge stays current after visiting Notifications.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.consultantId, location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <ConsultantSessionProvider session={session}>
      <div className="admin-layout">
        <Sidebar brandSub={session.role} basePath={basePath} items={navItems} badges={{ notifications: unreadCount }} />
        <div className="admin-main">
          <header className="admin-topbar">
            <div>
              <h2>{session.displayName}</h2>
              <p className="text-muted">{session.role} — {session.companyName}</p>
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
    </ConsultantSessionProvider>
  );
}
