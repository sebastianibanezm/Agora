import type { ClosedContainer } from '@/types';
import { getTranslations } from 'next-intl/server';

interface Props { rows: ClosedContainer[] }

export async function ClosedTable({ rows }: Props) {
  const t = await getTranslations('dashboard');
  return (
    <div className="overflow-hidden">
      {/* Column headers */}
      <div
        className="grid font-mono text-[9.5px] uppercase text-ink-3 px-4 py-2 bg-white/[0.015]"
        style={{ gridTemplateColumns: '1fr 1fr 60px 60px 80px' }}
      >
        <span>{t('colContainer')}</span>
        <span>{t('colBuyer')}</span>
        <span className="text-right">{t('colCycle')}</span>
        <span className="text-right">{t('colDeltaAvg')}</span>
        <span className="text-right">{t('colPenalty')}</span>
      </div>

      {/* Rows */}
      {rows.map((row, idx) => {
        const deltaClass = row.deltaAvgDays > 0
          ? 'text-severity-watch'
          : row.deltaAvgDays < 0
          ? 'text-severity-ok'
          : 'text-ink-4';

        const deltaDisplay = row.deltaAvgDays === 0
          ? '—'
          : row.deltaAvgDays > 0
          ? `+${row.deltaAvgDays}d`
          : `${row.deltaAvgDays}d`;

        const penaltyCls = row.penaltyUsd > 0 ? 'text-severity-crit font-mono font-semibold' : 'text-ink-4';
        const penaltyDisplay = row.penaltyUsd > 0 ? `$${row.penaltyUsd.toLocaleString()}` : '—';

        return (
          <div
            key={row.id}
            data-testid="closed-row"
            className={`grid px-4 py-2.5 items-center ${idx < rows.length - 1 ? 'border-b border-[var(--line-soft)]' : ''}`}
            style={{ gridTemplateColumns: '1fr 1fr 60px 60px 80px' }}
          >
            <span className="font-mono text-[12px] text-ink-1">{row.id}</span>
            <span className="text-[12px] text-ink-2 truncate pr-2">{row.buyerName}</span>
            <span className="font-mono text-[12px] text-ink-2 text-right">{row.cycledays}d</span>
            <span
              data-testid={`delta-${row.id}`}
              className={`font-mono text-[12px] text-right ${deltaClass}`}
            >
              {deltaDisplay}
            </span>
            <span
              data-testid={`penalty-${row.id}`}
              className={`text-[12px] text-right ${penaltyCls}`}
            >
              {penaltyDisplay}
            </span>
          </div>
        );
      })}
    </div>
  );
}
