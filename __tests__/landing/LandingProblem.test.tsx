import { render, screen } from '@testing-library/react'
import { LandingProblem } from '@/components/landing/LandingProblem'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('LandingProblem', () => {
  it('renders all 3 friction card titles', () => {
    render(<LandingProblem />)
    expect(screen.getByText('card1Title')).toBeInTheDocument()
    expect(screen.getByText('card2Title')).toBeInTheDocument()
    expect(screen.getByText('card3Title')).toBeInTheDocument()
  })

  it('renders the section title', () => {
    render(<LandingProblem />)
    // Title is split by <br /> so we check for heading containing the text
    const heading = screen.getAllByRole('heading', { level: 2 })[0]
    expect(heading?.textContent).toContain('title')
  })

  it('renders the integrated stats band', () => {
    render(<LandingProblem />)
    expect(screen.getByText('stats.eyebrow')).toBeInTheDocument()
    expect(screen.getByText('stats.stat1Label')).toBeInTheDocument()
    expect(screen.getByText('stats.stat2Label')).toBeInTheDocument()
    expect(screen.getByText('stats.stat3Label')).toBeInTheDocument()
  })
})
