import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/company-admin/dashboard', label: 'Dashboard' },
  { to: '/company-admin/properties', label: 'Manage Properties' },
  { to: '/company-admin/developers', label: 'Manage Developers' },
  { to: '/company-admin/loan-quotation', label: 'Loan Quotation' },
  { to: '/company-admin/visit-schedules', label: 'Visit Schedules' },
  { to: '/company-admin/consultant-accounts', label: 'Consultant Accounts' },
  { to: '/company-admin/consultant-links', label: 'Consultant Links' },
  { to: '/company-admin/sales-report', label: 'Sales Report' },
  { to: '/company-admin/notifications', label: 'Notifications' },
];

export function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="top-nav-brand-mark">R</span>
        <span>
          <strong>RealPortal</strong>
          <span className="admin-sidebar-brand-sub">Company Admin</span>
        </span>
      </div>
      <nav className="admin-sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `admin-sidebar-link${isActive ? ' admin-sidebar-link-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
