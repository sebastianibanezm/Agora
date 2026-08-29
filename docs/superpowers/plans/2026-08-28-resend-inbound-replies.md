# Resend Inbound Replies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route every `hola@replies.agenteagora.com` message through an authenticated Resend webhook to `sebastian@agenteagora.com`, and publish the working address everywhere the landing site advertises contact email.

**Architecture:** The existing contact confirmation keeps its verified root-domain From identity but adds the receiving subdomain as Reply-To. A dedicated Next.js Route Handler verifies Resend's raw Svix payload, accepts only the intended recipient, retrieves full content and send-compatible attachments, and sends an idempotent forward whose Reply-To is the original lead. Prohibited, oversized, or permanently rejected attachments cannot prevent body delivery.

**Tech Stack:** Next.js 16 Route Handlers, TypeScript, Resend Node SDK 6.12.3, Vitest, Vercel, Resend Receiving, DNS MX.

**Spec:** `docs/superpowers/specs/2026-08-28-resend-inbound-replies-design.md`

## Global Constraints

- Public inbound address is exactly `hola@replies.agenteagora.com`.
- Final monitored destination is exactly `sebastian@agenteagora.com`.
- Outbound confirmation and forwarding From identities remain on `hola@agenteagora.com`.
- Root `agenteagora.com` Google Workspace MX records must not change.
- Webhook payloads are verified from raw request text before processing.
- Secrets and customer message contents must never be printed or committed.
- Preserve the unrelated untracked signature-banner image.

---

### Task 1: Centralize the Resend client and correct confirmation replies

**Files:**
- Create: `lib/resend-client.ts`
- Modify: `app/api/contact/route.ts`
- Test: `__tests__/api/contact-route.test.ts`

**Interfaces:**
- Produces: `resend`, the shared initialized Resend client.
- Produces: contact confirmation send payload with `replyTo: 'hola@replies.agenteagora.com'`.

- [ ] **Step 1: Write a failing contact-route test**

Mock `@/lib/resend-client` and the Airtable fetch, submit a complete `NextRequest`, and assert the outbound payload:

```ts
expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
  from: 'Agora <hola@agenteagora.com>',
  to: 'lead@example.com',
  replyTo: 'hola@replies.agenteagora.com',
}))
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `pnpm vitest run __tests__/api/contact-route.test.ts`

Expected: FAIL because the route has no `replyTo` and no shared client module.

- [ ] **Step 3: Add the shared client and Reply-To**

Create:

```ts
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
```

Import it from the contact route, remove the route-local constructor, and add:

```ts
replyTo: 'hola@replies.agenteagora.com',
```

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `pnpm vitest run __tests__/api/contact-route.test.ts`

Expected: PASS.

### Task 2: Add an authenticated, idempotent inbound forwarding webhook

**Files:**
- Create: `app/api/webhooks/resend/inbound/route.ts`
- Create: `__tests__/api/resend-inbound-route.test.ts`

**Interfaces:**
- Consumes: `resend` from `lib/resend-client.ts`.
- Consumes: raw request body plus `svix-id`, `svix-timestamp`, and `svix-signature` headers.
- Consumes: `RESEND_WEBHOOK_SECRET`.
- Produces: a `POST` handler at `/api/webhooks/resend/inbound`.

- [ ] **Step 1: Write failing authentication and filtering tests**

Cover missing configuration, missing headers, invalid signature, unrelated event type, and wrong recipient. Assert that no Receiving API or send call occurs in every rejected or ignored case.

```ts
expect(mockVerify).not.toHaveBeenCalled()
expect(mockReceivingGet).not.toHaveBeenCalled()
expect(mockSend).not.toHaveBeenCalled()
```

- [ ] **Step 2: Run the focused webhook tests and confirm RED**

Run: `pnpm vitest run __tests__/api/resend-inbound-route.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement raw-body authentication and recipient filtering**

Read `await request.text()`, verify with `resend.webhooks.verify`, and process only:

```ts
event.type === 'email.received' &&
event.data.to.some(address => address.toLowerCase() === 'hola@replies.agenteagora.com')
```

Return `503` for missing server configuration, `400` for missing or invalid webhook authentication, and `200` with `{ ignored: true }` for verified irrelevant events.

- [ ] **Step 4: Run authentication/filtering tests and confirm GREEN**

Run: `pnpm vitest run __tests__/api/resend-inbound-route.test.ts`

Expected: authentication and filtering cases PASS.

- [ ] **Step 5: Write failing forwarding tests**

Mock a valid received email and attachment download. Assert the send payload and idempotency option:

```ts
expect(mockSend).toHaveBeenCalledWith(
  expect.objectContaining({
    from: 'Agora Replies <hola@agenteagora.com>',
    to: 'sebastian@agenteagora.com',
    replyTo: 'lead@example.com',
    subject: 'Re: Agora',
    html: '<p>Reply body</p>',
    text: 'Reply body',
    attachments: [expect.objectContaining({ filename: 'quote.pdf' })],
  }),
  { idempotencyKey: 'inbound-forward/email_123/full' },
)
```

