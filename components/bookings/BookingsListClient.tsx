'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import type { Booking, BookingStatus, Exporter, Naviera, AlertSeverity } from '@/types';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { formatDate } from '@/lib/utils/dates';
import { Snowflake, AlertTriangle, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export interface ListRow {
  booking: Booking;
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

interface GroupDef {
  key: string;
  statuses: BookingStatus[];
  dotClass: string;
  titleKey: string;
  titleNs: 'lifecycle' | 'bookings.kanban';
}

const GROUPS: GroupDef[] = [
  { key: 'awaiting_si',      statuses: ['created', 'awaiting_si'],         dotClass: 'bg-severity-watch', titleKey: 'awaiting_si',       titleNs: 'lifecycle' },
  { key: 'si_in_review',     statuses: ['si_received'],                     dotClass: 'bg-severity-info',  titleKey: 'colSiInReview',     titleNs: 'bookings.kanban' },
  { key: 'si_failed',        statuses: ['si_failed'],                       dotClass: 'bg-severity-crit',  titleKey: 'si_failed',         titleNs: 'lifecycle' },
  { key: 'ready_to_send',    statuses: ['si_validated'],                    dotClass: 'bg-mint-500',       titleKey: 'colReadyToSend',    titleNs: 'bookings.kanban' },
  { key: 'awaiting_dbl',     statuses: ['esi_sent', 'draft_bl_received'],   dotClass: 'bg-trace',          titleKey: 'colAwaitingDraftBl', titleNs: 'bookings.kanban' },
  { key: 'ready_to_release', statuses: ['bl_validated'],                    dotClass: 'bg-mint-500',       titleKey: 'colReadyToRelease', titleNs: 'bookings.kanban' },
  { key: 'released',         statuses: ['bl_released', 'closed'],           dotClass: 'bg-ink-4',          titleKey: 'bl_released',       titleNs: 'lifecycle' },
];

const COL_SPAN = 10;

export function BookingsListClient({ rows }: Props) {
  const t = useTranslations('bookings');
  const tKanban = useTranslations('bookings.kanban');
  const tLifecycle = useTranslations('lifecycle');
  const locale = useLocale() as 'es' | 'en';
  const router = useRouter();
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');

  // groups with rows are open by default; empty groups start collapsed
  const emptyGroupKeys = new Set(
    GROUPS.filter((g) => !rows.some((r) => g.statuses.includes(r.booking.status))).map((g) => g.key),
  );
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(emptyGroupKeys);

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  if (rows.length === 0) {
    return <div className="py-12 text-center text-sm text-ink-3">{t('empty')}</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* density toggle */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1 rounded-md border border-[var(--line-soft)] bg-bg-1 p-0.5">
          <button
            onClick={() => setDensity('compact')}
            className={clsx('rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider', density === 'compact' ? 'bg-bg-2 text-ink-1' : 'text-ink-3')}
          >
            {t('densityCompact')}
          </button>
          <button
            onClick={() => setDensity('comfortable')}
            className={clsx('rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider', density === 'comfortable' ? 'bg-bg-2 text-ink-1' : 'text-ink-3')}
          >
            {t('densityComfortable')}
          </button>
        </div>
      </div>

      {/* grouped table */}
      <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden">
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
            {GROUPS.map((group) => {
              const groupRows = rows.filter((r) => group.statuses.includes(r.booking.status));
              const collapsed = collapsedGroups.has(group.key);
              const title = group.titleNs === 'lifecycle'
                ? tLifecycle(group.titleKey as Parameters<typeof tLifecycle>[0])
                : tKanban(group.titleKey as Parameters<typeof tKanban>[0]);

              return (
                <Fragment key={group.key}>
                  {/* group header row */}
                  <tr
                    onClick={() => toggleGroup(group.key)}
                    className="cursor-pointer border-b border-[var(--line-soft)] bg-bg-0/60 hover:bg-bg-0/80"
                  >
                    <td colSpan={COL_SPAN} className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={clsx('h-[7px] w-[7px] shrink-0 rounded-full', group.dotClass)} />
                        <span className="text-[11px] font-semibold text-ink-2">{title}</span>
                        <span className="rounded bg-bg-2 px-[5px] py-px font-mono text-[10px] text-ink-4">
                          {groupRows.length}
                        </span>
                        <ChevronDown
                          className={clsx('ml-auto h-3.5 w-3.5 text-ink-4 transition-transform duration-150', collapsed && '-rotate-90')}
                        />
                      </div>
                    </td>
                  </tr>

                  {/* group rows */}
                  {!collapsed && groupRows.map(({ booking, exporter, naviera, alertCount }) => (
                    <tr
                      key={booking.id}
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className={clsx(
                        'cursor-pointer border-b border-[var(--line-soft)] last:border-b-0 hover:bg-white/5',
                        density === 'compact' ? '[&>td]:py-1.5' : '[&>td]:py-2.5',
                      )}
                    >
                      <td className="px-3">
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="inline-flex items-center gap-1.5 font-mono text-ink-1 hover:underline"
                        >
                          {booking.bookingNumber}
                          {booking.isReefer && <Snowflake className="h-3 w-3 text-trace" />}
                        </Link>
                      </td>
                      <td className="px-3"><ExporterChip exporter={exporter} size="sm" asLink={false} /></td>
                      <td className="px-3"><NavieraChip naviera={naviera} size="sm" asLink={false} /></td>
                      <td className="px-3 font-mono text-ink-2">{booking.containerType}</td>
                      <td className="px-3 text-ink-2">{booking.pol.split(',')[0]} → {booking.pod.split(',')[0]}</td>
                      <td className="px-3"><CutoffCountdown cutoffIso={booking.cutOff ?? ''} /></td>
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
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
