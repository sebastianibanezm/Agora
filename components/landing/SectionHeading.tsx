import React from 'react'

const TONES = {
  light: { eyebrow: '#6E5D45', title: '#2B1F12', accent: '#A86B14', lede: '#4E4030' },
  dark: { eyebrow: '#C9B9A0', title: '#F3EAD8', accent: '#E2AE55', lede: '#C9B9A0' },
} as const

/** Eyebrow + display title (with an italic gold accent line) + optional lede, shared by the landing sections. */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  lede,
  tone = 'light',
  className = '',
}: {
  eyebrow: string
  title: string
  accent?: string
  lede?: string
  tone?: keyof typeof TONES
  className?: string
}) {
  const colors = TONES[tone]

  return (
    <div className={`max-w-[760px] stagger-item ${className}`}>
      <span
        className="block mb-4 text-[12px] uppercase tracking-[0.14em]"
        style={{ fontFamily: 'var(--font-family-mono)', color: colors.eyebrow }}
      >
        {eyebrow}
      </span>
      <h2
        className="font-normal m-0"
        style={{
          fontFamily: 'var(--font-family-display)',
          fontVariationSettings: '"opsz" 144',
          fontSize: 'clamp(34px, 4.4vw, 56px)',
          lineHeight: 1.04,
          letterSpacing: '-0.015em',
          color: colors.title,
          textWrap: 'balance',
        }}
      >
        {title}
        {accent && (
          <>
            {' '}
            <span className="italic" style={{ color: colors.accent }}>{accent}</span>
          </>
        )}
      </h2>
      {lede && (
        <p className="mt-6 mb-0 text-[17px] leading-[1.65]" style={{ color: colors.lede, maxWidth: '60ch' }}>
          {lede}
        </p>
      )}
    </div>
  )
}
