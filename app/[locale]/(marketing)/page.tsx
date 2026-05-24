import type { Metadata } from 'next'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingEcosystem } from '@/components/landing/LandingEcosystem'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingPillars } from '@/components/landing/LandingPillars'
import { LandingProduct } from '@/components/landing/LandingProduct'
import { LandingFinancial } from '@/components/landing/LandingFinancial'
import { LandingStats } from '@/components/landing/LandingStats'
import { LandingContact } from '@/components/landing/LandingContact'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Agora — Export Intelligence para Exportadores',
  description:
    'Coordina documentos, detecta excepciones y mantén a tu equipo en contexto. La capa operacional para exportadoras chilenas.',
}

export default function LandingPage() {
  return (
    <>
      <main>
        <LandingHero />
        <LandingEcosystem />
        <LandingProblem />
        <LandingPillars />
        <LandingProduct />
        <LandingFinancial />
        <LandingStats />
        <LandingContact />
      </main>
      <LandingFooter />
    </>
  )
}
