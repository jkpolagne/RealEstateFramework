import { NavLink } from 'react-router-dom';

export interface ConsultantNavItem {
  to: string;
  label: string;
}

interface SidebarProps {
  brandSub: string;
  basePath: string;
  items: ConsultantNavItem[];
  /** Optional unread-style counts keyed by nav item `to` — shown as a badge next to the label. */
  badges?: Record<string, number>;
}

export function Sidebar({ brandSub, basePath, items, badges }: SidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="top-nav-brand-mark">R</span>
        <span>
          <strong>RealPortal</strong>
          <span className="admin-sidebar-brand-sub">{brandSub}</span>
        </span>
      </div>
      <nav className="admin-sidebar-nav">
        {items.map((item) => {
          const badgeCount = badges?.[item.to] ?? 0;
          return (
            <NavLink
              key={item.to}
              to={`${basePath}/${item.to}`}
              end={item.to === ''}
              className={({ isActive }) => `admin-sidebar-link${isActive ? ' admin-sidebar-link-active' : ''}`}
            >
              {item.label}
              {badgeCount > 0 && <span className="admin-sidebar-badge">{badgeCount}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
