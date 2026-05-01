import Link from 'next/link';
import type { Booking, Naviera } from '@/types';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { formatShortDate } from '@/lib/utils/dates';

const ACTIVE_STATUSES = new Set([
  'created', 'awaiting_si', 'si_received', 'si_validated', 'si_failed',
  'esi_sent', 'draft_bl_received', 'bl_validated',
]);

interface Props {
  bookings: Booking[];
  navieras: Naviera[];
  height: number;
  onHoverBooking: (b: Booking | null) => void;
  hoveredBookingId: string | null;
}

export function ActiveTransitPanel({ bookings, navieras, height, onHoverBooking, hoveredBookingId }: Props) {
  const navieraMap = new Map(navieras.map((n) => [n.id, n]));
  const active = bookings.filter((b) => ACTIVE_STATUSES.has(b.status));

  return (
    <div
      className="flex flex-col flex-1 min-w-0 rounded-xl border border-[var(--line-soft)] bg-bg-1 overflow-hidden"
      style={{ height }}
    >
      <div className="shrink-0 px-4 pt-3 pb-2 border-b border-[var(--line-soft)] flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.18em] text-ink-3 uppercase">
          En tránsito
        </span>
        <span className="font-mono text-[10px] text-ink-4">{active.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1.5">
        {active.map((booking) => {
          const naviera = navieraMap.get(booking.navieraId);
          const pol = booking.pol.split(',')[0];
          const pod = booking.pod.split(',')[0];

          return (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              onMouseEnter={() => onHoverBooking(booking)}
              onMouseLeave={() => onHoverBooking(null)}
              className={`group block rounded-lg border bg-bg-2 px-3 py-2 transition-colors ${
                hoveredBookingId === booking.id
                  ? 'border-[var(--line-mid)] bg-bg-3'
                  : 'border-[var(--line-soft)] hover:border-white/15 hover:bg-bg-3'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-semibold text-ink-1">
                  {booking.bookingNumber}
                </span>
                {naviera && <NavieraChip naviera={naviera} size="sm" asLink={false} />}
              </div>

              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-[10px] text-ink-3">
                  {pol} → {pod}
                </span>
                <LifecyclePill status={booking.status} size="sm" />
              </div>

              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="truncate text-[10px] text-ink-4 max-w-[140px]">
                  {booking.shipper}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {booking.isReefer && (
                    <span className="text-[10px] text-trace">❄</span>
                  )}
                  <span className="rounded border border-[var(--line-soft)] bg-bg-1 px-[5px] py-px font-mono text-[9px] text-ink-3">
                    {booking.containerType}
                  </span>
                  <span className="font-mono text-[9.5px] text-ink-4">
                    ETD {formatShortDate(booking.etd, 'es')}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {active.length === 0 && (
          <div className="flex h-full items-center justify-center text-[11px] text-ink-4">
            No hay embarques activos
          </div>
        )}
      </div>
    </div>
  );
}
