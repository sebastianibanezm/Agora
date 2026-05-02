# Landing Page — Design Spec

**Date:** 2026-05-02  
**Status:** Approved for implementation

---

## Overview

A public-facing marketing landing page for Agora, replacing the current root `/` route. The operations dashboard moves to `/app`. The landing page targets logistics managers and operations teams at Chilean fruit and nut exporters, communicating Agora's value proposition and directing qualified leads to a contact form.

---

## Architecture Decision

**Route strategy: landing page at `/`, dashboard at `/app`**

The Next.js App Router is restructured so that `app/[locale]/page.tsx` renders the landing page. The current dashboard page (`app/[locale]/page.tsx`) moves to `app/[locale]/app/page.tsx`. During this implementation the dashboard route change is **required** — the landing page must occupy the root. No auth guard is needed yet; the dashboard at `/app` remains publicly accessible for demo purposes.

The landing page is a standard Next.js page using the existing `[locale]` routing, sharing the app's i18n infrastructure, design system tokens, and component library.

---

## Visual Design

### Aesthetic

Warm paper body + dark glass hero — matches the Agora design system exactly:

- **Body sections:** cream/parchment surfaces (`--bg-0: #F8F2E4` through `--bg-3: #F1E8D5`)
- **Hero section:** full-viewport background image (shipping containers) with a glassmorphism card overlaid bottom-left
- **Ambient texture:** paper grain (`radial-gradient` dot pattern, `mix-blend-mode: multiply`) + warm corner glows

### Design Tokens

All tokens come from the Agora DS — no external palette:

| Role | Token | Value |
|---|---|---|
| Body background | `--bg-0` | `#F8F2E4` |
| Card surface | `--bg-1` / `--bg-2` | `#FCF7EA` / `#FFFCF1` |
| Primary text | `--ink-1` | `#2B1F12` |
| Secondary text | `--ink-2` | `#5A4A38` |
| Labels / mono | `--ink-3` | `#8A7860` |
| Accent (amber) | `--sev-watch` | `#B97A1F` |
| Positive (green) | `--sev-ok` | `#4F7A3C` |
| Critical | `--sev-crit` | `#8B2A1F` |
| Line soft | `--line-soft` | `rgba(60,42,22,0.08)` |
| Faint text | `--ink-4` | `#B5A586` |
| Line mid | `--line-mid` | `rgba(60,42,22,0.16)` |

No dark navy, no mint green, no external blues.

### Typography

| Role | Font | Style |
|---|---|---|
| Hero headline | Old Standard TT | italic, 400 |
| Section titles | Fraunces | italic, 300–400 |
| Body / UI | Inter | 400–600 |
| Labels / codes / mono | JetBrains Mono | 400–600 |

### Glassmorphism

Used on two elements — hero card and nav pill:

- **Hero card:** `backdrop-filter: blur(36px) saturate(180%)`, `background: rgba(43,31,18,0.28)`, `border: 1px solid rgba(248,242,228,0.20)`, inner top-edge highlight sheen via `::before` pseudo-element
- **Nav pill:** `backdrop-filter: blur(24px) saturate(180%)`, `background: rgba(43,31,18,0.38)`, `border: 1px solid rgba(248,242,228,0.22)`
- Outline CTA button inside hero card: `backdrop-filter: blur(8px)`, `background: rgba(248,242,228,0.08)`, `border: 1px solid rgba(248,242,228,0.28)`

### Icons

Lucide icons throughout (`lucide-react`), `strokeWidth={1.5}`. No emojis.

---

## Page Structure

7 sections in order:

### 1. Hero

Full-viewport (`100vh`) section. Background image fills the entire viewport via `object-fit: cover`.

**Gradient overlay** (layered, darkens bottom-left where card sits):
```
linear-gradient(135deg, rgba(43,31,18,0.62) 0%, rgba(43,31,18,0.15) 55%, rgba(43,31,18,0.30) 100%),
linear-gradient(to top, rgba(43,31,18,0.70) 0%, transparent 50%)
```

**Floating pill nav** — `position: fixed`, centered horizontally, `top: 24px`:
- Agora lambda logo (`/public/agora-logo.png`) inverted to white via CSS `filter: invert(1) brightness(10)`, `38×38px`, `border-radius: 9px`, glass pill background
- Wordmark "Agora" in Old Standard TT italic 19px
- Nav links: Soluciones / Cómo funciona / Empresa — `font-size: 12px`, `color: rgba(248,242,228,0.70)`
- Separator `1px` hairline
- "Ponte en Contacto →" — solid `--bg-0` fill, `color: --ink-1`, `border-radius: 999px`
- ES/EN toggle in JetBrains Mono

