# Resend Inbound Replies Design

## Purpose

Make every public `hola` contact path deliverable through `hola@replies.agenteagora.com`. Replies to landing-page confirmation emails and messages initiated from the public site must arrive in Resend, be authenticated by the application, and be forwarded to `sebastian@agenteagora.com` without changing the existing Google Workspace MX records for `agenteagora.com`.

## Current behavior and failure

The landing contact endpoint sends a confirmation from `Agora <hola@agenteagora.com>` and tells the lead that they can reply, but it does not set `Reply-To`. Email clients therefore address replies to `hola@agenteagora.com`. That address is not a working Google Workspace mailbox or alias, so replies bounce. The footer, legal pages, structured metadata, and LLM discovery files also publish the same undeliverable address.

## Approved routing

- Public inbound address: `hola@replies.agenteagora.com`.
- Final monitored destination: `sebastian@agenteagora.com`.
- Confirmation sender remains `Agora <hola@agenteagora.com>` so the existing verified outbound identity does not change.
- Confirmation messages set `Reply-To: hola@replies.agenteagora.com`.
- The root `agenteagora.com` MX records remain assigned to Google Workspace. Only the `replies.agenteagora.com` subdomain receives a Resend inbound MX record.

## Application design

Add a Next.js Route Handler at `/api/webhooks/resend/inbound`. It must read the request body as raw text and verify the `svix-id`, `svix-timestamp`, and `svix-signature` headers using `RESEND_WEBHOOK_SECRET` before parsing or processing an event.

The handler processes only verified `email.received` events addressed to `hola@replies.agenteagora.com`. Other verified event types and other recipients return a successful ignored response so retries do not amplify unrelated traffic.

For an accepted event, the handler:

1. Retrieves the complete received email through the Resend Receiving API.
2. Lists attachments through Resend, rejects outbound-prohibited file extensions before download, and keeps encoded attachments within a 35 MB budget so the complete outgoing email remains below Resend's 40 MB limit.
3. Sends the forwarded message from `Agora Replies <hola@agenteagora.com>` to `sebastian@agenteagora.com`.
4. Sets the forwarded message's `Reply-To` to the original sender, so replying in Gmail addresses the lead rather than the forwarding address.
5. Preserves the original subject, HTML, plain text, and every send-compatible attachment that fits the forwarding budget.
6. If an attachment is prohibited or too large, delivers the message body and any remaining safe attachments with an omission notice. If Resend permanently rejects a send that contains attachments, retries once without attachments so the body is not stranded. Transient retrieval, download, and provider failures remain retryable.
7. Supplies an idempotency key derived from the inbound Resend email ID and delivery mode so webhook retries cannot create duplicate forwarded messages.

Missing runtime configuration is a service error, missing or invalid webhook authentication is a client error, and Resend retrieval or forwarding failures are server errors so Resend can retry them. Logs must not print webhook payloads, email bodies, attachment contents, API keys, or webhook secrets.

## Public contact surfaces

Replace the active public contact address with `hola@replies.agenteagora.com` in:

- Spanish and English footer translations.
- Privacy policy and terms contact links.
- Organization and ContactPoint JSON-LD.
- `public/llms.txt` and `public/llms-full.txt`.

Historical design and implementation documents retain their original text unless they are the new documents for this change.

## Runtime configuration

The deployment requires:

- Existing `RESEND_API_KEY`, with sufficient permission to retrieve received email, download attachments, and send the forwarded message.
- New `RESEND_WEBHOOK_SECRET`, sourced from the production Resend webhook and stored in Vercel Production configuration.
- A Resend domain or receiving-domain configuration for `replies.agenteagora.com` with receiving enabled.
- The exact Resend-provided MX record on `replies.agenteagora.com`.
- An enabled `email.received` webhook targeting `https://www.agenteagora.com/api/webhooks/resend/inbound`.

Secret values must never be committed, printed, copied into documentation, or exposed in test output.

## Verification

Automated tests must prove that:

- Contact confirmations use the new `Reply-To` address.
- Missing signature headers and invalid signatures are rejected before any Resend retrieval or forwarding.
- Unrelated event types and recipient addresses are ignored.
- A valid inbound event retrieves content and attachments, forwards to Sebastian, uses the original sender as `Reply-To`, and supplies a deterministic idempotency key.
- Prohibited or oversized attachments are omitted with a notice while the message body is still delivered, and a permanent attachment-send rejection falls back to a body-only forward.
- Retrieval, attachment, and forwarding errors return a retryable server response.
- The active footer, legal, structured-data, and LLM contact surfaces use the new address.

After deployment, verify the production endpoint rejects an unsigned request, the Resend receiving domain and webhook are enabled, DNS resolves only the new subdomain to Resend, and a real message sent to `hola@replies.agenteagora.com` arrives at `sebastian@agenteagora.com` with reply and attachment behavior intact.

## Non-goals

- Creating a Google Workspace mailbox or alias for `hola@agenteagora.com`.
- Changing the root-domain Google Workspace MX records.
- Moving the outbound From address to the receiving subdomain.
- Building an inbox UI, persistence layer, autoresponder, or CRM conversation history.
