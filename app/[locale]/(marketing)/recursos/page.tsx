import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE_URL } from '@/lib/seo'
import { ARTICLES, articlePath } from '@/lib/articles'
import { RecursosHeader } from '@/components/recursos/RecursosHeader'
import { LandingFooter } from '@/components/landing/LandingFooter'

const HUB_URL = `${SITE_URL}/recursos`

export const metadata: Metadata = {
  title: { absolute: 'Recursos para exportadores: documentos, regulación y operaciones | Agora' },
  description:
    'Guías y análisis en español sobre documentos de exportación, regulación y operaciones para exportadoras de fruta y frutos secos: Ley 21.719, instructivo de embarque, DUS, demurrage y más.',
  // Content is Spanish-only: canonical always points at the unprefixed URL
  alternates: { canonical: HUB_URL },
  openGraph: {
    title: 'Recursos para exportadores | Agora',
    description:
      'Guías y análisis sobre documentos de exportación, regulación y operaciones para exportadoras de fruta y frutos secos.',
    url: HUB_URL,
    siteName: 'Agora',
    type: 'website',
  },
}

export default function RecursosPage() {
  return (
    <>
      <RecursosHeader />
      <main className="max-w-[860px] mx-auto px-5 sm:px-8 pb-24">
        <div className="pt-16 pb-12">
          <span
            className="block mb-3 text-[10px] uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
          >
            Recursos
          </span>
          <h1
            className="italic font-normal m-0"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(32px, 4vw, 48px)',
              lineHeight: 1.08,
              letterSpacing: '-0.015em',
              color: '#2B1F12',
            }}
          >
            Documentos, regulación y operaciones
            <br />
            para exportadores.
          </h1>
          <p className="text-[16px] leading-[1.65] m-0 mt-5" style={{ color: '#5A4A38', maxWidth: '56ch' }}>
            Análisis y guías prácticas escritas desde la operación real de exportadoras chilenas de fruta y
            frutos secos.
          </p>
        </div>

        <div className="flex flex-col gap-8" style={{ borderTop: '1px solid rgba(60,42,22,0.08)', paddingTop: '40px' }}>
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={articlePath(article)}
              className="group grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8 items-center"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="overflow-hidden rounded-[12px]"
                style={{ border: '1px solid rgba(60,42,22,0.10)', boxShadow: '0 8px 24px rgba(43,31,18,0.08)' }}
              >
                <Image
                  src={article.hero}
                  alt={article.heroAlt}
                  width={732}
                  height={419}
                  className="block w-full h-auto"
                  sizes="(max-width: 768px) 100vw, 280px"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="inline-flex px-[10px] py-[3px] rounded-full text-[9.5px] uppercase tracking-[0.10em]"
                    style={{
                      fontFamily: 'var(--font-family-mono)',
                      color: '#5A4A38',
                      background: '#F1E8D5',
                      border: '1px solid rgba(60,42,22,0.10)',
                    }}
                  >
                    {article.tag}
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-[0.10em]"
                    style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586' }}
                  >
                    {article.dateLabel} · {article.readingMinutes} min
                  </span>
                </div>
                <h2
                  className="italic font-normal m-0 mb-2"
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    fontSize: 'clamp(20px, 2.2vw, 26px)',
                    lineHeight: 1.2,
                    color: '#2B1F12',
                  }}
                >
                  {article.title}
                </h2>
                <p className="m-0 text-[14px] leading-[1.65]" style={{ color: '#5A4A38', maxWidth: '58ch' }}>
                  {article.excerpt}
                </p>
                <span
                  className="inline-flex items-center gap-[6px] mt-4 text-[12px] font-medium"
                  style={{ color: '#2B1F12' }}
                >
                  Leer el análisis <ArrowRight size={13} strokeWidth={1.8} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <LandingFooter />
    </>
  )
}
