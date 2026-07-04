import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import esMessages from '@/messages/es.json'
import MarketingLayout from '@/app/[locale]/(marketing)/layout'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async ({ namespace }: { namespace: string }) => {
    const section = namespace.split('.').reduce(
      (acc: Record<string, unknown>, key: string) => acc[key] as Record<string, unknown>,
      esMessages as unknown as Record<string, unknown>
    )
    return (key: string) => (section as Record<string, string>)[key]
  }),
}))

async function renderLayout() {
  const element = await MarketingLayout({
    children: <div />,
    params: Promise.resolve({ locale: 'es' }),
  })
  return render(element)
}

function getSchemas(container: HTMLElement) {
  const scripts = container.querySelectorAll('script[type="application/ld+json"]')
  return Array.from(scripts).map(s => JSON.parse(s.textContent ?? '{}'))
}

describe('marketing layout JSON-LD', () => {
  it('renders an Organization schema script tag', async () => {
    const { container } = await renderLayout()
    const org = getSchemas(container).find((s: { '@type': string }) => s['@type'] === 'Organization')
    expect(org).toBeTruthy()
    expect(org.name).toBe('Agente Agora LLC')
    expect(org.url).toBe('https://www.agenteagora.com')
  })

  it('renders a SoftwareApplication schema script tag', async () => {
    const { container } = await renderLayout()
    const app = getSchemas(container).find((s: { '@type': string }) => s['@type'] === 'SoftwareApplication')
    expect(app).toBeTruthy()
    expect(app.name).toBe('Agora')
    expect(app.applicationCategory).toBe('BusinessApplication')
  })

  it('renders a FAQPage schema with 5 questions matching the visible FAQ', async () => {
    const { container } = await renderLayout()
    const faq = getSchemas(container).find((s: { '@type': string }) => s['@type'] === 'FAQPage')
    expect(faq).toBeTruthy()
    expect(faq.mainEntity).toHaveLength(5)
    expect(faq.mainEntity[0].name).toBe(esMessages.landing.faq.q1)
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe(esMessages.landing.faq.a1)
  })
})
