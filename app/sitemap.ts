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
    {
      url: `${SITE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages },
    },
  ]
}
