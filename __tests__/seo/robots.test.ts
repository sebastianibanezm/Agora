import { describe, it, expect } from 'vitest'
import robots from '@/app/robots'

describe('robots', () => {
  it('allows all user agents at root', () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
    expect(rules.userAgent).toBe('*')
    expect(rules.allow).toBe('/')
  })

  it('disallows /app/ and /api/ paths', () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
    expect(rules.disallow).toContain('/app/')
    expect(rules.disallow).toContain('/api/')
  })

  it('points sitemap to the correct URL', () => {
    const result = robots()
    expect(result.sitemap).toBe('https://www.agenteagora.com/sitemap.xml')
  })
})
