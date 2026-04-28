'use client';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import type { Container } from '@/types';

interface Row {
  pair: 'po_invoice' | 'invoice_packing' | 'packing_bl';
  matched: number;
  mismatched: number;
}

// Per-container demo fixtures. Walnuts has a weight discrepancy on
// packing list ↔ B/L; the rest are clean.
const FIXTURES: Record<string, Row[]> = {
  'MSCU-7842156': [
    { pair: 'po_invoice', matched: 8, mismatched: 0 },
    { pair: 'invoice_packing', matched: 7, mismatched: 0 },
    { pair: 'packing_bl', matched: 6, mismatched: 1 },
  ],
  'MAEU-9182734': [
    { pair: 'po_invoice', matched: 9, mismatched: 0 },
    { pair: 'invoice_packing', matched: 9, mismatched: 0 },
    { pair: 'packing_bl', matched: 8, mismatched: 0 },
  ],
  'CMAU-9281744': [
    { pair: 'po_invoice', matched: 8, mismatched: 0 },
    { pair: 'invoice_packing', matched: 8, mismatched: 0 },
    { pair: 'packing_bl', matched: 7, mismatched: 0 },
  ],
};

const DEFAULT_ROWS: Row[] = [
  { pair: 'po_invoice', matched: 0, mismatched: 0 },
  { pair: 'invoice_packing', matched: 0, mismatched: 0 },
  { pair: 'packing_bl', matched: 0, mismatched: 0 },
];

export function ReconciliationTab({ container }: { container: Container }) {
  const t = useTranslations('reconciliation');
  const rows = FIXTURES[container.id] ?? DEFAULT_ROWS;

  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-bg-2/50">
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('pair')}</th>
            <th className="text-right px-4 py-3 text-ink-3 font-medium">{t('matched')}</th>
            <th className="text-right px-4 py-3 text-ink-3 font-medium">{t('mismatched')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.pair} className="border-b border-white/10 last:border-b-0">
              <td className="px-4 py-3 text-ink-2">{t(`pairs.${row.pair}`)}</td>
              <td className="px-4 py-3 text-right font-mono text-severity-ok">{row.matched}</td>
              <td
                className={clsx(
                  'px-4 py-3 text-right font-mono',
                  row.mismatched > 0 ? 'text-severity-risk' : 'text-ink-3',
                )}
              >
                {row.mismatched}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
