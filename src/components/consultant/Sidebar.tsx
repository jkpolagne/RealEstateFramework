import { NavLink } from 'react-router-dom';

export interface ConsultantNavItem {
  to: string;
  label: string;
}

interface SidebarProps {
  brandSub: string;
  basePath: string;
  items: ConsultantNavItem[];
}

export function Sidebar({ brandSub, basePath, items }: SidebarProps) {
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
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={`${basePath}/${item.to}`}
            end={item.to === ''}
            className={({ isActive }) => `admin-sidebar-link${isActive ? ' admin-sidebar-link-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
