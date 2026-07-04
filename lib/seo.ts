export const SITE_URL = 'https://www.agenteagora.com'

// Per-locale canonical URLs (localePrefix 'as-needed': es unprefixed, en at /en)
export const LOCALE_URLS: Record<string, string> = {
  es: SITE_URL,
  en: `${SITE_URL}/en`,
}
