import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import type { Alert, Booking, Exporter, Naviera } from '@/types';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

interface QueueItem {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  alert?: Alert;
}

interface Props {
  items: QueueItem[];
}

const SEVERITY_BORDER = {
  critical: 'border-l-severity-crit',
  action: 'border-l-severity-watch',
  watch: 'border-l-severity-info',
  info: 'border-l-ink-3',
};

export function ActionQueueV2({ items }: Props) {
  const t = useTranslations('dashboard');
  const locale = useLocale() as 'es' | 'en';

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1 p-6 text-center text-sm text-ink-3">
        {t('noPendingActions')}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-2.5">
        <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">
          {t('actionQueue')}
        </div>
        <Link
          href="/bookings?status=awaiting_si,si_failed,draft_bl_received"
          className="text-xs text-ink-3 hover:text-ink-1"
        >
          {t('actionQueueViewAll', { n: items.length })}
        </Link>
      </div>
      <ul className="divide-y divide-[var(--line-soft)]">
        {items.slice(0, 7).map(({ booking, exporter, naviera, alert }) => {
          const severity = alert?.severity ?? 'info';
          return (
            <li key={booking.id}>
              <Link
                href={`/bookings/${booking.id}`}
                className={clsx(
                  'group flex items-center gap-3 border-l-2 px-4 py-3 transition-colors hover:bg-white/5',
                  SEVERITY_BORDER[severity],
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-medium text-ink-1">{booking.bookingNumber}</span>
                    <LifecyclePill status={booking.status} size="sm" />
                    <ExporterChip exporter={exporter} size="sm" asLink={false} />
                    <NavieraChip naviera={naviera} size="sm" asLink={false} />
                  </div>
                  {alert && (
                    <div className="mt-1 flex items-start gap-1.5 text-xs">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-severity-watch" />
                      <span className="text-ink-2">{locale === 'es' ? (alert.titleEs ?? alert.title) : alert.title}</span>
                      {alert.costAtRiskUsd && (
                        <span className="font-mono text-severity-watch">
                          · USD {alert.costAtRiskUsd.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <CutoffCountdown cutoffIso={booking.cutOff ?? ''} />
                </div>
                <ChevronRight className="h-4 w-4 text-ink-3 transition-colors group-hover:text-ink-1" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
