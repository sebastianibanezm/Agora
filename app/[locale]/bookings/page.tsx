import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageTransition } from '@/components/shared/PageTransition';
import { BookingsViewClient } from '@/components/bookings/BookingsViewClient';
import { bookings } from '@/lib/mock-data/bookings';
import { exporters } from '@/lib/mock-data/exporters';
import { navieras } from '@/lib/mock-data/navieras';
import { activeAlerts } from '@/lib/mock-data/alerts';
import { shippingInstructions } from '@/lib/mock-data/shipping-instructions';
import type { AlertSeverity } from '@/types';

const SEVERITY_ORDER: AlertSeverity[] = ['critical', 'action', 'watch', 'info'];

function resolveHighestSeverity(bookingAlerts: typeof activeAlerts): AlertSeverity | null {
  for (const sev of SEVERITY_ORDER) {
    if (bookingAlerts.some((a) => a.severity === sev)) return sev;
  }
  return null;
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BookingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('bookings');

  const navieraMap = new Map(navieras.map((n) => [n.id, n]));

  const siByBookingId = new Map(
    shippingInstructions.map((si) => [si.bookingId, si])
  );

  const rows = bookings
    .filter((b) => b.status !== 'cancelled')
    .map((booking) => {
      const exporter = exporters.find(
        (e) => e.name === booking.shipper || e.legalName === booking.shipper
      );
      const naviera = navieraMap.get(booking.navieraId);
      if (!exporter || !naviera) return null;

      const bookingAlerts = activeAlerts.filter((a) => a.bookingId === booking.id);
      const alertCount = bookingAlerts.length;
      const highestAlertSeverity = resolveHighestSeverity(bookingAlerts);

      const si = siByBookingId.get(booking.id);
      const siFailedCheckCount = si
        ? si.validationResults.filter((c) => c.result === 'fail').length
        : 0;
      const esiTransmittedAt = si?.esiTransmittedAt ?? null;
      const siReceivedAt = si?.receivedAt ?? null;

      return { booking, exporter, naviera, alertCount, highestAlertSeverity, siFailedCheckCount, esiTransmittedAt, siReceivedAt };
    })
    .filter(Boolean) as Array<{
      booking: typeof bookings[number];
      exporter: typeof exporters[number];
      naviera: typeof navieras[number];
      alertCount: number;
      highestAlertSeverity: AlertSeverity | null;
      siFailedCheckCount: number;
      esiTransmittedAt: string | null;
      siReceivedAt: string | null;
    }>;

  return (
    <PageTransition>
      <div className="flex flex-col gap-2 bg-bg-0 px-4 pt-4 pb-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold text-ink-1">{t('title')}</h1>
          <span className="font-mono text-[10px] text-ink-3">{rows.length} bookings</span>
        </div>
        <Suspense fallback={<div className="text-sm text-ink-3">Loading…</div>}>
          <BookingsViewClient rows={rows} exporters={exporters} navieras={navieras} />
        </Suspense>
      </div>
    </PageTransition>
  );
}
