import { NextRequest, NextResponse } from 'next/server'
import { getResend } from '@/lib/resend-client'

const INBOUND_ADDRESS = 'hola@replies.agenteagora.com'
const FORWARD_FROM = 'Agora Replies <hola@agenteagora.com>'
const FORWARD_TO = 'sebastian@agenteagora.com'
// Resend limits the complete Base64-encoded email to 40 MB. Keep 5 MB for
// headers and message content so an attachment cannot strand the body.
const MAX_FORWARDED_ATTACHMENT_CHARACTERS = 35 * 1024 * 1024
const UNSUPPORTED_ATTACHMENT_EXTENSIONS = new Set([
  '.adp', '.app', '.asp', '.bas', '.bat', '.cer', '.chm', '.cmd', '.com', '.cpl',
  '.crt', '.csh', '.der', '.exe', '.fxp', '.gadget', '.hlp', '.hta', '.inf', '.ins',
  '.isp', '.its', '.js', '.jse', '.ksh', '.lib', '.lnk', '.mad', '.maf', '.mag',
  '.mam', '.maq', '.mar', '.mas', '.mat', '.mau', '.mav', '.maw', '.mda', '.mdb',
  '.mde', '.mdt', '.mdw', '.mdz', '.msc', '.msh', '.msh1', '.msh2', '.mshxml',
  '.msh1xml', '.msh2xml', '.msi', '.msp', '.mst', '.ops', '.pcd', '.pif', '.plg',
  '.prf', '.prg', '.reg', '.scf', '.scr', '.sct', '.shb', '.shs', '.sys', '.ps1',
  '.ps1xml', '.ps2', '.ps2xml', '.psc1', '.psc2', '.tmp', '.url', '.vb', '.vbe',
  '.vbs', '.vps', '.vsmacros', '.vss', '.vst', '.vsw', '.vxd', '.ws', '.wsc',
  '.wsf', '.wsh', '.xnk',
])

type EmailReceivedEvent = {
  type: 'email.received'
  data: {
    email_id: string
    from: string
    to: string[]
    subject?: string | null
  }
}

type ReceivedEmail = {
  html?: string | null
  text?: string | null
  subject?: string | null
}

type ReceivedAttachment = {
  filename?: string
  size: number
  content_type: string
  content_id?: string | null
  download_url: string
}

type ForwardAttachment = {
  filename: string
  content: string
  contentType: string
  contentId?: string
}

function isEmailReceivedEvent(event: unknown): event is EmailReceivedEvent {
  if (!event || typeof event !== 'object') return false

  const candidate = event as Partial<EmailReceivedEvent>
  return candidate.type === 'email.received'
    && typeof candidate.data?.email_id === 'string'
    && typeof candidate.data.from === 'string'
    && Array.isArray(candidate.data.to)
}

function upstreamFailure(stage: string) {
  console.error(`Resend inbound forwarding failed: ${stage}`)
  return NextResponse.json({ error: 'Inbound forwarding failed' }, { status: 502 })
}

function attachmentName(attachment: ReceivedAttachment) {
  return attachment.filename || 'unnamed attachment'
}

function hasUnsupportedExtension(filename: string) {
  const extensionIndex = filename.lastIndexOf('.')
  if (extensionIndex < 0) return false

  return UNSUPPORTED_ATTACHMENT_EXTENSIONS.has(filename.slice(extensionIndex).toLowerCase())
}