**Glass card** — `position: absolute`, `left: 48px`, `bottom: 48px`, `width: min(560px, calc(100vw - 96px))`:
- Eyebrow chip: 6px pulsing green dot (`sev-ok`, `animation: pulse 1.8s`), "Shipment Intelligence" in JetBrains Mono uppercase
- Headline: `font-size: clamp(30px, 2.8vw, 44px)`, "Tus exportaciones," line 1; "*siempre bajo control*" line 2 in italic `sev-watch` amber
- Subheadline: "Detecta desvíos antes de que se vuelvan reclamos. Documentos sincronizados, cadena de frío monitoreada, equipo siempre en contexto."
- CTAs: "Ponte en Contacto →" (solid bone button, `border-radius: 999px`) + "Ver Demo" (glass outline button)

**Scroll cue** — `position: absolute`, `bottom: 24px`, `right: 40px`: vertical line + "Scroll" in JetBrains Mono, `color: rgba(248,242,228,0.35)`

**Responsive (`< 768px`):** Card `position: relative`, `margin: auto 24px`, `padding: 28px 24px`. Nav links hidden.

### 2. Problem — *El caos operativo cuesta caro*

`padding: 120px 0`. Centered section head (`max-width: 720px`, `margin: 0 auto 64px`):
- Eyebrow: "01 — El problema"
- Title: "El caos operativo / cuesta caro"
- Lede: "Cada envío mueve decenas de documentos, actores y fechas críticas. Sin visibilidad unificada, los problemas llegan cuando ya no hay tiempo para reaccionar."

3-column friction card grid (`gap: 20px`). Each card: `background: --bg-1`, `border-radius: 14px`, `padding: 28px`, `border-top: 2px solid <severity>`, Lucide icon `34×34px` in `--bg-2` pill.

| Card | Top border | Icon | Title | Body | Citation |
|---|---|---|---|---|---|
| 1 | `sev-crit` | `thermometer-snowflake` | Desvíos detectados tarde | "Los problemas de temperatura o documentación se descubren en destino. A ese punto, el daño ya está hecho — reclamos, rechazos, pérdida de cliente." | "Causa #1 de pérdida en exportación de fruta fresca" |
| 2 | `sev-watch` | `file-warning` | Documentos fuera de sincronía | "Correos, WhatsApp, portales navieros, Excel. Cada documento vive en un silo. Un solo archivo pendiente puede detener el despacho — o el cobro." | "Promedio: 18 documentos por embarque" |
| 3 | `sev-ok` | `users` | Coordinación sin contexto | "Agencia, naviera, productor, importador — cada uno tiene su versión del estado. Sin una fuente única de verdad, cada llamada empieza desde cero." | "Horas de coordinación perdidas por embarque" |

Citation: `border-top: 1px dashed --line-soft`, JetBrains Mono 10px italic, `color: --ink-3`.

### 3. Pillars — *Un equipo digital para cada exportación*

`padding: 120px 0`. Centered section head:
- Eyebrow: "02 — Solución"
- Title: "Un equipo digital / para cada exportación"
- Lede: "Agora sincroniza visibilidad, alertas y documentación en una sola plataforma — para que tu equipo actúe antes de que los problemas escalen."

3 alternating rows (`gap: 96px` between rows). Each row: `display: grid`, `grid-template-columns: 1fr 1fr`, `gap: 80px`, `align-items: center`. Odd rows: copy left, visual right. Even rows: visual left, copy right.

**Visual panels** — `background: --bg-1`, `border: 1px solid --line-soft`, `border-radius: 16px`, `padding: 24px`, `box-shadow: 0 8px 32px rgba(43,31,18,0.08)`. These are **inline JSX components** (not images):

**Pillar 1 — Visibilidad completa de cada envío**
- Copy: "Estado en tiempo real de todos tus contenedores — posición, etapa documental, temperatura — en un solo panel. Sin cambiar de pestaña, sin llamar a la naviera."
- Visual: shipment timeline (6 steps: Booking ✓, Carga ✓, Zarpe ✓, Tránsito ● active, Destino ○, Entrega ○) + 3 KPI chips below (ETA "14 ene", Temp "−1.2°C" in `sev-ok`, Docs "14/18") + caption "Contenedor MAEU-9182734 · Ruta San Antonio → Yangshan" in JetBrains Mono

**Pillar 2 — Alertas con contexto, no solo ruido**
- Copy: "Agora filtra la señal del ruido y te entrega alertas accionables — con el contexto exacto que necesitas para decidir rápido: qué pasó, qué implica, qué puedes hacer."
- Visual: alert card ("Excursión de temperatura detectada", `alert-triangle` icon in `sev-watch`) + JetBrains Mono context block + 3 action buttons (Ver detalles primary, Notificar cliente, Descartar) + green "Excursión no crítica" status row below

