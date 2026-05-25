import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MarketingLayout from '@/app/[locale]/(marketing)/layout'

describe('marketing layout JSON-LD', () => {
  it('renders an Organization schema script tag', () => {
    const { container } = render(
      <MarketingLayout>
        <div />
      </MarketingLayout>
    )
    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    const schemas = Array.from(scripts).map(s => JSON.parse(s.textContent ?? '{}'))
    const org = schemas.find((s: { '@type': string }) => s['@type'] === 'Organization')
    expect(org).toBeTruthy()
    expect(org.name).toBe('Agente Agora LLC')
    expect(org.url).toBe('https://www.agenteagora.com')
  })

  it('renders a SoftwareApplication schema script tag', () => {
    const { container } = render(
      <MarketingLayout>
        <div />
      </MarketingLayout>
    )
    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    const schemas = Array.from(scripts).map(s => JSON.parse(s.textContent ?? '{}'))
    const app = schemas.find((s: { '@type': string }) => s['@type'] === 'SoftwareApplication')
    expect(app).toBeTruthy()
    expect(app.name).toBe('Agora')
    expect(app.applicationCategory).toBe('BusinessApplication')
  })
})
