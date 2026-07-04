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

  it('renders the primary CTA linking to contact', () => {
    render(<LandingHero />)
    const cta = screen.getByText('hero.ctaPrimary')
    expect(cta).toBeInTheDocument()
    expect(cta.closest('a')).toHaveAttribute('href', '#contact')
  })
})
