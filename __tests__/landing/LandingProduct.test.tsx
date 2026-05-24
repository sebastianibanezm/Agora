import { render, screen, fireEvent } from '@testing-library/react'
import { LandingProduct } from '@/components/landing/LandingProduct'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))

describe('LandingProduct', () => {
  it('renders the parallax image', () => {
    render(<LandingProduct />)
    // ParallaxImage renders a next/image internally; the mocked next/image renders <img>
    // The section header always shows the image regardless of active tab
    expect(document.querySelector('.parallax-root')).toBeInTheDocument()
  })

  it('renders three tab buttons', () => {
    render(<LandingProduct />)
    expect(screen.getByRole('button', { name: 'product.tabComex' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'product.tabFinanzas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'product.tabComercial' })).toBeInTheDocument()
  })

  it('shows Comex content by default', () => {
    render(<LandingProduct />)
    expect(screen.getByText('product.comexHed')).toBeInTheDocument()
    expect(screen.getByText('product.feature1Label')).toBeInTheDocument()
    expect(screen.getByText('product.feature2Label')).toBeInTheDocument()
    expect(screen.getByText('product.feature3Label')).toBeInTheDocument()
  })

  it('switches to Finanzas content when Finanzas tab is clicked', () => {
    render(<LandingProduct />)
    fireEvent.click(screen.getByRole('button', { name: 'product.tabFinanzas' }))
    expect(screen.getByText('product.finanzasHed')).toBeInTheDocument()
    expect(screen.getByText('product.finanzas1Label')).toBeInTheDocument()
    expect(screen.queryByText('product.comexHed')).not.toBeInTheDocument()
  })

  it('switches to Comercial content when Comercial tab is clicked', () => {
    render(<LandingProduct />)
    fireEvent.click(screen.getByRole('button', { name: 'product.tabComercial' }))
    expect(screen.getByText('product.comercialHed')).toBeInTheDocument()
    expect(screen.getByText('product.comercial1Label')).toBeInTheDocument()
    expect(screen.queryByText('product.comexHed')).not.toBeInTheDocument()
  })

  it('does not render the old dashboard image or annotation chips', () => {
    render(<LandingProduct />)
    expect(screen.queryByAltText('product.dashboardAlt')).not.toBeInTheDocument()
    expect(screen.queryByText('product.anno1')).not.toBeInTheDocument()
  })
})
