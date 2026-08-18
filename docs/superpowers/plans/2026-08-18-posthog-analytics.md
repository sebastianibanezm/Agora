# PostHog Website Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PostHog acquisition and conversion analytics with masked session replay to the Agora marketing site.

**Architecture:** Initialize `posthog-js` from Next.js 16's root client-instrumentation entry point and isolate all analytics behavior behind a typed `lib/analytics.ts` boundary. Marketing components emit explicit non-PII events, while the contact form identifies a lead only after its API request succeeds.

**Tech Stack:** Next.js 16.2, React 19, TypeScript, PostHog JavaScript SDK, Vitest, Testing Library, pnpm

---

## File Structure

- Create `instrumentation-client.ts`: invoke browser analytics initialization before hydration.
- Create `lib/analytics.ts`: own PostHog configuration, event taxonomy, safe capture, and post-conversion identity.
- Create `__tests__/analytics.test.ts`: verify initialization, replay masking, safe failures, events, and identity.
- Modify `components/landing/LandingHero.tsx`: emit the hero CTA event.
- Modify `components/landing/LandingCtaBand.tsx`: emit the closing CTA event.
- Modify `components/landing/LandingResources.tsx`: emit hub and featured-resource events.
- Modify `components/landing/LandingContact.tsx`: emit form start, success, failure, and identity operations.
- Modify existing landing tests: verify component-level analytics wiring.
- Modify `README.md`: document required Vercel variables, events, and replay behavior.
- Modify `package.json` and `pnpm-lock.yaml`: add `posthog-js`.

### Task 1: Install PostHog and define the analytics boundary

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `__tests__/analytics.test.ts`
- Create: `lib/analytics.ts`
- Create: `instrumentation-client.ts`

- [ ] **Step 1: Install the browser SDK**

Run:

```bash
pnpm add posthog-js --ignore-scripts
```

Expected: `posthog-js` appears in `dependencies`, and `pnpm-lock.yaml` is updated without running dependency lifecycle scripts.

- [ ] **Step 2: Write failing analytics tests**

Create `__tests__/analytics.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the test and verify the RED state**

Run:

```bash
./node_modules/.bin/vitest run __tests__/analytics.test.ts
```

Expected: FAIL because `@/lib/analytics` does not exist.

- [ ] **Step 4: Implement the minimal analytics module**

Create `lib/analytics.ts` with typed source values, `initializeAnalytics`, explicit capture helpers, and `identifyContactLead`. Use direct `process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `process.env.NEXT_PUBLIC_POSTHOG_HOST` accesses so Next.js can inline the public configuration. Wrap every PostHog call in `try/catch` and never log form values.

Initialization must pass:

```ts
{
  api_host: host,
  defaults: '2026-05-30',
  autocapture: true,
  capture_pageview: 'history_change',
  capture_pageleave: true,
  disable_session_recording: false,
  session_recording: { maskAllInputs: true },
}
```

Create `instrumentation-client.ts`:

```ts
import { initializeAnalytics } from '@/lib/analytics'

initializeAnalytics()
```

- [ ] **Step 5: Run the analytics tests and verify GREEN**

Run:

