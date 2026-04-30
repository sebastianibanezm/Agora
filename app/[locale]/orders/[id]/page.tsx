import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { OrderDetailClient } from '@/components/orders/OrderDetailClient';
import { getOrderById, orders } from '@/lib/mock-data/orders';
import { getExporterById } from '@/lib/mock-data/exporters';
import { navieras } from '@/lib/mock-data/navieras';
import { bookings as allBookings } from '@/lib/mock-data/bookings';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export function generateStaticParams() {
  return orders.map((o) => ({ id: o.id }));
}

export default async function OrderDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('orders');

  const order = getOrderById(id);
  if (!order) notFound();
  const exporter = getExporterById(order.exporterId);
  if (!exporter) notFound();

  const initialBookings = allBookings.filter((b) => b.orderId === id);

  return (
    <PageTransition>
      <div className="flex flex-col gap-3 bg-bg-0 px-4 pt-4 pb-8">
        <Link
          href="/orders"
          className="inline-flex w-fit items-center gap-1 text-xs text-ink-3 transition-colors hover:text-ink-1"
        >
          <ChevronLeft className="h-3 w-3" /> {t('backToOrders')}
        </Link>
        <OrderDetailClient
          order={order}
          exporter={exporter}
          navieras={navieras}
          initialBookings={initialBookings}
        />
      </div>
    </PageTransition>
  );
}
