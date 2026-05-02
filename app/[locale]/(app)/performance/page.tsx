import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageTransition } from '@/components/shared/PageTransition';
import { LineChart } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PerformancePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('performance');

  return (
    <PageTransition>
      <div className="flex flex-col gap-3 bg-bg-0 px-4 pt-4 pb-8">
        <h1 className="text-xl font-semibold text-ink-1">{t('title')}</h1>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--line-soft)] bg-bg-1 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-trace/15">
            <LineChart className="h-6 w-6 text-trace" />
          </div>
          <div className="text-base font-medium text-ink-1">{t('soonTitle')}</div>
          <p className="max-w-md text-sm text-ink-2">{t('soonBody')}</p>
        </div>
      </div>
    </PageTransition>
  );
}
