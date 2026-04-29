import { producers } from '@/lib/mock-data/producers';
import { purchaseOrders } from '@/lib/mock-data/purchase-orders';
import { containers } from '@/lib/mock-data/containers';
import { EntityFiche } from '@/components/entity-fiche/EntityFiche';
import { ProducerSpecificSections } from '@/components/entity-fiche/ProducerSpecificSections';
import { notFound } from 'next/navigation';
import { differenceInDays } from 'date-fns';
import { getTodayDemo } from '@/lib/utils/dates';
import Link from 'next/link';

export default async function ProducerFichePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prod = producers.find(p => p.id === id);
  if (!prod) notFound();

  const pos = purchaseOrders.filter(po => po.producerId === id);
  const cons = containers.filter(c => c.producerId === id);
  const today = getTodayDemo();

  const seasonVolume = prod.volumeHistory[prod.volumeHistory.length - 1]?.volumeKg ?? 0;
  const totalCerts = prod.sagCertifications.length;
  const validCerts = prod.sagCertifications.filter(c => c.daysUntilExpiry > 14).length;

  const kpis = [
    { label: 'Active Containers', value: String(prod.activeContainers), sub: '' },
    { label: 'Season Volume', value: `${(seasonVolume / 1000).toFixed(1)}t`, sub: 'kg' },
    { label: 'Shipped Value', value: `$${(pos.reduce((s, p) => s + p.valueUsd, 0) / 1000).toFixed(0)}k`, sub: 'USD' },
    { label: 'Certifications', value: `${validCerts}/${totalCerts}`, sub: 'valid' },
  ];

  const pills = [
    { label: prod.region, color: '#94a3b8' },
    { label: prod.sagId, color: '#00E696' },
    ...prod.products.map(p => ({ label: p.replace(/_/g, ' '), color: '#8B5CF6' })),
  ];

  return (
    <EntityFiche
      name={prod.name}
      pills={pills}
      kpis={kpis}
      pos={pos}
      containers={cons}
      poColumns={[
        { label: 'ID', render: po => <Link href={`/purchase-orders/${po.id}`} style={{ color: '#00E696', fontFamily: 'monospace', textDecoration: 'none' }}>{po.id}</Link> },
        { label: 'Importer', render: po => po.importerId },
        { label: 'Status', render: po => po.status },
        { label: 'Value', render: po => `$${po.valueUsd.toLocaleString()}` },
      ]}
      containerColumns={[
        { label: 'ID', render: c => <span style={{ fontFamily: 'monospace', color: '#00E696' }}>{c.id}</span> },
        { label: 'Destination', render: c => c.market },
        { label: 'Stage', render: c => c.status },
        { label: 'T-Day', render: c => {
          const d = differenceInDays(new Date(c.etd), today);
          return `T${d >= 0 ? '+' : ''}${d}d`;
        }},
      ]}
    >
      <ProducerSpecificSections producer={prod} />
    </EntityFiche>
  );
}
