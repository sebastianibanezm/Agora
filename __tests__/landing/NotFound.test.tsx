import { render, screen } from '@testing-library/react'
import { NotFoundDocument } from '@/components/notfound/NotFoundDocument'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
}))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))
vi.mock('next/navigation', () => ({
  usePathname: () => '/ruta-inexistente',
}))

describe('NotFoundDocument', () => {
  it('renders the bill-of-lading fields with the requested path', () => {
    render(<NotFoundDocument />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('/ruta-inexistente')).toBeInTheDocument()
    expect(screen.getByText('carrierNote')).toBeInTheDocument()
  })

  it('renders the 404 stamp', () => {
    render(<NotFoundDocument />)
    expect(screen.getByText('stampTop')).toBeInTheDocument()
    expect(screen.getByText('stampBottom')).toBeInTheDocument()
  })

  it('links home and to resources from the correction bar', () => {
    render(<NotFoundDocument />)
    expect(screen.getByText('ctaHome').closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByText('ctaResources').closest('a')).toHaveAttribute('href', '/recursos')
  })
})
