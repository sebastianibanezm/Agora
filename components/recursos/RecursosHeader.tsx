import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Light top bar for content-hub pages: paper background instead of the
 * landing hero's dark glass, same brand voice.
 */
export function RecursosHeader() {
  return (
    <header
      className="w-full"
      style={{ borderBottom: '1px solid rgba(60,42,22,0.08)', background: '#FCF7EA' }}
    >
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-[9px]" style={{ textDecoration: 'none' }}>
          <Image src="/landing/lambda-logo.png" alt="Agora" width={28} height={28} className="object-contain" />
          <span
            className="italic text-[18px]"
            style={{ fontFamily: 'var(--font-family-old-standard)', color: '#2B1F12', letterSpacing: '0.01em' }}
          >
            Agora
          </span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link
            href="/recursos"
            className="text-[12px] uppercase tracking-[0.12em]"
            style={{ fontFamily: 'var(--font-family-mono)', color: '#8A7860', textDecoration: 'none' }}
          >
            Recursos
          </Link>
          <Link
            href="/#contact"
            className="contact-submit inline-flex items-center gap-[6px] text-[12px] font-medium btn-press"
            style={{ padding: '8px 16px', borderRadius: '999px', textDecoration: 'none' }}
          >
            Agenda una demo <ArrowRight size={12} strokeWidth={1.8} />
          </Link>
        </nav>
      </div>
    </header>
  )
}
