import { render, screen } from '@testing-library/react'
import { LandingProduct } from '@/components/landing/LandingProduct'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))

describe('LandingProduct', () => {
  it('renders the three area blocks without tabs', () => {
    render(<LandingProduct />)
    expect(screen.getByText('product.comexHed')).toBeInTheDocument()
    expect(screen.getByText('product.finanzasHed')).toBeInTheDocument()
    expect(screen.getByText('product.comercialHed')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the real product screenshots with alt text', () => {
    render(<LandingProduct />)
    expect(screen.getByAltText('product.shotDashboardAlt')).toBeInTheDocument()
    expect(screen.getByAltText('product.shotWorkflowAlt')).toBeInTheDocument()
  })

  it('renders comex feature rows', () => {
    render(<LandingProduct />)
    expect(screen.getByText('product.feature1Label')).toBeInTheDocument()
    expect(screen.getByText('product.feature2Label')).toBeInTheDocument()
    expect(screen.getByText('product.feature3Label')).toBeInTheDocument()
  })

  it('renders finanzas and comercial feature rows simultaneously', () => {
    render(<LandingProduct />)
    expect(screen.getByText('product.finanzas1Label')).toBeInTheDocument()
    expect(screen.getByText('product.comercial1Label')).toBeInTheDocument()
  })
})
