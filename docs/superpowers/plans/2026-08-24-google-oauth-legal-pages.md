# Google OAuth Legal Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish bilingual privacy and terms pages that satisfy Agora's Google OAuth external-audience branding requirements.

**Architecture:** Keep legal copy in a typed, locale-keyed data module, render both documents through one server-compatible document component, and expose the pages through localized App Router routes. Extend the existing footer and sitemap rather than introducing a parallel navigation or SEO system.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, next-intl, Tailwind CSS 4, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-08-24-google-oauth-legal-pages.md`

## Global Constraints

- Spanish routes are `/privacy` and `/terms`; English routes are `/en/privacy` and `/en/terms`.
- The privacy policy names Agente Agora LLC and `hola@agenteagora.com` and accurately limits Google access to basic authentication identity data.
- State explicitly that Agora does not request Gmail, Google Drive, Google Calendar, or other Google Workspace content and does not sell Google user data or use it for advertising.
- Do not invent a governing jurisdiction, pricing, liability cap, or commercial term.
- Preserve Agora's existing ivory-and-ink editorial design; add no dependency and no motion.
- New visible copy must contain no em dash or en dash characters.
- Follow TDD and keep tests focused on user-visible behavior.
- All metadata and routing code must follow the local Next.js 16 documentation already installed in `node_modules/next/dist/docs/`.

---

### Task 1: Bilingual legal pages, navigation, and discovery

**Files:**
- Create: `lib/legal-content.ts`
- Create: `components/legal/LegalDocumentPage.tsx`
- Create: `app/[locale]/(marketing)/privacy/page.tsx`
- Create: `app/[locale]/(marketing)/terms/page.tsx`
- Create: `__tests__/legal/legal-content.test.tsx`
- Modify: `components/landing/LandingFooter.tsx`
- Modify: `messages/es.json`
- Modify: `messages/en.json`
- Modify: `__tests__/landing/LandingFooter.test.tsx`
- Modify: `app/sitemap.ts`
- Modify: `__tests__/seo/sitemap.test.ts`

**Interfaces:**
- Produces: `LegalDocument` and `LegalLocale` types plus `getLegalDocument(kind, locale)` from `lib/legal-content.ts`.
- Consumes: the current `es` and `en` locale model, `LandingFooter`, existing design tokens, and `SITE_URL` conventions.
- Produces: metadata-bearing privacy and terms pages at the four required public URLs.

**Task constraints:**
- Spanish routes are `/privacy` and `/terms`; English routes are `/en/privacy` and `/en/terms`.
- The privacy policy names Agente Agora LLC and `hola@agenteagora.com` and accurately limits Google access to basic authentication identity data.
- State explicitly that Agora does not request Gmail, Google Drive, Google Calendar, or other Google Workspace content and does not sell Google user data or use it for advertising.
- Do not invent a governing jurisdiction, pricing, liability cap, or commercial term.
- Preserve Agora's existing ivory-and-ink editorial design; add no dependency and no motion.
- New visible copy must contain no em dash or en dash characters.
- Follow TDD and keep tests focused on user-visible behavior.
- Await route params as required by Next.js 16 and use the installed local framework documentation for any uncertainty.

- [ ] **Step 1: Write failing content, footer, and sitemap tests**

Create `__tests__/legal/legal-content.test.tsx` to render `LegalDocumentPage` with the documents returned by `getLegalDocument`. Assert localized H1 headings, Agente Agora LLC, the privacy contact mail link, Google identity use, and explicit absence of Gmail, Drive, and Calendar access. Assert the terms include account security, customer-content ownership, termination, and contact sections. Extend `LandingFooter.test.tsx` so the Spanish mock asserts `/privacy` and `/terms`; add an English-locale case asserting `/en/privacy` and `/en/terms`. Extend `sitemap.test.ts` to assert all four URLs and reciprocal `es`/`en` alternates.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
./node_modules/.bin/vitest run __tests__/legal/legal-content.test.tsx __tests__/landing/LandingFooter.test.tsx __tests__/seo/sitemap.test.ts
```

Expected: failure because the legal modules and required links and sitemap entries do not exist.

- [ ] **Step 3: Implement typed bilingual legal content**

Create `lib/legal-content.ts` with `LegalLocale = 'es' | 'en'`, `LegalKind = 'privacy' | 'terms'`, section objects with stable IDs, and `getLegalDocument`. Use an effective date of August 24, 2026 in English and `24 de agosto de 2026` in Spanish. The privacy document must cover controller/contact, data collected, Google login, uses, processors, retention, security, transfers, rights, children, and updates. The terms must cover acceptance/authority, accounts/security, service, acceptable use, customer content, third-party authentication, confidentiality, subscriptions/order forms, suspension/termination, disclaimers and lawful limits, changes, and contact. Keep the prose practical, reciprocal across locales, and within all Global Constraints.

- [ ] **Step 4: Implement the shared legal document page**

Create `components/legal/LegalDocumentPage.tsx` as a server-compatible component. Render a compact logo/home link, locale-aware sibling-document links, an eyebrow, H1, summary, effective date, an `aside` table of contents linked to semantic `<section id>` elements, contact links, and `LandingFooter`. Use existing CSS variables and Tailwind classes with a readable content width, responsive single-column fallback, visible focus behavior inherited from the site, and no animation.

- [ ] **Step 5: Implement localized routes and metadata**

Create the two App Router `page.tsx` files. Await `params: Promise<{ locale: string }>` as required by Next.js 16, normalize unexpected locales to Spanish, call `getLegalDocument`, and render `LegalDocumentPage`. Export `generateMetadata` with localized title and description, exact canonical URL, `alternates.languages` for `es` and `en`, and matching Open Graph fields.

- [ ] **Step 6: Add locale-aware footer links**

Add `footer.linkPrivacy` and `footer.linkTerms` messages in Spanish and English. Render both as Next links using `/privacy` and `/terms` for Spanish, and `/en/privacy` and `/en/terms` for English. Make homepage section destinations locale-aware absolute paths so footer navigation also works from a legal page: Spanish `/#section`, English `/en/#section`; keep `/recursos` as the existing Spanish resource destination.

- [ ] **Step 7: Add sitemap discovery**

Add one entry per legal URL to `app/sitemap.ts`. Each Spanish and English pair must share reciprocal language alternates, use `changeFrequency: 'yearly'`, and use a lower priority than the homepage.

- [ ] **Step 8: Run focused tests and verify GREEN**

Run the focused command from Step 2. Expected: all focused tests pass.

- [ ] **Step 9: Run full verification**

Run:

```bash
./node_modules/.bin/vitest run
./node_modules/.bin/eslint .
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/next build
```

Expected: all commands exit 0. Search new visible content with `rg '[—–]'` and confirm no matches.

- [ ] **Step 10: Commit**

```bash
git add docs/superpowers/specs/2026-08-24-google-oauth-legal-pages.md docs/superpowers/plans/2026-08-24-google-oauth-legal-pages.md lib/legal-content.ts components/legal/LegalDocumentPage.tsx 'app/[locale]/(marketing)/privacy/page.tsx' 'app/[locale]/(marketing)/terms/page.tsx' __tests__/legal/legal-content.test.tsx components/landing/LandingFooter.tsx messages/es.json messages/en.json __tests__/landing/LandingFooter.test.tsx app/sitemap.ts __tests__/seo/sitemap.test.ts
git commit -m "feat: add bilingual legal pages"
```
