import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Booking, Exporter, ShippingInstruction } from '@/types';

// Cumulative historical savings accrued over many shipping seasons
const HISTORICAL_SAVINGS_USD: Record<string, Record<string, number>> = {
  'EXP-COMFRUT':   { consignee: 4200,  weight: 1800,  vessel: 900,  cutoff: 3100,  incoterm: 600,  destination: 2400, container: 700,  cargo: 1100 },
  'EXP-AGROSUPER': { consignee: 8500,  weight: 12400, vessel: 2100, cutoff: 5600,  incoterm: 1400, destination: 6800, container: 3200, cargo: 4100 },
  'EXP-FRUSAN':    { consignee: 2100,  weight: 700,   vessel: 3800, cutoff: 1200,  incoterm: 0,    destination: 900,  container: 1500, cargo: 300  },
  'EXP-COPEFRUT':  { consignee: 1400,  weight: 3200,  vessel: 0,    cutoff: 800,   incoterm: 2700, destination: 1100, container: 400,  cargo: 2200 },
  'EXP-HORTIFRUT': { consignee: 6300,  weight: 900,   vessel: 1500, cutoff: 4200,  incoterm: 800,  destination: 3500, container: 2100, cargo: 700  },
  'EXP-CAMPOSOL':  { consignee: 3700,  weight: 5100,  vessel: 2400, cutoff: 0,     incoterm: 1100, destination: 4200, container: 900,  cargo: 3300 },
};

const ERROR_BUCKET_MATCHERS: { id: string; matches: (check: { id: string; checkName: string }) => boolean }[] = [
  { id: 'consignee',   matches: (c) => /consignee|notify|shipper/i.test(c.checkName) },
  { id: 'weight',      matches: (c) => /weight|kg|reconc/i.test(c.checkName) },
  { id: 'vessel',      matches: (c) => /vessel|voyage/i.test(c.checkName) },
  { id: 'cutoff',      matches: (c) => /cut.?off|date|loading/i.test(c.checkName) },
  { id: 'incoterm',    matches: (c) => /incoterm|payment|freight/i.test(c.checkName) },
  { id: 'destination', matches: (c) => /port.?of.?discharge|destination|pod/i.test(c.checkName) },
  { id: 'container',   matches: (c) => /container.?type|equipment|fcl|lcl|seal/i.test(c.checkName) },
  { id: 'cargo',       matches: (c) => /cargo|description|hs.?code|product/i.test(c.checkName) },
];

// Muted green scale — low opacity for small savings, solid dark for large
const GREEN_LEVELS = [
  { bg: 'rgba(79,122,60,0.18)',  text: '#5A4A38' }, // very low
  { bg: 'rgba(79,122,60,0.38)',  text: '#2B1F12' }, // low-mid
  { bg: 'rgba(52, 95, 38, 0.7)', text: '#e8f5e2' }, // mid-high
  { bg: '#1e3d18',               text: '#c8e3be' }, // high
] as const;

interface Props {
  exporters: Exporter[];
  bookings: Booking[];
  sis: ShippingInstruction[];
}

export function SiQualityHeatmap({ exporters, bookings, sis }: Props) {
  const t = useTranslations('dashboard');

  const ERROR_BUCKETS = [
    { id: 'consignee',   label: t('feeNameConsignee'),   matches: ERROR_BUCKET_MATCHERS[0]!.matches },
    { id: 'weight',      label: t('feeNameWeight'),      matches: ERROR_BUCKET_MATCHERS[1]!.matches },
    { id: 'vessel',      label: t('feeNameVessel'),      matches: ERROR_BUCKET_MATCHERS[2]!.matches },
    { id: 'cutoff',      label: t('feeNameCutoff'),      matches: ERROR_BUCKET_MATCHERS[3]!.matches },
    { id: 'incoterm',    label: t('feeNameIncoterm'),    matches: ERROR_BUCKET_MATCHERS[4]!.matches },
    { id: 'destination', label: t('feeNameDestination'), matches: ERROR_BUCKET_MATCHERS[5]!.matches },
    { id: 'container',   label: t('feeNameContainer'),   matches: ERROR_BUCKET_MATCHERS[6]!.matches },
    { id: 'cargo',       label: t('feeNameCargo'),       matches: ERROR_BUCKET_MATCHERS[7]!.matches },
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
    const bucketsHit = new Set<string>();
    for (const check of failChecks) {
      for (const bucket of ERROR_BUCKETS) {
        if (bucket.matches(check) && !bucketsHit.has(bucket.id)) {
          bucketsHit.add(bucket.id);
          grid[exporterId]![bucket.id] = (grid[exporterId]![bucket.id] ?? 0) + (booking.costAtRiskUsd ?? 0);
          break;
        }
      }
    }
  }

  // Merge multi-year historical baseline
  for (const exp of exporters) {
    const hist = HISTORICAL_SAVINGS_USD[exp.id];
    if (!hist) continue;
    for (const [bucketId, usd] of Object.entries(hist)) {
      grid[exp.id]![bucketId] = (grid[exp.id]![bucketId] ?? 0) + usd;
    }
  }

  const totalSaved = Object.values(grid)
    .flatMap((row) => Object.values(row))
    .reduce((a, b) => a + b, 0);

  const max = Math.max(1, ...Object.values(grid).flatMap((row) => Object.values(row)));

  const cellStyle = (usd: number) => {
    if (usd === 0) return { backgroundColor: 'transparent' as const, color: 'var(--color-ink-4)' };
    const intensity = usd / max;
    const level =
      intensity >= 0.75 ? GREEN_LEVELS[3] :
      intensity >= 0.45 ? GREEN_LEVELS[2] :
      intensity >= 0.20 ? GREEN_LEVELS[1] :
                          GREEN_LEVELS[0];
    return { backgroundColor: level.bg, color: level.text };
  };

  const formatUsd = (usd: number): string => {
    if (usd === 0) return '—';
    if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`;
    return `$${usd}`;
  };

  const formatTotal = (usd: number): string => {
    if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`;
    return `$${usd}`;
  };

  return (
    <div className="h-full rounded-xl border border-[var(--line-soft)] bg-bg-1">
      <div className="border-b border-[var(--line-soft)] px-4 py-2.5 flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">
          {t('siQualityByExporter')}
        </div>
        <div className="font-mono text-[10px] tracking-wider uppercase">
          <span className="text-ink-3">Total Ahorrado: </span>
          <span style={{ color: '#4F7A3C' }}>{formatTotal(totalSaved)}</span>
        </div>
      </div>
      <div className="overflow-x-auto pt-3 pb-4 px-4">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-0 pb-2 text-left font-normal text-ink-3 pr-4 min-w-32"></th>
              {ERROR_BUCKETS.map((b) => (
                <th key={b.id} className="p-0 pb-2 w-14 font-mono text-[9px] tracking-wider text-ink-3 uppercase text-center">
                  {b.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exporters.map((exp) => (
              <tr key={exp.id}>
                <td className="p-0 pr-4 text-ink-2 whitespace-nowrap">
                  <Link href={`/exporters/${exp.id}`} className="hover:text-ink-1 flex h-14 items-center">
                    {exp.name}
                  </Link>
                </td>
                {ERROR_BUCKETS.map((b) => {
                  const usd = grid[exp.id]?.[b.id] ?? 0;
                  const style = cellStyle(usd);
                  return (
                    <td key={b.id} className="p-0 w-14">
                      <Link
                        href={`/exporters/${exp.id}`}
                        style={style}
                        className="flex h-14 w-14 items-center justify-center font-mono text-[11px] leading-tight"
                      >
                        {formatUsd(usd)}
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
