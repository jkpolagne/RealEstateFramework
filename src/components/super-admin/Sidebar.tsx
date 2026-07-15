import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/super-admin/companies', label: 'Companies' },
  { to: '/super-admin/create-company', label: 'Create Company' },
  { to: '/super-admin/create-company-admin', label: 'Create Company Admin' },
  { to: '/super-admin/system-logs', label: 'System Logs' },
];

export function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="top-nav-brand-mark">R</span>
        <span>
          <strong>RealPortal</strong>
          <span className="admin-sidebar-brand-sub">Super Admin</span>
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
