import { Link } from 'react-router-dom';

export type PortalKey = 'company-admin' | 'super-admin' | 'broker' | 'sales-manager' | 'sales-person';

const PORTALS: { key: PortalKey; to: string; label: string }[] = [
  { key: 'company-admin', to: '/company-admin', label: 'Company Admin' },
  { key: 'super-admin', to: '/super-admin', label: 'Super Admin' },
  { key: 'broker', to: '/broker', label: 'Broker' },
  { key: 'sales-manager', to: '/sales-manager', label: 'Sales Manager' },
  { key: 'sales-person', to: '/sales-person', label: 'Sales Person' },
];

/** Lets staff move between role portals via in-app navigation (no login exists yet) without losing this session's in-memory data. */
export function PortalSwitcher({ current }: { current: PortalKey }) {
  return (
    <div className="portal-switcher">
      <span className="text-muted portal-switcher-label">Switch portal:</span>
      {PORTALS.filter((p) => p.key !== current).map((portal) => (
        <Link key={portal.key} to={portal.to} className="portal-switcher-link">
          {portal.label}
        </Link>
      ))}
    </div>
  );
}
