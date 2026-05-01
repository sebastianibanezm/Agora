import { useTranslations } from 'next-intl';
import type { Booking, Exporter, Naviera } from '@/types';
import { BookingCard } from '@/components/shared/BookingCard';

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
          <div key={booking.id} className="w-[280px] shrink-0">
            <BookingCard
              booking={booking}
              exporter={exporter}
              naviera={naviera}
              showCutoff
            />
          </div>
        ))}
      </div>
    </div>
  );
}
