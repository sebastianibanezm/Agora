import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.agenteagora.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    es: SITE_URL,
    en: `${SITE_URL}/en`,
  }

  return [
    {
      url: `${SITE_URL}/recursos`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/recursos/ley-21719-proteccion-de-datos-agro`,
      lastModified: new Date('2026-07-04'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages },
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages },
    },
  ]
}
