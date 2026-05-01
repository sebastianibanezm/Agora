'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import type { Alert, Booking, Exporter, Naviera } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export interface DrilldownRow {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  alert?: Alert;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  rows: DrilldownRow[];
}

const STATUS_BORDER: Partial<Record<Booking['status'], string>> = {
  awaiting_si:       'border-l-severity-watch',
  si_failed:         'border-l-severity-crit',
  si_received:       'border-l-severity-info',
  si_validated:      'border-l-severity-info',
  esi_sent:          'border-l-trace',
  draft_bl_received: 'border-l-severity-info',
  bl_validated:      'border-l-severity-ok',
};

const ALERT_BORDER: Record<Alert['severity'], string> = {
  critical: 'border-l-severity-crit',
  action:   'border-l-severity-watch',
  watch:    'border-l-severity-info',
  info:     'border-l-ink-4',
};

export function KpiDrilldownModal({ open, onClose, title, rows }: Props) {
  const t = useTranslations('bookings');
  const tCommon = useTranslations('common');
  const locale = useLocale() as 'es' | 'en';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 flex flex-col max-h-[72vh] overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <DialogHeader className="shrink-0 px-5 pt-5 pb-4">
          <div className="flex items-end justify-between gap-3">
            <DialogTitle className="font-display text-xl italic text-ink-1 leading-none tracking-[-0.01em]">
              {title}
            </DialogTitle>
            {rows.length > 0 && (
              <span className="font-mono text-[11px] text-ink-4 leading-none mb-0.5">
                {t('bookingsSection', { n: rows.length })}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="mx-5 h-px bg-[var(--line-soft)] shrink-0" />

        {/* ── List ───────────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1">
          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-ink-3">
              {tCommon('empty')}
            </div>
          ) : (
            <ul className="divide-y divide-[var(--line-soft)]">
              {rows.map(({ booking, exporter, naviera, alert }) => {
                const borderClass = alert
                  ? ALERT_BORDER[alert.severity]
                  : (STATUS_BORDER[booking.status] ?? 'border-l-ink-4');

                return (
                  <li key={booking.id}>
                    <Link
                      href={`/bookings/${booking.id}`}
                      onClick={onClose}
                      className={clsx(
                        'group flex items-center gap-3 border-l-2 px-4 py-3 transition-colors hover:bg-black/[0.025]',
                        borderClass,
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        {/* Row 1: booking # + status + chips */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[11px] font-medium text-ink-2">
                            {booking.bookingNumber}
                          </span>
                          <LifecyclePill status={booking.status} size="sm" />
                          <ExporterChip exporter={exporter} size="sm" asLink={false} />
                          <NavieraChip naviera={naviera} size="sm" asLink={false} />
                        </div>

                        {/* Row 2: alert (if any) */}
                        {alert && (
                          <div className="mt-1 flex items-start gap-1.5">
                            <AlertTriangle className="mt-px h-3 w-3 shrink-0 text-severity-watch" />
                            <span className="text-[11px] text-ink-2 leading-snug">
                              {locale === 'es' ? (alert.titleEs ?? alert.title) : alert.title}
                            </span>
                            {alert.costAtRiskUsd != null && (
                              <span className="ml-1 font-mono text-[10px] text-severity-watch whitespace-nowrap">
                                · USD {alert.costAtRiskUsd.toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: cutoff */}
                      <CutoffCountdown
                        cutoffIso={booking.cutOff ?? ''}
                        className="shrink-0"
                      />

                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-4 transition-colors group-hover:text-ink-2" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="h-3 shrink-0" />
      </DialogContent>
    </Dialog>
  );
}
