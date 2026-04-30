import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Booking, Exporter, Naviera } from '@/types';
import { LifecyclePill } from './LifecyclePill';
import { CutoffCountdown } from './CutoffCountdown';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { NavieraChip } from '@/components/shared/NavieraChip';

interface Props {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
}

export function BookingHeader({ booking, exporter, naviera }: Props) {
  const t = useTranslations('bookings');
  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/bookings"
        className="inline-flex w-fit items-center gap-1 text-xs text-ink-3 hover:text-ink-1"
      >
        <ArrowLeft className="h-3 w-3" /> {t('backToBookings')}
      </Link>

      {/* Identity row */}
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-mono text-2xl font-semibold text-ink-1">{booking.bookingNumber}</h1>
        <LifecyclePill status={booking.status} />
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
          <ExporterChip exporter={exporter} />
          <span>·</span>
          <NavieraChip naviera={naviera} />
          <span>·</span>
          <span className="text-ink-2">{booking.shipper} → {booking.consignee}</span>
        </div>

        {/* Urgency signals — right-aligned */}
        <div className="flex items-center gap-4">
          {booking.costAtRiskUsd > 0 && (
            <div className="flex items-center gap-1 font-mono text-xs text-severity-watch">
              <AlertTriangle className="h-3 w-3" />
              USD {booking.costAtRiskUsd.toLocaleString()} {t('atRisk')}
            </div>
          )}
          <CutoffCountdown cutoffIso={booking.cutOff ?? ''} prefix />
        </div>
      </div>

      <div className="text-xs text-ink-3">
        {booking.pol.split(',')[0]} → {booking.pod.split(',')[0]} · {booking.vesselName} / {booking.voyage}
        {booking.isReefer && booking.setpointC !== undefined && ` · 40RF @ ${booking.setpointC} °C`}
      </div>
    </div>
  );
}
