import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Booking, Exporter, ShippingInstruction } from '@/types';

const ERROR_BUCKET_MATCHERS: { id: string; matches: (check: { id: string; checkName: string }) => boolean }[] = [
  { id: 'consignee', matches: (c) => /consignee|notify|shipper/i.test(c.checkName) },
  { id: 'weight', matches: (c) => /weight|kg|reconc/i.test(c.checkName) },
  { id: 'vessel', matches: (c) => /vessel|voyage/i.test(c.checkName) },
  { id: 'cutoff', matches: (c) => /cut.?off|date|loading/i.test(c.checkName) },
  { id: 'incoterm', matches: (c) => /incoterm|payment|freight/i.test(c.checkName) },
];

interface Props {
  exporters: Exporter[];
  bookings: Booking[];
  sis: ShippingInstruction[];
}

export function SiQualityHeatmap({ exporters, bookings, sis }: Props) {
  const t = useTranslations('dashboard');

  const ERROR_BUCKETS = [
    { id: 'consignee', label: t('errorBucketConsignee'), matches: ERROR_BUCKET_MATCHERS[0]!.matches },
    { id: 'weight', label: t('errorBucketWeight'), matches: ERROR_BUCKET_MATCHERS[1]!.matches },
    { id: 'vessel', label: t('errorBucketVessel'), matches: ERROR_BUCKET_MATCHERS[2]!.matches },
    { id: 'cutoff', label: t('errorBucketCutoff'), matches: ERROR_BUCKET_MATCHERS[3]!.matches },
    { id: 'incoterm', label: t('errorBucketIncoterm'), matches: ERROR_BUCKET_MATCHERS[4]!.matches },
  ];

  const grid: Record<string, Record<string, number>> = {};
  for (const e of exporters) grid[e.id] = {};

  for (const si of sis) {
    const booking = bookings.find((b) => b.id === si.bookingId);
    if (!booking) continue;
    const exporter = exporters.find(
      (e) => e.name === booking.shipper || e.legalName === booking.shipper
    );
    if (!exporter) continue;
    const exporterId = exporter.id;
    if (!grid[exporterId]) continue;

    const failChecks = si.validationResults.filter((r) => r.result === 'fail' || r.result === 'warn');
    for (const check of failChecks) {
      for (const bucket of ERROR_BUCKETS) {
        if (bucket.matches(check)) {
          grid[exporterId]![bucket.id] = (grid[exporterId]![bucket.id] ?? 0) + 1;
          break;
        }
      }
    }
  }

  const max = Math.max(
    1,
    ...Object.values(grid).flatMap((row) => Object.values(row)),
  );

  const cellColor = (n: number) => {
    if (n === 0) return 'bg-bg-2 text-ink-3';
    const intensity = n / max;
    if (intensity >= 0.66) return 'bg-severity-crit/30 text-ink-1';
    if (intensity >= 0.33) return 'bg-severity-watch/25 text-ink-1';
    return 'bg-severity-info/15 text-ink-2';
  };

  return (
    <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1">
      <div className="border-b border-[var(--line-soft)] px-4 py-2.5">
        <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">
          {t('siQualityByExporter')}
        </div>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="text-left font-normal text-ink-3"></th>
              {ERROR_BUCKETS.map((b) => (
                <th key={b.id} className="font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">
                  {b.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exporters.map((exp) => (
              <tr key={exp.id}>
                <td className="py-1 pr-3 text-ink-2">
                  <Link href={`/exporters/${exp.id}`} className="hover:text-ink-1">
                    {exp.name}
                  </Link>
                </td>
                {ERROR_BUCKETS.map((b) => {
                  const n = grid[exp.id]?.[b.id] ?? 0;
                  return (
                    <td key={b.id} className="text-center">
                      <Link
                        href={`/exporters/${exp.id}`}
                        className={`block rounded-sm px-2 py-2 font-mono text-[11px] ${cellColor(n)}`}
                      >
                        {n}
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
