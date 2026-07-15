import type { VisitRequest } from '../types';

/** In-memory mock store — mutated by visitService to simulate persistence for the session. */
export const visitRequests: VisitRequest[] = [];
