'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { useFadeIn } from '@/hooks/useFadeIn'

const VOLUME_OPTIONS = ['1–20', '20–100', '100–500', '500+'] as const

export function LandingContact() {
  const t = useTranslations('landing')
  const [volume, setVolume] = useState<string | null>(null)
  const ref = useFadeIn()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
  }

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="contact"
      className="py-[140px]"
      style={{
        borderTop: '1px solid rgba(60,42,22,0.08)',
        opacity: 0,
        transform: 'translateY(24px)',
        transition: 'opacity 0.55s ease-out, transform 0.55s ease-out',
      }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">

          {/* Left: copy + steps */}
          <div>
            <span
              className="block mb-[18px] text-[10px] uppercase tracking-[0.18em]"
              style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
            >
              {t('contact.eyebrow')}
            </span>
            <h2
              className="italic mb-[22px]"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: 'clamp(40px, 4.2vw, 58px)',
                lineHeight: 1.04,
                letterSpacing: '-0.02em',
                color: '#2B1F12',
                fontWeight: 300,
              }}
            >
              {t('contact.title')}
              <br />
              {t('contact.titleLine2')}
            </h2>
            <p
              className="text-[16px] leading-[1.65] mb-6"
              style={{ color: '#5A4A38', maxWidth: '42ch' }}
            >
              {t('contact.sub')}
            </p>

            {/* Social proof line */}
            <div
              className="inline-flex items-center gap-[7px] mb-8"
              style={{ display: 'flex' }}
            >
              <div
                className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                style={{ background: '#4F7A3C' }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '11px',
                  color: '#8A7860',
                }}
              >
                {t('contact.proof')}
              </span>
            </div>

            {/* Process steps */}
            <div className="flex flex-col gap-[18px]">
              {(['1', '2', '3'] as const).map((n) => (
                <div
                  key={n}
                  className="flex gap-4 items-start pt-[18px] stagger-item"
                  style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}
                >
                  <div
                    className="text-[10px] uppercase tracking-[0.18em] pt-[2px] min-w-[32px] flex-shrink-0"
                    style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
                  >
                    0{n}
                  </div>
                  <div>
                    <strong
                      className="italic text-[16px] font-medium block mb-[2px]"
                      style={{ fontFamily: 'var(--font-family-display)', color: '#2B1F12' }}
                    >
                      {t(`contact.step${n}Title` as any)}
                    </strong>
                    <p className="text-[13.5px] leading-[1.55] m-0" style={{ color: '#5A4A38' }}>
                      {t(`contact.step${n}Body` as any)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div
            className="rounded-[16px] p-9"
            style={{
              background: '#FFFCF1',
              border: '1px solid rgba(60,42,22,0.16)',
              boxShadow: '0 8px 32px rgba(43,31,18,0.07)',
            }}
          >
            <h3
              className="italic text-[20px] mb-[6px]"
              style={{ fontFamily: 'var(--font-family-display)', color: '#2B1F12' }}
            >
              {t('contact.formTitle')}
            </h3>
            <p className="text-[13px] mb-7" style={{ color: '#8A7860' }}>
              {t('contact.formSub')}
            </p>

            <form onSubmit={handleSubmit}>
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {(['FirstName', 'LastName'] as const).map((f) => (
                  <div key={f} className="flex flex-col gap-[6px]">
                    <label
                      className="text-[10px] uppercase tracking-[0.12em] font-medium"
                      style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
                    >
                      {t(`contact.label${f}` as any)}{' '}
                      <span style={{ color: '#8B2A1F' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t(`contact.placeholder${f}` as any)}
                      className="h-[42px] px-[14px] rounded-[8px] text-[14px] outline-none w-full transition-shadow duration-150"
                      style={{
                        background: '#FCF7EA',
                        border: '1px solid rgba(60,42,22,0.14)',
                        color: '#2B1F12',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#5A4A38'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(43,31,18,0.07)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(60,42,22,0.14)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Single-field rows */}
              {(['Company', 'Email'] as const).map((f) => (
                <div key={f} className="flex flex-col gap-[6px] mb-4">
                  <label
                    className="text-[10px] uppercase tracking-[0.12em] font-medium"
                    style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
                  >
                    {t(`contact.label${f}` as any)}{' '}
                    <span style={{ color: '#8B2A1F' }}>*</span>
                  </label>
                  <input
                    type={f === 'Email' ? 'email' : 'text'}
                    placeholder={t(`contact.placeholder${f}` as any)}
                    className="h-[42px] px-[14px] rounded-[8px] text-[14px] outline-none w-full transition-shadow duration-150"
                    style={{
                      background: '#FCF7EA',
                      border: '1px solid rgba(60,42,22,0.14)',
                      color: '#2B1F12',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#5A4A38'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(43,31,18,0.07)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(60,42,22,0.14)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              ))}

              {/* Volume selector */}
              <div className="mb-4">
                <span
                  className="block text-[10px] uppercase tracking-[0.12em] font-medium mb-[6px]"
                  style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
                >
                  {t('contact.labelVolume')}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-[6px]">
                  {VOLUME_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      data-active={volume === opt ? 'true' : undefined}
                      onClick={() => setVolume(opt)}
                      className="h-[38px] flex items-center justify-center rounded-[7px] text-[11.5px] cursor-pointer btn-press"
                      style={{
                        fontFamily: 'var(--font-family-mono)',
                        background: volume === opt ? '#2B1F12' : '#FCF7EA',
                        color: volume === opt ? '#F8F2E4' : '#5A4A38',
                        border: `1px solid ${volume === opt ? '#2B1F12' : 'rgba(60,42,22,0.14)'}`,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-[6px] mb-4">
                <label
                  className="text-[10px] uppercase tracking-[0.12em] font-medium"
                  style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
                >
                  {t('contact.labelMessage')}{' '}
                  <span style={{ color: '#8B2A1F' }}>*</span>
                </label>
                <textarea
                  placeholder={t('contact.placeholderMessage')}
                  rows={4}
                  className="px-[14px] py-3 rounded-[8px] text-[14px] outline-none w-full resize-y"
                  style={{
                    background: '#FCF7EA',
                    border: '1px solid rgba(60,42,22,0.14)',
                    color: '#2B1F12',
                    minHeight: '88px',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#5A4A38'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(43,31,18,0.07)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(60,42,22,0.14)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-[46px] rounded-[10px] text-[14px] font-medium flex items-center justify-center gap-2 cursor-pointer mt-[6px] btn-press"
                style={{ background: '#2B1F12', color: '#F8F2E4', border: 'none' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#1F1609')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#2B1F12')}
              >
                {t('contact.submitBtn')} <ArrowRight size={14} strokeWidth={1.8} />
              </button>

              <p
                className="text-center mt-[14px] text-[10px] tracking-[0.04em]"
                style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586' }}
              >
                {t('contact.formNote')}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
