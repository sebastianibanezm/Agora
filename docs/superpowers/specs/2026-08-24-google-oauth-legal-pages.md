# Google OAuth Legal Pages Design

## Purpose

Publish the legal pages required to present Agora's Google OAuth consent screen to external users, while giving customers a clear, accurate explanation of the service's data practices and terms.

## Routes and localization

- Spanish is the default locale at `/privacy` and `/terms`.
- English is available at `/en/privacy` and `/en/terms`.
- Each page has localized metadata, a canonical URL, and `es`/`en` language alternates.
- The marketing footer links to the legal routes for the active locale.
- The sitemap includes all four URLs with matching language alternates.

## Privacy policy content

The policy identifies Agente Agora LLC as the service provider and `hola@agenteagora.com` as the privacy contact. It explains the categories of information collected, purposes of use, limited sharing with service providers, retention, security, international processing, user rights, children's privacy, and policy updates.

The Google-specific disclosure is explicit: Google login provides basic identity information such as name, email address, profile image, and a Google account identifier. Agora uses it only to authenticate and administer the account. Agora does not request access to Gmail, Google Drive, Google Calendar, or other Google Workspace content, and does not sell Google user data or use it for advertising.

## Terms content

The terms cover acceptance and authority, accounts and security, service use, acceptable use, customer content ownership, third-party authentication, confidentiality, orders and subscriptions, suspension and termination, disclaimers, limits permitted by applicable law, changes, and contact information. They must not invent a governing jurisdiction, pricing, liability cap, or commercial term that is not already established.

## Visual design

The pages use Agora's existing ivory, ink, display-serif, body-sans, and mono-label system. They are calm document pages with a compact branded header, readable measure, visible update date, section navigation, and the existing landing footer. No new dependency or motion is introduced.

## Quality requirements

- TDD: tests fail before production code is added.
- User-visible tests cover localized copy, Google-data boundaries, footer destinations, and sitemap entries.
- No em dash or en dash characters appear in new visible copy.
- Pages are semantic, keyboard-accessible, responsive, and build under Next.js 16.
- Run the focused tests, full Vitest suite, ESLint, TypeScript, and production build.

