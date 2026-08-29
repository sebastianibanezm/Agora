import { createHmac } from 'node:crypto'
import { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const resendMocks = vi.hoisted(() => ({
  verify: vi.fn(),
  get: vi.fn(),
  listAttachments: vi.fn(),
  send: vi.fn(),
}))

vi.mock('@/lib/resend-client', () => ({
  getResend: () => ({
    webhooks: { verify: resendMocks.verify },
    emails: {
      receiving: {
        get: resendMocks.get,
        attachments: { list: resendMocks.listAttachments },
      },
      send: resendMocks.send,
    },
  }),
}))

import { POST } from '@/app/api/webhooks/resend/inbound/route'

const validEvent = {
  type: 'email.received',
  data: {
    email_id: 'email_123',
    from: 'lead@example.com',
    to: ['hola@replies.agenteagora.com'],
    subject: 'Re: Agora',
  },
}

function webhookRequest(headers: Record<string, string> = {
  'svix-id': 'msg_123',
  'svix-timestamp': '1787954400',
  'svix-signature': 'v1,signature',
}) {
  return new NextRequest('https://www.agenteagora.com/api/webhooks/resend/inbound', {
    method: 'POST',
    body: JSON.stringify(validEvent),
    headers,
  })
}

describe('POST /api/webhooks/resend/inbound', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 'test_api_key'
    process.env.RESEND_WEBHOOK_SECRET = 'test_webhook_secret'
    resendMocks.verify.mockReset()
    resendMocks.get.mockReset()
    resendMocks.listAttachments.mockReset()
    resendMocks.send.mockReset()

    resendMocks.verify.mockReturnValue(validEvent)
    resendMocks.get.mockResolvedValue({
      data: { html: '<p>Reply body</p>', text: 'Reply body', subject: 'Re: Agora' },
      error: null,
    })
    resendMocks.listAttachments.mockResolvedValue({
      data: {
        object: 'list',
        has_more: false,
        data: [{
          id: 'attachment_123',
          filename: 'quote.pdf',
          size: 3,
          content_type: 'application/pdf',
          content_disposition: 'attachment',
          content_id: null,
          download_url: 'https://example.com/quote.pdf',
          expires_at: '2026-08-29T00:00:00.000Z',
        }],
      },
      error: null,
    })
    resendMocks.send.mockResolvedValue({ data: { id: 'forward_123' }, error: null })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), { status: 200 })))
  })

  afterEach(() => {
    delete process.env.RESEND_API_KEY
    delete process.env.RESEND_WEBHOOK_SECRET
    vi.unstubAllGlobals()
  })

  it('fails closed when the webhook secret is not configured', async () => {
    delete process.env.RESEND_WEBHOOK_SECRET

    const response = await POST(webhookRequest())

    expect(response.status).toBe(503)
    expect(resendMocks.verify).not.toHaveBeenCalled()
    expect(resendMocks.get).not.toHaveBeenCalled()
  })

  it('fails closed when the Resend API key is not configured', async () => {
    delete process.env.RESEND_API_KEY

    const response = await POST(webhookRequest())

    expect(response.status).toBe(503)
    expect(resendMocks.verify).not.toHaveBeenCalled()
    expect(resendMocks.get).not.toHaveBeenCalled()
  })

  it('rejects requests with missing signature headers before verification', async () => {
    const response = await POST(webhookRequest({}))

    expect(response.status).toBe(400)
    expect(resendMocks.verify).not.toHaveBeenCalled()
    expect(resendMocks.get).not.toHaveBeenCalled()
  })

  it('rejects an invalid webhook signature before processing', async () => {
    resendMocks.verify.mockImplementation(() => {
      throw new Error('invalid signature')
    })

    const response = await POST(webhookRequest())

    expect(response.status).toBe(400)
    expect(resendMocks.get).not.toHaveBeenCalled()
    expect(resendMocks.send).not.toHaveBeenCalled()
  })

  it('accepts a webhook signed with the real Svix signature contract', async () => {
    const signingKey = Buffer.from('resend-webhook-test-key')
    const webhookSecret = `whsec_${signingKey.toString('base64')}`
    const id = 'msg_signed'
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const payload = JSON.stringify(validEvent)
    const signature = `v1,${createHmac('sha256', signingKey)
      .update(`${id}.${timestamp}.${payload}`)
      .digest('base64')}`

    process.env.RESEND_WEBHOOK_SECRET = webhookSecret
    resendMocks.verify.mockImplementation((input) => (
      new Resend('test_api_key').webhooks.verify(input)
    ))

    const response = await POST(webhookRequest({
      'svix-id': id,
      'svix-timestamp': timestamp,
      'svix-signature': signature,
    }))

    expect(response.status).toBe(200)
    expect(resendMocks.get).toHaveBeenCalledWith('email_123')
    expect(resendMocks.send).toHaveBeenCalledTimes(1)
  })

  it('ignores verified events that are not inbound email', async () => {
    resendMocks.verify.mockReturnValue({ type: 'email.delivered', data: {} })

    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ignored: true })
    expect(resendMocks.get).not.toHaveBeenCalled()
  })

  it('ignores inbound email for any other recipient on the subdomain', async () => {
    resendMocks.verify.mockReturnValue({
      ...validEvent,
      data: { ...validEvent.data, to: ['anything@replies.agenteagora.com'] },
    })

    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ignored: true })
    expect(resendMocks.get).not.toHaveBeenCalled()
  })

  it('retrieves and forwards a valid message and attachment exactly once', async () => {
    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ forwarded: true })
    expect(resendMocks.verify).toHaveBeenCalledWith({
      payload: JSON.stringify(validEvent),
      headers: {
        id: 'msg_123',
        timestamp: '1787954400',
        signature: 'v1,signature',
      },
      webhookSecret: 'test_webhook_secret',
    })
    expect(resendMocks.get).toHaveBeenCalledWith('email_123')
    expect(resendMocks.listAttachments).toHaveBeenCalledWith({ emailId: 'email_123' })
    expect(fetch).toHaveBeenCalledWith('https://example.com/quote.pdf')
    expect(resendMocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Agora Replies <hola@agenteagora.com>',
        to: 'sebastian@agenteagora.com',
        replyTo: 'lead@example.com',
        subject: 'Re: Agora',
        html: '<p>Reply body</p>',
        text: 'Reply body',
        attachments: [{
          filename: 'quote.pdf',
          content: 'AQID',
          contentType: 'application/pdf',
        }],
      }),
      { idempotencyKey: 'inbound-forward/email_123/full' },
    )
  })

  it('delivers the body without an attachment type that Resend cannot send', async () => {
    resendMocks.listAttachments.mockResolvedValue({
      data: {
        object: 'list',
        has_more: false,
        data: [{
          id: 'attachment_123',
          filename: 'unsafe.EXE',
          size: 3,
          content_type: 'application/octet-stream',
          content_disposition: 'attachment',
          content_id: null,
          download_url: 'https://example.com/unsafe.exe',
          expires_at: '2026-08-29T00:00:00.000Z',
        }],
      },
      error: null,
    })

    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
    expect(fetch).not.toHaveBeenCalled()
    expect(resendMocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: undefined,
        html: expect.stringContaining('unsafe.EXE'),
        text: expect.stringContaining('unsafe.EXE'),
      }),
      { idempotencyKey: 'inbound-forward/email_123/body' },
    )
  })

  it('delivers the body without an attachment that would exceed the forwarding budget', async () => {
    resendMocks.listAttachments.mockResolvedValue({
      data: {
        object: 'list',
        has_more: false,
        data: [{
          id: 'attachment_123',
          filename: 'large-video.mp4',
          size: 40 * 1024 * 1024,
          content_type: 'video/mp4',
          content_disposition: 'attachment',
          content_id: null,
          download_url: 'https://example.com/large-video.mp4',
          expires_at: '2026-08-29T00:00:00.000Z',
        }],
      },
      error: null,
    })

    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
    expect(fetch).not.toHaveBeenCalled()
    expect(resendMocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: undefined,
        text: expect.stringContaining('large-video.mp4'),
      }),
      { idempotencyKey: 'inbound-forward/email_123/body' },
    )
  })

  it('retries without attachments after a permanent attachment send rejection', async () => {
    resendMocks.send
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'attachment rejected', statusCode: 422 },
      })
      .mockResolvedValueOnce({ data: { id: 'forward_123' }, error: null })

    const response = await POST(webhookRequest())

    expect(response.status).toBe(200)
    expect(resendMocks.send).toHaveBeenCalledTimes(2)
    expect(resendMocks.send).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        attachments: undefined,
        text: expect.stringContaining('quote.pdf'),
      }),
      { idempotencyKey: 'inbound-forward/email_123/body' },
    )
  })

  it('keeps transient attachment send failures retryable', async () => {
    resendMocks.send.mockResolvedValue({
      data: null,
      error: { message: 'temporary failure', statusCode: 500 },
    })

    const response = await POST(webhookRequest())

    expect(response.status).toBe(502)
    expect(resendMocks.send).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['received email retrieval', () => resendMocks.get.mockResolvedValue({ data: null, error: { message: 'get failed' } })],
    ['attachment listing', () => resendMocks.listAttachments.mockResolvedValue({ data: null, error: { message: 'list failed' } })],
    ['attachment download', () => vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))],
    ['forwarding send', () => resendMocks.send.mockResolvedValue({ data: null, error: { message: 'send failed' } })],
  ])('returns a retryable response when %s fails', async (_failure, arrangeFailure) => {
    arrangeFailure()

    const response = await POST(webhookRequest())

    expect(response.status).toBe(502)
  })
})
