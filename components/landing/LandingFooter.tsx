'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

function platformLinks(locale: string) {
  const homePath = locale === 'en' ? '/en' : ''

  return [
    { key: 'linkHow', href: `${homePath}/#how-it-works` },
    { key: 'linkStart', href: `${homePath}/#getting-started` },
    { key: 'linkFaq', href: `${homePath}/#faq` },
    { key: 'linkResources', href: '/recursos' },
  ] as const
}

function legalPath(locale: string, kind: 'privacy' | 'terms') {
  return `${locale === 'en' ? '/en' : ''}/${kind}`
}

const colHead: React.CSSProperties = {
  fontFamily: 'var(--font-family-mono)',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: '#C9B9A0',
}

/** Flat dark footer, the same band color as the before/after section. */
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

  return (
    <footer className="w-full" style={{ background: '#221811', color: '#F3EAD8' }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-14 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] gap-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src="/landing/lambda-logo.png"
                alt="Agora"
                width={34}
                height={34}
                className="object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <span
                className="italic text-[24px]"
                style={{ fontFamily: 'var(--font-family-old-standard)', letterSpacing: '0.01em' }}
              >
                Agora
              </span>
            </div>
            <p
              className="italic mt-4 mb-0"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '20px',
                lineHeight: 1.3,
                color: '#C9B9A0',
                maxWidth: '26ch',
              }}
            >
              {t('footer.tagline')}
            </p>
            <p
              className="mt-5 mb-0 text-[12px] uppercase tracking-[0.12em]"
              style={{ fontFamily: 'var(--font-family-mono)', color: '#C9B9A0' }}
            >
              {t('footer.madeIn')}
            </p>
          </div>

          <div>
            <div style={colHead} className="mb-4">{t('footer.colPlatform')}</div>
            <ul className="m-0 p-0 list-none flex flex-col gap-[10px]">
              {platformLinks(locale).map(({ key, href }) => (
                <li key={key}>
                  {href.startsWith('/') && !href.includes('#') ? (
                    <Link href={href} className="footer-link">{t(`footer.${key}`)}</Link>
                  ) : (
                    <a href={href} className="footer-link">{t(`footer.${key}`)}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <div style={colHead} className="mb-4">{t('footer.colCompany')}</div>
            <ul className="m-0 p-0 list-none flex flex-col gap-[10px]" style={{ overflowWrap: 'anywhere' }}>
              <li>
                <a href={`${locale === 'en' ? '/en' : ''}/#contact`} className="footer-link">{t('footer.linkContact')}</a>
              </li>
              <li>
                <a href={`mailto:${t('footer.email')}`} className="footer-link">{t('footer.email')}</a>
              </li>
              <li>
                <Link href={legalPath(locale, 'privacy')} className="footer-link">{t('footer.linkPrivacy')}</Link>
              </li>
              <li>
                <Link href={legalPath(locale, 'terms')} className="footer-link">{t('footer.linkTerms')}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-11 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{ borderTop: '1px solid rgba(243,234,216,0.14)' }}
        >
          <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', letterSpacing: '0.04em', color: '#C9B9A0' }}>
            {t('footer.copyright')}
          </span>
          <button
            onClick={toggleLocale}
            className="locale-toggle inline-flex items-center gap-[3px] self-start sm:self-auto px-[10px] py-[6px] rounded-full cursor-pointer"
            style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}
            aria-label="Cambiar idioma"
          >
            <span style={{ color: locale === 'es' ? '#F3EAD8' : 'rgba(243,234,216,0.55)', fontWeight: locale === 'es' ? 600 : 400 }}>ES</span>
            <span style={{ color: 'rgba(243,234,216,0.3)', margin: '0 1px' }}>/</span>
            <span style={{ color: locale === 'en' ? '#F3EAD8' : 'rgba(243,234,216,0.55)', fontWeight: locale === 'en' ? 600 : 400 }}>EN</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
