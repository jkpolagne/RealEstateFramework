import type { ChecklistItem, EmploymentStatus, PaymentMethod } from '../types';

let counter = 0;
function item(label: string, phase: 'Basic' | 'Complete'): ChecklistItem {
  counter += 1;
  return { id: `chk-${Date.now()}-${counter}`, label, phase, checked: false, verifiedBy: null, verifiedDate: null };
}

const BANK_REQUIREMENTS: Record<EmploymentStatus, { basic: string[]; complete: string[] }> = {
  'Locally Employed': {
    basic: ['2 valid IDs', 'Certificate of Employment w/ Compensation', 'Payslips (last 3 months)', 'Income Tax Return (ITR)'],
    complete: ['Birth Certificate', 'Marriage Contract (if married)', 'Proof of Billing Address', 'Verified TIN', 'ESAV (if Pag-IBIG-linked)'],
  },
  OFW: {
    basic: [
      '2 valid IDs',
      'Certificate of Employment / Employment Contract / Salary Certificate',
      'Payslips or Payroll Bank Statements',
      'Passport ID with entry/exit stamps',
    ],
    complete: ['Birth Certificate', 'Marriage Contract (if married)', 'Proof of Billing Address', 'Verified TIN', 'Special Power of Attorney'],
  },
  'Self-Employed': {
    basic: ['2 valid IDs', 'Income Tax Return (last 2 years)', 'Bank Statements (last 6 months)'],
    complete: [
      'Birth Certificate',
      'Marriage Contract (if married)',
      'Audited Financial Statements (last 2 years)',
      'DTI Registration/Business Clearance',
      "Mayor's Permit",
      'Proof of Billing Address',
      'Verified TIN',
      'Picture of the business establishment',
    ],
  },
};

/** Builds the requirements checklist per CLAUDE.md — items differ by payment method, and for Bank Financing, by employment status. */
export function buildRequirementsChecklist(paymentMethod: PaymentMethod, employmentStatus: EmploymentStatus | null): ChecklistItem[] {
  if (paymentMethod === 'Cash') {
    return [item('Valid ID', 'Basic'), item('Declaration of Source of Funds', 'Basic')];
  }
  if (paymentMethod === 'In-House') {
    return [item('Proof of Income', 'Basic'), item('Valid Government ID', 'Basic')];
  }
  const set = BANK_REQUIREMENTS[employmentStatus ?? 'Locally Employed'];
  return [...set.basic.map((label) => item(label, 'Basic')), ...set.complete.map((label) => item(label, 'Complete'))];
}

export function checklistPhaseStatus(items: ChecklistItem[]): 'Complete' | 'Basic only' | 'Incomplete' {
  const basicItems = items.filter((i) => i.phase === 'Basic');
  const completeItems = items.filter((i) => i.phase === 'Complete');
  const basicDone = basicItems.length > 0 && basicItems.every((i) => i.checked);
  const allDone = items.length > 0 && items.every((i) => i.checked);

  if (allDone) return 'Complete';
  if (completeItems.length === 0) return basicDone ? 'Complete' : 'Incomplete';
  if (basicDone) return 'Basic only';
  return 'Incomplete';
}

/** Number of 25%-wide payment thresholds crossed (1-4) for tranche-based methods, or 1 once Cash is fully paid. */
export function tranchesEligible(paymentProgressPercent: number, totalTranches: number): number {
  if (totalTranches === 1) return paymentProgressPercent >= 100 ? 1 : 0;
  const step = 100 / totalTranches;
  return Math.min(totalTranches, Math.floor(paymentProgressPercent / step + 1e-9));
}
