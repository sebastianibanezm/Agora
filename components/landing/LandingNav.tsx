'use client'

import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useState } from 'react'

const APP_LOGIN_URL = 'https://app.agenteagora.com/login'

export function LandingNav() {
  const t = useTranslations('landing.nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function toggleLocale() {
    const next = locale === 'es' ? 'en' : 'es'
    // AGORA_LOCALE is the project-configured cookie name in i18n/routing.ts
    // (localeCookie: { name: 'AGORA_LOCALE', sameSite: 'lax' })
    document.cookie = `AGORA_LOCALE=${next}; path=/; samesite=lax`
    // localePrefix 'as-needed': es lives at /, en under /en
    const basePath = pathname.replace(/^\/en(?=\/|$)/, '') || '/'
    router.replace(next === 'en' ? `/en${basePath === '/' ? '' : basePath}` : basePath)
    router.refresh()
  }

  return (
    <>
    <nav
      className="landing-nav-glass fixed top-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-1 p-[5px] rounded-full"
    >
      {/* Brand */}
      <div className="inline-flex items-center gap-[9px] pr-[14px] pl-1">
        <div
          className="w-[38px] h-[38px] flex items-center justify-center flex-shrink-0"
        >
          <Image
            src="/landing/lambda-logo.png"
            alt="Agora"
            width={34}
            height={34}
            className="object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
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
      {/* 'solutions' → #solutions (LandingPillars), 'howItWorks' → #how-it-works, 'company' → #contact */}
      <div className="hidden lg:flex gap-[1px]">
        {(['solutions', 'howItWorks', 'company'] as const).map((key) => (
          <a
            key={key}
            href={key === 'company' ? '#contact' : key === 'howItWorks' ? '#how-it-works' : '#solutions'}
            className="nav-link px-[13px] py-2 rounded-full text-[12px] cursor-pointer"
          >
            {t(key)}
          </a>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-5 mx-1" style={{ background: 'rgba(248,242,228,0.14)' }} />

      {/* Hamburger — compact navigation through tablet widths */}
      <button
        className="lg:hidden p-2 rounded-full transition-colors duration-150"
        style={{ color: 'rgba(248,242,228,0.70)' }}
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
        aria-controls="landing-mobile-menu"
        aria-expanded={open}
      >
        {open ? <X size={16} strokeWidth={1.8} /> : <Menu size={16} strokeWidth={1.8} />}
      </button>

      {/* Primary CTA — desktop only */}
      <a
        href="#contact"
        className="cta-solid hidden lg:inline-flex ml-1 px-[18px] py-[9px] rounded-full text-[12px] font-medium items-center gap-[6px] cursor-pointer btn-press"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
      >
        {t('cta')} <ArrowRight size={13} strokeWidth={1.8} />
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

    <a
      href={APP_LOGIN_URL}
      className="landing-nav-glass landing-sign-in-glass fixed top-6 right-6 z-50 hidden h-[48px] items-center px-[18px] rounded-full text-[12px] font-medium whitespace-nowrap lg:inline-flex"
    >
      {t('signIn')}
    </a>

    {/* Mobile dropdown — always rendered, animated via opacity/transform */}
    <div
      data-mobile-menu
      id="landing-mobile-menu"
      aria-hidden={!open}
      inert={!open}
      className="fixed left-1/2 -translate-x-1/2 z-40 flex flex-col py-2 lg:hidden"
      style={{
        top: '76px',
        width: 'min(320px, calc(100vw - 32px))',
        background: 'rgba(43,31,18,0.72)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(248,242,228,0.18)',
        borderRadius: '16px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.40)',
        transformOrigin: 'top center',
        opacity: open ? 1 : 0,
        transform: open ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(-6px)',
        pointerEvents: open ? 'auto' : 'none',
        transition: open
          ? 'opacity 150ms cubic-bezier(0.23,1,0.32,1), transform 150ms cubic-bezier(0.23,1,0.32,1)'
          : 'opacity 100ms ease-in, transform 100ms ease-in',
      }}
    >
      {(['solutions', 'howItWorks', 'company'] as const).map((key) => (
        <a
          key={key}
          href={key === 'company' ? '#contact' : key === 'howItWorks' ? '#problem' : '#solutions'}
          onClick={() => setOpen(false)}
          className="px-5 py-3 text-[14px] transition-colors duration-150 cursor-pointer"
          style={{ color: 'rgba(248,242,228,0.80)', textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F2E4')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(248,242,228,0.80)')}
        >
          {t(key)}
        </a>
      ))}
      <div style={{ height: '1px', background: 'rgba(248,242,228,0.10)', margin: '4px 0' }} />
      <a
        href={APP_LOGIN_URL}
        onClick={() => setOpen(false)}
        className="landing-mobile-sign-in mx-3 mt-2 px-4 py-[10px] rounded-[10px] text-[14px] font-medium text-center whitespace-nowrap cursor-pointer btn-press"
      >
        {t('signIn')}
      </a>
      <a
        href="#contact"
        onClick={() => setOpen(false)}
        className="mx-3 my-2 px-4 py-[10px] rounded-[10px] text-[14px] font-medium text-center cursor-pointer btn-press"
        style={{ background: '#F8F2E4', color: '#2B1F12', textDecoration: 'none' }}
      >
        {t('cta')}
      </a>
    </div>
    </>
  )
}
