import type { MetadataRoute } from 'next'
import { ARTICLES } from '@/lib/articles'

const SITE_URL = 'https://www.agenteagora.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    es: SITE_URL,
    en: `${SITE_URL}/en`,
  }

  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${SITE_URL}/recursos/${article.slug}`,
    lastModified: new Date(article.datePublished),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const legalEntries: MetadataRoute.Sitemap = (['privacy', 'terms'] as const).flatMap((kind) => {
    const localizedUrls = {
      es: `${SITE_URL}/${kind}`,
      en: `${SITE_URL}/en/${kind}`,
    }

    return (['es', 'en'] as const).map((locale) => ({
      url: localizedUrls[locale],
      lastModified: new Date('2026-08-24'),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
      alternates: { languages: localizedUrls },
    }))
  })

  return [
    {
      url: `${SITE_URL}/recursos`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    ...articleEntries,
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages },
    },
    ...legalEntries,
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages },
    },
  ]
}
