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

  it('renders the primary CTA', () => {
    render(<LandingNav />)
    expect(screen.getByText('cta')).toBeInTheDocument()
  })

  it('renders language toggle with ES and EN', () => {
    render(<LandingNav />)
    expect(screen.getByText('ES')).toBeInTheDocument()
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('calls router.replace and router.refresh when locale toggle is clicked', () => {
    render(<LandingNav />)
    const toggleBtn = screen.getByRole('button')
    fireEvent.click(toggleBtn)
    expect(mockReplace).toHaveBeenCalledWith('/')
    expect(mockRefresh).toHaveBeenCalled()
  })
})
