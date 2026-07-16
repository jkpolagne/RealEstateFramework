import type { SystemLogEntry } from '../types';

/** Newest first — write-services unshift new entries onto this array. */
export const systemLogs: SystemLogEntry[] = [];
