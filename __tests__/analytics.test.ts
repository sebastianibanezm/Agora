import { beforeEach, describe, expect, it, vi } from 'vitest'

const posthog = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
}))

vi.mock('posthog-js', () => ({ default: posthog }))

import {
  captureContactCta,
  captureContactFormFailed,
  captureContactFormStarted,
  captureContactFormSubmitted,
  captureResourceClick,
  identifyContactLead,
  initializeAnalytics,
} from '@/lib/analytics'

describe('analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST
  })

  it('does not initialize without complete public configuration', () => {
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = 'phc_test'
    initializeAnalytics()
    expect(posthog.init).not.toHaveBeenCalled()
  })

  it('initializes page analytics and masked session replay', () => {
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN = 'phc_test'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://us.i.posthog.com'

    initializeAnalytics()

    expect(posthog.init).toHaveBeenCalledWith('phc_test', expect.objectContaining({
      api_host: 'https://us.i.posthog.com',
      autocapture: true,
      capture_pageview: 'history_change',
      capture_pageleave: true,
      disable_session_recording: false,
      session_recording: expect.objectContaining({ maskAllInputs: true }),
    }))
  })

  it('captures the explicit conversion event taxonomy', () => {
    captureContactCta('hero')
    captureResourceClick('featured_article', '/recursos/example')
    captureContactFormStarted()
    captureContactFormSubmitted('500–1000')
    captureContactFormFailed('http', 500)

    expect(posthog.capture).toHaveBeenNthCalledWith(1, 'contact_cta_clicked', { source: 'hero' })
    expect(posthog.capture).toHaveBeenNthCalledWith(2, 'resource_clicked', {
      source: 'featured_article',
      path: '/recursos/example',
    })
    expect(posthog.capture).toHaveBeenNthCalledWith(3, 'contact_form_started')
    expect(posthog.capture).toHaveBeenNthCalledWith(4, 'contact_form_submitted', {
      annual_container_volume: '500–1000',
    })
    expect(posthog.capture).toHaveBeenNthCalledWith(5, 'contact_form_failed', {
      reason: 'http',
      status_code: 500,
    })
  })

  it('identifies a converted lead with normalized identity', () => {
    identifyContactLead({
      email: ' MARIA@EXAMPLE.COM ',
      firstName: 'María',
      lastName: 'Soto',
      company: 'Valle Fresco',
      volume: '1000–3000',
    })

    expect(posthog.identify).toHaveBeenCalledWith('maria@example.com', {
      email: 'maria@example.com',
      name: 'María Soto',
      company: 'Valle Fresco',
      annual_container_volume: '1000–3000',
      lead_source: 'marketing_site_contact_form',
    })
  })

  it('contains PostHog runtime failures', () => {
    posthog.capture.mockImplementationOnce(() => { throw new Error('blocked') })
    expect(() => captureContactCta('cta_band')).not.toThrow()
  })
})
