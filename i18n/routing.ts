import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'] as const,
  defaultLocale: 'es',
  // 'as-needed': es (default) stays unprefixed, en lives under /en.
  // Crawlable per-locale URLs are required for hreflang/indexing — with
  // cookie-only locales Google can never discover the English version.
  localePrefix: 'as-needed',
  localeCookie: {
    name: 'AGORA_LOCALE',
    sameSite: 'lax',
  },
});

export type AppLocale = (typeof routing.locales)[number];
