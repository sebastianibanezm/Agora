import { render, screen } from '@testing-library/react'
import { LandingPillars } from '@/components/landing/LandingPillars'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `pillars.${key}`,
}))

describe('LandingPillars', () => {
  it('renders all 3 pillar titles', () => {
    render(<LandingPillars />)
    expect(screen.getByText('pillars.p1Title')).toBeInTheDocument()
    expect(screen.getByText('pillars.p2Title')).toBeInTheDocument()
    expect(screen.getByText('pillars.p3Title')).toBeInTheDocument()
  })

  it('renders pillar number badges', () => {
    render(<LandingPillars />)
    expect(screen.getByText('pillars.p1Num')).toBeInTheDocument()
    expect(screen.getByText('pillars.p2Num')).toBeInTheDocument()
    expect(screen.getByText('pillars.p3Num')).toBeInTheDocument()
  })
})
