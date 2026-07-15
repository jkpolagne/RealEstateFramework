import type { AddLoanQuotationInput, LoanQuotation, Property } from '../types';
import { loanQuotations } from '../mocks/loanQuotations';
import { delay } from '../lib/delay';
import { amortize } from '../lib/amortize';

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

export async function updateLoanQuotation(
  id: string,
  input: AddLoanQuotationInput,
  property: Property,
): Promise<LoanQuotation> {
  await delay(400);
  const quotation = loanQuotations.find((q) => q.id === id);
  if (!quotation) throw new Error('Loan quotation not found');
  const principal = property.price - input.downPaymentAmount;
  const totalAmountPayable = input.monthlyAmortization * input.termMonths;

  Object.assign(quotation, {
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
  });
  return quotation;
}

export async function deleteLoanQuotation(id: string): Promise<void> {
  await delay(300);
  const index = loanQuotations.findIndex((q) => q.id === id);
  if (index !== -1) loanQuotations.splice(index, 1);
}

/** Suggests a monthly amortization for the Add/Edit Quotation form, using the same formula as the seed data. */
export function suggestMonthlyAmortization(propertyPrice: number, downPaymentAmount: number, interestRate: number, termMonths: number): number {
  const principal = propertyPrice - downPaymentAmount;
  return Math.round(amortize(principal, interestRate, termMonths));
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
  const monthlyBudget = Math.round(amortize(financedAmount, ASSUMED_ANNUAL_RATE, ASSUMED_TERM_MONTHS));

  const maxAffordablePrice = totalBudget;

  const matchingProperties = allProperties
    .filter((p) => p.status === 'available' && p.price <= maxAffordablePrice)
    .sort((a, b) => b.price - a.price);

  return { monthlyBudget, maxAffordablePrice, matchingProperties };
}
