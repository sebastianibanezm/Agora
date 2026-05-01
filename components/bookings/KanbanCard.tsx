'use client';

import type { ReactNode } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { Booking, AlertSeverity, Exporter, Naviera } from '@/types';
import { BookingCard } from '@/components/shared/BookingCard';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { formatElapsedSince, formatShortDate } from '@/lib/utils/dates';

export interface KanbanRow {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  alertCount: number;
  highestAlertSeverity: AlertSeverity | null;
  siFailedCheckCount: number;
  siFailedCheckNames: string[];
  esiTransmittedAt: string | null;
  siReceivedAt: string | null;
}

interface Props {
  row: KanbanRow;
}

export function KanbanCard({ row }: Props) {
  const { booking, exporter, naviera, highestAlertSeverity, siFailedCheckCount, siFailedCheckNames, esiTransmittedAt, siReceivedAt } = row;
  const t = useTranslations('bookings.kanban');
  const tCutoff = useTranslations('dashboard');
  const locale = useLocale() as 'es' | 'en';

  const metric = getMetric({ booking, siFailedCheckCount, siFailedCheckNames, esiTransmittedAt, siReceivedAt, locale, t, tCutoff });

  return (
    <BookingCard
      booking={booking}
      exporter={exporter}
      naviera={naviera}
      severity={highestAlertSeverity ?? undefined}
      metric={metric}
    />
  );
}

// ── Column metric ─────────────────────────────────────────────────────────────

type TKanban = ReturnType<typeof useTranslations<'bookings.kanban'>>;
type TDash = ReturnType<typeof useTranslations<'dashboard'>>;

function getMetric({ booking, siFailedCheckCount, siFailedCheckNames, esiTransmittedAt, siReceivedAt, locale, t, tCutoff }: {
  booking: Booking;
  siFailedCheckCount: number;
  siFailedCheckNames: string[];
  esiTransmittedAt: string | null;
  siReceivedAt: string | null;
  locale: 'es' | 'en';
  t: TKanban;
  tCutoff: TDash;
}): ReactNode {
  const { status } = booking;

  if (status === 'awaiting_si' || status === 'created' || status === 'si_received') {
    return (
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-ink-4">{tCutoff('cutoff')}</span>
        <CutoffCountdown cutoffIso={booking.cutOff ?? ''} />
      </div>
    );
  }

  if (status === 'si_failed') {
    return (
      <span className="text-[10px] text-severity-crit">
        {siFailedCheckCount === 1
          ? siFailedCheckNames[0]
          : t('cardIssues', { n: siFailedCheckCount })}
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

  return null;
}
