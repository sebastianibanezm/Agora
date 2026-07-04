import { render, screen, fireEvent } from '@testing-library/react'
import { LandingContact } from '@/components/landing/LandingContact'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('LandingContact', () => {
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
})
