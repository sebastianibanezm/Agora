'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import type { Booking, Exporter, Naviera, Order, BookingStatus, Market } from '@/types';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { formatDate } from '@/lib/utils/dates';
import { Search, Snowflake, AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

interface Row {
  booking: Booking;
  order: Order;
  exporter: Exporter;
  naviera: Naviera;
  alertCount: number;
}

interface Props {
  rows: Row[];
  exporters: Exporter[];
  navieras: Naviera[];
}

const STATUS_OPTIONS: BookingStatus[] = [
  'created',
  'awaiting_si',
  'si_received',
  'si_validated',
  'si_failed',
  'esi_sent',
  'draft_bl_received',
  'bl_validated',
  'bl_released',
  'closed',
];

const MARKETS: Market[] = ['US', 'EU', 'IN', 'CN', 'MENA', 'LATAM'];

export function BookingsListClient({ rows, exporters, navieras }: Props) {
  const t = useTranslations('bookings');
  const tCommon = useTranslations('common');
  const locale = useLocale() as 'es' | 'en';
  const sp = useSearchParams();

  const initialStatuses = (sp.get('status') ?? '').split(',').filter(Boolean) as BookingStatus[];
  const initialPol = sp.get('pol') ?? '';
  const initialPod = sp.get('pod') ?? '';

  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Set<BookingStatus>>(new Set(initialStatuses));
  const [exporterFilter, setExporterFilter] = useState<string>('');
  const [navieraFilter, setNavieraFilter] = useState<string>('');
  const [marketFilter, setMarketFilter] = useState<Market | ''>('');
  const [reeferOnly, setReeferOnly] = useState(false);
  const [density, setDensity] = useState<'compact' | 'comfortable'>('compact');

  const toggleStatus = (s: BookingStatus) => {
    const next = new Set(statuses);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    setStatuses(next);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ booking, exporter, naviera, order }) => {
      if (statuses.size > 0 && !statuses.has(booking.status)) return false;
      if (exporterFilter && exporter.id !== exporterFilter) return false;
      if (navieraFilter && naviera.id !== navieraFilter) return false;
      if (marketFilter && order.destinationMarket !== marketFilter) return false;
      if (reeferOnly && !booking.isReefer) return false;
      if (initialPol && booking.pol !== initialPol) return false;
      if (initialPod && booking.pod !== initialPod) return false;
      if (q) {
        const hay = [
          booking.bookingNumber,
          booking.containerNumber ?? '',
          booking.vesselName,
          booking.voyage,
          exporter.name,
          naviera.name,
          order.orderNumber,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, statuses, exporterFilter, navieraFilter, marketFilter, reeferOnly, search, initialPol, initialPod]);

  const clearAll = () => {
    setStatuses(new Set());
    setExporterFilter('');
    setNavieraFilter('');
    setMarketFilter('');
    setReeferOnly(false);
    setSearch('');
  };

  const hasFilters = statuses.size > 0 || exporterFilter || navieraFilter || marketFilter || reeferOnly || search;

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-20 -mx-4 border-b border-[var(--line-soft)] bg-bg-0/95 px-4 py-3 backdrop-blur">
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-ink-3" />
            <input
              type="text"
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-[var(--line-soft)] bg-bg-1 pl-8 pr-3 py-2 text-sm text-ink-1 placeholder:text-ink-3 focus:border-mint-500 focus:outline-none"
            />
          </div>

          <select
            value={exporterFilter}
            onChange={(e) => setExporterFilter(e.target.value)}
            className="rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-1 focus:border-mint-500 focus:outline-none"
          >
            <option value="">{t('filterExporter')}</option>
            {exporters.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>

          <select
            value={navieraFilter}
            onChange={(e) => setNavieraFilter(e.target.value)}
            className="rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-1 focus:border-mint-500 focus:outline-none"
          >
            <option value="">{t('filterNaviera')}</option>
            {navieras.map((n) => (
              <option key={n.id} value={n.id}>{n.shortName}</option>
            ))}
          </select>

          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value as Market | '')}
            className="rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-1 focus:border-mint-500 focus:outline-none"
          >
            <option value="">{t('filterMarket')}</option>
            {MARKETS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-2 cursor-pointer">
            <input
              type="checkbox"
              checked={reeferOnly}
              onChange={(e) => setReeferOnly(e.target.checked)}
              className="accent-trace"
            />
            <Snowflake className="h-3 w-3 text-trace" />
            {t('reefer')}
          </label>

          <div className="ml-auto flex items-center gap-1 rounded-md border border-[var(--line-soft)] bg-bg-1 p-0.5">
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

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_OPTIONS.map((s) => {
            const active = statuses.has(s);
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={clsx(
                  'rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
                  active
                    ? 'border-mint-500 bg-mint-500/10 text-mint-500'
                    : 'border-[var(--line-soft)] bg-bg-1 text-ink-3 hover:text-ink-2',
                )}
              >
                <LifecycleLabel status={s} />
              </button>
            );
          })}
          {hasFilters && (
            <button
              onClick={clearAll}
              className="ml-2 inline-flex items-center gap-1 rounded-full bg-ink-3/10 px-2 py-0.5 text-[10px] text-ink-2 hover:bg-ink-3/20"
            >
              <X className="h-3 w-3" /> {tCommon('cancel')}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-[var(--line-soft)] bg-bg-1">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink-3">
            {t('empty')}
          </div>
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
              {filtered.map(({ booking, exporter, naviera, alertCount }) => (
                <tr
                  key={booking.id}
                  className={clsx(
                    'border-b border-[var(--line-soft)] last:border-b-0 hover:bg-white/5',
                    density === 'compact' ? '[&>td]:py-1.5' : '[&>td]:py-2.5',
                  )}
                >
                  <td className="px-3">
                    <Link href={`/bookings/${booking.id}`} className="font-mono text-ink-1 hover:underline inline-flex items-center gap-1.5">
                      {booking.bookingNumber}
                      {booking.isReefer && <Snowflake className="h-3 w-3 text-trace" />}
                    </Link>
                  </td>
                  <td className="px-3">
                    <ExporterChip exporter={exporter} size="sm" asLink={false} />
                  </td>
                  <td className="px-3">
                    <NavieraChip naviera={naviera} size="sm" asLink={false} />
                  </td>
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

      <div className="mt-2 text-right font-mono text-[10px] text-ink-3">
        {filtered.length} / {rows.length}
      </div>
    </div>
  );
}

function LifecycleLabel({ status }: { status: BookingStatus }) {
  const t = useTranslations('lifecycle');
  return <>{t(status)}</>;
}
