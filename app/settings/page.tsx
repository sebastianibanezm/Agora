import { getLocale, getTranslations } from 'next-intl/server';
import { LanguageToggle } from '@/components/settings/LanguageToggle';
import type { AppLocale } from '@/i18n/routing';

export default async function SettingsPage() {
  const t = await getTranslations('settings');
  const locale = (await getLocale()) as AppLocale;

  return (
    <section className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-6 text-ink-1">{t('title')}</h1>

      <div className="glass border border-white/10 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-medium text-ink-2 mb-3">{t('language')}</h2>
        <LanguageToggle currentLocale={locale} />
      </div>

      <p className="text-sm text-ink-2">{t('moreSoon')}</p>
    </section>
  );
}