function estimatedBase64Length(byteLength: number) {
  return 4 * Math.ceil(byteLength / 3)
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function omissionNotice(filenames: string[]) {
  const names = filenames.join(', ')
  const message = `Agora forwarded the message body, but omitted these attachments because they could not be sent safely: ${names}.`

  return {
    html: `<p><em>${escapeHtml(message)}</em></p>`,
    text: `\n\n${message}`,
  }
}

function forwardContent(receivedEmail: ReceivedEmail, omittedFilenames: string[] = []) {
  const notice = omittedFilenames.length > 0 ? omissionNotice(omittedFilenames) : null

  if (receivedEmail.html) {
    return {
      html: `${receivedEmail.html}${notice?.html || ''}`,
      text: receivedEmail.text
        ? `${receivedEmail.text}${notice?.text || ''}`
        : undefined,
    }
  }

  return { text: `${receivedEmail.text || ''}${notice?.text || ''}` }
}

function isPermanentClientError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const statusCode = (error as { statusCode?: unknown }).statusCode
  return typeof statusCode === 'number'
    && statusCode >= 400
    && statusCode < 500
    && statusCode !== 409
    && statusCode !== 429
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 })
  }

  const resend = getResend()

  const id = request.headers.get('svix-id')
  const timestamp = request.headers.get('svix-timestamp')
  const signature = request.headers.get('svix-signature')

  if (!id || !timestamp || !signature) {
    return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 })
  }

  const payload = await request.text()
  let event: unknown

  try {
    event = resend.webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }

  if (!isEmailReceivedEvent(event)) {
    return NextResponse.json({ ignored: true })
  }

  const intendedRecipient = event.data.to.some(
    (address) => address.toLowerCase() === INBOUND_ADDRESS,
  )
  if (!intendedRecipient) {
    return NextResponse.json({ ignored: true })
  }

  const { data: receivedData, error: receivedError } = await resend.emails.receiving.get(
    event.data.email_id,
  )
  if (receivedError || !receivedData) return upstreamFailure('retrieve message')

  const { data: attachmentPage, error: attachmentError } =
    await resend.emails.receiving.attachments.list({ emailId: event.data.email_id })
  if (attachmentError || !attachmentPage) return upstreamFailure('list attachments')

  const receivedEmail = receivedData as ReceivedEmail
  const attachmentRecords = attachmentPage.data as ReceivedAttachment[]

  const attachments: ForwardAttachment[] = []
  const omittedFilenames: string[] = []
  let encodedAttachmentCharacters = 0

  try {
    for (const attachment of attachmentRecords) {
      const filename = attachmentName(attachment)
      const estimatedCharacters = estimatedBase64Length(attachment.size)

      if (
        hasUnsupportedExtension(filename)
        || encodedAttachmentCharacters + estimatedCharacters > MAX_FORWARDED_ATTACHMENT_CHARACTERS
      ) {
        omittedFilenames.push(filename)
        continue
      }

      const response = await fetch(attachment.download_url)
      if (!response.ok) throw new Error('Attachment download failed')

      const content = Buffer.from(await response.arrayBuffer()).toString('base64')
      if (encodedAttachmentCharacters + content.length > MAX_FORWARDED_ATTACHMENT_CHARACTERS) {
        omittedFilenames.push(filename)
        continue
      }

      attachments.push({
        filename,
        content,
        contentType: attachment.content_type,
        ...(attachment.content_id ? { contentId: attachment.content_id } : {}),
      })
      encodedAttachmentCharacters += content.length
    }
  } catch {
    return upstreamFailure('download attachment')
  }

  const content = forwardContent(receivedEmail, omittedFilenames)
  const deliveryMode = attachments.length > 0
    ? omittedFilenames.length > 0 ? 'partial' : 'full'
    : 'body'

  const { error: sendError } = await resend.emails.send(
    {
      from: FORWARD_FROM,
      to: FORWARD_TO,
      replyTo: event.data.from,
      subject: event.data.subject || receivedEmail.subject || '(no subject)',
      ...content,
      attachments: attachments.length > 0 ? attachments : undefined,
    },
    { idempotencyKey: `inbound-forward/${event.data.email_id}/${deliveryMode}` },
  )

  if (!sendError) return NextResponse.json({ forwarded: true })

  if (attachments.length > 0 && isPermanentClientError(sendError)) {
    const allAttachmentNames = attachmentRecords.map(attachmentName)
    const { error: bodySendError } = await resend.emails.send(
      {
        from: FORWARD_FROM,
        to: FORWARD_TO,
        replyTo: event.data.from,
        subject: event.data.subject || receivedEmail.subject || '(no subject)',
        ...forwardContent(receivedEmail, allAttachmentNames),
        attachments: undefined,
      },
      { idempotencyKey: `inbound-forward/${event.data.email_id}/body` },
    )

    if (!bodySendError) return NextResponse.json({ forwarded: true })
    return upstreamFailure('send body fallback')
  }

  return upstreamFailure('send forward')
}
