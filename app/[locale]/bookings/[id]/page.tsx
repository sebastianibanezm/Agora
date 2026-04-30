import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { bookings } from '@/lib/mock-data/bookings';
import { getBookingById } from '@/lib/mock-data/bookings';
import { exporters } from '@/lib/mock-data/exporters';
import { getNavieraById } from '@/lib/mock-data/navieras';
import { getSIByBookingId } from '@/lib/mock-data/shipping-instructions';
import { getDraftBlByBookingId } from '@/lib/mock-data/draft-bls';
import { getAlertsByBookingId } from '@/lib/mock-data/alerts';
import { getActivityForBooking } from '@/lib/mock-data/activity-events';
import { BookingDetailClient } from '@/components/bookings/BookingDetailClient';
import { PageTransition } from '@/components/shared/PageTransition';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export function generateStaticParams() {
  return bookings.map((b) => ({ id: b.id }));
}

export default async function BookingDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const booking = getBookingById(id);
  if (!booking) notFound();
  const exporter = exporters.find((e) => e.name === booking.shipper || e.legalName === booking.shipper);
  if (!exporter) notFound();
  const naviera = getNavieraById(booking.navieraId);
  if (!naviera) notFound();

  const si = getSIByBookingId(id);
  const bl = getDraftBlByBookingId(id);
  const alerts = getAlertsByBookingId(id);
  const events = getActivityForBooking(id);

  return (
    <PageTransition>
      <BookingDetailClient
        booking={booking}
        exporter={exporter}
        naviera={naviera}
        si={si}
        bl={bl}
        alerts={alerts}
        events={events}
      />
    </PageTransition>
  );
}
