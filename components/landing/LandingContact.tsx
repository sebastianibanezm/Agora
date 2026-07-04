'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight, Clock, ShieldCheck } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'

const VOLUME_OPTIONS = ['100–500', '500–1000', '1000–3000', '3000+'] as const

type Status = 'idle' | 'loading' | 'success' | 'error'

export function LandingContact() {
  const t = useTranslations('landing')
  const [volume, setVolume] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const ref = useReveal<HTMLElement>(0.1)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!volume) return
    setStatus('loading')

    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fd.get('firstName'),
          lastName: fd.get('lastName'),
          company: fd.get('company'),
          email: fd.get('email'),
          volume,
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      ref={ref}
      id="contact"
      className="reveal py-[140px]"
      style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}
    >
      <div className="max-w-[1160px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">

          {/* Left: copy + reassurance */}
          <div className="stagger-item">
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
              className="text-[16px] leading-[1.65] mb-10"
              style={{ color: '#5A4A38', maxWidth: '42ch' }}
            >
              {t('contact.sub')}
            </p>

            <div className="flex flex-col gap-4">
              {[
                { Icon: Clock, text: t('contact.formSub') },
                { Icon: ShieldCheck, text: t('contact.formNote') },
              ].map(({ Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3 pt-4" style={{ borderTop: '1px solid rgba(60,42,22,0.08)' }}>
                  <Icon size={15} strokeWidth={1.5} style={{ color: '#8A7860', flexShrink: 0, marginTop: '2px' }} />
                  <p className="m-0 text-[13.5px] leading-[1.55]" style={{ color: '#5A4A38' }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div
            className="rounded-[16px] p-9 stagger-item"
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

            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <div
                  className="w-[48px] h-[48px] rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(79,122,60,0.12)', color: '#4F7A3C' }}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11.5l5 5 9-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3
                  className="italic font-normal m-0"
                  style={{ fontFamily: 'var(--font-family-display)', fontSize: '22px', color: '#2B1F12' }}
                >
                  ¡Recibimos tu solicitud!
                </h3>
                <p className="text-[14px] leading-[1.65] m-0" style={{ color: '#5A4A38', maxWidth: '34ch' }}>
                  Te enviamos un correo de confirmación. Nos pondremos en contacto en las próximas horas.
                </p>
              </div>
            ) : (
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
                      name={f === 'FirstName' ? 'firstName' : 'lastName'}
                      required
                      placeholder={t(`contact.placeholder${f}` as any)}
                      className="contact-input h-[42px] px-[14px] rounded-[8px] text-[14px] w-full"
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
                    name={f.toLowerCase()}
                    required
                    placeholder={t(`contact.placeholder${f}` as any)}
                    className="contact-input h-[42px] px-[14px] rounded-[8px] text-[14px] w-full"
                  />
                </div>
              ))}

              {/* Volume selector */}
              <div className="mb-4">
                <span
                  className="block text-[10px] uppercase tracking-[0.12em] font-medium mb-[6px]"
                  style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
                >
                  {t('contact.labelVolume')}{' '}
                  <span style={{ color: '#8B2A1F' }}>*</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-[6px]">
                  {VOLUME_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      data-active={volume === opt ? 'true' : undefined}
                      onClick={() => setVolume(opt)}
                      className="volume-option h-[38px] flex items-center justify-center rounded-[7px] text-[11.5px] cursor-pointer btn-press"
                      style={{ fontFamily: 'var(--font-family-mono)' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {status === 'error' && (
                <p className="text-[12px] mb-3 text-center" style={{ color: '#8B2A1F' }}>
                  Hubo un error al enviar. Intenta nuevamente o escríbenos directamente.
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="contact-submit w-full h-[46px] rounded-[10px] text-[14px] font-medium flex items-center justify-center gap-2 cursor-pointer mt-[6px] btn-press"
                style={{ opacity: status === 'loading' ? 0.7 : 1 }}
              >
                {status === 'loading' ? 'Enviando…' : <>{t('contact.submitBtn')} <ArrowRight size={14} strokeWidth={1.8} /></>}
              </button>

              <p
                className="text-center mt-[14px] text-[10px] tracking-[0.04em]"
                style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586' }}
              >
                {t('contact.formNote')}
              </p>
            </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
