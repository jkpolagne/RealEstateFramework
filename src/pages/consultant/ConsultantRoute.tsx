import { Navigate } from 'react-router-dom';
import type { ConsultantNavItem } from '../../components/consultant/Sidebar';
import type { ConsultantRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ConsultantLayout } from './ConsultantLayout';

interface ConsultantRouteProps {
  role: ConsultantRole;
  basePath: string;
  navItems: ConsultantNavItem[];
}

/** Gates a consultant portal behind the logged-in session's role, deriving the session from real auth instead of a hardcoded id. */
export function ConsultantRoute({ role, basePath, navItems }: ConsultantRouteProps) {
  const { session } = useAuth();

  if (!session || session.role !== role || !session.companyId) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ConsultantLayout
      session={{
        consultantId: session.id,
        companyId: session.companyId,
        companyName: session.companyName ?? '',
        role,
        displayName: session.displayName,
      }}
      basePath={basePath}
      navItems={navItems}
    />
  );
}
