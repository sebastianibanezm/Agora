import { render, screen } from '@testing-library/react'
import { getLegalDocument } from '@/lib/legal-content'
import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage'

vi.mock('@/components/landing/LandingFooter', () => ({
  LandingFooter: () => <footer aria-label="Agora footer" />,
}))

describe('LegalDocumentPage', () => {
  it('renders the Spanish privacy policy with the Google data boundary and contact link', () => {
    render(<LegalDocumentPage document={getLegalDocument('privacy', 'es')} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Política de Privacidad' })).toBeInTheDocument()
    expect(screen.getByText('Agente Agora LLC')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'hola@agenteagora.com' })).toEqual(
      expect.arrayContaining([expect.objectContaining({ href: 'mailto:hola@agenteagora.com' })]),
    )
    expect(screen.getByText(/nombre, dirección de correo electrónico, imagen de perfil e identificador de cuenta/i)).toBeInTheDocument()
    expect(screen.getByText(/no solicita acceso a Gmail, Google Drive, Google Calendar ni a otro contenido de Google Workspace/i)).toBeInTheDocument()
    expect(screen.getByText(/no vende datos de usuarios de Google ni los usa para publicidad/i)).toBeInTheDocument()
  })

  it('renders the English privacy policy with the same Google data boundary', () => {
    render(<LegalDocumentPage document={getLegalDocument('privacy', 'en')} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByText(/name, email address, profile image, and Google account identifier/i)).toBeInTheDocument()
    expect(screen.getByText(/does not request access to Gmail, Google Drive, Google Calendar, or other Google Workspace content/i)).toBeInTheDocument()
    expect(screen.getByText(/does not sell Google user data or use it for advertising/i)).toBeInTheDocument()
  })

  it('renders terms sections for account security, customer content, termination, and contact', () => {
    render(<LegalDocumentPage document={getLegalDocument('terms', 'en')} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Terms of Service' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Accounts and security' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Customer content' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Suspension and termination' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument()
  })
})