**Pillar 3 — Documentación siempre sincronizada**
- Copy: "Todos los documentos del embarque — BL, facturas, fitosanitarios, certificados — en una matriz de readiness unificada. Sabes qué falta, quién lo tiene y cuánto tiempo queda."
- Visual: 6-row document list (Bill of Lading ✓, Factura Comercial ✓, Certificado Fitosanitario ✓, DUS ⚠ amber, Packing List ⚠ amber, Carta de Crédito ○ faded) + footer "14 / 18 documentos" + "⚠ Cut-off en 18h" in `sev-watch`

**Responsive (`< 1024px`):** all pillar rows stack to single column, `gap: 32px`.

### 4. Product — *Diseñado para operadores reales*

`padding: 120px 0`. Centered section head:
- Eyebrow: "03 — La plataforma"
- Title: "Diseñado para / operadores reales"
- Lede: "Un panel de operaciones que condensa todo lo que importa — envíos activos, alertas, documentos pendientes — sin ruido, sin fricciones."

Dashboard screenshot (`/public/landing/dashboard.png`) via Next.js `<Image>`:
- Container: `border: 1px solid --line-mid`, `border-radius: 16px`, `overflow: hidden`
- Shadow: `box-shadow: 0 40px 80px rgba(43,31,18,0.18), 0 0 0 1px rgba(43,31,18,0.06)`
- `width: 100%`

3 annotation chips (`position: absolute`, JetBrains Mono 10px, `--bg-0` fill, `--line-mid` border, `box-shadow: 0 4px 14px rgba(43,31,18,0.10)`, `border-radius: 6px`). Each has a `6px` circle prefix (green `sev-ok`):
- "3D Globe — rutas activas" — `top: 12%`, `left: -2%`, translates left outside image
- "Cola de acción priorizada" — `top: 50%`, `right: -2%`, translates right, amber dot
- "KPIs en tiempo real" — `bottom: 18%`, `left: -2%`, translates left

**Responsive (`< 1024px`):** annotation chips hidden (`display: none`).

### 5. Stats — *Outcomes strip*

No top/bottom padding — full-bleed. `border-top: 1px solid --line-soft`, `border-bottom: 1px solid --line-soft`.

3-column grid. Each stat: `padding: 64px 40px`, `border-right: 1px solid --line-soft` (last child: none).

| Stat number | Label | Source copy |
|---|---|---|
| 18h | Antes de que sea tarde | "El tiempo promedio disponible para reaccionar ante un problema documental antes del cut-off naviero." |
| 94% | Reducción en tiempo de coordinación | "Operadores con Agora reportan hasta un 94% menos de tiempo dedicado a seguimiento manual por embarque." |
| 0 | Reclamos por frío fuera de rango | "Temporadas cereza 2025–2026 con Agora. Trazabilidad completa, protocolos verificados, clientes informados." |

Numbers: Fraunces italic `font-weight: 300`, `font-size: clamp(52px, 6vw, 80px)`, `color: --ink-1`.
Source copy: JetBrains Mono 10.5px italic, `color: --ink-3`, `max-width: 32ch`.

**Responsive (`< 768px`):** stack to 1 column, each stat `border-right: none`, `border-bottom: 1px solid --line-soft`.

### 6. Contact Form — *Ponte en Contacto*

`padding: 140px 0`. 2-column layout `grid-template-columns: 1fr 1fr`, `gap: 80px`.

**Left copy:**
- Eyebrow: "04 — Contacto"
- Title (Fraunces italic 300, `clamp(38px, 4vw, 56px)`): "Hablemos de / tus operaciones"
- Sub: "Cuéntanos sobre tu empresa y tus embarques. Te respondemos en menos de 24 horas con una propuesta adaptada a tu volumen y mercados."
- 3-step list:
  1. "Nos conocemos" — "Una llamada de 30 minutos para entender tus operaciones, rutas y dolores actuales."
  2. "Demo personalizada" — "Te mostramos Agora con tus propios datos — tus rutas, tus navieras, tu temporada."
  3. "Onboarding en 48h" — "Si calzamos, tu equipo está operativo antes de que empiece el próximo embarque."

**Right form card** (`--bg-2`, `border: 1px solid --line-mid`, `border-radius: 16px`, `padding: 36px`):
- Title "Ponte en Contacto" in Fraunces italic 20px
- Sub "Sin compromisos — te respondemos en menos de un día hábil." in Inter 13px `--ink-3`
- Fields (labels: JetBrains Mono 10px uppercase `--ink-3`; inputs: `height: 42px`, `background: --bg-1`, `border: 1px solid rgba(60,42,22,0.14)`, `border-radius: 8px`; focus: `border-color: --ink-2`, `box-shadow: 0 0 0 3px rgba(43,31,18,0.07)`):
  - Nombre + Apellido — 2-col grid
  - Empresa
  - Email corporativo
