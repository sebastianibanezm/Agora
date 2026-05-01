import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Alert, Booking, Exporter, Naviera } from '@/types';
import { BookingCard } from '@/components/shared/BookingCard';

interface QueueItem {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  alert?: Alert;
}

interface Props {
  items: QueueItem[];
}

export function ActionQueueV2({ items }: Props) {
  const t = useTranslations('dashboard');

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1 p-6 text-center text-sm text-ink-3">
        {t('noPendingActions')}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--line-soft)] bg-bg-1">
      <div className="flex items-center justify-between border-b border-[var(--line-soft)] px-4 py-2.5">
        <div className="font-mono text-[10px] tracking-wider text-ink-3 uppercase">
          {t('actionQueue')}
        </div>
        <Link
          href="/bookings?status=awaiting_si,si_failed,draft_bl_received"
          className="text-xs text-ink-3 hover:text-ink-1"
        >
          {t('actionQueueViewAll', { n: items.length })}
        </Link>
      </div>
      <div className="flex flex-col gap-2 p-2">
        {items.slice(0, 7).map(({ booking, exporter, naviera, alert }) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            exporter={exporter}
            naviera={naviera}
            alert={alert}
            showCutoff
            showChevron
          />
        ))}
      </div>
    </div>
  );
}
