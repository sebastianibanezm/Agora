import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import LandingPage from '@/app/[locale]/(marketing)/page'

// Mock all landing components
vi.mock('@/components/landing/LandingHero', () => ({ LandingHero: () => <div data-testid="landing-hero" /> }))
vi.mock('@/components/landing/LandingProof', () => ({ LandingProof: () => <div data-testid="landing-proof" /> }))
vi.mock('@/components/landing/LandingProblem', () => ({ LandingProblem: () => <div data-testid="landing-problem" /> }))
vi.mock('@/components/landing/LandingPillars', () => ({ LandingPillars: () => <div data-testid="landing-pillars" /> }))
vi.mock('@/components/landing/LandingProduct', () => ({ LandingProduct: () => <div data-testid="landing-product" /> }))
vi.mock('@/components/landing/LandingHowItWorks', () => ({ LandingHowItWorks: () => <div data-testid="landing-how-it-works" /> }))
vi.mock('@/components/landing/LandingCtaBand', () => ({ LandingCtaBand: () => <div data-testid="landing-cta-band" /> }))
vi.mock('@/components/landing/LandingContact', () => ({ LandingContact: () => <div data-testid="landing-contact" /> }))
vi.mock('@/components/landing/LandingFaq', () => ({ LandingFaq: () => <div data-testid="landing-faq" /> }))
vi.mock('@/components/landing/LandingFooter', () => ({ LandingFooter: () => <div data-testid="landing-footer" /> }))

const SECTION_IDS = [
  'landing-hero',
  'landing-proof',
  'landing-problem',
  'landing-pillars',
  'landing-product',
  'landing-cta-band',
  'landing-how-it-works',
  'landing-contact',
  'landing-faq',
] as const

describe('LandingPage', () => {
  it('renders all 9 landing sections in order', async () => {
    const { container } = render(await LandingPage())
    const rendered = Array.from(container.querySelectorAll('[data-testid^="landing-"]')).map(
      (el) => el.getAttribute('data-testid')
    )
    expect(rendered).toEqual([...SECTION_IDS, 'landing-footer'])
  })

  it('wraps all sections in a main element', async () => {
    const { container } = render(await LandingPage())
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    for (const id of SECTION_IDS) {
      expect(main).toContainElement(screen.getByTestId(id))
    }
  })

  it('renders footer outside main', async () => {
    const { container } = render(await LandingPage())
    const main = container.querySelector('main')
    expect(main).not.toContainElement(screen.getByTestId('landing-footer'))
  })
})
