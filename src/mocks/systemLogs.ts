import type { SystemLogEntry } from '../types';

export const systemLogs: SystemLogEntry[] = [
  {
    "id": "log-1784166947201",
    "type": "company_status_changed",
    "message": "Company \"StarReal\" (C-002) status changed from Inactive to Active.",
    "companyId": "company-1784166690770",
    "timestamp": "2026-07-16T01:55:47.201Z"
  },
  {
    "id": "log-1784166945193",
    "type": "company_status_changed",
    "message": "Company \"StarReal\" (C-002) status changed from Active to Inactive.",
    "companyId": "company-1784166690770",
    "timestamp": "2026-07-16T01:55:45.193Z"
  },
  {
    "id": "log-1784166941965",
    "type": "admin_created",
    "message": "Company Admin \"flores\" was created for StarReal.",
    "companyId": "company-1784166690770",
    "timestamp": "2026-07-16T01:55:41.965Z"
  },
  {
    "id": "log-1784166690770",
    "type": "company_created",
    "message": "Company \"StarReal\" (C-002) was registered.",
    "companyId": "company-1784166690770",
    "timestamp": "2026-07-16T01:51:30.770Z"
  },
  {
    "id": "log-1784158088560",
    "type": "admin_created",
    "message": "Company Admin \"Carlo\" was created for Advench.",
    "companyId": "company-1784158043492",
    "timestamp": "2026-07-15T23:28:08.560Z"
  },
  {
    "id": "log-1784158043492",
    "type": "company_created",
    "message": "Company \"Advench\" (C-001) was registered.",
    "companyId": "company-1784158043492",
    "timestamp": "2026-07-15T23:27:23.492Z"
  }
];
