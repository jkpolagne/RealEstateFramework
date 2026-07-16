import { createContext, useContext, type ReactNode } from 'react';
import type { ConsultantRole } from '../types';

export interface ConsultantSession {
  consultantId: string;
  companyId: string;
  companyName: string;
  role: ConsultantRole;
  displayName: string;
}

const ConsultantSessionContext = createContext<ConsultantSession | null>(null);

export function ConsultantSessionProvider({
  session,
  children,
}: {
  session: ConsultantSession;
  children: ReactNode;
}) {
  return <ConsultantSessionContext.Provider value={session}>{children}</ConsultantSessionContext.Provider>;
}

export function useConsultantSession(): ConsultantSession {
  const ctx = useContext(ConsultantSessionContext);
  if (!ctx) throw new Error('useConsultantSession must be used within ConsultantSessionProvider');
  return ctx;
}
