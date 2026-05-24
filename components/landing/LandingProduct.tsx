'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useFadeIn } from '@/hooks/useFadeIn'

export function LandingProduct() {
  const t = useTranslations('landing')
  const ref = useFadeIn()

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="product"
      className="py-[120px]"
      style={{
        borderTop: '1px solid rgba(60,42,22,0.08)',
        opacity: 0,
        transform: 'translateY(24px)',
        transition: 'opacity 0.55s ease-out, transform 0.55s ease-out',
      }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Asymmetric section head */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-16 mb-16 items-start">
          {/* Left: eyebrow + h2 */}
          <div>
            <span
              className="block mb-3 text-[10px] uppercase tracking-[0.18em]"
              style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
            >
              {t('product.eyebrow')}
            </span>
            <h2
              className="italic font-normal m-0"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(36px, 4vw, 52px)',
                lineHeight: 1.06,
                letterSpacing: '-0.015em',
                color: '#2B1F12',
              }}
            >
              {t('product.title')}
              <br />
              {t('product.titleLine2')}
            </h2>
          </div>

          {/* Right: lede */}
          <div className="lg:pt-[42px]">
            <p
              className="text-[16px] leading-[1.65] m-0"
              style={{ color: '#5A4A38', maxWidth: '52ch' }}
            >
              {t('product.lede')}
            </p>
          </div>
        </div>

        {/* Feature spec table */}
        <div className="mb-12" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
          {[
            { num: '01', label: t('product.feature1Label'), body: t('product.feature1Body') },
            { num: '02', label: t('product.feature2Label'), body: t('product.feature2Body') },
            { num: '03', label: t('product.feature3Label'), body: t('product.feature3Body') },
          ].map((feature) => (
            <div
              key={feature.num}
              className="grid items-baseline gap-x-8 py-[13px]"
              style={{
                gridTemplateColumns: '36px 1fr 1.6fr',
                borderBottom: '1px solid rgba(60,42,22,0.08)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '10px',
                  color: '#B5A586',
                  letterSpacing: '0.12em',
                }}
              >
                {feature.num}
              </span>
              <span className="font-medium" style={{ fontSize: '13.5px', color: '#2B1F12' }}>
                {feature.label}
              </span>
              <span style={{ fontSize: '13px', color: '#5A4A38', lineHeight: 1.5 }}>
                {feature.body}
              </span>
            </div>
          ))}
        </div>

        {/* Screenshot with annotations */}
        <div className="relative mx-auto" style={{ maxWidth: '100%' }}>
          {/* Annotation chips — hidden on mobile */}
          <div className="hidden lg:block">
            <Annotation label={t('product.anno1')} style={{ top: '12%', left: '-2%', transform: 'translateX(-100%) translateX(-8px)' }} amber={false} />
            <Annotation label={t('product.anno2')} style={{ top: '50%', right: '-2%', transform: 'translateX(100%) translateX(8px)' }} amber={true} />
            <Annotation label={t('product.anno3')} style={{ bottom: '18%', left: '-2%', transform: 'translateX(-100%) translateX(-8px)' }} amber={false} />
          </div>

          <div
            className="overflow-hidden w-full"
            style={{
              border: '1px solid rgba(60,42,22,0.16)',
              borderRadius: '16px',
              boxShadow: '0 40px 80px rgba(43,31,18,0.18), 0 0 0 1px rgba(43,31,18,0.06)',
            }}
          >
            <Image
              src="/landing/dashboard.png"
              alt={t('product.dashboardAlt')}
              width={1200}
              height={750}
              className="w-full h-auto block"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Annotation({ label, style, amber }: { label: string; style: React.CSSProperties; amber: boolean }) {
  return (
    <div
      className="absolute inline-flex items-center gap-[6px]"
      style={{
        fontFamily: 'var(--font-family-mono)',
        fontSize: '10px',
        letterSpacing: '0.04em',
        color: '#2B1F12',
        background: '#F8F2E4',
        border: '1px solid rgba(60,42,22,0.16)',
        padding: '5px 10px',
        borderRadius: '6px',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 14px rgba(43,31,18,0.10)',
        ...style,
      }}
    >
      <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: amber ? '#B97A1F' : '#4F7A3C' }} />
      {label}
    </div>
  )
}
