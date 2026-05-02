# Landing Page — Design Spec

**Date:** 2026-05-02  
**Status:** Approved for implementation

---

## Overview

A public-facing marketing landing page for Agora, replacing the current root `/` route. The operations dashboard moves to `/app` (or similar authenticated route). The landing page targets logistics managers and operations teams at Chilean fruit and nut exporters, communicating Agora's value proposition and directing qualified leads to a contact form.

---

## Architecture Decision

**Route strategy: C — landing page at `/`, app at `/app`**

The Next.js app router is restructured so that `/` renders the landing page and the operations dashboard lives behind an authenticated route. This follows the standard B2B SaaS pattern (Linear, Vercel, Notion). The landing page is a standard Next.js page using the existing `[locale]` routing, sharing the app's i18n infrastructure, design system tokens, and component library.

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

- **Hero card:** `backdrop-filter: blur(36px) saturate(180%)`, `background: rgba(43,31,18,0.28)`, `border: 1px solid rgba(248,242,228,0.20)`, inner top-edge highlight sheen
- **Nav pill:** `backdrop-filter: blur(24px) saturate(180%)`, `background: rgba(43,31,18,0.38)`, `border: 1px solid rgba(248,242,228,0.22)`
- Outline CTA button inside hero card also carries a subtle `blur(8px)` glass treatment

### Icons

Lucide icons throughout (`lucide@0.469.0`), `stroke-width: 1.5`. No emojis.

---

## Page Structure

7 sections in order:

### 1. Hero
- Full-viewport background image: shipping container photo (`/public/hero-bg.png`)
- Gradient overlay darkening bottom-left (where card sits) while keeping top-right lighter
- Paper grain overlay (`mix-blend-mode: overlay`)
- **Floating pill nav** (glassmorphism): real Agora lambda logo (inverted to white), wordmark in Old Standard TT italic, nav links, "Ponte en Contacto" solid CTA, ES/EN language toggle
- **Glass card** (bottom-left, `min(560px, calc(100vw - 96px))`): eyebrow chip with pulsing green dot + "Shipment Intelligence" label, headline "Tus exportaciones, *siempre bajo control*" (amber italic accent), subheadline, two CTAs ("Ponte en Contacto →" solid, "Ver Demo" glass outline)
- Scroll cue (bottom-right, JetBrains Mono)

### 2. Problem — *El caos operativo cuesta caro*
- Centered section head: eyebrow, Fraunces italic title, lede
- 3-column friction card grid, each with a colored top border (severity scale):
  - **Desvíos detectados tarde** — `sev-crit` red top, `thermometer-snowflake` icon
  - **Documentos fuera de sincronía** — `sev-watch` amber top, `file-warning` icon
  - **Coordinación sin contexto** — `sev-ok` green top, `users` icon
- Each card: Fraunces italic title, body copy, dashed-border citation in JetBrains Mono

### 3. Pillars — *Un equipo digital para cada exportación*
- Centered section head
- 3 alternating image+copy rows (odd: copy left / visual right; even: visual left / copy right):
  1. **Visibilidad completa** — shipment timeline mock + 3 KPI chips (ETA, temp, docs)
  2. **Alertas con contexto** — alert card mock with context block + compliant status badge
  3. **Documentación sincronizada** — document readiness matrix mock with status indicators
- Pillar copy: mono number badge, Fraunces italic title, Inter body (max 44ch)
- Visual panels: `--bg-1` card, `border-radius: 16px`, soft shadow

### 4. Product — *Diseñado para operadores reales*
- Centered section head
- Full-width dashboard screenshot (`/public/dashboard.png`) with `border-radius: 16px` and layered shadow
- 3 floating annotation chips (JetBrains Mono, `--bg-0` fill, `--line-mid` border): "3D Globe — rutas activas" (left), "Cola de acción priorizada" (right), "KPIs en tiempo real" (left)
- Green dot prefix on each annotation

### 5. Stats — *Outcomes strip*
- Full-bleed section, `border-top` + `border-bottom` hairlines
- 3-column grid, vertical hairline dividers:
  - **18h** — "Antes de que sea tarde"
  - **94%** — "Reducción en tiempo de coordinación"
  - **0** — "Reclamos por frío fuera de rango"
- Numbers in Fraunces italic 300, `clamp(52px, 6vw, 80px)`; source copy in JetBrains Mono italic

### 6. Contact Form — *Ponte en Contacto*
- 2-column layout: left copy + right form card
- **Left:** Fraunces italic title, sub, 3-step process (numbered in JetBrains Mono)
  1. Nos conocemos (30-min call)
  2. Demo personalizada
  3. Onboarding en 48h
- **Right form card** (`--bg-2`, `border-radius: 16px`):
  - Fields: nombre + apellido (2-col), empresa, email corporativo
  - Volume selector: 4-option grid (1–20 / 20–100 / 100–500 / 500+), toggle active state = `--ink-1` fill
  - Message textarea
  - Submit: full-width `--ink-1` button, "Enviar mensaje →"
  - Footnote: confidentiality note in JetBrains Mono

### 7. Footer
- `--bg-1` background, `border-top: 1px solid --line-soft`
- 4-column grid: brand column (logo + tagline) + Plataforma / Empresa / Legal link columns
- Bottom bar: copyright in JetBrains Mono + ES/EN language toggle (pill style)

---

## i18n

Follows the existing `next-intl` setup with `[locale]` routing. All copy keys go into `messages/es.json` (primary) and `messages/en.json`. The language toggle in both the nav pill and footer switches locale via the existing `routing.ts` configuration.

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
| `/` → Operations Dashboard | `/` → Landing Page |
| — | `/app` → Operations Dashboard (or keep `/[locale]` with auth guard) |

The exact authenticated route for the dashboard is out of scope for this spec — the landing page implementation does not need to move the dashboard, only occupy the root route. A redirect or auth guard can be added separately.

---

## Responsive Behaviour

| Breakpoint | Changes |
|---|---|
| `< 1024px` | Pill nav links hidden; pillar rows stack to single column; annotation chips hidden |
| `< 768px` | Hero card full-width with reduced padding; 2-col form becomes 1-col; stats stack vertically |
| `< 640px` | Volume selector 2-col; footer 1-col |

---

## Out of Scope

- Authentication / session management
- CMS or form backend (form submission handling is a separate task)
- Team section (no assets)
- FAQ accordion (deferred — add once there are real questions)
- Proof bar (deferred — add once there are named customers)
- Analytics / tracking scripts
