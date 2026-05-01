'use client';

import { useState } from 'react';
import type { Booking, Naviera } from '@/types';
import { ShipmentGlobe } from '@/components/globe/ShipmentGlobe';
import { ActiveTransitPanel } from '@/components/dashboard/ActiveTransitPanel';

interface Props {
  bookings: Booking[];
  navieras: Naviera[];
  height: number;
}

export function GlobeTransitSection({ bookings, navieras, height }: Props) {
  const [hoveredBooking, setHoveredBooking] = useState<Booking | null>(null);

  return (
    <div className="flex gap-4 items-stretch">
      <ShipmentGlobe
        bookings={bookings}
        height={height}
        highlightedBooking={hoveredBooking}
      />
      <ActiveTransitPanel
        bookings={bookings}
        navieras={navieras}
        height={height}
        onHoverBooking={setHoveredBooking}
        hoveredBookingId={hoveredBooking?.id ?? null}
      />
    </div>
  );
}
