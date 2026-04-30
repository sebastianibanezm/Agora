'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { BookingStatus, Exporter, Market, Naviera } from '@/types';
import type { ListRow } from '@/components/bookings/BookingsListClient';
import { BookingsListClient } from '@/components/bookings/BookingsListClient';
import { BookingsKanbanClient } from '@/components/bookings/BookingsKanbanClient';
import { getTodayDemo } from '@/lib/mock-data/today';
import { Search, Snowflake, X } from 'lucide-react';
import clsx from 'clsx';

export type { ListRow as Row };

const STATUS_OPTIONS: BookingStatus[] = [
  'created', 'awaiting_si', 'si_received', 'si_validated', 'si_failed',
  'esi_sent', 'draft_bl_received', 'bl_validated', 'bl_released', 'closed',
];
const MARKETS: Market[] = ['US', 'EU', 'IN', 'CN', 'MENA', 'LATAM'];

interface Props {
  rows: ListRow[];
  exporters: Exporter[];
  navieras: Naviera[];
}

export function BookingsViewClient({ rows, exporters, navieras }: Props) {
  const t = useTranslations('bookings');
  const tKanban = useTranslations('bookings.kanban');
  const tCommon = useTranslations('common');
  const tLifecycle = useTranslations('lifecycle');
  const sp = useSearchParams();

  const [view, setView] = useState<'board' | 'list'>('board');

  const initialStatuses = (sp.get('status') ?? '').split(',').filter(Boolean) as BookingStatus[];
  const initialPol = sp.get('pol') ?? '';
  const initialPod = sp.get('pod') ?? '';

  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Set<BookingStatus>>(new Set(initialStatuses));
  const [exporterFilter, setExporterFilter] = useState('');
  const [navieraFilter, setNavieraFilter] = useState('');
  const [marketFilter, setMarketFilter] = useState<Market | ''>('');
  const [reeferOnly, setReeferOnly] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);

  const toggleStatus = (s: BookingStatus) => {
    const next = new Set(statuses);
    next.has(s) ? next.delete(s) : next.add(s);
    setStatuses(next);
  };

  const now = getTodayDemo().getTime();
  const URGENT_MS = 24 * 3_600_000;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ booking, exporter, naviera, order, highestAlertSeverity }) => {
      if (statuses.size > 0 && !statuses.has(booking.status)) return false;
      if (exporterFilter && exporter.id !== exporterFilter) return false;
      if (navieraFilter && naviera.id !== navieraFilter) return false;
      if (marketFilter && order.destinationMarket !== marketFilter) return false;
      if (reeferOnly && !booking.isReefer) return false;
      if (initialPol && booking.pol !== initialPol) return false;
      if (initialPod && booking.pod !== initialPod) return false;
      if (urgentOnly) {
        const isNearCutoff = new Date(booking.cutOff).getTime() - now < URGENT_MS;
        const isCritical = highestAlertSeverity === 'critical';
        if (!isNearCutoff && !isCritical) return false;
      }
      if (q) {
        const hay = [
          booking.bookingNumber, booking.containerNumber ?? '',
          booking.vesselName, booking.voyage, exporter.name, naviera.name, order.orderNumber,
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, statuses, exporterFilter, navieraFilter, marketFilter, reeferOnly, urgentOnly, search, initialPol, initialPod, now]);

  const clearAll = () => {
    setStatuses(new Set());
    setExporterFilter('');
    setNavieraFilter('');
    setMarketFilter('');
    setReeferOnly(false);
    setUrgentOnly(false);
    setSearch('');
  };

  const hasFilters = statuses.size > 0 || exporterFilter || navieraFilter || marketFilter || reeferOnly || urgentOnly || search;

  return (
    <div className="flex flex-col">
      {/* sticky filter bar */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-[var(--line-soft)] bg-bg-0/95 px-4 py-3 backdrop-blur">
        <div className="mb-3 flex items-center gap-2">
          {/* search */}
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

          {/* exporter */}
          <select value={exporterFilter} onChange={(e) => setExporterFilter(e.target.value)}
            className="rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-1 focus:border-mint-500 focus:outline-none">
            <option value="">{t('filterExporter')}</option>
            {exporters.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          {/* naviera */}
          <select value={navieraFilter} onChange={(e) => setNavieraFilter(e.target.value)}
            className="rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-1 focus:border-mint-500 focus:outline-none">
            <option value="">{t('filterNaviera')}</option>
            {navieras.map((n) => <option key={n.id} value={n.id}>{n.shortName}</option>)}
          </select>

          {/* market */}
          <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value as Market | '')}
            className="rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-1 focus:border-mint-500 focus:outline-none">
            <option value="">{t('filterMarket')}</option>
            {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* reefer */}
          <label className="flex items-center gap-1.5 rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-2 cursor-pointer">
            <input type="checkbox" checked={reeferOnly} onChange={(e) => setReeferOnly(e.target.checked)} className="accent-trace" />
            <Snowflake className="h-3 w-3 text-trace" />
            {t('reefer')}
          </label>

          {/* urgent only — board view only */}
          {view === 'board' && (
            <button
              onClick={() => setUrgentOnly((v) => !v)}
              className={clsx(
                'flex items-center gap-1.5 rounded-md border px-2 py-2 text-xs transition-colors',
                urgentOnly
                  ? 'border-severity-watch bg-severity-watch/8 text-severity-watch'
                  : 'border-[var(--line-soft)] bg-bg-1 text-ink-2',
              )}
            >
              <span className={clsx('h-[7px] w-[7px] rounded-full', urgentOnly ? 'bg-severity-watch' : 'bg-ink-4')} />
              {tKanban('filterUrgentOnly')}
            </button>
          )}

          {/* view toggle */}
          <div className="ml-auto flex items-center gap-1 rounded-md border border-[var(--line-soft)] bg-bg-2 p-0.5">
            <button onClick={() => setView('board')}
              className={clsx('rounded px-2 py-1 text-[10px] font-medium', view === 'board' ? 'bg-bg-3 text-ink-1' : 'text-ink-3')}>
              {tKanban('viewBoard')}
            </button>
            <button onClick={() => setView('list')}
              className={clsx('rounded px-2 py-1 text-[10px] font-medium', view === 'list' ? 'bg-bg-3 text-ink-1' : 'text-ink-3')}>
              {tKanban('viewList')}
            </button>
          </div>
        </div>

        {/* status pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_OPTIONS.map((s) => {
            const active = statuses.has(s);
            return (
              <button key={s} onClick={() => toggleStatus(s)}
                className={clsx(
                  'rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
                  active ? 'border-mint-500 bg-mint-500/10 text-mint-500' : 'border-[var(--line-soft)] bg-bg-1 text-ink-3 hover:text-ink-2',
                )}>
                {tLifecycle(s)}
              </button>
            );
          })}
          {hasFilters && (
            <button onClick={clearAll}
              className="ml-2 inline-flex items-center gap-1 rounded-full bg-ink-3/10 px-2 py-0.5 text-[10px] text-ink-2 hover:bg-ink-3/20">
              <X className="h-3 w-3" /> {tCommon('cancel')}
            </button>
          )}
        </div>
      </div>

      {/* view */}
      <div className="mt-3">
        {view === 'board' ? (
          <BookingsKanbanClient rows={filtered} />
        ) : (
          <BookingsListClient rows={filtered} />
        )}
      </div>

      <div className="mt-2 text-right font-mono text-[10px] text-ink-3">
        {filtered.length} / {rows.length}
      </div>
    </div>
  );
}
