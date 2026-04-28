export function formatUsd(amount: number, locale: 'es' | 'en'): string {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number, locale: 'es' | 'en', maxFrac = 2): string {
  return new Intl.NumberFormat(locale === 'es' ? 'es-CL' : 'en-US', {
    maximumFractionDigits: maxFrac,
  }).format(n);
}
