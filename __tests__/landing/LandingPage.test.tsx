import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import LandingPage from '@/app/[locale]/(marketing)/page'

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => `faq.${key}`,
}))

// Mock all landing components
vi.mock('@/components/landing/LandingHero', () => ({ LandingHero: () => <div data-testid="landing-hero" /> }))
vi.mock('@/components/landing/LandingProof', () => ({ LandingProof: () => <div data-testid="landing-proof" /> }))
vi.mock('@/components/landing/LandingProblem', () => ({ LandingProblem: () => <div data-testid="landing-problem" /> }))
vi.mock('@/components/landing/LandingProcess', () => ({ LandingProcess: () => <div data-testid="landing-process" /> }))
vi.mock('@/components/landing/LandingCompare', () => ({ LandingCompare: () => <div data-testid="landing-compare" /> }))
vi.mock('@/components/landing/LandingRoadmap', () => ({ LandingRoadmap: () => <div data-testid="landing-roadmap" /> }))
vi.mock('@/components/landing/LandingHowItWorks', () => ({ LandingHowItWorks: () => <div data-testid="landing-how-it-works" /> }))
vi.mock('@/components/landing/LandingContact', () => ({ LandingContact: () => <div data-testid="landing-contact" /> }))
vi.mock('@/components/landing/LandingFaq', () => ({ LandingFaq: () => <div data-testid="landing-faq" /> }))
vi.mock('@/components/landing/LandingResources', () => ({ LandingResources: () => <div data-testid="landing-resources" /> }))
vi.mock('@/components/landing/LandingFooter', () => ({ LandingFooter: () => <div data-testid="landing-footer" /> }))

const SECTION_IDS = [
  'landing-hero',
  'landing-proof',
  'landing-problem',
  'landing-process',
  'landing-compare',
  'landing-roadmap',
  'landing-how-it-works',
  'landing-contact',
  'landing-faq',
  'landing-resources',
] as const

describe('LandingPage', () => {
  it('renders all landing sections in order', async () => {
    const { container } = render(await LandingPage({ params: Promise.resolve({ locale: 'es' }) }))
    const rendered = Array.from(container.querySelectorAll('[data-testid^="landing-"]')).map(
      (el) => el.getAttribute('data-testid')
    )
    expect(rendered).toEqual([...SECTION_IDS, 'landing-footer'])
  })

  it('wraps all sections in a main element', async () => {
    const { container } = render(await LandingPage({ params: Promise.resolve({ locale: 'es' }) }))
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    for (const id of SECTION_IDS) {
      expect(main).toContainElement(screen.getByTestId(id))
    }
  })

  it('renders footer outside main', async () => {
    const { container } = render(await LandingPage({ params: Promise.resolve({ locale: 'es' }) }))
    const main = container.querySelector('main')
    expect(main).not.toContainElement(screen.getByTestId('landing-footer'))
  })
})
