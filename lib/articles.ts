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
    slug: 'certificado-fitosanitario-electronico-ephyto-sag',
    title:
      'Certificado fitosanitario 100% digital: Chile estrena el ePhyto con China y cambia el flujo documental de la fruta',
    excerpt:
      'Desde abril de 2026 Chile es el primer país del mundo con certificación fitosanitaria totalmente electrónica hacia China. Se acabó el certificado en papel viajando detrás del contenedor: qué cambia para exportadoras de cerezas, ciruelas y frutos secos, y qué exige el ePhyto de tu operación documental.',
    datePublished: '2026-07-07',
    dateLabel: 'Julio 2026',
    readingMinutes: 6,
    hero: '/recursos/ephyto-hero.jpg',
    heroAlt: 'Cerezas frescas recién cosechadas listas para exportación',
    tag: 'Regulación',
  },
  {
    slug: 'sobreestadia-demurrage-fruta-exportacion',
    title:
      'Sobreestadía y demurrage: el costo oculto que empieza en un documento atrasado, no en el puerto',
    excerpt:
      'El demurrage supera los USD 400 por contenedor y por día, y casi nunca nace de la naviera: nace de un BL con un dato mal puesto o un certificado que llegó tarde. Cómo la temporada récord de cerezas volvió a exponer el eslabón documental de la logística chilena y qué se puede controlar.',
    datePublished: '2026-07-06',
    dateLabel: 'Julio 2026',
    readingMinutes: 7,
    hero: '/recursos/sobreestadia-hero.jpg',
    heroAlt: 'Patio portuario con contenedores refrigerados apilados y grúas de embarque',
    tag: 'Logística',
  },
  {
    slug: 'formas-de-pago-exportacion-carta-credito-cobranza',
    title:
      'Carta de crédito, cobranza documentaria o cuenta abierta: cómo elegir la forma de pago que sí te asegura cobrar',
    excerpt:
      'La fruta ya salió, pero la temporada no se gana hasta que el dinero entra a la cuenta. Carta de crédito, cobranza documentaria y cuenta abierta reparten el riesgo de no pago de formas muy distintas — y la diferencia la marcan los documentos de embarque. Guía práctica para exportadoras de fruta y frutos secos.',
    datePublished: '2026-07-05',
    dateLabel: 'Julio 2026',
    readingMinutes: 7,
    hero: '/recursos/formas-pago-hero.jpg',
    heroAlt: 'Cierre de un acuerdo comercial de exportación sobre documentos firmados',
    tag: 'Pagos',
  },
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
