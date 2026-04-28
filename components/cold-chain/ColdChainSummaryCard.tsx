'use client';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import type { ColdChainTrace } from '@/types';

function formatMinutes(minutes: number): string {
  const totalHours = Math.floor(minutes / 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const mins = minutes % 60;
  return `${days}d ${hours}h ${mins}m`;
}

const STATUS_COLOR: Record<string, string> = {
  pre_load:     'text-ink-3',
  in_treatment: 'text-severity-ok',
  completed:    'text-severity-ok',
  breached:     'text-severity-crit',
};

export function ColdChainSummaryCard({ trace }: { trace: ColdChainTrace }) {
  const t = useTranslations('coldChain');
  const pct = trace.treatmentRequiredMinutes > 0
    ? Math.min(100, Math.round((trace.treatmentMinutesCompliant / trace.treatmentRequiredMinutes) * 100))
    : 0;

  return (
    <div className="rounded-md bg-bg-2/50 border border-white/10 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-ink-3 mb-1">{t('statusBanner')}</div>
          <div className={clsx('text-sm font-mono font-semibold', STATUS_COLOR[trace.status])}>
            {trace.status === 'in_treatment' ? t('minutesCompliant') : trace.status.toUpperCase()}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl text-mint-500" data-testid="compliance-counter">
            {formatMinutes(trace.treatmentMinutesCompliant)}
          </div>
          <div className="text-xs text-ink-3">
            / {formatMinutes(trace.treatmentRequiredMinutes)} {t('minutesRequired')}
          </div>
        </div>
      </div>

      <div className="h-2 rounded-full bg-bg-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-mint-500 transition-all"
          style={{ width: `${pct}%` }}
          data-testid="compliance-bar"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {trace.loggers.map(lg => {
          const lastReading = lg.readings[lg.readings.length - 1];
          return (
            <div key={lg.id} className="text-center">
              <div className="text-xs text-ink-3 mb-0.5">
                {lg.position === 'top' ? t('loggerTop') : lg.position === 'middle' ? t('loggerMiddle') : t('loggerBottom')}
              </div>
              <div className="font-mono text-sm text-trace">
                {lastReading ? `${lastReading.tempC.toFixed(2)}°C` : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
