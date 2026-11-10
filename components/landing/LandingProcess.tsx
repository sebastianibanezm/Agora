'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { captureContactCta } from '@/lib/analytics'
import { BrowserFrame, FrameChrome, FRAME_STYLE } from './BrowserFrame'
import { SectionHeading } from './SectionHeading'

// Production screens on example data, captured at 2x.
const STEPS = [
  { n: '1', src: '/landing/process/proceso-builder.png', width: 2032, height: 1638 },
  { n: '2', src: '/landing/process/contract.png', width: 2880, height: 2000 },
  { n: '3', src: '/landing/process/review-booking.png', width: 2880, height: 1800 },
  { n: '4', src: '/landing/process/invoice-review.png', width: 2880, height: 1800 },
  { n: '5', src: '/landing/process/send.png', width: 1480, height: 1480 },
] as const

const LINE = '1px solid rgba(60,42,22,0.12)'

/** Index of the step crossing the middle of the viewport. */
function useActiveStep(count: number) {
  const refs = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.slice(0, count).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [count])

  return { active, refs }
}

/**
 * How Agora works: on desktop the steps scroll past one browser frame that
 * stays in place and swaps its screen; on phones each step shows its own screen.
 */
export function LandingProcess() {
  const t = useTranslations('landing.process')
  const headRef = useReveal<HTMLDivElement>(0.3)
  const { active, refs } = useActiveStep(STEPS.length)
  const current = STEPS[active] ?? STEPS[0]

  return (
    <section id="how-it-works" className="landing-section" style={{ borderTop: LINE }}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12">
        <div ref={headRef} className="reveal mb-10 lg:mb-14">
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} accent={t('titleAccent')} lede={t('lede')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] gap-8 lg:gap-[72px]">
          <ol className="m-0 p-0 list-none">
            {STEPS.map((step, i) => (
              <li
                key={step.n}
                ref={(el) => { refs.current[i] = el }}
                data-step={i}
                className="process-step grid content-center gap-3 pb-11 lg:pb-0 lg:py-7 lg:pl-7 lg:min-h-[44vh]"
                data-active={i === active ? 'true' : 'false'}
              >
                <span
                  className="text-[12px] tracking-[0.12em]"
                  style={{ fontFamily: 'var(--font-family-mono)', color: '#6E5D45' }}
                >
                  0{step.n} / 05
                </span>
                <h3
                  className="italic font-normal m-0"
                  style={{
                    fontFamily: 'var(--font-family-display)',
                    fontSize: 'clamp(21px, 2vw, 26px)',
                    lineHeight: 1.15,
                    color: '#2B1F12',
                  }}
                >
                  {t(`step${step.n}Title`)}
                </h3>
                <p className="m-0 text-[15.5px] leading-[1.65]" style={{ color: '#4E4030', maxWidth: '44ch' }}>
                  {t(`step${step.n}Body`)}
                </p>
                <div className="lg:hidden mt-[10px] min-w-0">
                  <BrowserFrame
                    src={step.src}
                    alt={t(`step${step.n}Alt`)}
                    label={t(`step${step.n}Bar`)}
                    width={step.width}
                    height={step.height}
                    sizes="100vw"
                  />
                </div>
              </li>
            ))}
          </ol>

          <div className="hidden lg:grid self-start sticky gap-[14px]" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 100px)' }} aria-hidden>
            <div className="overflow-hidden rounded-[14px]" style={FRAME_STYLE}>
              <FrameChrome
                label={`app.agenteagora.com · ${t(`step${current.n}Bar`)}`}
                note={`${active + 1} / ${STEPS.length}`}
              />
              <div
                className="relative transition-[aspect-ratio] duration-300"
                style={{ aspectRatio: `${current.width} / ${current.height}`, background: '#FFFBF2' }}
              >
                {STEPS.map((step, i) => (
                  <Image
                    key={step.n}
                    src={step.src}
                    alt=""
                    fill
                    sizes="760px"
                    className="object-contain object-left-top transition-opacity duration-[450ms]"
                    style={{ opacity: i === active ? 1 : 0 }}
                  />
                ))}
              </div>
            </div>
            <p className="m-0 text-[12.5px] leading-[1.5]" style={{ fontFamily: 'var(--font-family-mono)', color: '#6E5D45' }}>
              {t(`step${current.n}Caption`)}
            </p>
          </div>
        </div>

        <div
          className="mt-10 lg:mt-[72px] flex flex-wrap items-center justify-between gap-x-8 gap-y-5 rounded-[16px] p-6 sm:p-9"
          style={{ background: '#FFFBF2', border: LINE }}
        >
          <div>
            <h3
              className="italic font-normal m-0"
              style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(22px, 2.4vw, 30px)', lineHeight: 1.15, color: '#2B1F12' }}
            >
              {t('ctaTitle')}
            </h3>
            <p className="mt-[6px] mb-0 text-[15.5px]" style={{ color: '#4E4030' }}>
              {t('ctaBody')}
            </p>
          </div>
          <a
            href="#contact"
            onClick={() => captureContactCta('process')}
            className="cta-ink btn-press inline-flex items-center gap-[10px] h-12 px-[22px] rounded-full text-[15px] font-medium whitespace-nowrap"
          >
            {t('cta')} <ArrowRight size={14} strokeWidth={1.8} />
          </a>
        </div>
        <p
          className="mt-4 mb-0 text-[12px] uppercase tracking-[0.10em] text-center"
          style={{ fontFamily: 'var(--font-family-mono)', color: '#6E5D45' }}
        >
          {t('shotNote')}
        </p>
      </div>
    </section>
  )
}
