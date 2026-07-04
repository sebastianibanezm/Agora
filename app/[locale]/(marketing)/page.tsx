import type { Metadata } from 'next'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingProof } from '@/components/landing/LandingProof'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingPillars } from '@/components/landing/LandingPillars'
import { LandingProduct } from '@/components/landing/LandingProduct'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingCtaBand } from '@/components/landing/LandingCtaBand'
import { LandingContact } from '@/components/landing/LandingContact'
import { LandingFaq } from '@/components/landing/LandingFaq'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Agora — Export Intelligence para Exportadores',
  description:
    'Coordina documentos, detecta excepciones y mantén a tu equipo en contexto. La capa operacional para exportadoras.',
  openGraph: {
    title: 'Agora — Export Intelligence para Exportadores',
    description:
      'Automatiza tu flujo documental, elimina multas por errores y expedita la cobranza. La plataforma operacional agéntica para exportaciones.',
    url: 'https://www.agenteagora.com',
    siteName: 'Agora',
    images: [{ url: 'https://www.agenteagora.com/og-image.png', width: 1200, height: 630 }],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agora — Export Intelligence para Exportadores',
    description:
      'Automatiza tu flujo documental, elimina multas por errores y expedita la cobranza.',
    images: ['https://www.agenteagora.com/og-image.png'],
  },
}

export default function LandingPage() {
  return (
    <>
      <main id="landing-main">
        <LandingHero />
        <LandingProof />
        <LandingProblem />
        <LandingPillars />
        <LandingCtaBand />
        <LandingProduct />
        <LandingHowItWorks />
        <LandingContact />
        <LandingFaq />
      </main>
      <LandingFooter />
    </>
  )
}
