import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockSend = vi.hoisted(() => vi.fn())

vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockSend }
  },
}))

import { POST } from '@/app/api/contact/route'

describe('POST /api/contact', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 'test_api_key'
    mockSend.mockReset()
    mockSend.mockResolvedValue({ data: { id: 'email_123' }, error: null })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 200 })))
  })

  afterEach(() => {
    delete process.env.RESEND_API_KEY
    vi.unstubAllGlobals()
  })

  it('sends the confirmation with the working replies subdomain as Reply-To', async () => {
    const request = new NextRequest('https://www.agenteagora.com/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Ana',
        lastName: 'Pérez',
        company: 'Exportadora Sur',
        email: 'lead@example.com',
        volume: '100',
      }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      from: 'Agora <hola@agenteagora.com>',
      to: 'lead@example.com',
      replyTo: 'hola@replies.agenteagora.com',
    }))
  })
})
