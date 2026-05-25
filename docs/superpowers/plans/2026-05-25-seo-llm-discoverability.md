# SEO & LLM Discoverability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Agora's landing page fully discoverable by search engines and LLM crawlers through robots/sitemap files, rich metadata, JSON-LD structured data, and expanded LLM context files.

**Architecture:** Seven self-contained changes across three layers — crawler infrastructure (`robots.ts`, `sitemap.ts`), Next.js metadata (layout + page exports), and static content files (`llms.txt`, `llms-full.txt`). Each task is independent and commits cleanly on its own.

**Tech Stack:** Next.js App Router (`MetadataRoute.Robots`, `MetadataRoute.Sitemap`, `Metadata`), schema.org JSON-LD, llms.txt standard, Vitest + @testing-library/react

> **Routing note:** There is no `middleware.ts` in this project. With `localePrefix: 'never'`, locale is determined by cookie — `/en` is not a real URL. The sitemap lists only `https://www.agenteagora.com/`. Hreflang is omitted from the sitemap but remains in metadata `alternates` for browser/crawler hints.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/robots.ts` | Create | Crawler access rules + sitemap pointer |
| `app/sitemap.ts` | Create | XML sitemap with landing page URL |
| `app/[locale]/layout.tsx` | Modify | Richer description, keywords, alternates, GSC placeholder |
| `app/[locale]/(marketing)/layout.tsx` | Modify | JSON-LD Organization + SoftwareApplication schemas |
| `app/[locale]/(marketing)/page.tsx` | Modify | Page-level OG + Twitter metadata |
| `public/llms.txt` | Modify | Add Keywords + "What Agora is not" sections |
| `public/llms-full.txt` | Create | Expanded LLM context: pillars, stats, glossary, ICP |
| `__tests__/seo/robots.test.ts` | Create | Unit test for robots export |
| `__tests__/seo/sitemap.test.ts` | Create | Unit test for sitemap export |
| `__tests__/seo/metadata.test.ts` | Create | Tests for global + page metadata exports |
| `__tests__/seo/jsonld.test.tsx` | Create | Render test for JSON-LD scripts |
| `__tests__/seo/llms.test.ts` | Create | Content assertions for llms.txt + llms-full.txt |

---

## Task 1: robots.ts

**Files:**
- Create: `app/robots.ts`
- Create: `__tests__/seo/robots.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/seo/robots.test.ts
import { describe, it, expect } from 'vitest'
import robots from '@/app/robots'

