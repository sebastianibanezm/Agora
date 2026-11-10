'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { LandingNav } from './LandingNav'
import { BrowserFrame } from './BrowserFrame'
import { captureContactCta } from '@/lib/analytics'

/**
 * Hero: the tagline over the container photo, then the home dashboard breaking
 * out of the hero's bottom edge so the product shows in the first screen.
 * A still image only (optimized by next/image); the old 3.3 MB video is gone.
 */
export function LandingHero() {
  const t = useTranslations('landing')

  return (
    <>
      <section data-hero className="relative w-full overflow-hidden" style={{ background: '#221811', isolation: 'isolate' }}>
        <div className="hero-photo absolute inset-y-0 left-0 -z-20">
          <Image
            src="/landing/hero-bg.png"
            alt=""
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 140vw"
            className="object-cover"
            style={{ objectPosition: '50% 40%' }}
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background: `
              linear-gradient(95deg, rgba(34,24,17,0.92) 0%, rgba(34,24,17,0.78) 38%, rgba(34,24,17,0.25) 72%, rgba(34,24,17,0.15) 100%),
              linear-gradient(0deg, rgba(34,24,17,0.55) 0%, rgba(34,24,17,0) 40%)
            `,
          }}
        />

        <LandingNav />

        <div
          className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 grid gap-[26px]"
          style={{ paddingTop: 'calc(68px + clamp(56px, 9vw, 120px))', paddingBottom: 'clamp(200px, 26vw, 330px)' }}
        >
          <p
            className="m-0 text-[12px] uppercase tracking-[0.14em] hero-el hero-el-0"
            style={{ fontFamily: 'var(--font-family-mono)', color: '#C9B9A0' }}
          >
            {t('hero.eyebrow')}
          </p>

          <h1
            className="m-0 font-normal hero-el hero-el-1"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontVariationSettings: '"opsz" 144',
              fontSize: 'clamp(44px, 7.2vw, 100px)',
              lineHeight: 0.98,
              letterSpacing: '-0.025em',
              color: '#F3EAD8',
              maxWidth: '13ch',
              textWrap: 'balance',
            }}
          >
            {t('hero.headline')}{' '}
            <span className="italic" style={{ color: '#E2AE55' }}>
              {t('hero.headlineAccent')}
            </span>
          </h1>

          <p
            className="m-0 hero-el hero-el-2"
            style={{ fontSize: 'clamp(17px, 1.5vw, 20px)', lineHeight: 1.6, color: 'rgba(243,234,216,0.9)', maxWidth: '54ch' }}
          >
            {t('hero.sub')}
          </p>

          <div className="mt-[6px] flex flex-wrap items-center gap-x-6 gap-y-[14px] hero-el hero-el-3">
            <a
              href="#contact"
              onClick={() => captureContactCta('hero')}
              className="cta-solid btn-press inline-flex items-center gap-[10px] h-12 px-[22px] rounded-full text-[15px] font-medium whitespace-nowrap"
            >
              {t('hero.ctaPrimary')} <ArrowRight size={14} strokeWidth={1.8} />
            </a>
            <a href="#how-it-works" className="hero-link inline-flex items-center gap-2 text-[15px] font-medium">
              {t('hero.ctaSecondary')} <ArrowDown size={14} strokeWidth={1.8} />
            </a>
          </div>
        </div>
      </section>

      <div
        className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12"
        style={{ marginTop: 'clamp(-300px, -22vw, -170px)' }}
      >
        <div className="max-w-[1080px] mx-auto hero-el hero-el-4">
          <BrowserFrame
            src="/landing/process/dashboard.png"
            alt={t('hero.productAlt')}
            label={`app.agenteagora.com · ${t('hero.productBar')}`}
            note={t('process.shotNote')}
            width={2880}
            height={1880}
            sizes="(max-width: 1200px) 100vw, 1080px"
            priority
            raised
          />
        </div>
      </div>
    </>
  )
}
