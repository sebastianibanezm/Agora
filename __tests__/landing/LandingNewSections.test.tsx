import { fireEvent, render, screen } from '@testing-library/react'
import { LandingProof } from '@/components/landing/LandingProof'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingProcess } from '@/components/landing/LandingProcess'
import { LandingCompare } from '@/components/landing/LandingCompare'
import { LandingRoadmap } from '@/components/landing/LandingRoadmap'
import { LandingFaq } from '@/components/landing/LandingFaq'
import { LandingResources } from '@/components/landing/LandingResources'

const { mockCaptureContactCta, mockCaptureResourceClick } = vi.hoisted(() => ({
  mockCaptureContactCta: vi.fn(),
  mockCaptureResourceClick: vi.fn(),
}))

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/image', () => ({
  default: (props: { alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element -- Test double for next/image.
    return <img alt={props.alt} />
  },
}))
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
  it('renders the 3 getting-started steps with the section anchor', () => {
    const { container } = render(<LandingHowItWorks />)
    expect(container.querySelector('#getting-started')).toBeInTheDocument()
    for (const n of ['1', '2', '3']) expect(screen.getByText(`step${n}Title`)).toBeInTheDocument()
  })

  it('does not show a price', () => {
    const { container } = render(<LandingHowItWorks />)
    expect(container.textContent).not.toMatch(/USD|price|precio/i)
  })

  it('tracks the getting-started CTA, which links to contact', () => {
    render(<LandingHowItWorks />)
    const cta = screen.getByText('cta').closest('a')!
    expect(cta).toHaveAttribute('href', '#contact')
    cta.addEventListener('click', event => event.preventDefault())
    fireEvent.click(cta)
    expect(mockCaptureContactCta).toHaveBeenCalledWith('getting_started')
  })
})

describe('LandingProcess', () => {
  it('renders the five process steps with a product screen each', () => {
    const { container } = render(<LandingProcess />)
    expect(container.querySelector('#how-it-works')).toBeInTheDocument()
    for (const n of ['1', '2', '3', '4', '5']) {
      expect(screen.getByText(`step${n}Title`)).toBeInTheDocument()
      expect(screen.getByAltText(`step${n}Alt`)).toBeInTheDocument()
    }
  })

  it('shows the first step in the fixed frame until another step scrolls in', () => {
    render(<LandingProcess />)
    expect(screen.getByText('step1Caption')).toBeInTheDocument()
    expect(screen.getByText('1 / 5')).toBeInTheDocument()
  })

  it('tracks the demo CTA after the steps, which links to contact', () => {
    render(<LandingProcess />)
    const cta = screen.getByText('cta').closest('a')!
    expect(cta).toHaveAttribute('href', '#contact')
    cta.addEventListener('click', event => event.preventDefault())
    fireEvent.click(cta)
    expect(mockCaptureContactCta).toHaveBeenCalledWith('process')
  })
})

describe('LandingCompare', () => {
  it('renders the before and after table', () => {
    render(<LandingCompare />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(6)
  })
})

describe('LandingRoadmap', () => {
  it('marks both roadmap items as not yet available', () => {
    render(<LandingRoadmap />)
    expect(screen.getAllByText('tag')).toHaveLength(2)
    expect(screen.getByText('item1Title')).toBeInTheDocument()
    expect(screen.getByText('item2Title')).toBeInTheDocument()
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

    const hubLink = screen.getByText('hubCta').closest('a')!
    hubLink.addEventListener('click', event => event.preventDefault())
    fireEvent.click(hubLink)
    expect(mockCaptureResourceClick).toHaveBeenCalledWith('hub', '/recursos')

    const articleLink = screen.getByText('articleTitle').closest('a')!
    articleLink.addEventListener('click', event => event.preventDefault())
    fireEvent.click(articleLink)
    expect(mockCaptureResourceClick).toHaveBeenCalledWith(
      'featured_article',
      '/recursos/ley-21719-proteccion-de-datos-agro',
    )
  })
})
