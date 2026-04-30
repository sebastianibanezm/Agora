'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import type { Booking, AlertSeverity, Exporter, Naviera, Order } from '@/types';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { formatElapsedSince, formatShortDate } from '@/lib/utils/dates';
import clsx from 'clsx';

const SEVERITY_STRIP: Record<AlertSeverity, string> = {
  critical: 'bg-severity-crit',
  action:   'bg-severity-risk',
  watch:    'bg-severity-watch',
  info:     'bg-severity-info',
};

export interface KanbanRow {
  booking: Booking;
  order: Order;
  exporter: Exporter;
  naviera: Naviera;
  alertCount: number;
  highestAlertSeverity: AlertSeverity | null;
  siFailedCheckCount: number;
  esiTransmittedAt: string | null;
  siReceivedAt: string | null;
}

interface Props {
  row: KanbanRow;
}

export function KanbanCard({ row }: Props) {
  const { booking, exporter, naviera, highestAlertSeverity, siFailedCheckCount, esiTransmittedAt, siReceivedAt } = row;
  const t = useTranslations('bookings.kanban');
  const locale = useLocale() as 'es' | 'en';

  const pol = booking.pol.split(',')[0];
  const pod = booking.pod.split(',')[0];

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="group block relative rounded-lg border border-[var(--line-soft)] bg-bg-2 px-2 pb-2 pt-2 pl-[11px] transition-colors hover:border-white/15 hover:bg-bg-3 overflow-hidden"
    >
      {/* severity strip */}
      {highestAlertSeverity && (
        <span
          data-severity={highestAlertSeverity}
          className={clsx(
            'absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg',
            SEVERITY_STRIP[highestAlertSeverity],
          )}
        />
      )}

      {/* row 1: booking number + naviera */}
      <div className="flex items-center justify-between gap-1">
        <span className="font-mono text-[11px] font-semibold text-ink-1">
          {booking.bookingNumber}
        </span>
        <NavieraChip naviera={naviera} size="sm" asLink={false} />
      </div>

      {/* row 2: exporter + container type + reefer */}
      <div className="mt-1 flex items-center justify-between gap-1">
        <span className="max-w-[110px] truncate text-[11px] text-ink-2">
          {exporter.name}
        </span>
        <div className="flex items-center gap-1">
          <span className="rounded border border-[var(--line-soft)] bg-bg-1 px-[5px] py-px font-mono text-[9.5px] text-ink-3">
            {booking.containerType}
          </span>
          {booking.isReefer && (
            <span data-testid="reefer-icon" className="text-[11px] text-trace">❄</span>
          )}
        </div>
      </div>

      {/* row 3: lane + column metric */}
      <div className="mt-[5px] flex items-center justify-between gap-1">
        <span className="text-[10px] text-ink-3">
          {pol} → {pod}
        </span>
        <CardMetric
          booking={booking}
          siFailedCheckCount={siFailedCheckCount}
          esiTransmittedAt={esiTransmittedAt}
          siReceivedAt={siReceivedAt}
          locale={locale}
          t={t}
        />
      </div>
    </Link>
  );
}

// ── Column metric ─────────────────────────────────────────────────────────────

type TFn = ReturnType<typeof useTranslations<'bookings.kanban'>>;

function CardMetric({ booking, siFailedCheckCount, esiTransmittedAt, siReceivedAt, locale, t }: {
  booking: Booking;
  siFailedCheckCount: number;
  esiTransmittedAt: string | null;
  siReceivedAt: string | null;
  locale: 'es' | 'en';
  t: TFn;
}) {
  const status = booking.status;

  if (status === 'awaiting_si' || status === 'created' || status === 'si_received') {
    return <CutoffCountdown cutoffIso={booking.cutOff} />;
  }

  if (status === 'si_failed') {
    return (
      <span className="font-mono text-[10px] text-severity-crit">
        {t('cardIssues', { n: siFailedCheckCount })}
      </span>
    );
  }

  if (status === 'si_validated') {
    const when = siReceivedAt ? formatElapsedSince(siReceivedAt) : '—';
    return (
      <span className="font-mono text-[10px] text-ink-3">
        {t('cardReadySince', { when })}
      </span>
    );
  }

  if (status === 'esi_sent') {
    const when = esiTransmittedAt ? formatElapsedSince(esiTransmittedAt) : '—';
    return (
      <span className="font-mono text-[10px] text-trace">
        {t('cardEsiSent', { when })}
      </span>
    );
  }

  if (status === 'draft_bl_received') {
    return (
      <span className="font-mono text-[10px] text-severity-info">
        {t('cardDraftBlReceived')}
      </span>
    );
  }

  if (status === 'bl_validated') {
    return (
      <span className="font-mono text-[10px] text-severity-ok">
        {t('cardBlReady')}
      </span>
    );
  }

  if (status === 'bl_released') {
    const date = formatShortDate(booking.etd, locale);
    return (
      <span className="font-mono text-[10px] text-ink-4">
        {t('cardReleased', { date })}
      </span>
    );
  }

  if (status === 'closed') {
    const date = formatShortDate(booking.etd, locale);
    return (
      <span className="font-mono text-[10px] text-ink-4">
        {t('cardClosed', { date })}
      </span>
    );
  }

  // cancelled bookings are filtered at page.tsx before reaching the board
  return null;
}
