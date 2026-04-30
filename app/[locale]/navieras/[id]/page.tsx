import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { EntityFiche } from '@/components/entity-fiche/EntityFiche';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { ExporterChip } from '@/components/shared/ExporterChip';
import { navieras, getNavieraById } from '@/lib/mock-data/navieras';
import { bookings as allBookings } from '@/lib/mock-data/bookings';
import { exporters } from '@/lib/mock-data/exporters';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export function generateStaticParams() {
  return navieras.map((n) => ({ id: n.id }));
}

export default async function NavieraDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('navieras');
  const tBookings = await getTranslations('bookings');

  const naviera = getNavieraById(id);
  if (!naviera) notFound();

  const navieraBookings = allBookings
    .filter((b) => b.navieraId === id)
    .sort((a, b) => new Date(a.cutOff ?? '').getTime() - new Date(b.cutOff ?? '').getTime());

  return (
    <PageTransition>
      <div className="flex flex-col gap-4 bg-bg-0 px-4 pt-4 pb-8">
        <Link href="/navieras" className="inline-flex w-fit items-center gap-1 text-xs text-ink-3 hover:text-ink-1">
          <ChevronLeft className="h-3 w-3" /> {t('title')}
        </Link>

        <EntityFiche
          name={naviera.shortName}
          subtitle={`${naviera.name} · SCAC ${naviera.code}`}
          logoUrl={naviera.logoUrl}
          pills={[{ label: t(`apiCapability_${naviera.apiCapability}`), color: '#7DD3FC' }]}
          kpis={[
            { label: t('kpi_bookings'), value: String(naviera.totalBookings) },
            { label: t('kpi_blTurnaround'), value: `${naviera.avgDraftBlTurnaroundHours}h` },
            { label: t('kpi_siRejection'), value: `${naviera.siRejectionRate.toFixed(1)}%` },
            { label: t('kpi_cutoffDiscipline'), value: `${naviera.cutoffDisciplineRate.toFixed(1)}%` },
          ]}
        >
          <div className="rounded-md border border-[var(--line-soft)] bg-bg-2">
            <div className="border-b border-[var(--line-soft)] px-4 py-2.5 font-mono text-[10px] tracking-wider text-ink-3 uppercase">
              {t('activeBookings')} ({navieraBookings.length})
            </div>
            {navieraBookings.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-ink-3">{t('noActiveBookings')}</div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--line-soft)] text-left font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">
                    <th className="px-3 py-2 font-normal">{tBookings('colNumber')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colExporter')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colRoute')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colCutoff')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {navieraBookings.slice(0, 12).map((b) => {
                    const exporter = exporters.find(
                      (e) => e.name === b.shipper || e.legalName === b.shipper
                    );
                    return (
                      <tr key={b.id} className="border-b border-[var(--line-soft)] last:border-b-0 hover:bg-white/5">
                        <td className="px-3 py-2">
                          <Link href={`/bookings/${b.id}`} className="font-mono text-ink-1 hover:underline">{b.bookingNumber}</Link>
                        </td>
                        <td className="px-3 py-2">{exporter && <ExporterChip exporter={exporter} size="sm" asLink={false} />}</td>
                        <td className="px-3 py-2 text-ink-2">{b.pol.split(',')[0]} → {b.pod.split(',')[0]}</td>
                        <td className="px-3 py-2"><CutoffCountdown cutoffIso={b.cutOff ?? ''} /></td>
                        <td className="px-3 py-2"><LifecyclePill status={b.status} size="sm" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </EntityFiche>
      </div>
    </PageTransition>
  );
}
