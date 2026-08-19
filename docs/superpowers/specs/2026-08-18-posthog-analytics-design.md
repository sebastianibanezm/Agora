# PostHog Website Analytics Design

## Goal

Add PostHog product analytics and masked session replay to the Agora marketing site so the team can understand acquisition, visitor journeys, content engagement, and contact-form conversion.

## Scope

The integration will collect automatic page views, page leaves, clicks, and masked session recordings. It will also emit a small set of explicit business events:

- `contact_cta_clicked` from the hero and closing CTA band
- `resource_clicked` from the resources hub link and featured article
- `contact_form_started` once per page load when a visitor first interacts with the form
- `contact_form_submitted` after the contact API returns success
- `contact_form_failed` after a non-success response or network failure

No consent banner or analytics opt-in gate will be added. Session replay will remain enabled, with every form input masked. Analytics events will not include names, email addresses, company names, or other entered field values.

## Architecture

PostHog initialization will live in the Next.js client instrumentation entry point. A focused `lib/analytics.ts` module will own event names and capture helpers so components do not depend directly on PostHog behavior.

The site will use the existing PostHog Cloud US project. Public configuration will come from `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`. If either variable is absent, analytics calls will become safe no-ops so local development, tests, and previews do not fail.

Session replay will be enabled explicitly with all inputs masked. Automatic page-view and page-leave capture will use PostHog's current Next.js-supported client configuration.

## Components

### Client initialization

`instrumentation-client.ts` will initialize `posthog-js` only when both public environment variables are present. It will enable autocapture, page views, page leaves, and session replay while retaining input masking.

### Analytics boundary

`lib/analytics.ts` will export typed helpers for capturing events and identifying a converted lead. Capture failures must never interrupt navigation or form submission.

### CTA and content tracking

The hero and closing-band contact links will capture the CTA source before navigating to `#contact`. Resource links will capture whether the visitor selected the resources hub or the featured article.

### Contact funnel

The form will capture `contact_form_started` only on the first focus or volume selection. Submission success will capture `contact_form_submitted` with the selected volume range, then identify the browser using a normalized email address and attach the submitted name, company, and volume as person properties. Failure will capture only the failure category (`http` or `network`) and status code when available.

Identification occurs only after the API confirms success, preserving the anonymous pre-conversion journey and preventing failed or invalid submissions from creating identified profiles.

## Data Flow

1. A visitor loads the site and receives an anonymous PostHog identity.
2. Page views, autocaptured interactions, and masked replay data are recorded.
3. Explicit CTA, resource, and form-start events describe the conversion journey.
4. The contact form posts to the existing `/api/contact` route.
5. On success, the client captures the conversion and identifies the lead, merging the anonymous history into that profile.
6. On failure, the client records a non-PII failure event and keeps the form's existing error behavior.

## Error Handling

Missing analytics configuration, blocked analytics requests, browser privacy tools, and PostHog runtime failures must not affect rendering, navigation, or contact submission. The existing contact API remains the source of truth for conversion success.

## Testing

Vitest and Testing Library tests will verify:

- analytics initialization is skipped without configuration and uses masked replay when configured;
- analytics helpers capture the intended event names and properties;
- hero, closing-band, and resource interactions emit source-specific events;
- form start is emitted once;
- successful submission emits conversion and identity calls in the intended flow;
- HTTP and network failures emit non-PII failure events;
- no analytics failure blocks the existing visitor interaction.

The complete suite, TypeScript typecheck, ESLint, and a production Next.js build must pass before publication.

## Deployment

Vercel must define:

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
- `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`

The repository documentation will explain these variables and the event taxonomy. The public project token is intentionally browser-visible; no PostHog personal API key will be stored in the repository.