Also assert that retrieval, attachment listing/download, and transient send failures return `502` so Resend retries. Prohibited or oversized attachments must produce a successful body delivery with an omission notice, while permanent client-side attachment rejection must retry once without attachments.

- [ ] **Step 6: Implement retrieval, attachment forwarding, and idempotent send**

Use `resend.emails.receiving.get`, `resend.emails.receiving.attachments.list`, `fetch(download_url)`, and `resend.emails.send`. Convert attachment bytes to base64 and pass only send-supported attachment fields. Reject Resend's outbound-prohibited extensions, reserve 5 MB of its 40 MB encoded-message limit for content and headers, and use delivery-mode-specific idempotency keys. Omit incompatible attachments with a notice and retry permanent attachment validation failures once as body-only delivery.

- [ ] **Step 7: Run the focused webhook suite and confirm GREEN**

Run: `pnpm vitest run __tests__/api/resend-inbound-route.test.ts`

Expected: PASS for success, filtering, authentication, and retryable failure cases.

### Task 3: Publish the deliverable contact address everywhere active

**Files:**
- Modify: `messages/es.json`
- Modify: `messages/en.json`
- Modify: `lib/legal-content.ts`
- Modify: `app/[locale]/(marketing)/layout.tsx`
- Modify: `public/llms.txt`
- Modify: `public/llms-full.txt`
- Modify: `__tests__/landing/LandingFooter.test.tsx`
- Modify: `__tests__/legal/legal-content.test.tsx`
- Modify: `__tests__/seo/jsonld.test.tsx`

**Interfaces:**
- Produces: the exact public address `hola@replies.agenteagora.com` in visible, legal, machine-readable, and AI-discovery content.

- [ ] **Step 1: Update tests to require the new address**

Load real locale messages in the footer test and assert:

```ts
expect(esMessages.landing.footer.email).toBe('hola@replies.agenteagora.com')
expect(enMessages.landing.footer.email).toBe('hola@replies.agenteagora.com')
```

Update the legal contact link expectation and add JSON-LD assertions for both `Organization.email` and `Organization.contactPoint.email`.

- [ ] **Step 2: Run the focused public-contact tests and confirm RED**

Run: `pnpm vitest run __tests__/landing/LandingFooter.test.tsx __tests__/legal/legal-content.test.tsx __tests__/seo/jsonld.test.tsx`

Expected: FAIL because active surfaces still contain `hola@agenteagora.com`.

- [ ] **Step 3: Replace active public contact values**

Change only active runtime and published artifacts to `hola@replies.agenteagora.com`; do not rewrite historical specs or plans.

- [ ] **Step 4: Run public-contact tests and scan active files**

Run:

```bash
pnpm vitest run __tests__/landing/LandingFooter.test.tsx __tests__/legal/legal-content.test.tsx __tests__/seo/jsonld.test.tsx
rg -n 'hola@agenteagora\.com' app components lib messages public --glob '!public/landing/sebastian-ibanez-email-signature-banner.png'
```

Expected: tests PASS; the scan finds only intentional outbound From identities in `app/api`.

### Task 4: Document configuration and perform repository verification

**Files:**
- Modify: `README.md`
- Verify: all changed source, tests, spec, and plan files.

**Interfaces:**
- Produces: operator checklist for Vercel, Resend, DNS, and end-to-end validation without secret values.

- [ ] **Step 1: Document the production contract**

Add an inbound replies section naming `RESEND_WEBHOOK_SECRET`, the endpoint URL, receiving domain, Resend event type, forwarding destination, and the requirement not to change root Google Workspace MX records.

- [ ] **Step 2: Run the full local verification suite**

Run:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Expected: all commands exit `0`.

- [ ] **Step 3: Review the final diff and secret safety**

Run:

```bash
git diff --check
git diff --stat
git status --short
rg -n 're_[A-Za-z0-9]|whsec_' --glob '!node_modules/**' --glob '!.next/**' .
```

Expected: no whitespace errors, only scoped files changed, the unrelated signature banner remains untracked, and no credential value is present.

- [ ] **Step 4: Audit deploy-time state without revealing values**

Confirm the linked Vercel project, list environment-variable names only, inspect current DNS records, and inspect Resend domain/webhook metadata if authenticated access is available. Do not create, rotate, print, or copy secrets during the audit.

- [ ] **Step 5: Configure and verify production where authorized access exists**

Deploy the tested code, add the exact Resend-provided MX record only to `replies.agenteagora.com`, enable receiving, create the `email.received` webhook, store its signing secret as `RESEND_WEBHOOK_SECRET`, and send a real message with an attachment. Confirm it reaches `sebastian@agenteagora.com` and that Reply addresses the original sender.
