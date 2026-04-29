import { PageTransition } from '@/components/shared/PageTransition';
import { importers } from '@/lib/mock-data/importers';
import { purchaseOrders } from '@/lib/mock-data/purchase-orders';
import { containers } from '@/lib/mock-data/containers';
import { EntityFiche } from '@/components/entity-fiche/EntityFiche';
import { ImporterSpecificSections } from '@/components/entity-fiche/ImporterSpecificSections';
import { notFound } from 'next/navigation';
import { differenceInDays } from 'date-fns';
import { getTodayDemo } from '@/lib/utils/dates';
import Link from 'next/link';

export default async function ImporterFichePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const imp = importers.find(i => i.id === id);
  if (!imp) notFound();

  const pos = purchaseOrders.filter(po => po.importerId === id);
  const cons = containers.filter(c => c.importerId === id);
  const today = getTodayDemo();

  const kpis = [
    { label: 'Annual Volume', value: `${(imp.annualVolumeKg / 1_000_000).toFixed(1)}M kg`, sub: 'kg' },
    { label: 'PO Value', value: `$${(pos.reduce((s, p) => s + p.valueUsd, 0) / 1000).toFixed(0)}k`, sub: 'USD' },
    { label: 'Active Containers', value: String(imp.activeContainers), sub: '' },
    { label: 'Avg Payment', value: `${imp.avgPaymentDays}d`, sub: '' },
  ];

  const pills = [
    { label: imp.country, color: '#94a3b8' },
    { label: imp.market, color: '#F97316' },
    ...(imp.creditRating ? [{ label: imp.creditRating, color: '#00E696' }] : []),
  ];

  return (
    <PageTransition>
      <EntityFiche
        name={imp.name}
        pills={pills}
        kpis={kpis}
        pos={pos}
        containers={cons}
        poColumns={[
          { label: 'ID', render: po => <Link href={`/purchase-orders/${po.id}`} style={{ color: '#00E696', fontFamily: 'monospace', textDecoration: 'none' }}>{po.id}</Link> },
          { label: 'Product', render: po => po.productId.replace(/_/g, ' ') },
          { label: 'Status', render: po => po.status },
          { label: 'Value', render: po => `$${po.valueUsd.toLocaleString()}` },
        ]}
        containerColumns={[
          { label: 'ID', render: c => <span style={{ fontFamily: 'monospace', color: '#00E696' }}>{c.id}</span> },
          { label: 'Product', render: c => c.productLabel },
          { label: 'Stage', render: c => c.status },
          { label: 'T-Day', render: c => {
            const d = differenceInDays(new Date(c.etd), today);
            return `T${d >= 0 ? '+' : ''}${d}d`;
          }},
        ]}
      >
        <ImporterSpecificSections importer={imp} />
      </EntityFiche>
    </PageTransition>
  );
}
