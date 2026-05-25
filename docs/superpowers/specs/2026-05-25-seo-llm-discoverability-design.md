# SEO & LLM Discoverability — Design Spec

**Date:** 2026-05-25  
**Scope:** Option B — Technical foundation + metadata polish  
**Target:** Latin American exporters (Spanish-primary) + English-language investors and international audience

---

## 1. Crawler Access

### `app/robots.ts`
Next.js route handler that generates `robots.txt`. Rules:
- Allow all crawlers on `/`
- Block all crawlers on `/app/*`, `/api/*` (authenticated product routes, not useful for search)
- Point `Sitemap` to `https://www.agenteagora.com/sitemap.xml`

### `app/sitemap.ts`
Next.js route handler that generates `sitemap.xml`. Entries:
- `https://www.agenteagora.com/` — Spanish landing page (default locale, `localePrefix: 'never'`)
- `https://www.agenteagora.com/en` — English landing page

Each entry includes `lastModified`, `changeFrequency: 'monthly'`, and `priority: 1.0`.

Note: the `/en` route must resolve. Since `localePrefix: 'never'` is set, next-intl serves locale via cookie — we need to verify the `/en` path renders correctly or adjust routing to support it explicitly.

### Google Search Console
- Add a `verification` key to the `metadata` export in `app/[locale]/layout.tsx` so ownership can be confirmed by pasting the GSC meta tag value — no structural change needed.
- After deploying, submit `https://www.agenteagora.com/sitemap.xml` via GSC and request indexing of the homepage.

---

## 2. Metadata Polish

### Global layout — `app/[locale]/layout.tsx`

Current description: `"Plataforma operacional para exportaciones."` — too thin.

Updated global metadata:
```ts
title: {
  default: 'Agora — Export Intelligence para Exportadores',
  template: '%s | Agora',
},
description: 'Agora es la plataforma operacional para exportadores de fruta y frutos secos. Automatiza documentos, detecta excepciones antes del cut-off y da visibilidad en tiempo real a todo tu equipo.',
keywords: ['exportaciones Chile', 'plataforma exportaciones', 'export intelligence', 'documentos exportación', 'fruta exportación', 'logística exportaciones', 'BL', 'bill of lading'],
alternates: {
  canonical: 'https://www.agenteagora.com',
  languages: {
    'es': 'https://www.agenteagora.com',
    'en': 'https://www.agenteagora.com/en',
  },
},
```

### Landing page — `app/[locale]/(marketing)/page.tsx`

Add page-level OpenGraph and Twitter tags (currently only global ones exist):
```ts
openGraph: {
  title: 'Agora — Export Intelligence para Exportadores',
  description: 'Automatiza tu flujo documental, elimina multas por errores y expedita la cobranza. La plataforma operacional agéntica para exportaciones.',
  url: 'https://www.agenteagora.com',
  siteName: 'Agora',
  images: [{ url: 'https://www.agenteagora.com/og-image.png', width: 1200, height: 630 }],
  locale: 'es_CL',
  type: 'website',
},
twitter: {
  card: 'summary_large_image',
  title: 'Agora — Export Intelligence para Exportadores',
  description: 'Automatiza tu flujo documental, elimina multas por errores y expedita la cobranza.',
  images: ['https://www.agenteagora.com/og-image.png'],
},
```

---

## 3. Structured Data (JSON-LD)

Add a `<script type="application/ld+json">` block to `app/[locale]/(marketing)/layout.tsx` (currently a passthrough — add JSON-LD without other changes).

Two schemas:

### `Organization`
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Agente Agora LLC",
  "url": "https://www.agenteagora.com",
  "logo": "https://www.agenteagora.com/agora-logo.png",
  "description": "Plataforma de export intelligence para exportadores de fruta y frutos secos en Latinoamérica.",
  "areaServed": ["CL", "PE", "EC", "US"],
  "contactPoint": {
    "@type": "ContactPoint",
    "url": "https://www.agenteagora.com/#contacto",
    "contactType": "sales"
  }
}
```

### `SoftwareApplication`
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Agora",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Plataforma operacional para exportadores. Automatiza documentos, detecta excepciones antes del cut-off naviero y centraliza la coordinación de embarques.",
  "audience": {
    "@type": "BusinessAudience",
    "audienceType": "Exportadores de fruta y frutos secos"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://www.agenteagora.com/#contacto"
  }
}
```

Both schemas are server-rendered and invisible to users.

---

## 4. LLM Discoverability

### `public/llms.txt` (minor update)
The existing file is solid. Small additions:
- Add a `## Keywords` section with anchor terms (BL, DUS, fitosanitario, demurrage, cut-off, packing list, naviera, booking, consignatario)
- Add a `## What Agora is not` section to prevent LLM misclassification (not a freight forwarder, not a customs broker, not a TMS)
- Company name and location (`Agente Agora LLC — Latinoamerica, Estados Unidos`) stays as-is

### `public/llms-full.txt` (new file)
Expanded context for AI assistants that support the llms.txt standard (Perplexity, Claude, etc.). Includes:
- Full problem narrative (three failure modes: late deviation detection, document silos, coordination without context)
- Three product pillars with detail
- Concrete stats: 18h reaction window before cut-off, 94% reduction in manual coordination time, 0 cold-chain claims in cherry season 2025–2026
- Domain glossary: BL, DUS, fitosanitario, demurrage, packing list, naviera, booking confirmation, consignatario, SAG certificate, carta de crédito
- Ideal customer profile
- What Agora is not (freight forwarder, customs broker, TMS, ERP)
- Company: Agente Agora LLC, Latinoamerica / Estados Unidos, https://www.agenteagora.com

---

## Files Changed

| File | Action |
|------|--------|
| `app/robots.ts` | Create |
| `app/sitemap.ts` | Create |
| `app/[locale]/layout.tsx` | Update metadata |
| `app/[locale]/(marketing)/layout.tsx` | Add JSON-LD |
| `app/[locale]/(marketing)/page.tsx` | Add OG/Twitter metadata |
| `public/llms.txt` | Update (keywords + "not" section) |
| `public/llms-full.txt` | Create |

---

## Out of Scope

- Keyword research or copy rewrites (Option C)
- Blog / resource section
- Google Analytics or tracking setup
- Performance/Core Web Vitals optimization
