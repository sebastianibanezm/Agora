import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'] as const,
  defaultLocale: 'es',
  localePrefix: 'never',
  localeCookie: {
    name: 'AGORA_LOCALE',
    sameSite: 'lax',
  },
});

export type AppLocale = (typeof routing.locales)[number];
