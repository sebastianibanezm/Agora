'use client';

import { useState } from 'react';
import type { Booking, Exporter, Naviera } from '@/types';
import { ShipmentGlobe } from '@/components/globe/ShipmentGlobe';
import { ActiveTransitPanel } from '@/components/dashboard/ActiveTransitPanel';

interface Props {
  bookings: Booking[];
  navieras: Naviera[];
  exporters: Exporter[];
  height: number;
}

export function GlobeTransitSection({ bookings, navieras, exporters, height }: Props) {
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
        exporters={exporters}
        height={height}
        onHoverBooking={setHoveredBooking}
        hoveredBookingId={hoveredBooking?.id ?? null}
      />
    </div>
  );
}
