import { SITE_URL } from './seo'

export type Article = {
  slug: string
  title: string
  excerpt: string
  datePublished: string // ISO
  dateLabel: string
  readingMinutes: number
  hero: string
  heroAlt: string
  tag: string
}

// Content hub registry — hub index, landing section, sitemap and JSON-LD all
// read from here so a new article only needs one entry plus its page.
export const ARTICLES: Article[] = [
  {
    slug: 'ley-21719-proteccion-de-datos-agro',
    title: 'Ley 21.719: el nuevo desafío regulatorio que obliga al agro a ordenar sus datos antes de diciembre de 2026',
    excerpt:
      'La nueva ley de protección de datos personales entra en vigencia el 1 de diciembre de 2026, con multas de hasta 20.000 UTM. Exportadoras, packings y sus proveedores deberán saber exactamente qué datos manejan, dónde viven y quién accede a ellos.',
    datePublished: '2026-07-04',
    dateLabel: 'Julio 2026',
    readingMinutes: 6,
    hero: '/recursos/ley-21719-hero.jpg',
    heroAlt: 'Terminal portuario con contenedores de exportación al atardecer',
    tag: 'Regulación',
  },
]

export function articleUrl(article: Article): string {
  return `${SITE_URL}/recursos/${article.slug}`
}

export function articlePath(article: Article): string {
  return `/recursos/${article.slug}`
}
