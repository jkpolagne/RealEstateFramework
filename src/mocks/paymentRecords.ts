import type { PaymentRecord } from '../types';

/** Mutated at runtime by clientService — Upload Payment Proof pushes onto this. */
export const paymentRecords: PaymentRecord[] = [];
