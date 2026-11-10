'use client'

import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const APP_LOGIN_URL = 'https://app.agenteagora.com/login'

const NAV_LINKS = [
  { key: 'howItWorks', href: '#how-it-works' },
  { key: 'gettingStarted', href: '#getting-started' },
  { key: 'faq', href: '#faq' },
] as const

/** True once the hero has scrolled out from under the bar. */
function useSolidBar() {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const update = () => {
      const hero = document.querySelector('[data-hero]')
      setSolid(hero ? hero.getBoundingClientRect().bottom <= 90 : window.scrollY > 40)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return solid
}

export function LandingNav() {
  const t = useTranslations('landing.nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const solid = useSolidBar()

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

  const localeToggle = (
    <button
      onClick={toggleLocale}
      className="bar-locale inline-flex items-center gap-[3px] px-2 py-2 rounded-full cursor-pointer"
      style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}
    >
      <span style={{ fontWeight: locale === 'es' ? 600 : 400, opacity: locale === 'es' ? 1 : 0.6 }}>ES</span>
      <span style={{ opacity: 0.4, margin: '0 1px' }}>/</span>
      <span style={{ fontWeight: locale === 'en' ? 600 : 400, opacity: locale === 'en' ? 1 : 0.6 }}>EN</span>
    </button>
  )

  return (
    <>
      <header data-solid={solid ? 'true' : 'false'} className="landing-bar fixed inset-x-0 top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 h-[68px] flex items-center gap-3 lg:gap-7">
          <a href="#landing-main" className="inline-flex items-center gap-[9px] flex-shrink-0" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Image src="/landing/lambda-logo.png" alt="" width={30} height={30} className="bar-logo object-contain" />
            <span className="text-[22px] italic" style={{ fontFamily: 'var(--font-family-old-standard)', letterSpacing: '0.01em' }}>
              Agora
            </span>
          </a>

          <nav aria-label="Secciones" className="hidden lg:flex gap-[26px] ml-3">
            {NAV_LINKS.map(({ key, href }) => (
              <a key={key} href={href} className="nav-link text-[14.5px] cursor-pointer">
                {t(key)}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-[10px] lg:gap-[18px]">
            <span className="hidden sm:inline-flex">{localeToggle}</span>
            <a
              href={APP_LOGIN_URL}
              className="bar-sign-in hidden lg:inline-flex text-[14px] whitespace-nowrap"
            >
              {t('signIn')}
            </a>
            <a
              href="#contact"
              className="cta-solid btn-press inline-flex items-center gap-[6px] h-[38px] px-4 rounded-full text-[14px] font-medium whitespace-nowrap"
            >
              {t('cta')} <ArrowRight size={13} strokeWidth={1.8} className="hidden sm:block" />
            </a>
            <button
              className="bar-menu lg:hidden inline-grid place-items-center w-[38px] h-[38px] rounded-[10px]"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              aria-controls="landing-mobile-menu"
              aria-expanded={open}
            >
              {open ? <X size={16} strokeWidth={1.8} /> : <Menu size={16} strokeWidth={1.8} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown — always rendered, animated via opacity/transform */}
      <div
        data-mobile-menu
        id="landing-mobile-menu"
        aria-hidden={!open}
        inert={!open}
        className="fixed z-40 flex flex-col py-2 lg:hidden"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 76px)',
          right: '16px',
          width: 'min(320px, calc(100vw - 32px))',
          background: 'rgba(43,31,18,0.92)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(248,242,228,0.18)',
          borderRadius: '16px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.40)',
          transformOrigin: 'top right',
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(-6px)',
          pointerEvents: open ? 'auto' : 'none',
          transition: open
            ? 'opacity 150ms cubic-bezier(0.23,1,0.32,1), transform 150ms cubic-bezier(0.23,1,0.32,1)'
            : 'opacity 100ms ease-in, transform 100ms ease-in',
        }}
      >
        {NAV_LINKS.map(({ key, href }) => (
          <a
            key={key}
            href={href}
            onClick={() => setOpen(false)}
            className="px-5 py-3 text-[15px] transition-colors duration-150 cursor-pointer"
            style={{ color: 'rgba(248,242,228,0.86)', textDecoration: 'none' }}
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
        <div className="sm:hidden self-center mt-2 mb-1" style={{ color: 'rgba(248,242,228,0.86)' }}>
          {localeToggle}
        </div>
      </div>
    </>
  )
}
