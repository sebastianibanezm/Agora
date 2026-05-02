import { PageTransition } from '@/components/shared/PageTransition';
import { GlobeTransitSection } from '@/components/dashboard/GlobeTransitSection';
import { KpiStripV2 } from '@/components/dashboard/KpiStripV2';
import { ActionQueueV2 } from '@/components/dashboard/ActionQueueV2';
import { ApproachingCutoffStrip } from '@/components/dashboard/ApproachingCutoffStrip';
import { CompletedBookingsTable } from '@/components/dashboard/CompletedBookingsTable';
import { SiQualityHeatmap } from '@/components/dashboard/SiQualityHeatmap';
import { bookings } from '@/lib/mock-data/bookings';
import { exporters } from '@/lib/mock-data/exporters';
import { navieras } from '@/lib/mock-data/navieras';
import { activeAlerts } from '@/lib/mock-data/alerts';
import { shippingInstructions } from '@/lib/mock-data/shipping-instructions';
import { draftBls } from '@/lib/mock-data/draft-bls';
import { getRecentlyClosedBookings } from '@/lib/mock-data/kpis';
import { hoursUntil } from '@/lib/utils/dates';

const ATTENTION_STATUSES = new Set([
  'awaiting_si',
  'si_failed',
  'draft_bl_received',
  'esi_sent',
]);

export default function OperationsDashboard() {
  const navieraMap = new Map(navieras.map((n) => [n.id, n]));

  const queueRanked = bookings
    .filter((b) => ATTENTION_STATUSES.has(b.status))
    .map((booking) => {
      const exporter = exporters.find(
        (e) => e.name === booking.shipper || e.legalName === booking.shipper
      );
      const naviera = navieraMap.get(booking.navieraId);
      const alert = activeAlerts.find((a) => a.bookingId === booking.id);
      const sevRank = alert
        ? { critical: 0, action: 1, watch: 2, info: 3 }[alert.severity]
        : 4;
      const hours = hoursUntil(booking.cutOff ?? '');
      return { booking, exporter, naviera, alert, sevRank, hours };
    })
    .filter((r): r is typeof r & { exporter: NonNullable<typeof r.exporter>; naviera: NonNullable<typeof r.naviera> } =>
      Boolean(r.exporter && r.naviera),
    )
    .sort((a, b) => a.sevRank - b.sevRank || a.hours - b.hours)
    .slice(0, 7);

  const approaching = bookings
    .filter((b) => {
      const h = hoursUntil(b.cutOff ?? '');
      return h > 0 && h <= 168 && b.status !== 'closed' && b.status !== 'bl_released' && b.status !== 'cancelled';
    })
    .sort((a, b) => hoursUntil(a.cutOff ?? '') - hoursUntil(b.cutOff ?? ''))
    .map((booking) => {
      const exporter = exporters.find(
        (e) => e.name === booking.shipper || e.legalName === booking.shipper
      );
      const naviera = navieraMap.get(booking.navieraId);
      return exporter && naviera ? { booking, exporter, naviera } : null;
    })
    .filter(Boolean) as { booking: typeof bookings[number]; exporter: typeof exporters[number]; naviera: typeof navieras[number] }[];

  const completedRows = getRecentlyClosedBookings(7).slice(0, 8).map((booking) => {
    const exporter = exporters.find(
      (e) => e.name === booking.shipper || e.legalName === booking.shipper
    );
    const naviera = navieraMap.get(booking.navieraId);
    const si = shippingInstructions.find((s) => s.bookingId === booking.id);
    const bl = draftBls.find((d) => d.bookingId === booking.id);
    return exporter && naviera ? { booking, exporter, naviera, si, bl } : null;
  }).filter(Boolean) as { booking: typeof bookings[number]; exporter: typeof exporters[number]; naviera: typeof navieras[number]; si?: typeof shippingInstructions[number]; bl?: typeof draftBls[number] }[];

  return (
    <PageTransition>
      <div className="flex flex-col gap-4 bg-bg-0 px-4 pt-4 pb-8">
        <GlobeTransitSection bookings={bookings} navieras={navieras} exporters={exporters} height={468} />

        <KpiStripV2 />

        <ActionQueueV2 items={queueRanked} />

        <ApproachingCutoffStrip items={approaching} />

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CompletedBookingsTable rows={completedRows} />
          </div>
          <div className="lg:col-span-2">
            <SiQualityHeatmap
              exporters={exporters}
              bookings={bookings}
              sis={shippingInstructions}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
