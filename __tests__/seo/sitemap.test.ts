import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'

describe('sitemap', () => {
  it('includes the canonical homepage URL', () => {
    const result = sitemap()
    const urls = result.map(entry => entry.url)
    expect(urls).toContain('https://www.agenteagora.com')
  })

  it('sets priority 1.0 on the homepage', () => {
    const result = sitemap()
    const homepage = result.find(e => e.url === 'https://www.agenteagora.com')
    expect(homepage?.priority).toBe(1.0)
  })

  it('sets changeFrequency to weekly on the homepage', () => {
    const result = sitemap()
    const homepage = result.find(e => e.url === 'https://www.agenteagora.com')
    expect(homepage?.changeFrequency).toBe('weekly')
  })

  it('includes the English locale URL with hreflang alternates', () => {
    const result = sitemap()
    const en = result.find(e => e.url === 'https://www.agenteagora.com/en')
    expect(en).toBeTruthy()
    expect(en?.alternates?.languages?.es).toBe('https://www.agenteagora.com')
  })

  it('includes a lastModified date', () => {
    const result = sitemap()
    const homepage = result.find(e => e.url === 'https://www.agenteagora.com')
    expect(homepage?.lastModified).toBeInstanceOf(Date)
  })

  it('includes localized privacy and terms pages with reciprocal language alternates', () => {
    const result = sitemap()

    const privacyEs = result.find(entry => entry.url === 'https://www.agenteagora.com/privacy')
    const privacyEn = result.find(entry => entry.url === 'https://www.agenteagora.com/en/privacy')
    const termsEs = result.find(entry => entry.url === 'https://www.agenteagora.com/terms')
    const termsEn = result.find(entry => entry.url === 'https://www.agenteagora.com/en/terms')

    expect(privacyEs?.alternates?.languages).toEqual({
      es: 'https://www.agenteagora.com/privacy',
      en: 'https://www.agenteagora.com/en/privacy',
    })
    expect(privacyEn?.alternates?.languages).toEqual(privacyEs?.alternates?.languages)
    expect(termsEs?.alternates?.languages).toEqual({
      es: 'https://www.agenteagora.com/terms',
      en: 'https://www.agenteagora.com/en/terms',
    })
    expect(termsEn?.alternates?.languages).toEqual(termsEs?.alternates?.languages)
    expect(privacyEs?.changeFrequency).toBe('yearly')
    expect(termsEs?.changeFrequency).toBe('yearly')
  })
})
