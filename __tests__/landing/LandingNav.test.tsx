import { render, screen, fireEvent } from '@testing-library/react'
import { LandingNav } from '@/components/landing/LandingNav'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
}))

// Module-level mock functions so tests can assert on them
const mockReplace = vi.fn()
const mockRefresh = vi.fn()

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  usePathname: () => '/',
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: { alt: string }) => <img alt={props.alt} />,
}))

describe('LandingNav', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockRefresh.mockClear()
  })

  it('renders the Agora wordmark', () => {
    render(<LandingNav />)
    expect(screen.getByText('Agora')).toBeInTheDocument()
  })

  it('renders the primary CTA (desktop and mobile menu)', () => {
    render(<LandingNav />)
    const ctas = screen.getAllByText('cta')
    expect(ctas.length).toBeGreaterThanOrEqual(1)
    for (const cta of ctas) {
      expect(cta.closest('a')).toHaveAttribute('href', '#contact')
    }
  })

  it('renders language toggle with ES and EN', () => {
    render(<LandingNav />)
    expect(screen.getByText('ES')).toBeInTheDocument()
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('calls router.replace and router.refresh when locale toggle is clicked', () => {
    render(<LandingNav />)
    const toggleBtn = screen.getByRole('button', { name: /ES\s*\/\s*EN/i })
    fireEvent.click(toggleBtn)
    expect(mockReplace).toHaveBeenCalledWith('/en')
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('renders desktop and mobile sign-in links to the universal app login', () => {
    render(<LandingNav />)

    const signInLinks = screen.getAllByRole('link', { name: 'signIn', hidden: true })
    expect(signInLinks).toHaveLength(2)
    for (const link of signInLinks) {
      expect(link).toHaveAttribute('href', 'https://app.agenteagora.com/login')
      expect(link).toHaveClass('whitespace-nowrap')
    }

    const desktopLink = signInLinks.find((link) => link.classList.contains('fixed'))
    expect(desktopLink).toHaveClass('top-6', 'right-6', 'hidden', 'lg:inline-flex')

    const mobileMenu = document.querySelector('[data-mobile-menu]')
    expect(mobileMenu).not.toBeNull()
    expect(mobileMenu).toHaveClass('lg:hidden')
    expect(mobileMenu).toContainElement(
      signInLinks.find((link) => mobileMenu?.contains(link)) ?? null
    )
  })

  it('removes the closed mobile menu from the accessibility tree', () => {
    render(<LandingNav />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    const mobileMenu = document.querySelector('[data-mobile-menu]') as HTMLElement
    expect(menuButton).toHaveAttribute('aria-controls', 'landing-mobile-menu')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(mobileMenu).toHaveAttribute('id', 'landing-mobile-menu')
    expect(mobileMenu).toHaveAttribute('aria-hidden', 'true')
    expect(mobileMenu).toHaveAttribute('inert')
    expect(screen.getAllByRole('link', { name: 'signIn' })).toHaveLength(1)
  })

  it('exposes the opened mobile menu and closes it when sign-in is selected', () => {
    render(<LandingNav />)

    const menuButton = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(menuButton)
    const mobileMenu = document.querySelector('[data-mobile-menu]') as HTMLElement
    expect(mobileMenu).toHaveStyle({ opacity: '1' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(mobileMenu).toHaveAttribute('aria-hidden', 'false')
    expect(mobileMenu).not.toHaveAttribute('inert')
    expect(screen.getAllByRole('link', { name: 'signIn' })).toHaveLength(2)

    const mobileSignIn = screen
      .getAllByRole('link', { name: 'signIn' })
      .find((link) => mobileMenu.contains(link))
    expect(mobileSignIn).toBeDefined()
    fireEvent.click(mobileSignIn!)

    expect(mobileMenu).toHaveStyle({ opacity: '0' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(mobileMenu).toHaveAttribute('aria-hidden', 'true')
    expect(mobileMenu).toHaveAttribute('inert')
    expect(screen.getAllByRole('link', { name: 'signIn' })).toHaveLength(1)
  })
})
