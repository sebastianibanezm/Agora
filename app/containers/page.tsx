import { containers } from '@/lib/mock-data/containers';
import { ContainerListTable } from '@/components/containers/ContainerListTable';
import { getTranslations } from 'next-intl/server';

export default async function ContainersPage() {
  const t = await getTranslations('containers');
  return (
    <section>
      <h1 className="text-xl font-semibold mb-6 text-ink-1">{t('title')}</h1>
      <ContainerListTable containers={containers} />
    </section>
  );
}
