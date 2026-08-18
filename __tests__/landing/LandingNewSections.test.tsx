import { fireEvent, render, screen } from '@testing-library/react'
import { LandingProof } from '@/components/landing/LandingProof'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingCtaBand } from '@/components/landing/LandingCtaBand'
import { LandingFaq } from '@/components/landing/LandingFaq'
import { LandingResources } from '@/components/landing/LandingResources'

const { mockCaptureContactCta, mockCaptureResourceClick } = vi.hoisted(() => ({
  mockCaptureContactCta: vi.fn(),
  mockCaptureResourceClick: vi.fn(),
}))

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))
vi.mock('@/lib/analytics', () => ({
  captureContactCta: mockCaptureContactCta,
  captureResourceClick: mockCaptureResourceClick,
}))

beforeEach(() => {
  mockCaptureContactCta.mockClear()
  mockCaptureResourceClick.mockClear()
})

describe('LandingProof', () => {
  it('renders the Onizzo logo with alt text', () => {
    render(<LandingProof />)
    expect(screen.getByAltText('logoAlt')).toBeInTheDocument()
  })

  it('renders client identity and credibility markers', () => {
    render(<LandingProof />)
    expect(screen.getByText('clientName')).toBeInTheDocument()
    expect(screen.getByText('marker1')).toBeInTheDocument()
    expect(screen.getByText('marker2')).toBeInTheDocument()
    expect(screen.getByText('marker3')).toBeInTheDocument()
  })
})

describe('LandingHowItWorks', () => {
  it('renders the 3 process steps with the section anchor', () => {
    const { container } = render(<LandingHowItWorks />)
    expect(container.querySelector('#how-it-works')).toBeInTheDocument()
    expect(screen.getByText('step1Title')).toBeInTheDocument()
    expect(screen.getByText('step2Title')).toBeInTheDocument()
    expect(screen.getByText('step3Title')).toBeInTheDocument()
  })
})

describe('LandingCtaBand', () => {
  it('renders the CTA linking to contact', () => {
    render(<LandingCtaBand />)
    expect(screen.getByText('cta').closest('a')).toHaveAttribute('href', '#contact')
  })

  it('tracks the closing CTA source', () => {
    render(<LandingCtaBand />)
    fireEvent.click(screen.getByText('cta'))
    expect(mockCaptureContactCta).toHaveBeenCalledWith('cta_band')
  })
})

describe('LandingFaq', () => {
  it('renders 5 questions as an accordion with the section anchor', () => {
    const { container } = render(<LandingFaq />)
    expect(container.querySelector('#faq')).toBeInTheDocument()
    expect(container.querySelectorAll('details').length).toBe(5)
    for (const n of ['1', '2', '3', '4', '5']) {
      expect(screen.getByText(`q${n}`)).toBeInTheDocument()
    }
  })

  it('reveals the answer when a question is opened', () => {
    const { container } = render(<LandingFaq />)
    const first = container.querySelector('details')!
    first.open = true
    expect(screen.getByText('a1')).toBeInTheDocument()
  })
})

describe('LandingResources', () => {
  it('renders the featured article card linking to the Ley 21.719 analysis', () => {
    render(<LandingResources />)
    const card = screen.getByText('articleTitle').closest('a')
    expect(card).toHaveAttribute('href', '/recursos/ley-21719-proteccion-de-datos-agro')
    expect(screen.getByText('hubCta').closest('a')).toHaveAttribute('href', '/recursos')
  })

  it('tracks the resources hub and featured article destinations', () => {
    render(<LandingResources />)

    fireEvent.click(screen.getByText('hubCta'))
    expect(mockCaptureResourceClick).toHaveBeenCalledWith('hub', '/recursos')

    fireEvent.click(screen.getByText('articleTitle'))
    expect(mockCaptureResourceClick).toHaveBeenCalledWith(
      'featured_article',
      '/recursos/ley-21719-proteccion-de-datos-agro',
    )
  })
})
