import React from 'react'

/** Eyebrow + italic display title (with an accent line) + optional lede, shared by the landing sections. */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  lede,
  className = '',
}: {
  eyebrow: string
  title: string
  accent?: string
  lede?: string
  className?: string
}) {
  return (
    <div className={`max-w-[720px] stagger-item ${className}`}>
      <span
        className="block mb-3 text-[10px] uppercase tracking-[0.18em]"
        style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860' }}
      >
        {eyebrow}
      </span>
      <h2
        className="italic font-normal m-0"
        style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: 'clamp(32px, 3.4vw, 46px)',
          lineHeight: 1.06,
          letterSpacing: '-0.015em',
          color: '#2B1F12',
        }}
      >
        {title}
        {accent && (
          <>
            <br />
            <span style={{ color: '#B97A1F' }}>{accent}</span>
          </>
        )}
      </h2>
      {lede && (
        <p className="mt-6 mb-0 text-[16px] leading-[1.7]" style={{ color: '#5A4A38', maxWidth: '62ch' }}>
          {lede}
        </p>
      )}
    </div>
  )
}
