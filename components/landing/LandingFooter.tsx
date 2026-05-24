'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

export function LandingFooter() {
  const t = useTranslations('landing')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function toggleLocale() {
    const next = locale === 'es' ? 'en' : 'es'
    document.cookie = `AGORA_LOCALE=${next}; path=/; samesite=lax`
    router.replace(pathname)
    router.refresh()
  }

  return (
    <footer className="relative w-full overflow-hidden" style={{ minHeight: '420px' }}>
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing/footer-bg.png"
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: 'center 55%' }}
        />
        {/* Dark gradient overlay — heavier at bottom so content is legible */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to bottom, rgba(43,31,18,0.35) 0%, rgba(43,31,18,0.55) 50%, rgba(43,31,18,0.80) 100%),
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
      <div className="relative z-10 max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12 py-16 flex flex-col justify-between" style={{ minHeight: '420px' }}>

        {/* Brand glass card — top */}
        <div
          className="relative overflow-hidden self-start"
          style={{
            background: 'rgba(43,31,18,0.28)',
            backdropFilter: 'blur(36px) saturate(180%)',
            WebkitBackdropFilter: 'blur(36px) saturate(180%)',
            border: '1px solid rgba(248,242,228,0.20)',
            borderRadius: '18px',
            padding: '22px 26px 20px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09)',
          }}
        >
          {/* Inner highlight sheen */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(248,242,228,0.30) 40%, rgba(248,242,228,0.12) 70%, transparent 100%)',
            }}
          />
          <div className="flex items-center gap-[9px] mb-4">
            <div className="w-[26px] h-[26px] flex items-center justify-center flex-shrink-0">
              <Image
                src="/landing/lambda-logo.png"
                alt="Agora"
                width={24}
                height={24}
                className="object-contain"
                style={{ filter: 'invert(1)' }}
              />
            </div>
            <span
              className="italic text-[19px]"
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
              fontSize: 'clamp(18px, 2vw, 26px)',
              lineHeight: 1.2,
              color: 'rgba(248,242,228,0.92)',
              maxWidth: '400px',
            }}
          >
            {t('footer.tagline')}
          </div>
        </div>

        {/* Bottom bar glass pill */}
        <div
          className="relative overflow-hidden mt-12"
          style={{
            background: 'rgba(43,31,18,0.32)',
            backdropFilter: 'blur(24px) saturate(160%)',
            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid rgba(248,242,228,0.16)',
            borderRadius: '12px',
            padding: '14px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span
              className="text-[10.5px] tracking-[0.06em]"
              style={{ fontFamily: 'var(--font-family-mono)', color: 'rgba(248,242,228,0.55)' }}
            >
              {t('footer.copyright')}
            </span>

            <div className="flex items-center gap-5">
              <a
                href="#contact"
                className="text-[12px] transition-colors duration-150 cursor-pointer"
                style={{ color: 'rgba(248,242,228,0.65)', textDecoration: 'none' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#F8F2E4')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(248,242,228,0.65)')}
              >
                {t('footer.linkContact')}
              </a>
              <button
                onClick={toggleLocale}
                className="inline-flex items-center gap-[3px] px-[10px] py-[5px] rounded-[7px] cursor-pointer transition-colors duration-150"
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '10.5px',
                  letterSpacing: '0.06em',
                  background: 'rgba(248,242,228,0.08)',
                  border: '1px solid rgba(248,242,228,0.14)',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(248,242,228,0.14)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(248,242,228,0.08)')}
              >
                <span style={{ color: locale === 'es' ? '#F8F2E4' : 'rgba(248,242,228,0.45)', fontWeight: locale === 'es' ? 600 : 400 }}>ES</span>
                <span style={{ color: 'rgba(248,242,228,0.25)', margin: '0 1px' }}>/</span>
                <span style={{ color: locale === 'en' ? '#F8F2E4' : 'rgba(248,242,228,0.45)', fontWeight: locale === 'en' ? 600 : 400 }}>EN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
