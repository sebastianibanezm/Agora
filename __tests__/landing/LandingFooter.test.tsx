import { render, screen, fireEvent } from '@testing-library/react'
import { LandingFooter } from '@/components/landing/LandingFooter'

// Module-level mock functions so tests can assert on them
const mockReplace = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
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
    expect(screen.getByText('footer.linkSolutions').closest('a')).toHaveAttribute('href', '#solutions')
    expect(screen.getByText('footer.linkPlatform').closest('a')).toHaveAttribute('href', '#product')
    expect(screen.getByText('footer.linkHow').closest('a')).toHaveAttribute('href', '#how-it-works')
    expect(screen.getByText('footer.linkFaq').closest('a')).toHaveAttribute('href', '#faq')
  })

  it('renders contact email as mailto link', () => {
    render(<LandingFooter />)
    expect(screen.getByText('footer.email').closest('a')).toHaveAttribute('href', 'mailto:footer.email')
  })

  it('renders copyright', () => {
    render(<LandingFooter />)
    expect(screen.getByText('footer.copyright')).toBeInTheDocument()
  })

  it('calls router.replace and router.refresh when locale toggle is clicked', () => {
    render(<LandingFooter />)
    const toggleBtn = screen.getByRole('button')
    fireEvent.click(toggleBtn)
    expect(mockReplace).toHaveBeenCalledWith('/')
    expect(mockRefresh).toHaveBeenCalled()
  })
})
