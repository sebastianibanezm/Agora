'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight, Check } from 'lucide-react'

const INK = '#2B1F12'
const LINE = 'rgba(43,31,18,0.35)'
const LINE_SOFT = 'rgba(43,31,18,0.18)'

const cellLabel: React.CSSProperties = {
  fontFamily: 'var(--font-family-mono)',
  fontSize: '8.5px',
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
  color: '#8A7860',
  display: 'block',
  marginBottom: '5px',
  lineHeight: 1.35,
}

const cellValue: React.CSSProperties = {
  fontFamily: 'var(--font-family-mono)',
  fontSize: '12px',
  color: INK,
  lineHeight: 1.45,
  wordBreak: 'break-word',
}

function Cell({
  label,
  value,
  accent,
  className,
  children,
}: {
  label: string
  value?: string
  accent?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={className} style={{ padding: '10px 14px' }}>
      <span style={cellLabel}>{label}</span>
      {value !== undefined && (
        <span style={{ ...cellValue, color: accent ? '#8B2A1F' : INK, fontWeight: accent ? 700 : 400 }}>
          {value}
        </span>
      )}
      {children}
    </div>
  )
}

export function NotFoundDocument() {
  const t = useTranslations('landing.notFound.doc')
  const locale = useLocale()
  const pathname = usePathname()
  const today = new Date().toLocaleDateString(locale === 'en' ? 'en-GB' : 'es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 sm:px-8 py-14 overflow-hidden"
      style={{ background: '#F1E8D5' }}
    >
      <div className="w-full" style={{ maxWidth: '780px' }}>
        {/* The document — slightly rotated, like it landed on a desk */}
        <div
          className="notfound-doc relative"
          style={{
            background: '#FFFCF1',
            border: `1.5px solid ${INK}`,
            boxShadow: '0 32px 80px rgba(43,31,18,0.28), 0 4px 16px rgba(43,31,18,0.10)',
            transform: 'rotate(-1.4deg)',
          }}
        >
          {/* ── Header: logo + document title + refs ─────────────── */}
          <div className="grid grid-cols-[1.1fr_1.6fr_0.75fr]" style={{ borderBottom: `1.5px solid ${INK}` }}>
            <div className="doc-r flex items-center gap-[8px] px-4 py-4">
              <Image src="/landing/lambda-logo.png" alt="Agora" width={24} height={24} className="object-contain flex-shrink-0" />
              <div>
                <div
                  className="italic"
                  style={{ fontFamily: 'var(--font-family-old-standard)', fontSize: '17px', color: INK, lineHeight: 1 }}
                >
                  Agora
                </div>
                <div style={{ ...cellLabel, marginBottom: 0, marginTop: '3px', fontSize: '7px' }}>{t('agency')}</div>
              </div>
            </div>
            <div className="doc-r px-4 py-4 flex flex-col justify-center">
              <div
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: INK,
                }}
              >
                {t('title')}
              </div>
              <div style={{ ...cellLabel, marginBottom: 0, marginTop: '3px' }}>{t('subtitle')}</div>
            </div>
            <div className="flex flex-col justify-center px-4 py-2">
              <div style={{ marginBottom: '6px' }}>
                <span style={{ ...cellLabel, marginBottom: '2px' }}>{t('blNoLabel')}</span>
                <span style={{ ...cellValue, fontWeight: 700 }}>404</span>
              </div>
              <div>
                <span style={{ ...cellLabel, marginBottom: '2px' }}>{t('scacLabel')}</span>
                <span style={cellValue}>{t('scacValue')}</span>
              </div>
            </div>
          </div>

          {/* ── Shipper / booking refs ───────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ borderBottom: `1px solid ${LINE_SOFT}` }}>
            <Cell label={t('shipperLabel')} value={t('shipperValue')} className="doc-r" />
            <div className="grid grid-cols-2">
              <Cell label={t('bookingLabel')} value="404" className="doc-r" />
              <Cell label={t('exportRefLabel')} value={pathname || '/'} accent />
            </div>
          </div>

          {/* ── Consignee / notify ───────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ borderBottom: `1px solid ${LINE_SOFT}` }}>
            <Cell label={t('consigneeLabel')} value={t('consigneeValue')} className="sm:doc-r" />
            <Cell label={t('notifyLabel')} value={t('notifyValue')} />
          </div>

          {/* ── Vessel / voyage / ports ──────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ borderBottom: `1.5px solid ${INK}` }}>
            <Cell label={t('vesselLabel')} value={t('vesselValue')} className="doc-r" />
            <Cell label={t('voyageLabel')} value={t('voyageValue')} className="sm:doc-r" />
            <Cell label={t('polLabel')} value={t('polValue')} className="doc-r" />
            <Cell label={t('podLabel')} value={t('podValue')} />
          </div>

          {/* ── Particulars head strip ───────────────────────────── */}
          <div
            className="px-4 py-[7px] text-center"
            style={{
              borderBottom: `1px solid ${LINE_SOFT}`,
              fontFamily: 'var(--font-family-mono)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: INK,
            }}
          >
            {t('particularsHead')}
          </div>

          {/* ── Goods + weight/measurement ───────────────────────── */}
          <div className="grid grid-cols-[1fr] sm:grid-cols-[1fr_120px_100px]" style={{ borderBottom: `1px solid ${LINE_SOFT}` }}>
            <div className="px-4 py-3 sm:doc-r" style={{ minHeight: '150px' }}>
              <span style={cellLabel}>{t('goodsLabel')}</span>
              <div style={{ ...cellValue, marginTop: '6px' }}>{t('goodsLine1')}</div>
              <div style={{ ...cellValue, marginTop: '4px', color: '#8B2A1F', fontWeight: 700 }}>{t('goodsLine2')}</div>

              {/* Carrier's note — the Agora pitch, typeset as a printed remark */}
              <div
                className="mt-5 pt-4"
                style={{ borderTop: `1px dashed ${LINE}` }}
              >
                <span style={cellLabel}>{t('carrierNoteLabel')}</span>
                <p
                  className="m-0"
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    fontStyle: 'italic',
                    fontSize: '14.5px',
                    lineHeight: 1.55,
                    color: '#4A3C2C',
                    maxWidth: '52ch',
                  }}
                >
                  {t('carrierNote')}
                </p>
              </div>
            </div>
            <Cell label={t('weightLabel')} value={t('weightValue')} className="doc-r hidden sm:block" />
            <Cell label={t('measLabel')} value={t('measValue')} className="hidden sm:block" />
          </div>

          {/* ── Freight & charges ────────────────────────────────── */}
          <div className="grid grid-cols-3" style={{ borderBottom: `1px solid ${LINE_SOFT}` }}>
            <Cell label={t('freightLabel')} value={t('freightConcept')} className="doc-r" />
            <Cell label={t('freightRateLabel')} value={t('freightRateValue')} className="doc-r" />
            <Cell label={t('freightTermsLabel')} value={t('freightTermsValue').toUpperCase()} />
          </div>

          {/* ── Issue / originals / signature ────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <div className="sm:doc-r">
              <Cell label={t('issueLabel')} value={`agenteagora.com · ${today}`} />
            </div>
            <div className="sm:doc-r">
              <Cell label={t('originalsLabel')} value={t('originalsValue')} />
            </div>
            <div className="px-4 py-3">
              <span style={cellLabel}>{t('signedLabel')}</span>
              <div
                className="italic"
                style={{
                  fontFamily: 'var(--font-family-old-standard)',
                  fontSize: '24px',
                  color: INK,
                  lineHeight: 1,
                  marginTop: '2px',
                }}
              >
                Agora
              </div>
              <div style={{ ...cellLabel, marginBottom: 0, marginTop: '4px', fontSize: '7.5px' }}>{t('signedRole')}</div>
            </div>
          </div>

          {/* ── The stamp ────────────────────────────────────────── */}
          <div
            aria-hidden
            className="notfound-stamp absolute pointer-events-none select-none"
            style={{ top: '51%', right: '4%' }}
          >
            <div
              className="notfound-stamp-inner text-center"
              style={{
                padding: '14px 26px 12px',
                border: '3.5px solid #8B2A1F',
                borderRadius: '10px',
                outline: '1.5px solid #8B2A1F',
                outlineOffset: '3px',
                transform: 'rotate(-8deg)',
                color: '#8B2A1F',
                mixBlendMode: 'multiply',
                opacity: 0.88,
                maskImage:
                  'radial-gradient(130% 100% at 32% 22%, black 42%, rgba(0,0,0,0.72) 68%, rgba(0,0,0,0.92) 100%)',
                WebkitMaskImage:
                  'radial-gradient(130% 100% at 32% 22%, black 42%, rgba(0,0,0,0.72) 68%, rgba(0,0,0,0.92) 100%)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.30em',
                  textTransform: 'uppercase',
                  paddingBottom: '5px',
                  borderBottom: '1.5px solid rgba(139,42,31,0.65)',
                }}
              >
                {t('stampTop')}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '40px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  lineHeight: 1.05,
                  padding: '4px 0 2px',
                  textIndent: '0.18em',
                }}
              >
                404
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  paddingTop: '5px',
                  borderTop: '1.5px solid rgba(139,42,31,0.65)',
                }}
              >
                {t('stampBottom')}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '7.5px',
                  letterSpacing: '0.14em',
                  marginTop: '4px',
                  opacity: 0.8,
                }}
              >
                {t('stampSerial')} · {today.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* ── Correction available — the product's exception pattern ── */}
        <div
          className="notfound-fix flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mt-8 rounded-[12px] p-5"
          style={{
            background: 'rgba(79,122,60,0.07)',
            border: '1px solid rgba(79,122,60,0.30)',
            boxShadow: '0 8px 24px rgba(43,31,18,0.06)',
          }}
        >
          <div className="flex items-start gap-[9px] flex-1">
            <Check size={14} strokeWidth={2.2} style={{ color: '#4F7A3C', flexShrink: 0, marginTop: '2px' }} />
            <p className="m-0 text-[13.5px] leading-[1.55]" style={{ color: '#5A4A38' }}>
              <span style={{ color: '#4F7A3C', fontWeight: 600 }}>{t('fixLabel')}</span> — {t('fixBody')}
            </p>
          </div>
          <div className="flex items-center gap-[8px] flex-shrink-0">
            <Link
              href="/"
              className="contact-submit inline-flex items-center gap-[7px] text-[13px] font-medium btn-press"
              style={{ padding: '10px 18px', borderRadius: '999px', textDecoration: 'none' }}
            >
              {t('ctaHome')} <ArrowRight size={13} strokeWidth={1.8} />
            </Link>
            <Link
              href="/recursos"
              className="inline-flex items-center text-[13px] font-medium btn-press"
              style={{
                padding: '10px 16px',
                borderRadius: '999px',
                color: INK,
                border: '1px solid rgba(60,42,22,0.22)',
                textDecoration: 'none',
                background: '#FFFCF1',
              }}
            >
              {t('ctaResources')}
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stampIn {
          0%   { opacity: 0; transform: scale(2.1) rotate(-8deg); }
          55%  { opacity: 0.95; transform: scale(0.93) rotate(-8deg); }
          75%  { transform: scale(1.05) rotate(-8deg); }
          100% { opacity: 0.88; transform: scale(1) rotate(-8deg); }
        }
        .notfound-stamp-inner {
          animation: stampIn 460ms cubic-bezier(0.22, 1.2, 0.36, 1) 420ms both;
        }
        @keyframes fixIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .notfound-fix {
          animation: fixIn 500ms cubic-bezier(0.23, 1, 0.32, 1) 1050ms both;
        }
        @keyframes docIn {
          from { opacity: 0; transform: rotate(-1.4deg) translateY(18px); }
          to   { opacity: 1; transform: rotate(-1.4deg) translateY(0); }
        }
        .notfound-doc {
          animation: docIn 550ms cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .doc-r { border-right: 1px solid rgba(43,31,18,0.18); }
        @media (max-width: 639px) {
          .sm\:doc-r { border-right: none; }
        }
        @media (min-width: 640px) {
          .sm\:doc-r { border-right: 1px solid rgba(43,31,18,0.18); }
        }
        @media (prefers-reduced-motion: reduce) {
          .notfound-doc, .notfound-stamp-inner, .notfound-fix {
            animation: none !important;
            opacity: 1 !important;
          }
          .notfound-doc { transform: rotate(-1.4deg) !important; }
          .notfound-stamp-inner { transform: rotate(-8deg) !important; opacity: 0.88 !important; }
        }
      `}</style>
    </main>
  )
}
