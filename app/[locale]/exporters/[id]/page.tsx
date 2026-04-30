import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ChevronLeft, Mail, Phone, MapPin } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { EntityFiche } from '@/components/entity-fiche/EntityFiche';
import { LifecyclePill } from '@/components/bookings/LifecyclePill';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { NavieraChip } from '@/components/shared/NavieraChip';
import { MarketChip } from '@/components/shared/MarketChip';
import { exporters, getExporterById } from '@/lib/mock-data/exporters';
import { bookings as allBookings } from '@/lib/mock-data/bookings';
import { navieras } from '@/lib/mock-data/navieras';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export function generateStaticParams() {
  return exporters.map((e) => ({ id: e.id }));
}

export default async function ExporterDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('exporters');
  const tBookings = await getTranslations('bookings');

  const exp = getExporterById(id);
  if (!exp) notFound();

  const exporterBookings = allBookings.filter(
    (b) => b.shipper === exp.name || b.shipper === exp.legalName
  );
  const activeBookings = exporterBookings.filter(
    (b) => !['closed', 'cancelled', 'bl_released'].includes(b.status)
  );
  const navieraMap = new Map(navieras.map((n) => [n.id, n]));

  const recentBookings = exporterBookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <PageTransition>
      <div className="flex flex-col gap-4 bg-bg-0 px-4 pt-4 pb-8">
        <Link href="/exporters" className="inline-flex w-fit items-center gap-1 text-xs text-ink-3 hover:text-ink-1">
          <ChevronLeft className="h-3 w-3" /> {t('title')}
        </Link>

        <EntityFiche
          name={exp.name}
          subtitle={`${exp.legalName} · ${exp.taxId}`}
          logoUrl={exp.logoUrl}
          pills={exp.primaryMarkets.map((m) => ({ label: m, color: '#7DD3FC' }))}
          kpis={[
            { label: t('kpi_containers'), value: String(exp.totalContainers) },
            { label: t('kpi_onTimeSi'), value: `${exp.onTimeSiRate.toFixed(1)}%` },
            { label: t('kpi_quality'), value: `${exp.siQualityScore}/100` },
            { label: t('kpi_turnaround'), value: `${exp.avgSiTurnaroundHours.toFixed(1)}h` },
          ]}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-[var(--line-soft)] bg-bg-2 p-4">
              <div className="mb-2 font-mono text-[10px] tracking-wider text-ink-3 uppercase">{t('contact')}</div>
              <div className="text-sm text-ink-1">{exp.contactName}</div>
              <a href={`mailto:${exp.contactEmail}`} className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink-2 hover:text-ink-1">
                <Mail className="h-3 w-3" />{exp.contactEmail}
              </a>
              <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink-2">
                <Phone className="h-3 w-3" />{exp.contactPhone}
              </div>
              <div className="mt-2 inline-flex items-start gap-1.5 text-xs text-ink-3">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                {exp.address}
              </div>
            </div>
            <div className="rounded-md border border-[var(--line-soft)] bg-bg-2 p-4">
              <div className="mb-2 font-mono text-[10px] tracking-wider text-ink-3 uppercase">{t('primaryProducts')}</div>
              <div className="flex flex-wrap gap-1.5">
                {exp.primaryProducts.map((p) => (
                  <span key={p} className="rounded-full bg-ink-3/10 px-2 py-0.5 text-[11px] text-ink-2">{p}</span>
                ))}
              </div>
              <div className="mt-3 mb-2 font-mono text-[10px] tracking-wider text-ink-3 uppercase">{t('primaryMarkets')}</div>
              <div className="flex flex-wrap gap-1.5">
                {exp.primaryMarkets.map((m) => <MarketChip key={m} market={m} />)}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-[var(--line-soft)] bg-bg-2">
            <div className="border-b border-[var(--line-soft)] px-4 py-2.5 font-mono text-[10px] tracking-wider text-ink-3 uppercase">
              {t('activeBookings')} ({activeBookings.length})
            </div>
            {activeBookings.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-ink-3">{t('noActiveBookings')}</div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--line-soft)] text-left font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">
                    <th className="px-3 py-2 font-normal">{tBookings('colNumber')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colNaviera')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colRoute')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colCutoff')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBookings.map((b) => {
                    const naviera = navieraMap.get(b.navieraId);
                    if (!naviera) return null;
                    return (
                      <tr key={b.id} className="border-b border-[var(--line-soft)] last:border-b-0 hover:bg-white/5">
                        <td className="px-3 py-2">
                          <Link href={`/bookings/${b.id}`} className="font-mono text-ink-1 hover:underline">{b.bookingNumber}</Link>
                        </td>
                        <td className="px-3 py-2"><NavieraChip naviera={naviera} size="sm" asLink={false} /></td>
                        <td className="px-3 py-2 text-ink-2">{b.pol.split(',')[0]} → {b.pod.split(',')[0]}</td>
                        <td className="px-3 py-2"><CutoffCountdown cutoffIso={b.cutOff} /></td>
                        <td className="px-3 py-2"><LifecyclePill status={b.status} size="sm" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="rounded-md border border-[var(--line-soft)] bg-bg-2">
            <div className="border-b border-[var(--line-soft)] px-4 py-2.5 font-mono text-[10px] tracking-wider text-ink-3 uppercase">
              {t('recentBookings')} ({recentBookings.length})
            </div>
            {recentBookings.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-ink-3">{t('noRecentBookings')}</div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--line-soft)] text-left font-mono text-[9.5px] tracking-wider text-ink-3 uppercase">
                    <th className="px-3 py-2 font-normal">{tBookings('colNumber')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colNaviera')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colRoute')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colCutoff')}</th>
                    <th className="px-3 py-2 font-normal">{tBookings('colStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => {
                    const naviera = navieraMap.get(b.navieraId);
                    if (!naviera) return null;
                    return (
                      <tr key={b.id} className="border-b border-[var(--line-soft)] last:border-b-0 hover:bg-white/5">
                        <td className="px-3 py-2">
                          <Link href={`/bookings/${b.id}`} className="font-mono text-ink-1 hover:underline">{b.bookingNumber}</Link>
                        </td>
                        <td className="px-3 py-2"><NavieraChip naviera={naviera} size="sm" asLink={false} /></td>
                        <td className="px-3 py-2 text-ink-2">{b.pol.split(',')[0]} → {b.pod.split(',')[0]}</td>
                        <td className="px-3 py-2"><CutoffCountdown cutoffIso={b.cutOff} /></td>
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
