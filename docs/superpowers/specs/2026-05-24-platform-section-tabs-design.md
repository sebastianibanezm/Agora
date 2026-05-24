# Platform Section — Three-Tab Redesign

**Date:** 2026-05-24  
**Status:** Approved

---

## Summary

Redesign section 3 "La Plataforma" to consolidate COMEX, Finanzas, and Comercial into a single unified section with a tab switcher. The current `LandingProduct` and `LandingFinancial` components are merged into one. The dashboard screenshot is removed. A new Comercial tab is added.

---

## Structure

```
Section 3 — La Plataforma
├── Section header (2-col grid, same pattern as LandingProblem / LandingPillars)
│   ├── Left: eyebrow + title + lede
│   └── Right: ParallaxImage (platform-bg.png)
└── Tab area
    ├── Tab bar: [Comex] [Finanzas] [Comercial]
    └── Tab panel (2-col: feature list left, visual right)
        ├── Comex tab
        ├── Finanzas tab
        └── Comercial tab
```

---

## Section Header

- **Eyebrow:** `03 — La plataforma` (existing key)
- **Title:** `Coordinación y automatización a lo largo de todo el proceso.`
  - Split across two lines in rendering: `Coordinación y automatización` / `a lo largo de todo el proceso.`
- **Lede:** `Comex, finanzas y comercial — tres áreas integradas en una sola plataforma.`
- **Image:** `ParallaxImage` with `src="/landing/platform-bg.png"`, same props as current `LandingProduct` (variant="frame", strength=0.12, objectPosition="center 25%", aspectRatio 4/3)

---

## Tab Bar

Plain horizontal tab bar sitting on a `border-bottom` line (same visual language as existing spec rows). Active tab indicated by a 2px bottom border in `#2B1F12`. Font: mono, 10px. Labels: **Comex**, **Finanzas**, **Comercial**.

---

## Tab Panels

Each panel: 2-column grid (1fr 1fr), feature list on the left, visual component on the right.

### Comex tab

**Left — spec row table** (existing pattern from current `LandingProduct`):

| # | Label | Body |
|---|-------|------|
| 01 | Coordinación documental | Instructivo, BL y certificados en un solo flujo |
| 02 | Detección de excepciones | Errores capturados antes de que cuesten dinero |
| 03 | Visibilidad del equipo | Quién tiene qué y qué cambió |

Tab heading: "Control documental completo"  
Tab lede: "Una vista operacional de todas tus exportaciones: embarques activos, documentos pendientes, excepciones abiertas — con responsable claro."

**Right — document checklist visual** (new, inline JSX):  
A card showing a single active shipment with 5 document rows, each with a name and a status badge (Enviado / Revisar / Emitido / Pendiente / Listo). Colors: green for ok, amber for warn, muted for pending.

---

### Finanzas tab

Content migrated from `LandingFinancial`. The existing `FinancialVisual` component (cobranza pipeline + conciliación footer) moves here as the right column.

**Left — icon feature list** (existing pattern from `LandingFinancial`):

| Icon | Label | Body |
|------|-------|------|
| ReceiptText | Cobranza inteligente | Identifica qué POs cobrar y cuándo, priorizando según vencimiento y cliente — sin intervención manual. |
| Check | Conciliación automática | Cruza los pagos recibidos contra los POs registrados y cierra el caso solo. Cuando no cuadra, identifica la causa. |
| TrendingUp | Proyección financiera | Visibilidad del flujo de caja esperado por período y cliente, con separación entre ingresos confirmados y proyectados. |

Tab heading: "Cierra el loop financiero"  
Tab lede: "Conecta tus documentos de embarque con la cobranza y la conciliación. Sabe qué hay que cobrar, cuándo, y lo cruza automáticamente con los pagos recibidos."

**Right — `FinancialVisual`** (existing component, moved from `LandingFinancial.tsx` into `LandingProduct.tsx`, no content changes needed)

---

### Comercial tab (new)

**Left — icon feature list** (same pattern as Finanzas):

| Icon | Label | Body |
|------|-------|------|
| BarChart2 | OTIF por cliente | % de embarques que cumplieron fecha y cantidad pactadas. Argumento duro para defender o subir precios en la renegociación. |
| DollarSign | Precio neto efectivo | No el FOB nominal — el dinero que realmente llega después de fees, amendments y diferencias de cambio. |
| Activity | Score de salud del cliente | Un solo número por importador que combina precio neto, OTIF, comportamiento de pago y tendencia de volumen. |

Tab heading: "Inteligencia por cliente"  
Tab lede: "La data de cada embarque convertida en argumentos para la mesa. OTIF, precio neto efectivo y señales de alerta — para negociar desde hechos, no desde intuición."

**Right — `ComercialVisual`** (new named function component defined in `LandingProduct.tsx`):  
A client ranking card showing 2 importers, each with: client name, market, health score badge (green/amber), and a 3-metric row (OTIF %, precio neto/kg, días pago promedio). Visual language matches `FinancialVisual`.

---

## Component Architecture

### Files changed

| File | Change |
|------|--------|
| `components/landing/LandingProduct.tsx` | Full rewrite — becomes the unified tabbed Platform section |
| `components/landing/LandingFinancial.tsx` | Deleted — content migrated into LandingProduct |
| `messages/es.json` | Update `landing.product.*` keys; add `landing.product.comercial.*` keys; remove `landing.financial.*` |
| `messages/en.json` | Same |
| `app/[locale]/(marketing)/page.tsx` | Remove `<LandingFinancial />` import and usage |

### State

Tab state is local React `useState` inside `LandingProduct`. No server state, no URL params.

### Translations (new keys needed)

```
landing.product.title          → "Coordinación y automatización"
landing.product.titleLine2     → "a lo largo de todo el proceso."
landing.product.lede           → "Comex, finanzas y comercial — tres áreas integradas en una sola plataforma."

landing.product.comexHed       → "Control documental completo"
landing.product.comexLede      → "Una vista operacional de todas tus exportaciones..."

landing.product.finanzasHed    → "Cierra el loop financiero"
landing.product.finanzasLede   → "Conecta tus documentos de embarque con la cobranza y la conciliación..."

landing.product.comercialHed   → "Inteligencia por cliente"
landing.product.comercialLede  → "La data de cada embarque convertida en argumentos para la mesa..."
landing.product.comercial1Label → "OTIF por cliente"
landing.product.comercial1Body  → "% de embarques que cumplieron fecha y cantidad pactadas..."
landing.product.comercial2Label → "Precio neto efectivo"
landing.product.comercial2Body  → "No el FOB nominal — el dinero que realmente llega..."
landing.product.comercial3Label → "Score de salud del cliente"
landing.product.comercial3Body  → "Un solo número por importador que combina precio neto, OTIF..."
```

---

## What is removed

- The feature spec table in the current `LandingProduct` (replaced by Comex tab content)
- The dashboard screenshot (`/landing/dashboard.png`) and its `Annotation` chips
- The `LandingFinancial` section as a standalone section (merged into tabs)
- The `Annotation` helper component in `LandingProduct.tsx`

---

## Responsive behavior

- On mobile (`< lg`): tabs stack; each tab panel switches to single column (feature list above visual)
- Tab bar scrolls horizontally if needed (already handled by `overflow-x: auto`)
