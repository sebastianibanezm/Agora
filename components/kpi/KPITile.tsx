'use client';
import type { KPI } from '@/types';
import { useCountUp } from '@/lib/hooks/useCountUp';

interface Props { kpi: KPI; label: string }

function Sparkline({ points, id }: { points: number[]; id: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const W = 80, H = 24;
  const xs = points.map((_, i) => (i / (points.length - 1)) * W);
  const ys = points.map(v => H - ((v - min) / range) * (H - 2) - 1);
  const gradId = `sg-${id}`;
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x},${ys[i] ?? 0}`).join(' ');
  const fill = `${d} L ${W},${H} L 0,${H} Z`;
  return (
    <svg
      data-testid="kpi-sparkline"
      width={W} height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', right: 12, bottom: 10, opacity: 0.7 }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00E696" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00E696" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${gradId})`} />
      <polyline
        points={xs.map((x, i) => `${x},${ys[i] ?? 0}`).join(' ')}
        fill="none" stroke="#00E696" strokeWidth="1.5"
      />
    </svg>
  );
}

export function KPITile({ kpi, label }: Props) {
  const animatedValue = useCountUp(kpi.value);
  const deltaPct = kpi.deltaPct ?? 0;
  const positiveIsGood = kpi.deltaPositiveIsGood !== false;
  const isGoodChange = deltaPct === 0 ? null : (deltaPct > 0) === positiveIsGood;
  const deltaColorClass = isGoodChange === null ? 'text-ink-3' : isGoodChange ? 'text-mint-500' : 'text-severity-risk';
  const unitLabels: Record<string, string> = { usd: 'USD', pct: '%', count: 'FCL', days: 'DAYS', minutes: 'MIN' };
  const valueDisplay = kpi.unit === 'usd' ? animatedValue.toLocaleString() : String(animatedValue);

  return (
    <div className="relative overflow-hidden rounded-[10px] border border-[var(--line-soft)] bg-bg-1 px-4 py-3.5 cursor-pointer hover:border-[var(--line-mid)] transition-colors">
      <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3 mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span data-testid="kpi-value" className="font-mono font-semibold text-[30px] leading-none text-ink-1">
          {valueDisplay}
        </span>
        <span data-testid="kpi-unit" className="font-mono text-[12px] text-ink-3 tracking-[0.1em]">
          {unitLabels[kpi.unit] ?? kpi.unit.toUpperCase()}
        </span>
      </div>
      {kpi.deltaPct !== undefined && (
        <div
          data-testid="kpi-delta"
          className={`mt-2 font-mono text-[11px] flex items-center gap-1.5 ${deltaColorClass}`}
        >
          <span>{kpi.deltaPct > 0 ? '↑' : '↓'} {Math.abs(kpi.deltaPct)}%</span>
        </div>
      )}
      <Sparkline points={kpi.sparkline} id={kpi.id} />
    </div>
  );
}
