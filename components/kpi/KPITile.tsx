import type { KPI } from '@/types';
import clsx from 'clsx';

interface Props {
  kpi: KPI;
}

export function KPITile({ kpi }: Props) {
  const dir = kpi.deltaDirection;
  const positive = kpi.deltaPositive;
  const deltaColor =
    positive === undefined
      ? 'text-ink-3'
      : positive
        ? 'text-mint-500'
        : 'text-severity-risk';

  return (
    <div
      data-testid={`kpi-${kpi.id}`}
      className="relative overflow-hidden rounded-[10px] border border-[var(--line-soft)] bg-bg-1 px-4 py-3.5 transition-colors hover:border-[var(--line-mid)]"
    >
      <div className="mb-2 font-mono text-[9.5px] tracking-[0.18em] text-ink-3 uppercase">
        {kpi.label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          data-testid="kpi-value"
          className="font-mono text-[30px] leading-none font-semibold text-ink-1"
        >
          {kpi.value}
        </span>
      </div>
      {(kpi.delta || kpi.sublabel) && (
        <div className="mt-2 flex items-center gap-2 font-mono text-[11px]">
          {kpi.delta && (
            <span data-testid="kpi-delta" className={clsx('flex items-center gap-1', deltaColor)}>
              {dir === 'up' ? '↑' : dir === 'down' ? '↓' : '·'} {kpi.delta}
            </span>
          )}
          {kpi.sublabel && (
            <span className="truncate text-ink-3">{kpi.sublabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
