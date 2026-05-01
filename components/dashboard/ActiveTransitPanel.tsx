import { useTranslations } from 'next-intl';
import type { Booking, Exporter, Naviera } from '@/types';
import { BookingCard } from '@/components/shared/BookingCard';

const ACTIVE_STATUSES = new Set([
  'created', 'awaiting_si', 'si_received', 'si_validated', 'si_failed',
  'esi_sent', 'draft_bl_received', 'bl_validated',
]);

interface Props {
  bookings: Booking[];
  navieras: Naviera[];
  exporters: Exporter[];
  height: number;
  onHoverBooking: (b: Booking | null) => void;
  hoveredBookingId: string | null;
}

export function ActiveTransitPanel({ bookings, navieras, exporters, height, onHoverBooking, hoveredBookingId }: Props) {
  const t = useTranslations('dashboard');
  const navieraMap = new Map(navieras.map((n) => [n.id, n]));
  const active = bookings.filter((b) => ACTIVE_STATUSES.has(b.status));

  return (
    <div
      className="flex flex-col flex-1 min-w-0 rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden"
      style={{ height }}
    >
      <div className="shrink-0 px-4 pt-3 pb-2 border-b border-[var(--line-soft)] flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.18em] text-ink-3 uppercase">
          {t('enTransit')}
        </span>
        <span className="font-mono text-[10px] text-ink-4">{active.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1.5">
        {active.map((booking) => {
          const naviera = navieraMap.get(booking.navieraId);
          // Booking has no exporterId — match by shipper string against exporter name/legalName
          const exporter = exporters.find(
            (e) => e.name === booking.shipper || e.legalName === booking.shipper
          );
          if (!naviera || !exporter) return null;

          return (
            <BookingCard
              key={booking.id}
              booking={booking}
              exporter={exporter}
              naviera={naviera}
              onMouseEnter={() => onHoverBooking(booking)}
              onMouseLeave={() => onHoverBooking(null)}
              isHovered={hoveredBookingId === booking.id}
            />
          );
        })}

        {active.length === 0 && (
          <div className="flex h-full items-center justify-center text-[11px] text-ink-4">
            {t('noActiveShipments')}
          </div>
        )}
      </div>
    </div>
  );
}
