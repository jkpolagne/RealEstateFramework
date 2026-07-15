/** Standard monthly amortization formula for a fixed-rate loan. */
export function amortize(principal: number, annualRatePercent: number, termMonths: number): number {
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

/** Inverse of amortize() — the loan principal a given monthly payment can carry. */
export function amortizeInverse(monthlyPayment: number, annualRatePercent: number, termMonths: number): number {
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return monthlyPayment * termMonths;
  return (monthlyPayment * (Math.pow(1 + r, termMonths) - 1)) / (r * Math.pow(1 + r, termMonths));
}
