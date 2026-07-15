import type { AddLoanQuotationInput, LoanQuotation, Property } from '../types';
import { loanQuotations } from '../mocks/loanQuotations';
import { delay } from '../lib/delay';

export async function getLoanQuotationsByDeveloper(developerId: string): Promise<LoanQuotation[]> {
  await delay();
  return loanQuotations.filter((q) => q.developerId === developerId);
}

export async function getLoanQuotationByProperty(propertyId: string): Promise<LoanQuotation | undefined> {
  await delay();
  return loanQuotations.find((q) => q.propertyId === propertyId);
}

/** Company Admin's full quotation list. */
export async function getAllLoanQuotations(): Promise<LoanQuotation[]> {
  await delay();
  return loanQuotations;
}

export async function addLoanQuotation(
  input: AddLoanQuotationInput,
  property: Property,
): Promise<LoanQuotation> {
  await delay(400);
  const principal = property.price - input.downPaymentAmount;
  const totalAmountPayable = input.monthlyAmortization * input.termMonths;

  const quotation: LoanQuotation = {
    id: `quote-${Date.now()}`,
    propertyId: input.propertyId,
    developerId: property.developerId,
    propertyPrice: property.price,
    interestRate: input.interestRate,
    downPaymentPercent: input.downPaymentPercent,
    downPaymentAmount: input.downPaymentAmount,
    termMonths: input.termMonths,
    monthlyAmortization: input.monthlyAmortization,
    netLoanAmount: principal,
    totalInterestPaid: totalAmountPayable - principal,
    totalAmountPayable,
    principal,
    paymentBreakdownDescription: input.paymentBreakdownDescription,
  };
  loanQuotations.push(quotation);
  return quotation;
}

export interface ManualLoanResult {
  monthlyBudget: number;
  maxAffordablePrice: number;
  matchingProperties: Property[];
}

const ASSUMED_ANNUAL_RATE = 6.5;
const ASSUMED_TERM_MONTHS = 180;
const ASSUMED_DOWN_PAYMENT_PERCENT = 20;

/** Purely client-side estimate — no persisted data, matches the "Manual" tab of the loan calculator. */
export async function computeManualLoan(totalBudget: number, allProperties: Property[]): Promise<ManualLoanResult> {
  await delay(200);

  const financedAmount = totalBudget * (1 - ASSUMED_DOWN_PAYMENT_PERCENT / 100);
  const r = ASSUMED_ANNUAL_RATE / 100 / 12;
  const monthlyBudget = Math.round(
    (financedAmount * r * Math.pow(1 + r, ASSUMED_TERM_MONTHS)) /
      (Math.pow(1 + r, ASSUMED_TERM_MONTHS) - 1),
  );

  const maxAffordablePrice = totalBudget;

  const matchingProperties = allProperties
    .filter((p) => p.status === 'available' && p.price <= maxAffordablePrice)
    .sort((a, b) => b.price - a.price);

  return { monthlyBudget, maxAffordablePrice, matchingProperties };
}
