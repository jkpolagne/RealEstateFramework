const EWT_RATE = 0.1;
const MISC_TAX_RATE = 0.02;

export interface VoucherAmounts {
  grossCommission: number;
  lessEwt: number;
  lessAdcom: number;
  totalCommissionDue: number;
  lessMiscTax: number;
  otherDeductions: number;
  netCommissionReceivable: number;
}

/** Standard mock deduction structure — EWT and misc. tax are reasonable round percentages for demo purposes, not exact PH tax law. */
export function computeVoucherAmounts(salePrice: number, ratePercent: number, totalReleases: number, adcom = 0): VoucherAmounts {
  const grossCommission = Math.round(((salePrice * ratePercent) / 100) / totalReleases);
  const lessEwt = Math.round(grossCommission * EWT_RATE);
  const lessAdcom = adcom;
  const totalCommissionDue = grossCommission - lessEwt - lessAdcom;
  const lessMiscTax = Math.round(totalCommissionDue * MISC_TAX_RATE);
  const otherDeductions = 0;
  const netCommissionReceivable = totalCommissionDue - lessMiscTax - otherDeductions;

  return { grossCommission, lessEwt, lessAdcom, totalCommissionDue, lessMiscTax, otherDeductions, netCommissionReceivable };
}
