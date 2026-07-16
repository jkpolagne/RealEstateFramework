import { companies } from '../mocks/companies';
import { companyAdmins } from '../mocks/companyAdmins';
import { developers } from '../mocks/developers';
import { properties } from '../mocks/properties';
import { loanQuotations } from '../mocks/loanQuotations';
import { consultantAccounts } from '../mocks/consultantAccounts';
import { consultantLinks } from '../mocks/consultantLinks';
import { clients } from '../mocks/clients';
import { visitRequests } from '../mocks/visitRequests';
import { paymentRecords } from '../mocks/paymentRecords';
import { commissionVouchers } from '../mocks/commissionVouchers';
import { notifications } from '../mocks/notifications';
import { consultantNotifications } from '../mocks/consultantNotifications';
import { systemLogs } from '../mocks/systemLogs';
import { sales } from '../mocks/sales';

const STORAGE_PREFIX = 'realportal.data.';

const REGISTRY: Record<string, unknown[]> = {
  companies,
  companyAdmins,
  developers,
  properties,
  loanQuotations,
  consultantAccounts,
  consultantLinks,
  clients,
  visitRequests,
  paymentRecords,
  commissionVouchers,
  notifications,
  consultantNotifications,
  systemLogs,
  sales,
};

/** Re-serializes every mock array's current in-memory state to localStorage. Call after any mutation so a refresh doesn't lose entered data. */
export function persistAll(): void {
  try {
    for (const [key, arr] of Object.entries(REGISTRY)) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(arr));
    }
  } catch {
    // Storage unavailable/full — the in-memory copy still works for this session.
  }
}

/** Restores every mock array from localStorage, if present. Call once at app startup before anything reads the arrays. */
export function hydrateAll(): void {
  for (const [key, arr] of Object.entries(REGISTRY)) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;
      arr.length = 0;
      arr.push(...parsed);
    } catch {
      // Corrupted entry — keep whatever the array already has.
    }
  }
}

/** Wipes all persisted and in-memory data back to empty, for starting a fresh demo. */
export function resetAll(): void {
  for (const key of Object.keys(REGISTRY)) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch {
      // ignore
    }
  }
  for (const arr of Object.values(REGISTRY)) {
    arr.length = 0;
  }
}