```bash
./node_modules/.bin/vitest run __tests__/analytics.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 6: Commit the analytics foundation**

```bash
git add package.json pnpm-lock.yaml instrumentation-client.ts lib/analytics.ts __tests__/analytics.test.ts
git commit -m "feat: initialize PostHog website analytics"
```

### Task 2: Track CTA and resource engagement

**Files:**
- Modify: `__tests__/landing/LandingHero.test.tsx`
- Modify: `__tests__/landing/LandingNewSections.test.tsx`
- Modify: `components/landing/LandingHero.tsx`
- Modify: `components/landing/LandingCtaBand.tsx`
- Modify: `components/landing/LandingResources.tsx`

- [ ] **Step 1: Add failing interaction tests**

In `LandingHero.test.tsx`, mock `captureContactCta`, click the primary CTA, and assert:

```ts
expect(mockCaptureContactCta).toHaveBeenCalledWith('hero')
```

In `LandingNewSections.test.tsx`, mock `captureContactCta` and `captureResourceClick`, then add tests asserting:

```ts
expect(mockCaptureContactCta).toHaveBeenCalledWith('cta_band')
expect(mockCaptureResourceClick).toHaveBeenCalledWith('hub', '/recursos')
expect(mockCaptureResourceClick).toHaveBeenCalledWith(
  'featured_article',
  '/recursos/ley-21719-proteccion-de-datos-agro',
)
```

- [ ] **Step 2: Run focused tests and verify RED**

```bash
./node_modules/.bin/vitest run __tests__/landing/LandingHero.test.tsx __tests__/landing/LandingNewSections.test.tsx
```

Expected: FAIL because the click handlers do not call the analytics helpers.

- [ ] **Step 3: Add minimal component event handlers**

Import the appropriate helper from `@/lib/analytics` and add these handlers:

```tsx
onClick={() => captureContactCta('hero')}
```

```tsx
onClick={() => captureContactCta('cta_band')}
```

```tsx
onClick={() => captureResourceClick('hub', '/recursos')}
```

```tsx
onClick={() => captureResourceClick('featured_article', ARTICLE_PATH)}
```

Keep link destinations and navigation behavior unchanged.

- [ ] **Step 4: Re-run focused tests and verify GREEN**

```bash
./node_modules/.bin/vitest run __tests__/landing/LandingHero.test.tsx __tests__/landing/LandingNewSections.test.tsx
```

Expected: all focused tests pass.

- [ ] **Step 5: Commit engagement tracking**

```bash
git add components/landing/LandingHero.tsx components/landing/LandingCtaBand.tsx components/landing/LandingResources.tsx __tests__/landing/LandingHero.test.tsx __tests__/landing/LandingNewSections.test.tsx
git commit -m "feat: track marketing engagement events"
```

### Task 3: Track and identify the contact-form funnel

**Files:**
- Modify: `__tests__/landing/LandingContact.test.tsx`
- Modify: `components/landing/LandingContact.tsx`

- [ ] **Step 1: Add failing form-funnel tests**

Mock the analytics helpers and add tests covering:

1. Focusing multiple fields and selecting volume emits `contact_form_started` once.
2. A successful `fetch` captures `contact_form_submitted` with only the volume range, then calls `identifyContactLead` with the submitted lead object.
3. A non-success response captures `contact_form_failed('http', status)` and never identifies.
4. A rejected request captures `contact_form_failed('network')` and never identifies.

Use real form interactions and `waitFor` for the asynchronous state transition. Reset analytics mocks and `global.fetch` in `beforeEach`.

- [ ] **Step 2: Run the contact tests and verify RED**

```bash
./node_modules/.bin/vitest run __tests__/landing/LandingContact.test.tsx
```

Expected: FAIL because the form does not call analytics helpers.

- [ ] **Step 3: Implement one-time start tracking**

Add a `useRef(false)` guard and a `trackFormStarted` callback. Attach it to the form through `onFocusCapture`, and call it from the volume-option click before setting the selected volume.

- [ ] **Step 4: Implement success and failure tracking**

Build a local lead object from `FormData` before the request. After `fetch`:

```ts
if (res.ok) {
  captureContactFormSubmitted(volume)
  identifyContactLead(lead)
  setStatus('success')
} else {
  captureContactFormFailed('http', res.status)
  setStatus('error')
}
```

In `catch`, call `captureContactFormFailed('network')` before retaining the existing error state. Do not include names, email, or company in any `capture` event.

- [ ] **Step 5: Re-run the contact tests and verify GREEN**

```bash
./node_modules/.bin/vitest run __tests__/landing/LandingContact.test.tsx
```

Expected: all contact tests pass.

- [ ] **Step 6: Commit form-funnel tracking**

```bash
git add components/landing/LandingContact.tsx __tests__/landing/LandingContact.test.tsx
git commit -m "feat: track contact form conversion funnel"
```

### Task 4: Document deployment configuration

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add analytics operations documentation**

Document:

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
- `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`
- variables are public and frozen at build time;
- session replay is enabled and all inputs are masked;
- the five explicit event names and their non-PII properties;
- identification happens only after successful contact submission;
- missing variables disable analytics without breaking the site.

- [ ] **Step 2: Check documentation and diff integrity**

```bash
git diff --check
rg -n "NEXT_PUBLIC_POSTHOG|contact_form_submitted|mask" README.md
```

Expected: no whitespace errors and all operational details are discoverable.

- [ ] **Step 3: Commit documentation**

```bash
git add README.md
git commit -m "docs: document PostHog analytics operations"
```

### Task 5: Full verification and publication

**Files:**
- Review all changed files

- [ ] **Step 1: Run the full test suite**

```bash
./node_modules/.bin/vitest run
```

Expected: all tests pass with no warnings caused by the analytics integration.

- [ ] **Step 2: Run TypeScript and ESLint**

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint .
```

Expected: both commands exit 0.

- [ ] **Step 3: Run a production build without analytics variables**

```bash
./node_modules/.bin/next build
```

Expected: build succeeds, proving missing configuration is a safe no-op.

- [ ] **Step 4: Run a production build with public analytics variables**

```bash
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_build_verification NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com ./node_modules/.bin/next build
```

Expected: build succeeds and includes `instrumentation-client.ts`.

- [ ] **Step 5: Review the final diff and dependency audit**

```bash
git diff origin/main...HEAD --check
git status --short
pnpm audit --prod
```

Expected: no whitespace errors, only intended files changed, and no unresolved production vulnerabilities attributable to this change.

- [ ] **Step 6: Push the branch and open a pull request**

```bash
git push -u origin codex/posthog-analytics
gh pr create --base main --head codex/posthog-analytics --title "Add PostHog website analytics and masked replay" --body-file /tmp/agora-posthog-pr.md
```

The pull request body must summarize behavior, list verification commands and results, and call out the two Vercel environment variables required after merge.
