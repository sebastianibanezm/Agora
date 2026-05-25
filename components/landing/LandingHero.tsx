'use client'

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { LandingNav } from './LandingNav'
import { ParallaxImage, useParallaxTimeline } from './ParallaxImage'

export function LandingHero() {
  const t = useTranslations('landing')
  const { timelineName, rootStyle } = useParallaxTimeline()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7
    }
  }, [])

  return (
    <section
      className="parallax-root relative w-full overflow-hidden"
      style={{ minHeight: '100vh', background: '#2B1F12', ...rootStyle }}
    >
      {/* Background: video on desktop, image fallback on mobile */}
      <div className="absolute inset-0 z-0">
        {/* Video — hidden on mobile via CSS */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="/landing/hero-bg.png"
          className="hero-video absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 38%' }}
        >
          <source src="/landing/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Static image fallback — shown only on mobile */}
        <div className="hero-image-fallback absolute inset-0">
          <ParallaxImage
            src="/landing/hero-bg.png"
            objectPosition="center 38%"
            strength={0.12}
            timelineName={timelineName}
            priority
          />
        </div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, rgba(43,31,18,0.62) 0%, rgba(43,31,18,0.15) 55%, rgba(43,31,18,0.30) 100%),
              linear-gradient(to top, rgba(43,31,18,0.70) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Paper grain */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(248,242,228,0.032) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'overlay',
          opacity: 0.55,
        }}
      />

      {/* Nav */}
      <LandingNav />

      {/* Glass card — bottom-left */}
      <div
        className="absolute z-10"
        style={{
          left: '48px',
          bottom: '48px',
          width: 'min(560px, calc(100vw - 96px))',
        }}
      >
        <div
          className="relative overflow-hidden hero-el hero-el-0"
          style={{
            background: 'rgba(43,31,18,0.28)',
            backdropFilter: 'blur(36px) saturate(180%)',
            WebkitBackdropFilter: 'blur(36px) saturate(180%)',
            border: '1px solid rgba(248,242,228,0.20)',
            borderRadius: '22px',
            padding: '30px 30px 26px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.09)',
          }}
        >
          {/* Inner highlight sheen */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(248,242,228,0.35) 40%, rgba(248,242,228,0.15) 70%, transparent 100%)',
            }}
          />

          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-[9px] mb-[18px] hero-el hero-el-1"
            style={{
              padding: '4px 12px 4px 8px',
              background: 'rgba(248,242,228,0.08)',
              border: '1px solid rgba(248,242,228,0.16)',
              borderRadius: '999px',
            }}
          >
            <span
              className="w-[6px] h-[6px] rounded-full flex-shrink-0"
              style={{
                background: '#4F7A3C',
                boxShadow: '0 0 0 3px rgba(79,122,60,0.30)',
                animation: 'pulse 1.8s ease-in-out infinite',
              }}
            />
            <span
              className="text-[10.5px] uppercase tracking-[0.10em]"
              style={{ fontFamily: 'var(--font-family-mono)', color: 'rgba(248,242,228,0.80)' }}
            >
              {t('hero.eyebrow')}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="m-0 hero-el hero-el-2"
            style={{
              fontFamily: 'var(--font-family-old-standard)',
              fontSize: 'clamp(30px, 2.8vw, 44px)',
              lineHeight: 1.06,
              fontWeight: 400,
              letterSpacing: '-0.015em',
              color: '#F8F2E4',
            }}
          >
            {t('hero.headline')}
            <br />
            <span style={{ fontFamily: 'var(--font-family-fraunces)', fontStyle: 'italic', color: '#B97A1F' }}>
              {t('hero.headlineAccent')}
            </span>
          </h1>

          {/* Sub */}
          <p
            className="mt-[14px] text-[14px] leading-[1.60] font-normal hero-el hero-el-3"
            style={{ color: 'rgba(248,242,228,0.78)' }}
          >
            {t('hero.sub')}
          </p>

          {/* CTAs */}
          <div className="mt-5 flex items-center gap-[10px] flex-wrap hero-el hero-el-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-[7px] font-medium text-[13px] cursor-pointer btn-press"
              style={{
                height: '40px',
                padding: '0 20px',
                borderRadius: '999px',
                background: '#F8F2E4',
                color: '#2B1F12',
                border: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.30)',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#fff')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#F8F2E4')}
            >
              {t('hero.ctaPrimary')} <ArrowRight size={14} strokeWidth={1.8} />
            </a>
          </div>
        </div>
      </div>


      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .hero-video { display: block; }
        .hero-image-fallback { display: none; }
        @media (max-width: 767px) {
          .hero-video { display: none; }
          .hero-image-fallback { display: block; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-video { display: none; }
          .hero-image-fallback { display: block; }
        }
      `}</style>
    </section>
  )
}
