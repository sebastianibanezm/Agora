import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Booking, Exporter, Naviera } from '@/types';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { Snowflake } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  items: { booking: Booking; exporter: Exporter; naviera: Naviera }[];
}

export function ApproachingCutoffStrip({ items }: Props) {
  const t = useTranslations('dashboard');
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1">
      <div className="border-b border-[var(--line-soft)] px-4 py-2.5">
        <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">
          {t('approachingCutoff')}
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto p-3">
        {items.map(({ booking, exporter, naviera }) => (
          <Link
            key={booking.id}
            href={`/bookings/${booking.id}`}
            className={clsx(
              'flex w-[240px] shrink-0 flex-col gap-1.5 rounded-md border border-[var(--line-soft)] bg-bg-2 p-3 transition-colors hover:border-[var(--line-mid)]',
              booking.isReefer && 'ring-1 ring-trace/20',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-ink-1">{booking.bookingNumber}</span>
              <LifecyclePill status={booking.status} size="sm" />
            </div>
            <div className="text-xs text-ink-2">{exporter.name} · {naviera.shortName}</div>
            <div className="text-xs text-ink-3">
              {booking.pol.split(',')[0]} → {booking.pod.split(',')[0]}
            </div>
            <div className="mt-1 flex items-center justify-between">
              {booking.isReefer ? (
                <span className="inline-flex items-center gap-1 rounded-sm bg-trace/15 px-1.5 py-0.5 text-[10px] text-trace">
                  <Snowflake className="h-3 w-3" /> {t('reefer')}
                </span>
              ) : (
                <span />
              )}
              <CutoffCountdown cutoffIso={booking.cutOff ?? ''} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
