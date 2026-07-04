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
})
