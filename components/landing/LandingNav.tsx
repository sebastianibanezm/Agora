'use client'

import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'

export function LandingNav() {
  const t = useTranslations('landing.nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function toggleLocale() {
    const next = locale === 'es' ? 'en' : 'es'
    // AGORA_LOCALE is the project-configured cookie name in i18n/routing.ts
    // (localeCookie: { name: 'AGORA_LOCALE', sameSite: 'lax' })
    document.cookie = `AGORA_LOCALE=${next}; path=/; samesite=lax`
    router.replace(pathname)
    router.refresh()
  }

  return (
    <nav
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-1 p-[5px] rounded-full"
      style={{
        background: 'rgba(43,31,18,0.38)',
        backdropFilter: 'blur(24px) saturate(180%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(1.05)',
        border: '1px solid rgba(248,242,228,0.22)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Brand */}
      <div className="inline-flex items-center gap-[9px] pr-[14px] pl-1">
        <div
          className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{
            background: 'rgba(248,242,228,0.13)',
            border: '1px solid rgba(248,242,228,0.20)',
          }}
        >
          <Image
            src="/agora-logo.png"
            alt="Agora"
            width={22}
            height={22}
            className="object-contain"
            style={{ filter: 'invert(1) brightness(10)' }}
          />
        </div>
        <span
          className="text-[19px] italic"
          style={{ fontFamily: 'var(--font-family-old-standard)', color: '#F8F2E4', letterSpacing: '0.01em' }}
        >
          Agora
        </span>
      </div>

      {/* Nav links — hidden on mobile */}
      {/* 'solutions' → #solutions (LandingPillars), 'howItWorks' → #solutions, 'company' → #contact */}
      <div className="hidden md:flex gap-[1px]">
        {(['solutions', 'howItWorks', 'company'] as const).map((key) => (
          <a
            key={key}
            href={key === 'company' ? '#contact' : '#solutions'}
            className="px-[13px] py-2 rounded-full text-[12px] transition-colors duration-150 cursor-pointer"
            style={{ color: 'rgba(248,242,228,0.70)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F2E4')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(248,242,228,0.70)')}
          >
            {t(key)}
          </a>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-5 mx-1" style={{ background: 'rgba(248,242,228,0.14)' }} />

      {/* Primary CTA */}
      <a
        href="#contact"
        className="ml-1 px-[18px] py-[9px] rounded-full text-[12px] font-medium inline-flex items-center gap-[6px] transition-colors duration-150 cursor-pointer"
        style={{
          background: '#F8F2E4',
          color: '#2B1F12',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#fff')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#F8F2E4')}
      >
        {t('cta')} <span>→</span>
      </a>

      {/* Language toggle */}
      <button
        onClick={toggleLocale}
        className="inline-flex items-center gap-[3px] px-[10px] py-2 ml-[2px] rounded-full cursor-pointer transition-colors duration-150"
        style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10.5px' }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(248,242,228,0.08)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      >
        <span style={{ color: locale === 'es' ? '#F8F2E4' : 'rgba(248,242,228,0.50)', fontWeight: locale === 'es' ? 600 : 400 }}>ES</span>
        <span style={{ color: 'rgba(248,242,228,0.25)', margin: '0 1px' }}>/</span>
        <span style={{ color: locale === 'en' ? '#F8F2E4' : 'rgba(248,242,228,0.50)', fontWeight: locale === 'en' ? 600 : 400 }}>EN</span>
      </button>
    </nav>
  )
}
