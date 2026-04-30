'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import type { Order, Exporter, OrderStatus, Market } from '@/types';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { MarketChip } from '@/components/shared/MarketChip';
import { CreateOrderDialog } from '@/components/orders/CreateOrderDialog';
import { useDemoStore } from '@/lib/hooks/useDemoStore';
import { formatDate } from '@/lib/utils/dates';
import { Search, Plus } from 'lucide-react';
import clsx from 'clsx';

const STATUS_OPTIONS: OrderStatus[] = ['open', 'in_progress', 'completed', 'cancelled'];
const MARKETS: Market[] = ['US', 'EU', 'IN', 'CN', 'MENA', 'LATAM'];

interface Props {
  orders: Order[];
  exporters: Exporter[];
  bookingCounts: Record<string, number>;
}

const STATUS_PILL: Record<OrderStatus, string> = {
  open: 'bg-severity-info/15 text-severity-info',
  in_progress: 'bg-trace/15 text-trace',
  completed: 'bg-mint-500/15 text-mint-500',
  cancelled: 'bg-ink-3/15 text-ink-3',
};

export function OrdersListClient({ orders, exporters, bookingCounts }: Props) {
  const t = useTranslations('orders');
  const router = useRouter();
  const locale = useLocale() as 'es' | 'en';
  const demo = useDemoStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [exporterFilter, setExporterFilter] = useState<string>('');
  const [marketFilter, setMarketFilter] = useState<Market | ''>('');

  const allOrders = useMemo(() => [...demo.newOrders, ...orders], [orders, demo.newOrders]);

  const exporterMap = useMemo(() => new Map(exporters.map((e) => [e.id, e])), [exporters]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allOrders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (exporterFilter && o.exporterId !== exporterFilter) return false;
      if (marketFilter && o.destinationMarket !== marketFilter) return false;
      if (q) {
        const exp = exporterMap.get(o.exporterId);
        const hay = [o.orderNumber, exp?.name ?? '', o.destinationCountry].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allOrders, search, statusFilter, exporterFilter, marketFilter, exporterMap]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
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
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value as Market | '')}
          className="rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-1 focus:border-mint-500 focus:outline-none"
        >
          <option value="">{t('filterMarket')}</option>
          {MARKETS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="rounded-md border border-[var(--line-soft)] bg-bg-1 px-2 py-2 text-xs text-ink-1 focus:border-mint-500 focus:outline-none"
        >
          <option value="">{t('filterStatus')}</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{t(`statuses.${s}`)}</option>
          ))}
        </select>

        <div className="ml-auto">
          <CreateOrderDialog exporters={exporters}>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-mint-500 px-3 py-2 text-xs font-medium text-bg-0 transition-colors hover:bg-mint-500/90">
              <Plus className="h-3.5 w-3.5" />
              {t('create')}
            </button>
          </CreateOrderDialog>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink-3">
            {t('empty')}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--line-soft)] text-left font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">
                <th className="px-3 py-2 font-normal">{t('colNumber')}</th>
                <th className="px-3 py-2 font-normal">{t('colExporter')}</th>
                <th className="px-3 py-2 font-normal">{t('colDestination')}</th>
                <th className="px-3 py-2 font-normal text-right">{t('colContainers')}</th>
                <th className="px-3 py-2 font-normal">{t('colWindow')}</th>
                <th className="px-3 py-2 font-normal">{t('colStatus')}</th>
                <th className="px-3 py-2 font-normal">{t('colCreated')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const exp = exporterMap.get(o.exporterId);
                if (!exp) return null;
                const booked = bookingCounts[o.id] ?? o.bookingIds.length;
                return (
                  <tr key={o.id} onClick={() => router.push(`/orders/${o.id}`)} className="cursor-pointer border-b border-[var(--line-soft)] last:border-b-0 hover:bg-white/5">
                    <td className="px-3 py-2.5">
                      <Link href={`/orders/${o.id}`} className="font-mono text-ink-1 hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <ExporterChip exporter={exp} size="sm" asLink={false} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="inline-flex items-center gap-1.5">
                        <MarketChip market={o.destinationMarket} />
                        <span className="text-ink-2">{o.destinationCountry}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="font-mono text-ink-2">
                        {t('containerProgress', { booked, total: o.containerCount })}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-ink-2">
                      {formatDate(o.windowFrom, locale)} → {formatDate(o.windowTo, locale)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_PILL[o.status])}>
                        {t(`statuses.${o.status}`)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-ink-3">{formatDate(o.createdAt, locale)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
