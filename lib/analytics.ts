import posthog from 'posthog-js'

export type ContactCtaSource = 'hero' | 'cta_band'
export type ResourceClickSource = 'hub' | 'featured_article'
export type ContactFormFailureReason = 'http' | 'network'

export type ContactLead = {
  email: string
  firstName: string
  lastName: string
  company: string
  volume: string
}

function safely(operation: () => void) {
  try {
    operation()
  } catch {
    // Analytics must never interrupt navigation or contact submission.
  }
}

export function initializeAnalytics() {
  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!projectToken || !host) return

  safely(() => {
    posthog.init(projectToken, {
      api_host: host,
      defaults: '2026-05-30',
      autocapture: true,
      capture_pageview: 'history_change',
      capture_pageleave: true,
      disable_session_recording: false,
      session_recording: { maskAllInputs: true },
    })
  })
}

export function captureContactCta(source: ContactCtaSource) {
  safely(() => posthog.capture('contact_cta_clicked', { source }))
}

export function captureResourceClick(source: ResourceClickSource, path: string) {
  safely(() => posthog.capture('resource_clicked', { source, path }))
}

export function captureContactFormStarted() {
  safely(() => posthog.capture('contact_form_started'))
}

export function captureContactFormSubmitted(volume: string) {
  safely(() => posthog.capture('contact_form_submitted', {
    annual_container_volume: volume,
  }))
}

export function captureContactFormFailed(reason: ContactFormFailureReason, status?: number) {
  safely(() => posthog.capture('contact_form_failed', {
    reason,
    ...(status === undefined ? {} : { status_code: status }),
  }))
}

export function identifyContactLead(lead: ContactLead) {
  const email = lead.email.trim().toLowerCase()
  const name = `${lead.firstName.trim()} ${lead.lastName.trim()}`.trim()

  safely(() => posthog.identify(email, {
    email,
    name,
    company: lead.company.trim(),
    annual_container_volume: lead.volume,
    lead_source: 'marketing_site_contact_form',
  }))
}
