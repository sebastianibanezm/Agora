'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import type { Booking, Exporter, Naviera, Order } from '@/types';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { MarketChip } from '@/components/shared/MarketChip';
import { CreateBookingDialog } from '@/components/bookings/CreateBookingDialog';
import { useDemoStore, applyBookingOverride } from '@/lib/hooks/useDemoStore';
import { formatDate } from '@/lib/utils/dates';
import { Plus, Snowflake } from 'lucide-react';

interface Props {
  order: Order;
  exporter: Exporter;
  navieras: Naviera[];
  initialBookings: Booking[];
}

export function OrderDetailClient({ order, exporter, navieras, initialBookings }: Props) {
  const t = useTranslations('orders');
  const router = useRouter();
  const tBookings = useTranslations('bookings');
  const locale = useLocale() as 'es' | 'en';
  const demo = useDemoStore();

  const bookings = useMemo(() => {
    const newForOrder = demo.newBookings.filter((b) => b.orderId === order.id);
    const merged = [...newForOrder, ...initialBookings];
    return merged.map(applyBookingOverride);
  }, [demo, order.id, initialBookings]);

  const navieraMap = new Map(navieras.map((n) => [n.id, n]));

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-2xl font-semibold text-ink-1">{order.orderNumber}</h1>
              <span className="rounded-full bg-trace/15 px-2 py-0.5 text-[10px] font-medium text-trace">
                {t(`statuses.${order.status}`)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ExporterChip exporter={exporter} />
              <MarketChip market={order.destinationMarket} />
              <span className="text-xs text-ink-2">{order.destinationCountry}</span>
            </div>
            {order.notes && <p className="mt-1 max-w-2xl text-sm text-ink-2">{order.notes}</p>}
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-ink-3">
            <div className="font-mono">
              {t('containerProgress', { booked: bookings.length, total: order.containerCount })}
            </div>
            <div className="font-mono">
              {formatDate(order.windowFrom, locale)} → {formatDate(order.windowTo, locale)}
            </div>
            <CreateBookingDialog order={order} exporter={exporter} navieras={navieras}>
              <button className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-mint-500 px-3 py-2 text-xs font-medium text-bg-0 hover:bg-mint-500/90">
                <Plus className="h-3.5 w-3.5" />
                {tBookings('create')}
              </button>
            </CreateBookingDialog>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1">
        <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-2.5">
          <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">
            {t('bookingsSection', { n: bookings.length })}
          </div>
        </div>
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-sm text-ink-3">
            <p>{t('noBookings')}</p>
            <CreateBookingDialog order={order} exporter={exporter} navieras={navieras}>
              <button className="inline-flex items-center gap-1.5 rounded-md bg-mint-500 px-3 py-2 text-xs font-medium text-bg-0 hover:bg-mint-500/90">
                <Plus className="h-3.5 w-3.5" />
                {t('createFirstBooking')}
              </button>
            </CreateBookingDialog>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--line-soft)] text-left font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">
                <th className="px-3 py-2 font-normal">{tBookings('colNumber')}</th>
                <th className="px-3 py-2 font-normal">{tBookings('colNaviera')}</th>
                <th className="px-3 py-2 font-normal">{tBookings('colContainerType')}</th>
                <th className="px-3 py-2 font-normal">{tBookings('colRoute')}</th>
                <th className="px-3 py-2 font-normal">{tBookings('colCutoff')}</th>
                <th className="px-3 py-2 font-normal">{tBookings('colEtd')}</th>
                <th className="px-3 py-2 font-normal">{tBookings('colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const naviera = navieraMap.get(b.navieraId);
                if (!naviera) return null;
                return (
                  <tr key={b.id} onClick={() => router.push(`/bookings/${b.id}`)} className="cursor-pointer border-b border-[var(--line-soft)] last:border-b-0 hover:bg-white/5">
                    <td className="px-3 py-2.5">
                      <Link href={`/bookings/${b.id}`} className="inline-flex items-center gap-1.5 font-mono text-ink-1 hover:underline">
                        {b.bookingNumber}
                        {b.isReefer && <Snowflake className="h-3 w-3 text-trace" />}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5"><NavieraChip naviera={naviera} size="sm" asLink={false} /></td>
                    <td className="px-3 py-2.5 font-mono text-ink-2">{b.containerType}</td>
                    <td className="px-3 py-2.5 text-ink-2">
                      {b.pol.split(',')[0]} → {b.pod.split(',')[0]}
                    </td>
                    <td className="px-3 py-2.5"><CutoffCountdown cutoffIso={b.cutOff} /></td>
                    <td className="px-3 py-2.5 font-mono text-ink-2">{formatDate(b.etd, locale)}</td>
                    <td className="px-3 py-2.5"><LifecyclePill status={b.status} size="sm" /></td>
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
