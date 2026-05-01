import type { KPI } from '@/types';
import clsx from 'clsx';

interface Props {
  kpi: KPI;
  onClick?: () => void;
}

export function KPITile({ kpi, onClick }: Props) {
  const dir = kpi.deltaDirection;
  const positive = kpi.deltaPositive;
  const deltaColor =
    positive === undefined
      ? 'text-ink-3'
      : positive
        ? 'text-severity-ok'
        : 'text-severity-risk';

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      data-testid={`kpi-${kpi.id}`}
      onClick={onClick}
      className={clsx(
        'relative w-full overflow-hidden rounded-[10px] border border-[var(--line-soft)] bg-bg-1 px-4 py-3.5 text-left transition-colors hover:border-[var(--line-mid)]',
        onClick && 'cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04]',
      )}
    >
      <div className="mb-2 font-mono text-[9.5px] tracking-[0.18em] text-ink-3 uppercase">
        {kpi.label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          data-testid="kpi-value"
          className="font-heading text-[30px] leading-none font-semibold text-ink-1"
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
            <span className={clsx('truncate', deltaColor)}>{kpi.sublabel}</span>
          )}
        </div>
      )}
    </Tag>
  );
}
