import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import LandingPage from '@/app/[locale]/(marketing)/page'

// Mock all landing components
vi.mock('@/components/landing/LandingHero', () => ({ LandingHero: () => <div data-testid="landing-hero" /> }))
vi.mock('@/components/landing/LandingProblem', () => ({ LandingProblem: () => <div data-testid="landing-problem" /> }))
vi.mock('@/components/landing/LandingPillars', () => ({ LandingPillars: () => <div data-testid="landing-pillars" /> }))
vi.mock('@/components/landing/LandingProduct', () => ({ LandingProduct: () => <div data-testid="landing-product" /> }))
vi.mock('@/components/landing/LandingStats', () => ({ LandingStats: () => <div data-testid="landing-stats" /> }))
vi.mock('@/components/landing/LandingContact', () => ({ LandingContact: () => <div data-testid="landing-contact" /> }))
vi.mock('@/components/landing/LandingFooter', () => ({ LandingFooter: () => <div data-testid="landing-footer" /> }))

describe('LandingPage', () => {
  it('renders all 7 landing sections', async () => {
    render(await LandingPage())
    expect(screen.getByTestId('landing-hero')).toBeInTheDocument()
    expect(screen.getByTestId('landing-problem')).toBeInTheDocument()
    expect(screen.getByTestId('landing-pillars')).toBeInTheDocument()
    expect(screen.getByTestId('landing-product')).toBeInTheDocument()
    expect(screen.getByTestId('landing-stats')).toBeInTheDocument()
    expect(screen.getByTestId('landing-contact')).toBeInTheDocument()
    expect(screen.getByTestId('landing-footer')).toBeInTheDocument()
  })

  it('wraps sections 2-7 in a main element', async () => {
    const { container } = render(await LandingPage())
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).toContainElement(screen.getByTestId('landing-hero'))
    expect(main).toContainElement(screen.getByTestId('landing-problem'))
    expect(main).toContainElement(screen.getByTestId('landing-pillars'))
    expect(main).toContainElement(screen.getByTestId('landing-product'))
    expect(main).toContainElement(screen.getByTestId('landing-stats'))
    expect(main).toContainElement(screen.getByTestId('landing-contact'))
  })

  it('renders footer outside main', async () => {
    const { container } = render(await LandingPage())
    const main = container.querySelector('main')
    expect(main).not.toContainElement(screen.getByTestId('landing-footer'))
  })
})
