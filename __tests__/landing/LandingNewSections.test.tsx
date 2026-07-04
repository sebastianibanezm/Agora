import { render, screen } from '@testing-library/react'
import { LandingProof } from '@/components/landing/LandingProof'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingCtaBand } from '@/components/landing/LandingCtaBand'
import { LandingFaq } from '@/components/landing/LandingFaq'
import { LandingResources } from '@/components/landing/LandingResources'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))

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
})