- Volume selector label: "Contenedores por temporada"
- Volume grid: 4 options `1–20 / 20–100 / 100–500 / 500+`, `height: 38px`, JetBrains Mono 11.5px. **Inactive:** `background: --bg-1`, `border: 1px solid rgba(60,42,22,0.14)`, `color: --ink-2`. **Active:** `background: --ink-1`, `color: --bg-1`, `border-color: --ink-1`.
- Message textarea (`min-height: 88px`, `resize: vertical`)
- Submit button: `width: 100%`, `height: 46px`, `background: --ink-1`, `color: --bg-0`, `border-radius: 10px`, "Enviar mensaje →"; hover: `background: #1F1609`
- Footnote: "Tu información es confidencial y nunca se comparte con terceros." — JetBrains Mono 10px, `color: --ink-4`, centered

**Responsive (`< 768px`):** 2-col form becomes 1-col; volume grid stays 4-col down to `< 640px` then 2-col.

### 7. Footer

`background: --bg-1`, `border-top: 1px solid --line-soft`, `padding: 72px 0 36px`.

4-column grid (`grid-template-columns: 1.5fr 1fr 1fr 1fr`, `gap: 48px`):

- **Brand column:** 30×30px logo pill (`background: --ink-1`, logo inverted white) + "Agora" wordmark + tagline "Shipment intelligence para exportadores de fruta y frutos secos." in Inter 13px `--ink-3`
- **Plataforma:** Visibilidad / Alertas / Documentación / Integraciones
- **Empresa:** Nosotros / Clientes / Blog / Contacto
- **Legal:** Privacidad / Términos de uso / Seguridad

All footer links: Inter 13.5px, `color: --ink-2`; hover: `color: --ink-1`.

Bottom bar (`border-top: 1px solid --line-soft`, `padding-top: 24px`):
- Left: "© 2027 Agora Technologies SpA · Santiago, Chile" — JetBrains Mono 10.5px `--ink-4`
- Right: ES/EN toggle pill (`background: --bg-2`, `border: 1px solid --line-soft`, `border-radius: 6px`) — active lang `color: --ink-1 font-weight: 600`, inactive `color: --ink-3`

**Responsive (`< 640px`):** footer 1-col.

---

## i18n

Follows the existing `next-intl` setup with `[locale]` routing. All copy is extracted to `messages/es.json` (primary) and `messages/en.json` under a `landing` namespace key. Example key structure:

```json
{
  "landing": {
    "nav": { "solutions": "Soluciones", "howItWorks": "Cómo funciona", "company": "Empresa", "cta": "Ponte en Contacto" },
    "hero": { "eyebrow": "Shipment Intelligence", "headline": "Tus exportaciones,", "headlineAccent": "siempre bajo control", "sub": "Detecta desvíos...", "ctaPrimary": "Ponte en Contacto", "ctaSecondary": "Ver Demo" },
    "problem": { ... },
    "pillars": { ... },
    "product": { ... },
    "stats": { ... },
    "contact": { ... },
    "footer": { ... }
  }
}
```

The language toggle in the nav pill and footer calls `router.replace()` with the alternate locale via the existing `useRouter` + `usePathname` pattern from `next-intl`.

---

## Assets Required

| Asset | Source | Destination |
|---|---|---|
| Hero background | `ChatGPT Image May 1, 2026, 06_52_17 PM.png` | `/public/landing/hero-bg.png` |
| Dashboard screenshot | `ChatGPT Image May 2, 2026 at 04_55_14 PM.png` | `/public/landing/dashboard.png` |
| Agora logo (lambda) | `/public/agora-logo.png` (existing) | Reuse via `<Image>` |

---

## Route Changes

| Before | After |
|---|---|
| `app/[locale]/page.tsx` | `app/[locale]/app/page.tsx` (dashboard moved here) |
| — | `app/[locale]/page.tsx` (landing page, new) |

**Required as part of this implementation:** move the current `app/[locale]/page.tsx` dashboard to `app/[locale]/app/page.tsx`. The dashboard remains publicly accessible (no auth guard). Any existing internal links to `/` that should point to the dashboard must be updated to `/app`.

---

## Responsive Behaviour

| Breakpoint | Changes |
|---|---|
| `< 1024px` | Pill nav links hidden; pillar rows stack to single column; annotation chips hidden |
| `< 768px` | Hero card `position: relative`, full-width, `padding: 28px 24px`; form 1-col; stats 1-col |
| `< 640px` | Volume selector 2-col; footer 1-col |

---

## Out of Scope

- Authentication / session management
- CMS or form backend (form submission handling — submit fires `console.log` for now)
- Team section (no assets)
- FAQ accordion (deferred — add once there are real questions)
- Proof bar (deferred — add once there are named customers)
- Analytics / tracking scripts
