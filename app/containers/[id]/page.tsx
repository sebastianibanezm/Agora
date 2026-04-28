import { notFound } from 'next/navigation';
import { containers } from '@/lib/mock-data/containers';
import { ContainerTabs } from '@/components/containers/ContainerTabs';

interface Props { params: Promise<{ id: string }> }

export default async function ContainerDetailPage({ params }: Props) {
  const { id } = await params;
  const container = containers.find(c => c.id === id);
  if (!container) notFound();

  return (
    <section>
      <header className="mb-6">
        <div className="font-mono text-mint-500 text-xs mb-1">{container.id}</div>
        <h1 className="text-2xl font-semibold text-ink-1">
          {container.productLabel}
          <span className="text-ink-3 font-normal mx-2">·</span>
          {container.polLabel} → {container.podLabel}
        </h1>
      </header>
      <ContainerTabs container={container} />
    </section>
  );
}
