'use client';
import { useTranslations } from 'next-intl';
import type { Alert } from '@/types';

interface Props { alerts: Alert[] }

const SEV_LABELS: Record<string, string> = {
  crit:  'CRITICAL',
  risk:  'RISK',
  watch: 'WATCH',
  info:  'INFO',
  ok:    'OK',
};

const SEV_PILL_CLASSES: Record<string, string> = {
  crit:  'bg-red-500/8 border border-red-500/40 text-severity-crit',
  risk:  'bg-orange-500/8 border border-orange-500/40 text-severity-risk',
  watch: 'bg-amber-500/8 border border-amber-500/40 text-severity-watch',
  info:  'bg-blue-500/8 border border-blue-500/40 text-severity-info',
  ok:    'bg-green-500/8 border border-green-500/40 text-severity-ok',
};

const SEV_ORDER: Record<string, number> = { crit: 4, risk: 3, watch: 2, info: 1, ok: 0 };

export function AlertsRail({ alerts }: Props) {
  const t = useTranslations('dashboard');

  const active = alerts
    .filter(a => !a.dismissed)
    .sort((a, b) => (SEV_ORDER[b.severity] ?? 0) - (SEV_ORDER[a.severity] ?? 0));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-soft)]">
        <span className="text-sm font-medium text-ink-1">{t('liveAlerts')}</span>
        <span className="font-mono text-[10px] text-ink-3 tracking-widest">{active.length} {t('open')}</span>
      </div>

      {/* Alert rows */}
      <div className="flex flex-col divide-y divide-[var(--line-soft)] overflow-auto">
        {active.map(alert => {
          const pillCls = SEV_PILL_CLASSES[alert.severity] ?? SEV_PILL_CLASSES['info']!;
          const sevLabel = SEV_LABELS[alert.severity] ?? alert.severity.toUpperCase();
          return (
            <div key={alert.id} data-testid="alert-row" className="px-4 py-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-ink-3 tracking-wider uppercase">
                  {alert.category.replace(/_/g, ' ')}
                </span>
                <span
                  data-testid="sev-pill"
                  className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${pillCls}`}
                >
                  {sevLabel}
                </span>
              </div>
              <div className="font-mono text-[11px] text-ink-2">
                {alert.containerId} · {alert.titleKey}
              </div>
              {alert.amountUsd !== undefined && (
                <div className="font-mono text-[10px] text-ink-3">
                  USD {alert.amountUsd.toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
