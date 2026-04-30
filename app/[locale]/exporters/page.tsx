import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { PageTransition } from '@/components/shared/PageTransition';
import { ExportersGrid } from '@/components/exporters/ExportersGrid';
import { exporters } from '@/lib/mock-data/exporters';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ExportersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('exporters');

  return (
    <PageTransition>
      <div className="flex flex-col gap-3 bg-bg-0 px-4 pt-4 pb-8">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold text-ink-1">{t('title')}</h1>
          <span className="font-mono text-[10px] text-ink-3">{exporters.length} exporters</span>
        </div>
        <ExportersGrid exporters={exporters} />
      </div>
    </PageTransition>
  );
}
