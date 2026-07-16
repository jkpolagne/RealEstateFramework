import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ConsultantRole } from '../types';
import { companyAdmins } from '../mocks/companyAdmins';
import { companies } from '../mocks/companies';
import { consultantAccounts } from '../mocks/consultantAccounts';
import { SUPER_ADMIN_CREDENTIALS } from '../lib/auth';

export type AuthRole = 'Super Admin' | 'Company Admin' | ConsultantRole;

export interface AuthSession {
  role: AuthRole;
  id: string;
  displayName: string;
  /** null for Super Admin, who isn't scoped to one company. */
  companyId: string | null;
  companyName?: string;
}

export type LoginResult = { ok: true } | { ok: false; error: string };

interface AuthContextValue {
  session: AuthSession | null;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
}

const STORAGE_KEY = 'realportal.auth.session';

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

function persistSession(session: AuthSession | null): void {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable — session just won't survive a refresh this time.
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(loadSession);

  function login(email: string, password: string): LoginResult {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === SUPER_ADMIN_CREDENTIALS.email && password === SUPER_ADMIN_CREDENTIALS.password) {
      const next: AuthSession = { role: 'Super Admin', id: 'super-admin', displayName: 'Super Admin', companyId: null };
      setSession(next);
      persistSession(next);
      return { ok: true };
    }

    const admin = companyAdmins.find((a) => a.email.toLowerCase() === normalizedEmail);
    if (admin) {
      if (admin.temporaryPassword !== password) return { ok: false, error: 'Incorrect password.' };
      const company = companies.find((c) => c.id === admin.companyId);
      const next: AuthSession = {
        role: 'Company Admin',
        id: admin.id,
        displayName: admin.name,
        companyId: admin.companyId,
        companyName: company?.name,
      };
      setSession(next);
      persistSession(next);
      return { ok: true };
    }

    const consultant = consultantAccounts.find((c) => c.email.toLowerCase() === normalizedEmail);
    if (consultant) {
      if (consultant.status !== 'active') return { ok: false, error: 'This account is inactive.' };
      if (consultant.password !== password) return { ok: false, error: 'Incorrect password.' };
      const consultantCompany = companies.find((c) => c.id === consultant.companyId);
      const next: AuthSession = {
        role: consultant.role,
        id: consultant.id,
        displayName: `${consultant.firstName} ${consultant.lastName}`.trim(),
        companyId: consultant.companyId,
        companyName: consultantCompany?.name,
      };
      setSession(next);
      persistSession(next);
      return { ok: true };
    }

    return { ok: false, error: 'No account found with that email.' };
  }

  function logout() {
    setSession(null);
    persistSession(null);
  }

  return <AuthContext.Provider value={{ session, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function dashboardPathForRole(role: AuthRole): string {
  switch (role) {
    case 'Super Admin':
      return '/super-admin';
    case 'Company Admin':
      return '/company-admin';
    case 'Broker':
      return '/broker';
    case 'Sales Manager':
      return '/sales-manager';
    case 'Sales Person':
      return '/sales-person';
  }
}
