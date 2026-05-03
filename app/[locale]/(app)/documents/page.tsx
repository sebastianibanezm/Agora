import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageTransition } from '@/components/shared/PageTransition';
import { DocumentsViewClient } from '@/components/documents/DocumentsViewClient';
import { bookings } from '@/lib/mock-data/bookings';
import { exporters } from '@/lib/mock-data/exporters';
import { navieras } from '@/lib/mock-data/navieras';
import { shippingInstructions } from '@/lib/mock-data/shipping-instructions';
import { draftBls } from '@/lib/mock-data/draft-bls';
import { exporterBls } from '@/lib/mock-data/exporter-bls';
import { activityEvents } from '@/lib/mock-data/activity-events';
import type { Booking, Exporter, Naviera, ShippingInstruction, DraftBL, ExporterBL, ActivityEvent } from '@/types';

export interface DocumentsRow {
  booking: Booking;
  exporter: Exporter;
  naviera: Naviera;
  si: ShippingInstruction | undefined;
  bl: DraftBL | undefined;
  exporterBl: ExporterBL | undefined;
  events: ActivityEvent[];
}

type Props = { params: Promise<{ locale: string }> };

export default async function DocumentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('documents');

  const navieraMap = new Map(navieras.map((n) => [n.id, n]));
  const siMap = new Map(shippingInstructions.map((s) => [s.bookingId, s]));
  const blMap = new Map(draftBls.map((b) => [b.bookingId, b]));
  const exporterBlMap = new Map(exporterBls.map((e) => [e.bookingId, e]));
  const eventsByBooking = activityEvents.reduce<Map<string, ActivityEvent[]>>((acc, e) => {
    const list = acc.get(e.bookingId) ?? [];
    list.push(e);
    acc.set(e.bookingId, list);
    return acc;
  }, new Map());

  const rows = bookings
    .filter((b) => b.status !== 'cancelled')
    .map((booking): DocumentsRow | null => {
      const exporter = exporters.find(
        (e) => e.name === booking.shipper || e.legalName === booking.shipper,
      );
      const naviera = navieraMap.get(booking.navieraId);
      if (!exporter || !naviera) return null;
      return {
        booking,
        exporter,
        naviera,
        si: siMap.get(booking.id),
        bl: blMap.get(booking.id),
        exporterBl: exporterBlMap.get(booking.id),
        events: eventsByBooking.get(booking.id) ?? [],
      };
    })
    .filter(Boolean) as DocumentsRow[];

  return (
    <PageTransition>
      <div className="flex flex-col gap-2 bg-bg-0 px-4 pt-4 pb-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold text-ink-1">{t('title')}</h1>
          <span className="font-mono text-[10px] text-ink-3">{rows.length} bookings</span>
        </div>
        <Suspense fallback={<div className="text-sm text-ink-3">Loading…</div>}>
          <DocumentsViewClient rows={rows} exporters={exporters} navieras={navieras} />
        </Suspense>
      </div>
    </PageTransition>
  );
}
