import type { LoanQuotation } from '../types';
import { properties } from './properties';
import { amortize } from '../lib/amortize';

interface QuotationSeed {
  propertyId: string;
  interestRate: number;
  downPaymentPercent: number;
  termMonths: number;
}

const seeds: QuotationSeed[] = [
  { propertyId: 'prop-lot14-greenview', interestRate: 7.5, downPaymentPercent: 20, termMonths: 120 },
  { propertyId: 'prop-unit4b-riverside', interestRate: 6.5, downPaymentPercent: 20, termMonths: 180 },
  { propertyId: 'prop-lot22-sunrise', interestRate: 7.5, downPaymentPercent: 20, termMonths: 120 },
  { propertyId: 'prop-unit7-palmgrove', interestRate: 6.5, downPaymentPercent: 15, termMonths: 240 },
  { propertyId: 'prop-unit2-emerald', interestRate: 6.5, downPaymentPercent: 20, termMonths: 180 },
  { propertyId: 'prop-unit10-hilltop', interestRate: 6.25, downPaymentPercent: 15, termMonths: 240 },
];

export const loanQuotations: LoanQuotation[] = seeds.map((seed, i) => {
  const property = properties.find((p) => p.id === seed.propertyId)!;
  const downPaymentAmount = Math.round(property.price * (seed.downPaymentPercent / 100));
  const principal = property.price - downPaymentAmount;
  const monthlyAmortization = Math.round(amortize(principal, seed.interestRate, seed.termMonths));
  const totalAmountPayable = monthlyAmortization * seed.termMonths;
  const totalInterestPaid = totalAmountPayable - principal;

  return {
    id: `quote-${i + 1}`,
    propertyId: property.id,
    developerId: property.developerId,
    propertyPrice: property.price,
    interestRate: seed.interestRate,
    downPaymentPercent: seed.downPaymentPercent,
    downPaymentAmount,
    termMonths: seed.termMonths,
    monthlyAmortization,
    netLoanAmount: principal,
    totalInterestPaid,
    totalAmountPayable,
    principal,
    paymentBreakdownDescription: `${seed.downPaymentPercent}% down payment upon reservation, balance financed over ${seed.termMonths} months at ${seed.interestRate}% p.a.`,
  };
});
