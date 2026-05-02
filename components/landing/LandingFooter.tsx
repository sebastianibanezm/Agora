'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useFadeIn } from '@/hooks/useFadeIn'

const PLATFORM_LINKS = ['linkVisibility', 'linkAlerts', 'linkDocs', 'linkIntegrations'] as const
const COMPANY_LINKS = ['linkAbout', 'linkClients', 'linkBlog', 'linkContact'] as const
const LEGAL_LINKS = ['linkPrivacy', 'linkTerms', 'linkSecurity'] as const

export function LandingFooter() {
  const t = useTranslations('landing')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const ref = useFadeIn()

  function toggleLocale() {
    const next = locale === 'es' ? 'en' : 'es'
    // AGORA_LOCALE is the project-configured cookie name in i18n/routing.ts
    document.cookie = `AGORA_LOCALE=${next}; path=/; samesite=lax`
    router.replace(pathname)
    router.refresh()
  }

  return (
    <footer ref={ref as React.RefObject<HTMLElement>} style={{ background: '#FCF7EA', borderTop: '1px solid rgba(60,42,22,0.08)', padding: '72px 0 36px', opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.55s ease-out, transform 0.55s ease-out' }}>
      <div className="max-w-[1160px] mx-auto px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-14">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-[10px] mb-3">
              <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center overflow-hidden" style={{ background: '#F8F2E4', border: '1px solid rgba(60,42,22,0.12)' }}>
                <Image src="/landing/lambda-logo.png" alt="Agora" width={18} height={18} className="object-contain" />
              </div>
              <span className="italic text-[20px]" style={{ fontFamily: 'var(--font-family-old-standard)', color: '#2B1F12' }}>Agora</span>
            </div>
            <p className="text-[13px] leading-[1.6] m-0" style={{ color: '#8A7860', maxWidth: '30ch' }}>{t('footer.tagline')}</p>
          </div>

          {/* Link columns */}
          {[
            { heading: 'footer.colPlatform', links: PLATFORM_LINKS, prefix: 'footer.' },
            { heading: 'footer.colCompany', links: COMPANY_LINKS, prefix: 'footer.' },
            { heading: 'footer.colLegal', links: LEGAL_LINKS, prefix: 'footer.' },
          ].map(({ heading, links, prefix }) => (
            <div key={heading}>
              <h5 className="text-[10px] uppercase tracking-[0.18em] font-medium mb-[14px] m-0" style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}>
                {t(heading as any)}
              </h5>
              <ul className="list-none p-0 m-0 flex flex-col gap-[9px]">
                {links.map((link) => (
                  <li key={link}>
                    <a className="text-[13.5px] transition-colors duration-150 cursor-pointer" style={{ color: '#5A4A38', textDecoration: 'none' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#2B1F12')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#5A4A38')}
                    >
                      {t(`${prefix}${link}` as any)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
          <span className="text-[10.5px] tracking-[0.06em]" style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586' }}>
            {t('footer.copyright')}
          </span>
          <button
            onClick={toggleLocale}
            className="inline-flex items-center gap-[4px] px-[9px] py-1 rounded-[6px] cursor-pointer"
            style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10.5px', letterSpacing: '0.06em', background: '#FFFCF1', border: '1px solid rgba(60,42,22,0.08)' }}
          >
            <span style={{ color: locale === 'es' ? '#2B1F12' : '#8A7860', fontWeight: locale === 'es' ? 600 : 400 }}>ES</span>
            <span style={{ color: '#B5A586', margin: '0 2px' }}>/</span>
            <span style={{ color: locale === 'en' ? '#2B1F12' : '#8A7860', fontWeight: locale === 'en' ? 600 : 400 }}>EN</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
