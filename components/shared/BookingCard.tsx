'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import type { Alert, AlertSeverity, Booking, Exporter, Naviera } from '@/types';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { getCutoffSeverity, formatShortDate } from '@/lib/utils/dates';
import { getPodFlag } from '@/lib/utils/flags';

export interface BookingCardProps {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  alert?: Alert;
  showCutoff?: boolean;
  showChevron?: boolean;
  severity?: AlertSeverity;
  metric?: ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHovered?: boolean;
}

const SEVERITY_BORDER: Record<AlertSeverity, string> = {
  critical: 'border-l-severity-crit',
  action:   'border-l-severity-watch',
  watch:    'border-l-severity-info',
  info:     'border-l-ink-3',
};

const ALERT_ICON_COLOR: Record<AlertSeverity, string> = {
  critical: 'text-severity-crit',
  action:   'text-severity-watch',
  watch:    'text-severity-info',
  info:     'text-ink-3',
};

function resolveSeverity(booking: Booking, alert?: Alert, showCutoff?: boolean, severity?: AlertSeverity): AlertSeverity | null {
  if (severity) return severity;
  if (alert) return alert.severity;
  if (showCutoff) return getCutoffSeverity(booking.cutOff ?? '');
  return null;
}

export function BookingCard({
  booking, exporter, naviera,
  alert, showCutoff, showChevron,
  severity: severityProp, metric,
  onMouseEnter, onMouseLeave, isHovered,
}: BookingCardProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale() as 'es' | 'en';

  const severity = resolveSeverity(booking, alert, showCutoff, severityProp);
  const hasExtra = !!alert || !!showCutoff || !!metric;
  const flag = getPodFlag(booking.pod);

  const pol = booking.pol.split(',')[0];
  const pod = booking.pod.split(',')[0];

  return (
    <Link
      href={`/bookings/${booking.id}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={clsx(
        'block rounded-lg border bg-bg-2 px-3 py-2 transition-colors',
        severity ? ['border-l-2', SEVERITY_BORDER[severity]] : '',
        isHovered
          ? 'border-[var(--line-mid)] bg-bg-3'
          : 'border-[var(--line-soft)] hover:border-[var(--line-mid)] hover:bg-bg-3',
      )}
    >
      {/* Row 1 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span className="font-mono text-[11px] font-semibold text-ink-1">
            {booking.bookingNumber}
          </span>
          {flag && <span className="text-[11px] leading-none">{flag}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <NavieraChip naviera={naviera} size="sm" asLink={false} />
          {showChevron && <ChevronRight className="h-3.5 w-3.5 text-ink-3" />}
        </div>
      </div>

      {/* Row 2 */}
      <div className="mt-1 flex items-center justify-between gap-2 min-w-0">
        <span className="truncate text-[10px] text-ink-3">{pol} → {pod}</span>
        <LifecyclePill status={booking.status} size="sm" className="shrink-0" />
      </div>

      {/* Row 3 */}
      <div className="mt-1 flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0 shrink">
          <ExporterChip exporter={exporter} size="sm" asLink={false} className="max-w-full" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {booking.isReefer && <span className="text-[10px] text-trace">❄</span>}
          <span className="rounded border border-[var(--line-soft)] bg-bg-1 px-[5px] py-px font-mono text-[9px] text-ink-3">
            {booking.containerType}
          </span>
          <span className="font-mono text-[9.5px] text-ink-4">
            ETD {booking.etd ? formatShortDate(booking.etd, locale) : '—'}
          </span>
        </div>
      </div>

      {/* Extra slots */}
      {hasExtra && (
        <div className="mt-1.5 border-t border-[var(--line-soft)] pt-1.5 flex flex-col gap-1">
          {alert && (
            <div className="flex items-start gap-1.5 text-[10px]">
              <AlertTriangle className={clsx('mt-px h-3 w-3 shrink-0', ALERT_ICON_COLOR[alert.severity])} />
              <span className="text-ink-2">
                {locale === 'es' ? (alert.titleEs ?? alert.title) : alert.title}
              </span>
              {alert.costAtRiskUsd ? (
                <span className="font-mono text-severity-watch shrink-0">
                  · USD {alert.costAtRiskUsd.toLocaleString()}
                </span>
              ) : null}
            </div>
          )}
          {showCutoff && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-ink-4">{t('cutoff')}</span>
              <CutoffCountdown cutoffIso={booking.cutOff ?? ''} />
            </div>
          )}
          {metric}
        </div>
      )}
    </Link>
  );
}
