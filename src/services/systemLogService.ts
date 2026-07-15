import type { SystemLogEntry, SystemLogEventType } from '../types';
import { systemLogs } from '../mocks/systemLogs';
import { delay } from '../lib/delay';

export async function getSystemLogs(): Promise<SystemLogEntry[]> {
  await delay();
  return systemLogs;
}

export function recordSystemLog(type: SystemLogEventType, message: string, companyId: string | null): void {
  systemLogs.unshift({ id: `log-${Date.now()}`, type, message, companyId, timestamp: new Date().toISOString() });
}
