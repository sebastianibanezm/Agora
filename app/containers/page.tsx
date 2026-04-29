import { PageTransition } from '@/components/shared/PageTransition';
import { containers } from '@/lib/mock-data/containers';
import { importers } from '@/lib/mock-data/importers';
import { ContainersPageClient } from '@/components/containers/ContainersPageClient';

export default function ContainersPage() {
  return (
    <PageTransition>
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#e2e8f0' }}>
          Containers
        </h1>
        <ContainersPageClient containers={containers} importers={importers} />
      </div>
    </PageTransition>
  );
}
