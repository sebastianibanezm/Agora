import { render, screen, fireEvent } from '@testing-library/react'
import { LandingFooter } from '@/components/landing/LandingFooter'
import esMessages from '@/messages/es.json'
import enMessages from '@/messages/en.json'

// Module-level mock functions so tests can assert on them
const mockReplace = vi.fn()
const mockRefresh = vi.fn()
const mockLocale = vi.hoisted(() => ({ value: 'es' }))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => mockLocale.value,
}))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
  usePathname: () => '/',
}))

describe('LandingFooter', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    mockRefresh.mockClear()
    mockLocale.value = 'es'
  })

  it('renders the Agora wordmark', () => {
    render(<LandingFooter />)
    expect(screen.getByText('Agora')).toBeInTheDocument()
  })

  it('renders footer column headings', () => {
    render(<LandingFooter />)
    expect(screen.getByText('footer.colPlatform')).toBeInTheDocument()
    expect(screen.getByText('footer.colCompany')).toBeInTheDocument()
  })

  it('renders section anchor links', () => {
    render(<LandingFooter />)
    expect(screen.getByText('footer.linkSolutions').closest('a')).toHaveAttribute('href', '/#solutions')
    expect(screen.getByText('footer.linkPlatform').closest('a')).toHaveAttribute('href', '/#product')
    expect(screen.getByText('footer.linkHow').closest('a')).toHaveAttribute('href', '/#how-it-works')
    expect(screen.getByText('footer.linkFaq').closest('a')).toHaveAttribute('href', '/#faq')
  })

  it('routes Spanish legal links to unprefixed pages', () => {
    render(<LandingFooter />)
    expect(screen.getByText('footer.linkPrivacy').closest('a')).toHaveAttribute('href', '/privacy')
    expect(screen.getByText('footer.linkTerms').closest('a')).toHaveAttribute('href', '/terms')
  })

  it('routes English legal links and homepage sections to English paths', () => {
    mockLocale.value = 'en'
    render(<LandingFooter />)
    expect(screen.getByText('footer.linkPrivacy').closest('a')).toHaveAttribute('href', '/en/privacy')
    expect(screen.getByText('footer.linkTerms').closest('a')).toHaveAttribute('href', '/en/terms')
    expect(screen.getByText('footer.linkSolutions').closest('a')).toHaveAttribute('href', '/en/#solutions')
  })

  it('renders contact email as mailto link', () => {
    render(<LandingFooter />)
    expect(screen.getByText('footer.email').closest('a')).toHaveAttribute('href', 'mailto:footer.email')
  })

  it('publishes the working replies subdomain in both locales', () => {
    expect(esMessages.landing.footer.email).toBe('hola@replies.agenteagora.com')
    expect(enMessages.landing.footer.email).toBe('hola@replies.agenteagora.com')
  })

  it('renders copyright', () => {
    render(<LandingFooter />)
    expect(screen.getByText('footer.copyright')).toBeInTheDocument()
  })

  it('calls router.replace and router.refresh when locale toggle is clicked', () => {
    render(<LandingFooter />)
    const toggleBtn = screen.getByRole('button')
    fireEvent.click(toggleBtn)
    expect(mockReplace).toHaveBeenCalledWith('/en')
    expect(mockRefresh).toHaveBeenCalled()
  })
})
