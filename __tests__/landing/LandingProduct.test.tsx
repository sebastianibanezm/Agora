import { render, screen } from '@testing-library/react'
import { LandingProduct } from '@/components/landing/LandingProduct'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))
vi.mock('next/image', () => ({ default: (props: { alt: string }) => <img alt={props.alt} /> }))

describe('LandingProduct', () => {
  it('renders the dashboard image', () => {
    render(<LandingProduct />)
    expect(screen.getByAltText('product.dashboardAlt')).toBeInTheDocument()
  })

  it('renders annotation chips', () => {
    render(<LandingProduct />)
    expect(screen.getByText('product.anno1')).toBeInTheDocument()
    expect(screen.getByText('product.anno2')).toBeInTheDocument()
    expect(screen.getByText('product.anno3')).toBeInTheDocument()
  })
})
