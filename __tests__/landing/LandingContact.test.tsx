import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LandingContact } from '@/components/landing/LandingContact'

const {
  mockCaptureContactFormStarted,
  mockCaptureContactFormSubmitted,
  mockCaptureContactFormFailed,
  mockIdentifyContactLead,
  mockFetch,
} = vi.hoisted(() => ({
  mockCaptureContactFormStarted: vi.fn(),
  mockCaptureContactFormSubmitted: vi.fn(),
  mockCaptureContactFormFailed: vi.fn(),
  mockIdentifyContactLead: vi.fn(),
  mockFetch: vi.fn(),
}))

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('@/lib/analytics', () => ({
  captureContactFormStarted: mockCaptureContactFormStarted,
  captureContactFormSubmitted: mockCaptureContactFormSubmitted,
  captureContactFormFailed: mockCaptureContactFormFailed,
  identifyContactLead: mockIdentifyContactLead,
}))

vi.stubGlobal('fetch', mockFetch)

function fillContactForm(container: HTMLElement) {
  fireEvent.change(container.querySelector('input[name="firstName"]')!, { target: { value: 'María' } })
  fireEvent.change(container.querySelector('input[name="lastName"]')!, { target: { value: 'Soto' } })
  fireEvent.change(container.querySelector('input[name="company"]')!, { target: { value: 'Valle Fresco' } })
  fireEvent.change(container.querySelector('input[name="email"]')!, { target: { value: 'MARIA@EXAMPLE.COM' } })
  fireEvent.click(screen.getByText('100–500'))
}

describe('LandingContact', () => {
  beforeEach(() => {
    mockCaptureContactFormStarted.mockClear()
    mockCaptureContactFormSubmitted.mockClear()
    mockCaptureContactFormFailed.mockClear()
    mockIdentifyContactLead.mockClear()
    mockFetch.mockReset()
  })

  it('renders the form title', () => {
    render(<LandingContact />)
    expect(screen.getByText('contact.formTitle')).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(<LandingContact />)
    expect(screen.getByRole('button', { name: /contact\.submitBtn/i })).toBeInTheDocument()
  })

  it('volume selector marks clicked option as active', () => {
    render(<LandingContact />)
    const option = screen.getByText('100–500')
    fireEvent.click(option)
    expect(option).toHaveAttribute('data-active', 'true')
  })

  it('renders reassurance rows instead of process steps', () => {
    render(<LandingContact />)
    expect(screen.getAllByText('contact.formSub').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('contact.formNote').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('contact.step1Title')).not.toBeInTheDocument()
  })

  it('tracks form start only once across interactions', () => {
    const { container } = render(<LandingContact />)
    fireEvent.focus(container.querySelector('input[name="firstName"]')!)
    fireEvent.focus(container.querySelector('input[name="email"]')!)
    fireEvent.click(screen.getByText('100–500'))

    expect(mockCaptureContactFormStarted).toHaveBeenCalledTimes(1)
  })

  it('tracks and identifies a successfully submitted lead', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200 })
    const { container } = render(<LandingContact />)
    fillContactForm(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(mockCaptureContactFormSubmitted).toHaveBeenCalledWith('100–500')
    })
    expect(mockIdentifyContactLead).toHaveBeenCalledWith({
      email: 'MARIA@EXAMPLE.COM',
      firstName: 'María',
      lastName: 'Soto',
      company: 'Valle Fresco',
      volume: '100–500',
    })
    expect(mockCaptureContactFormFailed).not.toHaveBeenCalled()
  })

  it('tracks an HTTP submission failure without identifying the lead', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })
    const { container } = render(<LandingContact />)
    fillContactForm(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(mockCaptureContactFormFailed).toHaveBeenCalledWith('http', 500)
    })
    expect(mockCaptureContactFormSubmitted).not.toHaveBeenCalled()
    expect(mockIdentifyContactLead).not.toHaveBeenCalled()
  })

  it('tracks a network submission failure without identifying the lead', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'))
    const { container } = render(<LandingContact />)
    fillContactForm(container)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(mockCaptureContactFormFailed).toHaveBeenCalledWith('network')
    })
    expect(mockCaptureContactFormSubmitted).not.toHaveBeenCalled()
    expect(mockIdentifyContactLead).not.toHaveBeenCalled()
  })
})
