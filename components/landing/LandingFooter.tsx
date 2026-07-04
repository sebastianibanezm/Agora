'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { ParallaxImage, useParallaxTimeline } from './ParallaxImage'
import { useRouter, usePathname } from 'next/navigation'

const PLATFORM_LINKS = [
  { key: 'linkSolutions', href: '#solutions' },
  { key: 'linkResources', href: '/recursos' },
  { key: 'linkPlatform', href: '#product' },
  { key: 'linkHow', href: '#how-it-works' },
  { key: 'linkFaq', href: '#faq' },
] as const

export function LandingFooter() {
  const t = useTranslations('landing')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function toggleLocale() {
    const next = locale === 'es' ? 'en' : 'es'
    document.cookie = `AGORA_LOCALE=${next}; path=/; samesite=lax`
    // localePrefix 'as-needed': es lives at /, en under /en
    const basePath = pathname.replace(/^\/en(?=\/|$)/, '') || '/'
    router.replace(next === 'en' ? `/en${basePath === '/' ? '' : basePath}` : basePath)
    router.refresh()
  }

  const { timelineName, rootStyle } = useParallaxTimeline()

  const glassCard: React.CSSProperties = {
    background: 'rgba(43,31,18,0.30)',
    backdropFilter: 'blur(36px) saturate(180%)',
    WebkitBackdropFilter: 'blur(36px) saturate(180%)',
    border: '1px solid rgba(248,242,228,0.20)',
    borderRadius: '18px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09)',
  }

  const colHead: React.CSSProperties = {
    fontFamily: 'var(--font-family-mono)',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    color: 'rgba(248,242,228,0.55)',
  }

  return (
    <footer
      className="parallax-root relative w-full overflow-hidden"
      style={{ ...rootStyle }}
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <ParallaxImage
          src="/landing/footer-bg.png"
          objectPosition="center 55%"
          strength={0.10}
          timelineName={timelineName}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to bottom, rgba(43,31,18,0.35) 0%, rgba(43,31,18,0.55) 50%, rgba(43,31,18,0.82) 100%),
              linear-gradient(135deg, rgba(43,31,18,0.40) 0%, rgba(43,31,18,0.10) 60%, rgba(43,31,18,0.25) 100%)
            `,
          }}
        />
      </div>

      {/* Paper grain — same as hero */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(248,242,228,0.032) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'overlay',
          opacity: 0.55,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12 py-16 flex flex-col gap-10">

        {/* Top: brand card + link columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-stretch">

          {/* Brand card */}
          <div className="relative overflow-hidden flex flex-col justify-between p-7" style={glassCard}>
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(248,242,228,0.30) 40%, rgba(248,242,228,0.12) 70%, transparent 100%)',
              }}
            />
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/landing/lambda-logo.png"
                alt="Agora"
                width={38}
                height={38}
                className="object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <span
                className="italic text-[21px]"
                style={{ fontFamily: 'var(--font-family-old-standard)', color: '#F8F2E4', letterSpacing: '0.01em' }}
              >
                Agora
              </span>
            </div>
            <div
              className="italic"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontWeight: 300,
                fontSize: 'clamp(17px, 1.8vw, 24px)',
                lineHeight: 1.25,
                color: 'rgba(248,242,228,0.85)',
                maxWidth: '380px',
              }}
            >
              {t('footer.tagline')}
            </div>
            <div
              className="mt-6 text-[10px] uppercase tracking-[0.14em]"
              style={{ fontFamily: 'var(--font-family-mono)', color: 'rgba(248,242,228,0.45)' }}
            >
              {t('footer.madeIn')}
            </div>
          </div>

          {/* Link columns */}
          <div className="relative overflow-hidden p-7 grid grid-cols-2 gap-8" style={glassCard}>
            <div
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(248,242,228,0.30) 40%, rgba(248,242,228,0.12) 70%, transparent 100%)',
              }}
            />
            <div>
              <div style={colHead} className="mb-4">{t('footer.colPlatform')}</div>
              <ul className="m-0 p-0 list-none flex flex-col gap-[10px]">
                {PLATFORM_LINKS.map(({ key, href }) => (
                  <li key={key}>
                    {href.startsWith('/') ? (
                      <Link href={href} className="footer-link">{t(`footer.${key}` as any)}</Link>
                    ) : (
                      <a href={href} className="footer-link">{t(`footer.${key}` as any)}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={colHead} className="mb-4">{t('footer.colCompany')}</div>
              <ul className="m-0 p-0 list-none flex flex-col gap-[10px]">
                <li>
                  <a href="#contact" className="footer-link">{t('footer.linkContact')}</a>
                </li>
                <li>
                  <a href={`mailto:${t('footer.email')}`} className="footer-link">{t('footer.email')}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4"
          style={{ ...glassCard, borderRadius: '12px' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-family-mono)',
              fontSize: '10.5px',
              letterSpacing: '0.04em',
              color: 'rgba(248,242,228,0.60)',
            }}
          >
            {t('footer.copyright')}
          </span>
          <button
            onClick={toggleLocale}
            className="locale-toggle inline-flex items-center gap-[3px] self-start sm:self-auto px-[10px] py-[6px] rounded-full cursor-pointer"
            style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10.5px' }}
            aria-label="Cambiar idioma"
          >
            <span style={{ color: locale === 'es' ? '#F8F2E4' : 'rgba(248,242,228,0.50)', fontWeight: locale === 'es' ? 600 : 400 }}>ES</span>
            <span style={{ color: 'rgba(248,242,228,0.25)', margin: '0 1px' }}>/</span>
            <span style={{ color: locale === 'en' ? '#F8F2E4' : 'rgba(248,242,228,0.50)', fontWeight: locale === 'en' ? 600 : 400 }}>EN</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
