'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useFadeIn } from '@/hooks/useFadeIn'

export function LandingFooter() {
  const t = useTranslations('landing')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const ref = useFadeIn()

  function toggleLocale() {
    const next = locale === 'es' ? 'en' : 'es'
    document.cookie = `AGORA_LOCALE=${next}; path=/; samesite=lax`
    router.replace(pathname)
    router.refresh()
  }

  return (
    <footer
      ref={ref as React.RefObject<HTMLElement>}
      style={{
        background: '#FCF7EA',
        borderTop: '1px solid rgba(60,42,22,0.08)',
        padding: '64px 0 36px',
        opacity: 0,
        transform: 'translateY(24px)',
        transition: 'opacity 0.55s ease-out, transform 0.55s ease-out',
      }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Brand + tagline */}
        <div
          className="pb-12 mb-10"
          style={{ borderBottom: '1px solid rgba(60,42,22,0.08)' }}
        >
          <div className="flex items-center gap-[10px] mb-5">
            <div className="w-[28px] h-[28px] flex items-center justify-center">
              <Image
                src="/landing/lambda-logo.png"
                alt="Agora"
                width={26}
                height={26}
                className="object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
            <span
              className="italic text-[20px]"
              style={{ fontFamily: 'var(--font-family-old-standard)', color: '#2B1F12' }}
            >
              Agora
            </span>
          </div>
          <div
            className="italic"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontWeight: 300,
              fontSize: 'clamp(22px, 2.4vw, 32px)',
              lineHeight: 1.15,
              color: '#2B1F12',
              maxWidth: '520px',
            }}
          >
            {t('footer.tagline')}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <span
            className="text-[10.5px] tracking-[0.06em]"
            style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586' }}
          >
            {t('footer.copyright')}
          </span>

          <div className="flex items-center gap-6">
            <a
              href="#contact"
              className="text-[12px] transition-colors duration-150 cursor-pointer"
              style={{ color: '#8A7860', textDecoration: 'none' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2B1F12')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#8A7860')}
            >
              {t('footer.linkContact')}
            </a>
            <button
              onClick={toggleLocale}
              className="inline-flex items-center gap-[4px] px-[9px] py-1 rounded-[6px] cursor-pointer"
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontSize: '10.5px',
                letterSpacing: '0.06em',
                background: '#FFFCF1',
                border: '1px solid rgba(60,42,22,0.08)',
              }}
            >
              <span style={{ color: locale === 'es' ? '#2B1F12' : '#8A7860', fontWeight: locale === 'es' ? 600 : 400 }}>ES</span>
              <span style={{ color: '#B5A586', margin: '0 2px' }}>/</span>
              <span style={{ color: locale === 'en' ? '#2B1F12' : '#8A7860', fontWeight: locale === 'en' ? 600 : 400 }}>EN</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
