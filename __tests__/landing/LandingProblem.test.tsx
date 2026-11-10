import { render, screen } from '@testing-library/react'
import { LandingProblem } from '@/components/landing/LandingProblem'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('LandingProblem', () => {
  it('renders the section title with its accent line', () => {
    const { container } = render(<LandingProblem />)
    expect(container.querySelector('#problem')).toBeInTheDocument()
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.textContent).toContain('title')
    expect(heading.textContent).toContain('titleAccent')
  })

  it('renders the three figures with their labels', () => {
    render(<LandingProblem />)
    for (const n of ['1', '2', '3']) {
      expect(screen.getByText(`stat${n}Label`)).toBeInTheDocument()
    }
    expect(screen.getByText('stat3Unit')).toBeInTheDocument()
  })
})
