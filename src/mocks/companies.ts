import type { Company } from '../types';

export const companies: Company[] = [
  {
    id: 'company-advench-realty',
    code: 'C-001',
    name: 'Advench Realty',
    address: 'Naga City, Camarines Sur',
    email: 'admin@advenchrealty.ph',
    contactNumber: '054-123-4567',
    status: 'active',
    createdAt: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'company-legazpi-prime',
    code: 'C-002',
    name: 'Legazpi Prime Estates',
    address: 'Legazpi City, Albay',
    email: 'admin@legazpiprime.ph',
    contactNumber: '052-234-5678',
    status: 'inactive',
    createdAt: '2025-03-02T08:00:00.000Z',
  },
];
