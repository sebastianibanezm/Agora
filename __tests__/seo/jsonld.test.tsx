import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import esMessages from '@/messages/es.json'
import MarketingLayout from '@/app/[locale]/(marketing)/layout'
import LandingPage from '@/app/[locale]/(marketing)/page'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async ({ namespace }: { namespace: string }) => {
    const section = namespace.split('.').reduce(
      (acc: Record<string, unknown>, key: string) => acc[key] as Record<string, unknown>,
      esMessages as unknown as Record<string, unknown>
    )
    return (key: string) => (section as Record<string, string>)[key]
  }),
}))

vi.mock('@/components/landing/LandingHero', () => ({ LandingHero: () => <div /> }))
vi.mock('@/components/landing/LandingProof', () => ({ LandingProof: () => <div /> }))
vi.mock('@/components/landing/LandingProblem', () => ({ LandingProblem: () => <div /> }))
vi.mock('@/components/landing/LandingPillars', () => ({ LandingPillars: () => <div /> }))
vi.mock('@/components/landing/LandingProduct', () => ({ LandingProduct: () => <div /> }))
vi.mock('@/components/landing/LandingHowItWorks', () => ({ LandingHowItWorks: () => <div /> }))
vi.mock('@/components/landing/LandingCtaBand', () => ({ LandingCtaBand: () => <div /> }))
vi.mock('@/components/landing/LandingContact', () => ({ LandingContact: () => <div /> }))
vi.mock('@/components/landing/LandingFaq', () => ({ LandingFaq: () => <div /> }))
vi.mock('@/components/landing/LandingResources', () => ({ LandingResources: () => <div /> }))
vi.mock('@/components/landing/LandingFooter', () => ({ LandingFooter: () => <footer /> }))

async function renderLayout() {
  const element = await MarketingLayout({
    children: <div />,
    params: Promise.resolve({ locale: 'es' }),
  })
  return render(element)
}

async function renderHomepage() {
  const page = await LandingPage({ params: Promise.resolve({ locale: 'es' }) })
  const layout = await MarketingLayout({
    children: page,
    params: Promise.resolve({ locale: 'es' }),
  })
  return render(layout)
}

async function renderLegalPage() {
  const layout = await MarketingLayout({
    children: <main><h1>Privacy Policy</h1></main>,
    params: Promise.resolve({ locale: 'es' }),
  })
  return render(layout)
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
    expect(org.email).toBe('hola@replies.agenteagora.com')
    expect(org.contactPoint.email).toBe('hola@replies.agenteagora.com')
  })

  it('renders a SoftwareApplication schema script tag', async () => {
    const { container } = await renderLayout()
    const app = getSchemas(container).find((s: { '@type': string }) => s['@type'] === 'SoftwareApplication')
    expect(app).toBeTruthy()
    expect(app.name).toBe('Agora')
    expect(app.applicationCategory).toBe('BusinessApplication')
  })

  it('renders a FAQPage schema with 5 questions on the homepage', async () => {
    const { container } = await renderHomepage()
    const faq = getSchemas(container).find((s: { '@type': string }) => s['@type'] === 'FAQPage')
    expect(faq).toBeTruthy()
    expect(faq.mainEntity).toHaveLength(5)
    expect(faq.mainEntity[0].name).toBe(esMessages.landing.faq.q1)
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe(esMessages.landing.faq.a1)
  })

  it('does not add FAQPage schema when rendering a legal page through the marketing layout', async () => {
    const { container } = await renderLegalPage()
    expect(getSchemas(container).some((s: { '@type': string }) => s['@type'] === 'FAQPage')).toBe(false)
  })
})
