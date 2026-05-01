'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import type { Booking, Exporter, Naviera, ShippingInstruction, DraftBL } from '@/types';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { formatDate } from '@/lib/utils/dates';

interface Row {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  si?: ShippingInstruction;
  bl?: DraftBL;
}

function turnaroundHours(si?: ShippingInstruction, bl?: DraftBL) {
  if (!si || !bl) return null;
  return Math.round((new Date(bl.receivedAt).getTime() - new Date(si.receivedAt).getTime()) / 3_600_000);
}

export function CompletedBookingsTable({ rows }: { rows: Row[] }) {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const locale = useLocale() as 'es' | 'en';
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className="h-full rounded-xl border border-[var(--line-soft)] bg-bg-1">
      <div className="border-b border-[var(--line-soft)] px-4 py-2.5 font-mono text-[10px] tracking-wider text-ink-3 uppercase">
        {t('lastWeekClosed')}
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--line-soft)] text-left font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">
            <th className="px-4 py-2 font-normal">{t('colBooking')}</th>
            <th className="px-4 py-2 font-normal">{t('colExporter')}</th>
            <th className="px-4 py-2 font-normal">{t('colCarrier')}</th>
            <th className="px-4 py-2 font-normal">{t('colRoute')}</th>
            <th className="px-4 py-2 font-normal">{t('colEta')}</th>
            <th className="px-4 py-2 font-normal text-right">{t('colSiBlTurnaround')}</th>
            <th className="px-4 py-2 font-normal">{t('colStatus')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ booking, exporter, naviera, si, bl }) => {
            const ta = turnaroundHours(si, bl);
            return (
              <tr key={booking.id} onClick={() => router.push(`/bookings/${booking.id}`)} className="cursor-pointer border-b border-[var(--line-soft)] last:border-b-0 hover:bg-white/5">
                <td className="px-4 py-2">
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="font-mono text-ink-1 hover:underline"
                  >
                    {booking.bookingNumber}
                  </Link>
                </td>
                <td className="px-4 py-2 text-ink-2">{exporter.name}</td>
                <td className="px-4 py-2 text-ink-2">{naviera.shortName}</td>
                <td className="px-4 py-2 text-ink-2">
                  {booking.pol.split(',')[0]} → {booking.pod.split(',')[0]}
                </td>
                <td className="px-4 py-2 font-mono text-ink-2">{formatDate(booking.eta, locale)}</td>
                <td className="px-4 py-2 text-right font-mono text-ink-2">
                  {ta !== null ? `${ta}h` : '—'}
                </td>
                <td className="px-4 py-2">
                  <LifecyclePill status={booking.status} size="sm" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
