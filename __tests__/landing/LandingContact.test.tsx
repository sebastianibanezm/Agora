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
    const option = screen.getByText('20–100')
    fireEvent.click(option)
    expect(option).toHaveAttribute('data-active', 'true')
  })

  it('renders all 3 process steps', () => {
    render(<LandingContact />)
    expect(screen.getByText('contact.step1Title')).toBeInTheDocument()
    expect(screen.getByText('contact.step2Title')).toBeInTheDocument()
    expect(screen.getByText('contact.step3Title')).toBeInTheDocument()
  })
})
