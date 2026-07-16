import type { AddLoanQuotationInput, LoanQuotation, Property } from '../types';
import { loanQuotations } from '../mocks/loanQuotations';
import { delay } from '../lib/delay';
import { amortize, amortizeInverse } from '../lib/amortize';
import { persistAll } from '../lib/persist';

export async function getLoanQuotationsByDeveloper(developerId: string): Promise<LoanQuotation[]> {
  await delay();
  return loanQuotations.filter((q) => q.developerId === developerId);
}

export async function getLoanQuotationByProperty(propertyId: string): Promise<LoanQuotation | undefined> {
  await delay();
  return loanQuotations.find((q) => q.propertyId === propertyId);
}

/** Company Admin's full quotation list, scoped to their own company. */
export async function getAllLoanQuotations(companyId: string): Promise<LoanQuotation[]> {
  await delay();
  return loanQuotations.filter((q) => q.companyId === companyId);
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
    companyId: property.companyId,
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
  persistAll();
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
  persistAll();
  return quotation;
}

export async function deleteLoanQuotation(id: string): Promise<void> {
  await delay(300);
  const index = loanQuotations.findIndex((q) => q.id === id);
  if (index !== -1) loanQuotations.splice(index, 1);
  persistAll();
}

/** Suggests a monthly amortization for the Add/Edit Quotation form, using the same formula as the seed data. */
export function suggestMonthlyAmortization(propertyPrice: number, downPaymentAmount: number, interestRate: number, termMonths: number): number {
  const principal = propertyPrice - downPaymentAmount;
  return Math.round(amortize(principal, interestRate, termMonths));
}

export interface BudgetLoanInput {
  monthlyBudget: number;
  downPaymentPercent: number;
  termMonths: number;
  interestRate: number;
}

export interface BudgetMatchingProperty {
  property: Property;
  estimatedMonthlyPayment: number;
}

export interface BudgetLoanResult {
  monthlyBudget: number;
  maxLoanAmount: number;
  maxPropertyPrice: number;
  matchingProperties: BudgetMatchingProperty[];
}

/** Purely client-side estimate — no persisted data, backs the "Manual Computation" tab of the loan calculator. */
export async function computeBudgetLoan(input: BudgetLoanInput, allProperties: Property[]): Promise<BudgetLoanResult> {
  await delay(300);
  const { monthlyBudget, downPaymentPercent, termMonths, interestRate } = input;

  const maxLoanAmount = amortizeInverse(monthlyBudget, interestRate, termMonths);
  const maxPropertyPrice = maxLoanAmount / (1 - downPaymentPercent / 100);

  const matchingProperties = allProperties
    .filter((p) => p.status === 'available' && p.price <= maxPropertyPrice)
    .sort((a, b) => b.price - a.price)
    .map((property) => ({
      property,
      estimatedMonthlyPayment: Math.round(amortize(property.price * (1 - downPaymentPercent / 100), interestRate, termMonths)),
    }));

  return {
    monthlyBudget,
    maxLoanAmount: Math.round(maxLoanAmount),
    maxPropertyPrice: Math.round(maxPropertyPrice),
    matchingProperties,
  };
}
