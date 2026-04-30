'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import type { Booking, Exporter, Naviera, Order, AlertSeverity } from '@/types';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { formatDate } from '@/lib/utils/dates';
import { Snowflake, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export interface ListRow {
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
  rows: ListRow[];
}

export function BookingsListClient({ rows }: Props) {
  const t = useTranslations('bookings');
  const locale = useLocale() as 'es' | 'en';
  const router = useRouter();
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');

  return (
    <div className="flex flex-col">
      {/* density toggle — list-only, lives here */}
      <div className="flex justify-end pb-2">
        <div className="flex items-center gap-1 rounded-md border border-[var(--line-soft)] bg-bg-1 p-0.5">
          <button
            onClick={() => setDensity('compact')}
            className={clsx(
              'rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider',
              density === 'compact' ? 'bg-bg-2 text-ink-1' : 'text-ink-3',
            )}
          >
            {t('densityCompact')}
          </button>
          <button
            onClick={() => setDensity('comfortable')}
            className={clsx(
              'rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider',
              density === 'comfortable' ? 'bg-bg-2 text-ink-1' : 'text-ink-3',
            )}
          >
            {t('densityComfortable')}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1">
        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink-3">{t('empty')}</div>
        ) : (
          <table className={clsx('w-full', density === 'compact' ? 'text-xs' : 'text-sm')}>
            <thead>
              <tr className="border-b border-[var(--line-soft)] text-left font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">
                <th className="px-3 py-2 font-normal">{t('colNumber')}</th>
                <th className="px-3 py-2 font-normal">{t('colExporter')}</th>
                <th className="px-3 py-2 font-normal">{t('colNaviera')}</th>
                <th className="px-3 py-2 font-normal">{t('colContainerType')}</th>
                <th className="px-3 py-2 font-normal">{t('colRoute')}</th>
                <th className="px-3 py-2 font-normal">{t('colCutoff')}</th>
                <th className="px-3 py-2 font-normal">{t('colEtd')}</th>
                <th className="px-3 py-2 font-normal">{t('colStatus')}</th>
                <th className="px-3 py-2 font-normal text-center">{t('colAlerts')}</th>
                <th className="px-3 py-2 font-normal text-right">{t('colCostAtRisk')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ booking, exporter, naviera, alertCount }) => (
                <tr
                  key={booking.id}
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                  className={clsx(
                    'cursor-pointer border-b border-[var(--line-soft)] last:border-b-0 hover:bg-white/5',
                    density === 'compact' ? '[&>td]:py-1.5' : '[&>td]:py-2.5',
                  )}
                >
                  <td className="px-3">
                    <Link href={`/bookings/${booking.id}`} className="font-mono text-ink-1 hover:underline inline-flex items-center gap-1.5">
                      {booking.bookingNumber}
                      {booking.isReefer && <Snowflake className="h-3 w-3 text-trace" />}
                    </Link>
                  </td>
                  <td className="px-3"><ExporterChip exporter={exporter} size="sm" asLink={false} /></td>
                  <td className="px-3"><NavieraChip naviera={naviera} size="sm" asLink={false} /></td>
                  <td className="px-3 font-mono text-ink-2">{booking.containerType}</td>
                  <td className="px-3 text-ink-2">
                    {booking.pol.split(',')[0]} → {booking.pod.split(',')[0]}
                  </td>
                  <td className="px-3"><CutoffCountdown cutoffIso={booking.cutOff} /></td>
                  <td className="px-3 font-mono text-ink-2">{formatDate(booking.etd, locale)}</td>
                  <td className="px-3"><LifecyclePill status={booking.status} size="sm" /></td>
                  <td className="px-3 text-center">
                    {alertCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-severity-watch">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="font-mono">{alertCount}</span>
                      </span>
                    ) : (
                      <span className="text-ink-4">—</span>
                    )}
                  </td>
                  <td className="px-3 text-right font-mono text-ink-2">
                    {booking.costAtRiskUsd > 0 ? booking.costAtRiskUsd.toLocaleString('en-US') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
