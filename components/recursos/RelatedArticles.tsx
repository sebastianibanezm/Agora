import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ARTICLES, articlePath } from '@/lib/articles'

/**
 * "Seguir leyendo" block for the bottom of each article: shows every other
 * article in the hub so the reader can jump straight to them. Reads from the
 * ARTICLES registry, so new articles appear here automatically.
 */
export function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const others = ARTICLES.filter((a) => a.slug !== currentSlug)
  if (others.length === 0) return null

  return (
    <section className="mt-16" style={{ borderTop: '1px solid rgba(60,42,22,0.10)', paddingTop: '36px' }}>
      <div className="flex items-center gap-6 mb-8">
        <span
          className="flex-shrink-0 text-[10px] uppercase tracking-[0.18em]"
          style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
        >
          Seguir leyendo
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(60,42,22,0.08)' }} />
        <Link
          href="/recursos"
          className="flex-shrink-0 inline-flex items-center gap-[6px] text-[12px] font-medium"
          style={{ color: '#5A4A38', textDecoration: 'none' }}
        >
          Ver todos <ArrowRight size={12} strokeWidth={1.8} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {others.map((article) => (
          <Link
            key={article.slug}
            href={articlePath(article)}
            className="group flex flex-col"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="overflow-hidden rounded-[12px] mb-4"
              style={{ border: '1px solid rgba(60,42,22,0.10)', boxShadow: '0 8px 24px rgba(43,31,18,0.08)' }}
            >
              <Image
                src={article.hero}
                alt={article.heroAlt}
                width={732}
                height={419}
                className="block w-full h-auto"
                sizes="(max-width: 768px) 100vw, 260px"
              />
            </div>
            <span
              className="inline-flex self-start px-[9px] py-[3px] rounded-full text-[9px] uppercase tracking-[0.10em] mb-2"
              style={{
                fontFamily: 'var(--font-family-mono)',
                color: '#5A4A38',
                background: '#F1E8D5',
                border: '1px solid rgba(60,42,22,0.10)',
              }}
            >
              {article.tag}
            </span>
            <h3
              className="italic font-normal m-0"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '17px',
                lineHeight: 1.25,
                color: '#2B1F12',
              }}
            >
              {article.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  )
}
