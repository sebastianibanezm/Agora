import type { Metadata } from 'next'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingPillars } from '@/components/landing/LandingPillars'
import { LandingProduct } from '@/components/landing/LandingProduct'
import { LandingStats } from '@/components/landing/LandingStats'
import { LandingContact } from '@/components/landing/LandingContact'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Agora — Shipment Intelligence para Exportadores',
  description:
    'Detecta desvíos, sincroniza documentos y mantén a tu equipo en contexto. La plataforma de trazabilidad para exportadores de fruta.',
}

export default function LandingPage() {
  return (
    <>
      <main>
        <LandingHero />
        <LandingProblem />
        <LandingPillars />
        <LandingProduct />
        <LandingStats />
        <LandingContact />
      </main>
      <LandingFooter />
    </>
  )
}
