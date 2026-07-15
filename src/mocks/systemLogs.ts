import type { SystemLogEntry } from '../types';

/** Newest first — write-services unshift new entries onto this array. */
export const systemLogs: SystemLogEntry[] = [
  {
    id: 'log-4',
    type: 'company_status_changed',
    message: 'Company "Legazpi Prime Estates" (C-002) status changed from Active to Inactive.',
    companyId: 'company-legazpi-prime',
    timestamp: '2025-03-20T10:30:00.000Z',
  },
  {
    id: 'log-3',
    type: 'company_created',
    message: 'Company "Legazpi Prime Estates" (C-002) was registered.',
    companyId: 'company-legazpi-prime',
    timestamp: '2025-03-02T08:00:00.000Z',
  },
  {
    id: 'log-2',
    type: 'admin_created',
    message: 'Company Admin "Ma. Teresa Villanueva" was created for Advench Realty.',
    companyId: 'company-advench-realty',
    timestamp: '2025-01-16T09:30:00.000Z',
  },
  {
    id: 'log-1',
    type: 'company_created',
    message: 'Company "Advench Realty" (C-001) was registered.',
    companyId: 'company-advench-realty',
    timestamp: '2025-01-15T08:00:00.000Z',
  },
];