describe('robots', () => {
  it('allows all user agents at root', () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
    expect(rules.userAgent).toBe('*')
    expect(rules.allow).toBe('/')
  })

  it('disallows /app/ and /api/ paths', () => {
    const result = robots()
    const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules
    expect(rules.disallow).toContain('/app/')
    expect(rules.disallow).toContain('/api/')
  })

  it('points sitemap to the correct URL', () => {
    const result = robots()
    expect(result.sitemap).toBe('https://www.agenteagora.com/sitemap.xml')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/seo/robots.test.ts
```

Expected: FAIL — `Cannot find module '@/app/robots'`

- [ ] **Step 3: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/api/'],
    },
    sitemap: 'https://www.agenteagora.com/sitemap.xml',
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/seo/robots.test.ts
```

Expected: PASS — 3 tests

- [ ] **Step 5: Commit**

```bash
git add app/robots.ts __tests__/seo/robots.test.ts
git commit -m "feat(seo): add robots.ts allowing crawlers, blocking /app/ and /api/"
```

---

## Task 2: sitemap.ts

**Files:**
- Create: `app/sitemap.ts`
- Create: `__tests__/seo/sitemap.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/seo/sitemap.test.ts
import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'

describe('sitemap', () => {
  it('includes the canonical homepage URL', () => {
    const result = sitemap()
    const urls = result.map(entry => entry.url)
    expect(urls).toContain('https://www.agenteagora.com')
  })

  it('sets priority 1.0 on the homepage', () => {
    const result = sitemap()
    const homepage = result.find(e => e.url === 'https://www.agenteagora.com')
    expect(homepage?.priority).toBe(1.0)
  })

  it('sets changeFrequency to monthly on the homepage', () => {
    const result = sitemap()
    const homepage = result.find(e => e.url === 'https://www.agenteagora.com')
    expect(homepage?.changeFrequency).toBe('monthly')
  })

  it('includes a lastModified date', () => {
    const result = sitemap()
    const homepage = result.find(e => e.url === 'https://www.agenteagora.com')
    expect(homepage?.lastModified).toBeInstanceOf(Date)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/seo/sitemap.test.ts
```

Expected: FAIL — `Cannot find module '@/app/sitemap'`

- [ ] **Step 3: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.agenteagora.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/seo/sitemap.test.ts
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add app/sitemap.ts __tests__/seo/sitemap.test.ts
git commit -m "feat(seo): add sitemap.ts with canonical homepage entry"
```

---

## Task 3: Global metadata polish

**Files:**
- Modify: `app/[locale]/layout.tsx`
- Create: `__tests__/seo/metadata.test.ts`

Current global metadata is thin (`"Plataforma operacional para exportaciones."`). This task upgrades description, adds keywords, alternates, and a GSC verification placeholder.

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/seo/metadata.test.ts
import { describe, it, expect } from 'vitest'
import { metadata } from '@/app/[locale]/layout'

describe('global metadata', () => {
  it('has a title template', () => {
    expect(typeof metadata.title === 'object' && metadata.title !== null && 'template' in metadata.title).toBe(true)
  })

  it('description mentions fruta y frutos secos', () => {
    expect(metadata.description).toMatch(/fruta y frutos secos/)
  })

  it('has keywords array', () => {
    expect(Array.isArray(metadata.keywords)).toBe(true)
    expect((metadata.keywords as string[]).length).toBeGreaterThan(0)
  })

  it('has alternates with canonical', () => {
    expect(metadata.alternates?.canonical).toBe('https://www.agenteagora.com')
  })

  it('has metadataBase set', () => {
    expect(metadata.metadataBase?.toString()).toBe('https://www.agenteagora.com/')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/seo/metadata.test.ts
```

Expected: FAIL — description and keywords assertions fail

- [ ] **Step 3: Update `app/[locale]/layout.tsx` metadata export**

Replace the existing `metadata` export with:

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://www.agenteagora.com'),
  title: {
    default: 'Agora — Export Intelligence para Exportadores',
    template: '%s | Agora',
  },
  description:
    'Agora es la plataforma operacional para exportadores de fruta y frutos secos. Automatiza documentos, detecta excepciones antes del cut-off y da visibilidad en tiempo real a todo tu equipo.',
  keywords: [
    'exportaciones Chile',
    'plataforma exportaciones',
    'export intelligence',
    'documentos exportación',
    'fruta exportación',
    'logística exportaciones',
    'BL',
    'bill of lading',
    'shipment intelligence',
  ],
  alternates: {
    canonical: 'https://www.agenteagora.com',
    languages: {
      es: 'https://www.agenteagora.com',
      en: 'https://www.agenteagora.com',
    },
  },
  openGraph: {
    title: 'Agora — Export Intelligence para Exportadores',
    description:
      'Plataforma operacional para exportadores de fruta y frutos secos. Automatiza documentos, detecta excepciones antes del cut-off y da visibilidad en tiempo real a todo tu equipo.',
    images: [{ url: 'https://www.agenteagora.com/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agora — Export Intelligence para Exportadores',
    description:
      'Plataforma operacional para exportadores de fruta y frutos secos. Automatiza documentos, detecta excepciones antes del cut-off y da visibilidad en tiempo real a todo tu equipo.',
    images: ['https://www.agenteagora.com/og-image.png'],
  },
  // Replace the empty string with your Google Search Console verification code after setup
  // verification: { google: 'PASTE_GSC_CODE_HERE' },
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/seo/metadata.test.ts
```

Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/layout.tsx" __tests__/seo/metadata.test.ts
git commit -m "feat(seo): enrich global metadata with description, keywords, and alternates"
```

---

## Task 4: Landing page OG + Twitter metadata

**Files:**
- Modify: `app/[locale]/(marketing)/page.tsx`
- Modify: `__tests__/seo/metadata.test.ts` (add landing page tests)

- [ ] **Step 1: Add failing tests to `__tests__/seo/metadata.test.ts`**

Append this block to the existing file:

```ts
import { metadata as landingMetadata } from '@/app/[locale]/(marketing)/page'

describe('landing page metadata', () => {
  it('has openGraph title', () => {
    expect(landingMetadata.openGraph?.title).toBeTruthy()
  })

  it('openGraph description is specific to landing page copy', () => {
    expect(landingMetadata.openGraph?.description).toMatch(/flujo documental|exportaciones/)
  })

  it('has openGraph image', () => {
    const images = landingMetadata.openGraph?.images
    expect(images).toBeTruthy()
  })

  it('has twitter card', () => {
    expect(landingMetadata.twitter?.card).toBe('summary_large_image')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/seo/metadata.test.ts
```

Expected: FAIL — landing page metadata tests fail (no OG on page)

- [ ] **Step 3: Update `app/[locale]/(marketing)/page.tsx` metadata export**

Replace the existing `metadata` export with:

```ts
export const metadata: Metadata = {
  title: 'Agora — Export Intelligence para Exportadores',
  description:
    'Coordina documentos, detecta excepciones y mantén a tu equipo en contexto. La capa operacional para exportadoras.',
  openGraph: {
    title: 'Agora — Export Intelligence para Exportadores',
    description:
      'Automatiza tu flujo documental, elimina multas por errores y expedita la cobranza. La plataforma operacional agéntica para exportaciones.',
    url: 'https://www.agenteagora.com',
    siteName: 'Agora',
    images: [{ url: 'https://www.agenteagora.com/og-image.png', width: 1200, height: 630 }],
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agora — Export Intelligence para Exportadores',
    description:
      'Automatiza tu flujo documental, elimina multas por errores y expedita la cobranza.',
    images: ['https://www.agenteagora.com/og-image.png'],
  },
}
```

- [ ] **Step 4: Run all metadata tests**

```bash
npx vitest run __tests__/seo/metadata.test.ts
```

Expected: PASS — all 9 tests

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/(marketing)/page.tsx" __tests__/seo/metadata.test.ts
git commit -m "feat(seo): add page-level OG and Twitter metadata to landing page"
```

---

## Task 5: JSON-LD structured data

**Files:**
- Modify: `app/[locale]/(marketing)/layout.tsx`
- Create: `__tests__/seo/jsonld.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// __tests__/seo/jsonld.test.tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MarketingLayout from '@/app/[locale]/(marketing)/layout'

describe('marketing layout JSON-LD', () => {
  it('renders an Organization schema script tag', () => {
    const { container } = render(
      <MarketingLayout>
        <div />
      </MarketingLayout>
    )
    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    const schemas = Array.from(scripts).map(s => JSON.parse(s.textContent ?? '{}'))
    const org = schemas.find((s: { '@type': string }) => s['@type'] === 'Organization')
    expect(org).toBeTruthy()
    expect(org.name).toBe('Agente Agora LLC')
    expect(org.url).toBe('https://www.agenteagora.com')
  })

  it('renders a SoftwareApplication schema script tag', () => {
    const { container } = render(
      <MarketingLayout>
        <div />
      </MarketingLayout>
    )
    const scripts = container.querySelectorAll('script[type="application/ld+json"]')
    const schemas = Array.from(scripts).map(s => JSON.parse(s.textContent ?? '{}'))
    const app = schemas.find((s: { '@type': string }) => s['@type'] === 'SoftwareApplication')
    expect(app).toBeTruthy()
    expect(app.name).toBe('Agora')
    expect(app.applicationCategory).toBe('BusinessApplication')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/seo/jsonld.test.tsx
```

Expected: FAIL — 0 script tags found (layout is a passthrough)

- [ ] **Step 3: Update `app/[locale]/(marketing)/layout.tsx`**

```tsx
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Agente Agora LLC',
  url: 'https://www.agenteagora.com',
  logo: 'https://www.agenteagora.com/agora-logo.png',
  description:
    'Plataforma de export intelligence para exportadores de fruta y frutos secos en Latinoamérica.',
  areaServed: ['CL', 'PE', 'EC', 'US'],
  contactPoint: {
    '@type': 'ContactPoint',
    url: 'https://www.agenteagora.com/#contacto',
    contactType: 'sales',
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Agora',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Plataforma operacional para exportadores. Automatiza documentos, detecta excepciones antes del cut-off naviero y centraliza la coordinación de embarques.',
  audience: {
    '@type': 'BusinessAudience',
    audienceType: 'Exportadores de fruta y frutos secos',
  },
  offers: {
    '@type': 'Offer',
    url: 'https://www.agenteagora.com/#contacto',
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {children}
    </>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/seo/jsonld.test.tsx
```

Expected: PASS — 2 tests

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/(marketing)/layout.tsx" __tests__/seo/jsonld.test.tsx
git commit -m "feat(seo): add Organization and SoftwareApplication JSON-LD to marketing layout"
```

---

## Task 6: Update llms.txt

**Files:**
- Modify: `public/llms.txt`
- Create: `__tests__/seo/llms.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// __tests__/seo/llms.test.ts
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, it, expect } from 'vitest'

const llms = readFileSync(resolve(process.cwd(), 'public/llms.txt'), 'utf-8')

describe('llms.txt', () => {
  it('contains a Keywords section', () => {
    expect(llms).toMatch(/## Keywords/)
  })

  it('includes key domain terms in keywords', () => {
    expect(llms).toMatch(/demurrage/)
    expect(llms).toMatch(/fitosanitario/)
    expect(llms).toMatch(/consignatario/)
  })

  it('contains a "What Agora is not" section', () => {
    expect(llms).toMatch(/## (Lo que Agora no es|What Agora is not)/)
  })

  it('clarifies Agora is not a freight forwarder', () => {
    expect(llms).toMatch(/freight forwarder|agente de carga/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/seo/llms.test.ts
```

Expected: FAIL — Keywords section not found

- [ ] **Step 3: Append sections to `public/llms.txt`**

Add the following at the end of the existing file:

```
## Keywords

Términos clave del dominio relacionados con Agora:

BL, Bill of Lading, DUS, Declaración Única de Salida, fitosanitario, certificado fitosanitario, SAG, demurrage, cut-off naviero, packing list, naviera, booking, booking confirmation, consignatario, carta de crédito, instrucción de embarque, corrección de BL, despacho, contenedor, temperatura, cadena de frío, exportación fruta, fruta fresca, frutos secos, exportación Chile, agente de aduana, agente naviero

## Lo que Agora no es

- No es un agente de carga (freight forwarder): Agora no opera embarques ni negocia fletes.
- No es un agente de aduana: Agora no gestiona trámites aduaneros directamente.
- No es un TMS (Transportation Management System): Agora no optimiza rutas ni gestiona flotas.
- No es un ERP: Agora no reemplaza sistemas contables ni de gestión empresarial.
- No es un portal naviero: Agora se integra con portales navieros, pero no los reemplaza.
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run __tests__/seo/llms.test.ts
```

Expected: PASS — 4 tests (llms.txt suite only)

- [ ] **Step 5: Commit**

```bash
git add public/llms.txt __tests__/seo/llms.test.ts
git commit -m "feat(seo): add Keywords and 'Lo que Agora no es' sections to llms.txt"
```

---

## Task 7: Create llms-full.txt

**Files:**
- Create: `public/llms-full.txt`
- Modify: `__tests__/seo/llms.test.ts` (add llms-full.txt tests)

- [ ] **Step 1: Add failing tests for llms-full.txt**

Append to `__tests__/seo/llms.test.ts`:

```ts
const llmsFull = readFileSync(resolve(process.cwd(), 'public/llms-full.txt'), 'utf-8')

describe('llms-full.txt', () => {
  it('exists and has substantial content', () => {
    expect(llmsFull.length).toBeGreaterThan(2000)
  })

  it('includes the three product pillars', () => {
    expect(llmsFull).toMatch(/Información capturada|captura.*desde donde/)
    expect(llmsFull).toMatch(/Errores detectados|validado.*automáticamente/)
    expect(llmsFull).toMatch(/Visibilidad sin perseguir/)
  })

  it('includes concrete stats', () => {
    expect(llmsFull).toMatch(/18h/)
    expect(llmsFull).toMatch(/94%/)
    expect(llmsFull).toMatch(/cereza 2025/)
  })

  it('includes a domain glossary', () => {
    expect(llmsFull).toMatch(/## Glosario/)
    expect(llmsFull).toMatch(/demurrage/)
    expect(llmsFull).toMatch(/fitosanitario/)
  })

  it('includes ideal customer profile', () => {
    expect(llmsFull).toMatch(/## (Para quién es|Perfil de cliente)/)
  })

  it('includes a "not" section', () => {
    expect(llmsFull).toMatch(/## (Lo que Agora no es|What Agora is not)/)
  })

  it('references the company correctly', () => {
    expect(llmsFull).toMatch(/Agente Agora LLC/)
    expect(llmsFull).toMatch(/agenteagora\.com/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run __tests__/seo/llms.test.ts
```

Expected: FAIL — llms-full.txt not found

- [ ] **Step 3: Create `public/llms-full.txt`**

```
# Agora — Export Intelligence para Exportadores

## Qué es Agora

Agora es la plataforma operacional para exportadores de fruta fresca y frutos secos. Automatiza el flujo documental, detecta excepciones operacionales antes del cut-off naviero y centraliza la coordinación de embarques en un solo lugar.

Está diseñada para equipos operativos que manejan alto volumen documental y operaciones complejas: múltiples navieras, productores, agencias y mercados de destino simultáneos.

## El problema que resuelve

Cada envío de fruta mueve decenas de documentos, actores y fechas críticas. Sin visibilidad unificada, los problemas llegan cuando ya no hay tiempo para reaccionar:

**1. Documentos manuales y con errores**
El instructivo de embarque, las correcciones de BL, packing lists y certificados se construyen desde cero para cada operación — juntando correos, mensajes de WhatsApp y archivos Excel. Un campo mal ingresado dispara multas, atrasos, demurrage o rechazo de carga. Corrección de BL: USD 100–150. Demurrage: USD 400+/día.

**2. Excepciones descubiertas cuando ya es tarde**
Consignatario mal escrito, peso incorrecto, documento faltante — cuando esto aparece, el contenedor ya está en puerto. La mayoría de los equipos se entera por el rechazo de la naviera, no antes. Pérdidas desde miles hasta decenas de miles de USD por incidente.

**3. Pérdida de conocimiento operacional**
Al no operar con una capa operacional compartida, cuando alguien del equipo se va, sus conocimientos y procesos se van con esa persona. Horas de coordinación perdidas por embarque, por semana.

## Los tres pilares de Agora

**Pilar 1 — Información capturada desde donde ocurre el trabajo**
Agora lee correos, mensajes de WhatsApp y documentos para extraer y organizar datos de embarque automáticamente. Confirmaciones de booking, cambios de instructivo, actualizaciones navieras — estructurados por operación, no dispersos en bandejas de entrada.

**Pilar 2 — Errores detectados antes de que se conviertan en costos**
Cada documento es validado contra los datos fuente automáticamente. Consignatario no coincide, pesos inconsistentes, campo faltante — con contexto completo, antes de que dispare un cargo naviero o un despacho retrasado.

**Pilar 3 — Visibilidad sin perseguir a nadie**
Una sola capa que responde las preguntas que el equipo hace todos los días: qué está en riesgo, qué falta, quién es responsable, qué cambió. El equipo decide. Agora hace el seguimiento.

## Resultados medidos

- **18h** — tiempo promedio disponible para reaccionar ante un problema documental antes del cut-off naviero
- **94%** — reducción en tiempo de coordinación manual por embarque (operadores en acceso temprano)
- **0** — reclamos por frío fuera de rango en temporadas cereza 2025–2026 con Agora activo

## Para quién es

### Perfil de cliente ideal
- Exportadoras de fruta fresca y frutos secos con operaciones activas
- Equipos con alto volumen de coordinación por correo y WhatsApp
- Operaciones con frecuentes excepciones documentales o logísticas
- Empresas que exportan a múltiples mercados con distintos requisitos documentales

### No es adecuado para
- Exportadores de una sola temporada o muy bajo volumen (< 20 contenedores/año)
- Empresas sin equipo operativo dedicado

## Glosario de dominio

**BL / Bill of Lading:** Documento emitido por la naviera que acredita el embarque de la carga. Cualquier error en el BL puede resultar en multas o rechazo de mercancía en destino.

**DUS / Declaración Única de Salida:** Documento aduanero chileno requerido para exportar. Debe estar cuadrado con el BL y los demás documentos del embarque.

**Fitosanitario / Certificado fitosanitario:** Certificado emitido por el SAG (Servicio Agrícola y Ganadero) de Chile que acredita que la fruta cumple con los requisitos sanitarios del país de destino.

**Demurrage:** Cargo cobrado por la naviera cuando un contenedor permanece en el puerto de destino más tiempo del permitido, generalmente por problemas documentales o de despacho.

**Cut-off naviero:** Fecha y hora límite para entregar documentación completa a la naviera antes del zarpe del buque. Un documento fuera de plazo puede dejar un contenedor en tierra.

**Packing list:** Lista detallada del contenido de cada contenedor: variedades, calibres, pesos, número de cajas, temperatura de transporte.

**Naviera:** Empresa de transporte marítimo (ej: MSC, Hapag-Lloyd, CMA CGM, Maersk). Cada naviera tiene sus propios portales, formatos y requisitos documentales.

**Booking / Booking confirmation:** Reserva de espacio en un buque para un embarque específico. Incluye número de contenedor, ruta, naviera, fechas de carga y zarpe.

**Consignatario:** Empresa o persona en el país de destino que recibe la carga. Debe aparecer exactamente igual en todos los documentos del embarque.

**SAG:** Servicio Agrícola y Ganadero de Chile. Entidad que emite los certificados fitosanitarios y controla el cumplimiento de los requisitos del país de destino.

**Carta de crédito:** Instrumento financiero usado en comercio internacional para garantizar el pago al exportador. Su correcta liquidación requiere que todos los documentos del embarque cumplan condiciones específicas.

**Instrucción de embarque:** Documento interno que el exportador envía a la agencia naviera con todos los datos del embarque para que esta emita el BL borrador.

## Lo que Agora no es

- **No es un agente de carga (freight forwarder):** Agora no opera embarques ni negocia fletes con navieras.
- **No es un agente de aduana:** Agora no gestiona directamente trámites aduaneros ni presenta declaraciones ante el SNA.
- **No es un TMS (Transportation Management System):** Agora no optimiza rutas, no gestiona flotas terrestres ni coordina transporte inland.
- **No es un ERP:** Agora no reemplaza sistemas contables, de inventario ni de gestión empresarial general.
- **No es un portal naviero:** Agora se integra con portales de navieras para extraer datos, pero no los reemplaza.
- **No es un sistema de trazabilidad de origen:** Agora no gestiona la trazabilidad predial ni los registros de campo.

## Empresa

Agente Agora LLC — Latinoamerica, Estados Unidos
Web: https://www.agenteagora.com
Contacto: https://www.agenteagora.com/#contacto
```

- [ ] **Step 4: Run all llms tests**

```bash
npx vitest run __tests__/seo/llms.test.ts
```

Expected: PASS — all 11 tests (4 llms.txt + 7 llms-full.txt)

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
npx vitest run
```

Expected: All tests pass. If landing component tests fail, check that mocks in existing test files still match component exports.

- [ ] **Step 6: Commit**

```bash
git add public/llms-full.txt __tests__/seo/llms.test.ts
git commit -m "feat(seo): add llms-full.txt with pillars, stats, glossary, and ICP"
```

---

## Post-Deploy Checklist (manual, not code)

After deploying to production:

1. **Create Google Search Console account** at [search.google.com/search-console](https://search.google.com/search-console)
2. **Verify ownership** — choose "URL prefix" method → `https://www.agenteagora.com` → copy the meta tag `content` value → paste into the `verification.google` field in `app/[locale]/layout.tsx` (replace the commented placeholder) → deploy → click Verify in GSC
3. **Submit sitemap** — in GSC sidebar: Sitemaps → enter `sitemap.xml` → Submit
4. **Request indexing** — in GSC: URL Inspection → enter `https://www.agenteagora.com` → Request Indexing
5. **Validate structured data** — visit [search.google.com/test/rich-results](https://search.google.com/test/rich-results) → enter `https://www.agenteagora.com` → confirm Organization and SoftwareApplication schemas are detected without errors
