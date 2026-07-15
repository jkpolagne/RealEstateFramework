/** Standard monthly amortization formula for a fixed-rate loan. */
export function amortize(principal: number, annualRatePercent: number, termMonths: number): number {
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}
