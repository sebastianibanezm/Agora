import { render, screen } from '@testing-library/react'
import { LandingHero } from '@/components/landing/LandingHero'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))
vi.mock('@/components/landing/LandingNav', () => ({ LandingNav: () => <nav data-testid="nav" /> }))

describe('LandingHero', () => {
  it('renders the nav', () => {
    render(<LandingHero />)
    expect(screen.getByTestId('nav')).toBeInTheDocument()
  })

  it('renders headline copy keys', () => {
    render(<LandingHero />)
    expect(screen.getByText('hero.headline')).toBeInTheDocument()
    expect(screen.getByText('hero.headlineAccent')).toBeInTheDocument()
  })

  it('renders both CTA buttons', () => {
    render(<LandingHero />)
    expect(screen.getByText('hero.ctaPrimary')).toBeInTheDocument()
    expect(screen.getByText('hero.ctaSecondary')).toBeInTheDocument()
  })

  it('renders the scroll cue', () => {
    render(<LandingHero />)
    expect(screen.getByText('hero.scroll')).toBeInTheDocument()
  })
})
