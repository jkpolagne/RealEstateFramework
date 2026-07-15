const phpFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

export function formatPHP(amount: number): string {
  return phpFormatter.format(amount);
}

export function formatSqm(value: number): string {
  return `${value.toLocaleString('en-PH')} sqm`;
}
