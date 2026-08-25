import Image from 'next/image'
import Link from 'next/link'
import type { LegalDocument, LegalKind, LegalLocale } from '@/lib/legal-content'
import { LandingFooter } from '@/components/landing/LandingFooter'

export function legalPath(locale: LegalLocale, kind: LegalKind) {
  const prefix = locale === 'en' ? '/en' : ''
  return `${prefix}/${kind}`
}

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  const otherKind: LegalKind = document.kind === 'privacy' ? 'terms' : 'privacy'
  const otherDocumentLabel = document.locale === 'es'
    ? (otherKind === 'privacy' ? 'Política de Privacidad' : 'Términos de Servicio')
    : (otherKind === 'privacy' ? 'Privacy Policy' : 'Terms of Service')
  const homePath = document.locale === 'en' ? '/en' : '/'
  const homeLabel = document.locale === 'es' ? 'Inicio' : 'Home'
  const contentsLabel = document.locale === 'es' ? 'En esta página' : 'On this page'
  const effectiveLabel = document.locale === 'es' ? 'Vigente desde' : 'Effective date'

  return (
    <>
      <header className="border-b border-[rgba(60,42,22,0.12)] bg-[#F8F2E4]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-12">
          <Link href={homePath} className="inline-flex items-center gap-2 text-[#2B1F12] no-underline">
            <Image src="/landing/lambda-logo.png" alt="" width={26} height={26} className="object-contain" />
            <span className="italic text-[20px]" style={{ fontFamily: 'var(--font-family-old-standard)' }}>Agora</span>
            <span className="text-[10px] uppercase tracking-[0.13em] text-[#8A7860]" style={{ fontFamily: 'var(--font-family-mono)' }}>{homeLabel}</span>
          </Link>
          <Link href={legalPath(document.locale, otherKind)} className="text-[12px] font-medium text-[#2B1F12] underline underline-offset-4">
            {otherDocumentLabel}
          </Link>
        </div>
      </header>
      <main className="bg-[#F8F2E4] pb-24">
        <article className="mx-auto max-w-[1100px] px-5 pt-14 sm:px-8 sm:pt-20 lg:px-12">
          <div className="max-w-[730px] border-b border-[rgba(60,42,22,0.12)] pb-12">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-[#8A7860]" style={{ fontFamily: 'var(--font-family-mono)' }}>{document.eyebrow}</span>
            <h1 className="mt-4 font-normal italic text-[#2B1F12]" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(38px, 5vw, 58px)', lineHeight: 1.06, letterSpacing: '-0.02em' }}>{document.title}</h1>
            <p className="mt-5 max-w-[60ch] text-[17px] leading-[1.7] text-[#5A4A38]">{document.summary}</p>
            <p className="mt-5 text-[12px] uppercase tracking-[0.1em] text-[#8A7860]" style={{ fontFamily: 'var(--font-family-mono)' }}>{effectiveLabel}: {document.effectiveDate}</p>
            <p className="mt-5 text-[14px] text-[#5A4A38]"><strong className="font-medium text-[#2B1F12]">{document.provider}</strong></p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-16">
            <aside className="h-fit rounded-[10px] border border-[rgba(60,42,22,0.12)] bg-[#F1E8D5] p-5 lg:sticky lg:top-6">
              <h2 className="m-0 text-[10px] uppercase tracking-[0.14em] text-[#8A7860]" style={{ fontFamily: 'var(--font-family-mono)' }}>{contentsLabel}</h2>
              <ol className="mt-4 flex list-none flex-col gap-2 p-0 text-[13px] leading-[1.35]">
                {document.sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className="text-[#5A4A38] underline decoration-[rgba(90,74,56,0.35)] underline-offset-4">{section.title}</a></li>)}
              </ol>
            </aside>
            <div className="max-w-[700px]">
              {document.sections.map((section) => (
                <section id={section.id} key={section.id} className="scroll-mt-8 border-b border-[rgba(60,42,22,0.10)] py-8 first:pt-0">
                  <h2 className="m-0 font-normal italic text-[#2B1F12]" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(24px, 3vw, 31px)', lineHeight: 1.15 }}>{section.title}</h2>
                  {section.paragraphs.map((paragraph, index) => <p key={index} className="mb-0 mt-4 text-[16px] leading-[1.75] text-[#5A4A38]">{paragraph}</p>)}
                  {section.contactEmail && <a href={`mailto:${section.contactEmail}`} className="mt-4 inline-block text-[15px] font-medium text-[#2B1F12] underline underline-offset-4">{section.contactEmail}</a>}
                </section>
              ))}
            </div>
          </div>
        </article>
      </main>
      <LandingFooter />
    </>
  )
}
