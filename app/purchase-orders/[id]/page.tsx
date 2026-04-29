import { purchaseOrders } from '@/lib/mock-data/purchase-orders';
import { importers } from '@/lib/mock-data/importers';
import { documents } from '@/lib/mock-data/documents';
import { containers } from '@/lib/mock-data/containers';
import { PODetail } from '@/components/purchase-orders/PODetail';
import { notFound } from 'next/navigation';

interface Props { params: Promise<{ id: string }> }

export default async function PODetailPage({ params }: Props) {
  const { id } = await params;
  const po = purchaseOrders.find(p => p.id === id);
  if (!po) notFound();
  const importer = importers.find(i => i.id === po.importerId);
  if (!importer) notFound();
  const docs = documents.filter(d => po.containerIds.some(cid => d.containerId === cid));
  const linked = containers.filter(c => po.containerIds.includes(c.id));
  return <PODetail po={po} importer={importer} documents={docs} linkedContainers={linked} />;
}
