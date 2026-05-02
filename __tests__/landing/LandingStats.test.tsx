import { render, screen } from '@testing-library/react'
import { LandingStats } from '@/components/landing/LandingStats'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('LandingStats', () => {
  it('renders all 3 stat numbers', () => {
    render(<LandingStats />)
    expect(screen.getByText('stats.stat1Num')).toBeInTheDocument()
    expect(screen.getByText('stats.stat2Num')).toBeInTheDocument()
    expect(screen.getByText('stats.stat3Num')).toBeInTheDocument()
  })

  it('renders all 3 stat labels', () => {
    render(<LandingStats />)
    expect(screen.getByText('stats.stat1Label')).toBeInTheDocument()
    expect(screen.getByText('stats.stat2Label')).toBeInTheDocument()
    expect(screen.getByText('stats.stat3Label')).toBeInTheDocument()
  })
})
