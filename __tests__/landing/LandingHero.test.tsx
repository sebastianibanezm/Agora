import { fireEvent, render, screen } from '@testing-library/react'
import { LandingHero } from '@/components/landing/LandingHero'

const mockCaptureContactCta = vi.hoisted(() => vi.fn())

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/image', () => ({
  default: (props: { alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element -- Test double for next/image.
    return <img alt={props.alt} />
  },
}))
vi.mock('@/components/landing/LandingNav', () => ({ LandingNav: () => <nav data-testid="nav" /> }))
vi.mock('@/lib/analytics', () => ({ captureContactCta: mockCaptureContactCta }))

describe('LandingHero', () => {
  beforeEach(() => {
    mockCaptureContactCta.mockClear()
  })

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

  it('tracks the hero CTA source', () => {
    render(<LandingHero />)
    const cta = screen.getByText('hero.ctaPrimary').closest('a')!
    cta.addEventListener('click', event => event.preventDefault())
    fireEvent.click(cta)
    expect(mockCaptureContactCta).toHaveBeenCalledWith('hero')
  })
})
