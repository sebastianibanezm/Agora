import { describe, it, expect, vi } from 'vitest'
import esMessages from '@/messages/es.json'
import enMessages from '@/messages/en.json'

vi.mock('next-intl/server', () => ({
  getMessages: vi.fn(async ({ locale }: { locale: string }) =>
    locale === 'en' ? enMessages : esMessages
  ),
  getTranslations: vi.fn(),
  setRequestLocale: vi.fn(),
}))

import { generateMetadata as layoutMetadata } from '@/app/[locale]/layout'
import { generateMetadata as pageMetadata } from '@/app/[locale]/(marketing)/page'

const params = (locale: string) => ({ params: Promise.resolve({ locale }) })

describe('global metadata (es)', () => {
  it('has a title template', async () => {
    const metadata = await layoutMetadata(params('es'))
    expect(typeof metadata.title === 'object' && metadata.title !== null && 'template' in metadata.title).toBe(true)
  })

  it('description mentions fruta y frutos secos', async () => {
    const metadata = await layoutMetadata(params('es'))
    expect(metadata.description).toMatch(/fruta y frutos secos/)
  })

  it('has keywords array', async () => {
    const metadata = await layoutMetadata(params('es'))
    expect(Array.isArray(metadata.keywords)).toBe(true)
    expect((metadata.keywords as string[]).length).toBeGreaterThan(0)
  })

  it('es canonical is the unprefixed root', async () => {
    const metadata = await layoutMetadata(params('es'))
    expect(metadata.alternates?.canonical).toBe('https://www.agenteagora.com')
  })

  it('en canonical is /en with hreflang alternates', async () => {
    const metadata = await layoutMetadata(params('en'))
    expect(metadata.alternates?.canonical).toBe('https://www.agenteagora.com/en')
    const languages = metadata.alternates?.languages as Record<string, string>
    expect(languages.es).toBe('https://www.agenteagora.com')
    expect(languages.en).toBe('https://www.agenteagora.com/en')
    expect(languages['x-default']).toBe('https://www.agenteagora.com')
  })

  it('has metadataBase set', async () => {
    const metadata = await layoutMetadata(params('es'))
    expect(metadata.metadataBase?.toString()).toBe('https://www.agenteagora.com/')
  })
})

describe('landing page metadata', () => {
  it('es title targets document management keywords', async () => {
    const metadata = await pageMetadata(params('es'))
    const title = metadata.title as { absolute: string }
    expect(title.absolute).toMatch(/gestión documental/i)
    expect(title.absolute.length).toBeLessThanOrEqual(65)
  })

  it('en title is localized', async () => {
    const metadata = await pageMetadata(params('en'))
    const title = metadata.title as { absolute: string }
    expect(title.absolute).toMatch(/export document/i)
  })

  it('has openGraph title, description and image', async () => {
    const metadata = await pageMetadata(params('es'))
    expect(metadata.openGraph?.title).toBeTruthy()
    expect(metadata.openGraph?.description).toBeTruthy()
    expect(metadata.openGraph?.images).toBeTruthy()
  })

  it('has twitter card', async () => {
    const metadata = await pageMetadata(params('es'))
    expect((metadata.twitter as { card?: string } | undefined)?.card).toBe('summary_large_image')
  })
})
