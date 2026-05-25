import { describe, it, expect } from 'vitest'
import { metadata } from '@/app/[locale]/layout'

describe('global metadata', () => {
  it('has a title template', () => {
    expect(typeof metadata.title === 'object' && metadata.title !== null && 'template' in metadata.title).toBe(true)
  })

  it('description mentions fruta y frutos secos', () => {
    expect(metadata.description).toMatch(/fruta y frutos secos/)
  })

  it('has keywords array', () => {
    expect(Array.isArray(metadata.keywords)).toBe(true)
    expect((metadata.keywords as string[]).length).toBeGreaterThan(0)
  })

  it('has alternates with canonical', () => {
    expect(metadata.alternates?.canonical).toBe('https://www.agenteagora.com')
  })

  it('has metadataBase set', () => {
    expect(metadata.metadataBase?.toString()).toBe('https://www.agenteagora.com/')
  })
})
