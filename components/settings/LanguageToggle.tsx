'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { clsx } from 'clsx';

type Locale = 'es' | 'en';

export function LanguageToggle({ currentLocale }: { currentLocale: Locale }) {
  const t = useTranslations('settings');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function setLocale(locale: Locale) {
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    });
    startTransition(() => {
      router.refresh();
    });
  }

  const baseClass =
    'rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50';

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => setLocale('es')}
        className={clsx(
          baseClass,
          currentLocale === 'es'
            ? 'border-mint-500 bg-white/10 text-ink-1'
            : 'border-white/10 text-ink-2 hover:bg-white/5',
        )}
      >
        {t('languageEs')}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setLocale('en')}
        className={clsx(
          baseClass,
          currentLocale === 'en'
            ? 'border-mint-500 bg-white/10 text-ink-1'
            : 'border-white/10 text-ink-2 hover:bg-white/5',
        )}
      >
        {t('languageEn')}
      </button>
    </div>
  );
}
