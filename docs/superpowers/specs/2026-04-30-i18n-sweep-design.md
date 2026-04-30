# i18n Sweep — Hardcoded String Elimination

**Date:** 2026-04-30  
**Status:** Approved

## Background

The Agora platform uses next-intl v4 with `messages/en.json` and `messages/es.json` for all user-facing strings. However, 21 of 58 components have hardcoded strings in English or Spanish, bypassing the i18n system entirely. This spec covers the single-agent sweep to extract all hardcoded strings, add them to both translation files, and wire up `useTranslations` / `getTranslations` in each component.

---

## Scope

### Components requiring changes (21 total)

| Component | Strings | Pattern |
|---|---|---|
| `purchase-orders/POListTable.tsx` | "Search POs…", column headers (PO ID, Product, Importer, Status, Value USD, Date) | client → `useTranslations` |
| `purchase-orders/POKpiStrip.tsx` | "Total Value", "Quantity", "Containers", "Days to Delivery", "Payment", "USD", "units", "Received", "Pending", "Past" | server → `getTranslations` |
| `purchase-orders/POResumenEjecutivo.tsx` | "Resumen Ejecutivo", status labels, cold-chain/docs/finance state labels, summary sentence | server → `getTranslations` |
| `purchase-orders/POLifecycleTimeline.tsx` | Milestone labels ("Confirmada", "Contenedor asignado", "BL emitido", "Docs presentados", "Entregada", "Pago recibido") | server → `getTranslations` |
| `purchase-orders/PODetail.tsx` | "Ciclo de Vida", "Fulfillment & Contraparte", "Contenedores vinculados", table column headers, "Avg payment: {n}d" | server → `getTranslations` |
| `entity-fiche/RelationshipHistory.tsx` | "Purchase Orders", "Containers" section headings | server → `getTranslations` |
| `entity-fiche/ImporterSpecificSections.tsx` | "Volumen por Temporada", "Perfil de Mercado", "Historial de Pagos", market profile field labels, payment table headers, "Pagado"/"Pendiente" | server → `getTranslations` |
| `entity-fiche/ProducerSpecificSections.tsx` | "Volumen por Temporada", "Productos Certificados", "Certificaciones SAG", "Cold chain", "Ambient", "Season:", "Protocol:", "Vigente", "Vence en {n}d" | server → `getTranslations` |
| `compliance/ProductProfileCard.tsx` | "Season:", "Cold chain", "Ambient" | server → `getTranslations` |
| `compliance/MarketRulePackCard.tsx` | "Inspection Authority", "Digital System", "Registrations", "Label Languages" | server → `getTranslations` |
| `compliance/CommercialProfileCard.tsx` | "Draft", "{n} active POs", "Banco:", "Moneda:", "Cobro promedio: {n}d" | server → `getTranslations` |
| `compliance/SentinelQueue.tsx` | "No alerts" (already uses `useTranslations()` root-scoped — keep the root scope, add `t('alerts.noAlerts')`) | client → keep existing root-scoped `useTranslations()`, do NOT change to `useTranslations('alerts')` as that would break existing `t(alert.titleKey)` lookups |
| `containers/ContainersPageClient.tsx` | "Search containers…", "Kanban", "Table" | client → `useTranslations` |
| `containers/ContainerCard.tsx` | "Reefer" badge | add `'use client'` + `useTranslations` |
| `containers/ContainerKanban.tsx` | Stage labels from `STAGES.label` (Planning, Preparation, etc.) | client → translate via `containers.statuses.*` |
| `dashboard/ContainerCard.tsx` | "COST AT RISK" | client → `useTranslations` |
| `dashboard/ClosedTable.tsx` | Column headers: "CONTAINER", "BUYER", "CYCLE", "Δ AVG", "PENALTY" | server → `getTranslations` |
| `dashboard/PenaltyHeatmap.tsx` | `COL_LABELS` array (Refumig., Phyto Reissue, VGM Late, DUS Error, BL Correction, Demurrage, Detention, Bank Discrep.) | server → `getTranslations` |
| `map/ShipmentMap.tsx` | "ACTIVE SHIPMENTS · LIVE", "{n} ARCS" | client → `useTranslations` |

### Components excluded (no user-facing strings)

`ContainerTimeline`, `KPITile`, `KPIStrip` (already translated via `getTranslations`), `ColdChainTimeline`, `MiniSeasonBar`, `VolumeTimeSeries`, `PageTransition`, `ReadinessTab`, `EntityKpiStrip`, `AppShell`

---

## New Translation Namespaces

### `purchaseOrders`

```json
{
  "searchPlaceholder": "Search POs…",
  "colId": "PO ID",
  "colProduct": "Product",
  "colImporter": "Importer",
  "colStatus": "Status",
  "colValue": "Value USD",
  "colDate": "Date",
  "kpi": {
    "totalValue": "Total Value",
    "quantity": "Quantity",
    "containers": "Containers",
    "daysToDelivery": "Days to Delivery",
    "payment": "Payment",
    "usd": "USD",
    "kg": "kg",
    "units": "units",
    "received": "Received",
    "pending": "Pending",
    "past": "Past"
  },
  "resumen": {
    "title": "Executive Summary",
    "summary": "PO {id} in status {status} with {n} container(s) assigned.",
    "statusLabel": "PO Status",
    "coldChainLabel": "Cold Chain",
    "docsLabel": "Documentation",
    "financeLabel": "Financial Status",
    "coldChainActive": "Active monitoring",
    "coldChainPending": "Pending",
    "docsSubmitted": "Submitted",
    "docsInProgress": "In progress",
    "paymentReceived": "Payment received",
    "paymentPending": "Payment pending"
  },
  "statuses": {
    "draft": "Draft",
    "confirmed": "Confirmed",
    "in_fulfillment": "In Fulfillment",
    "delivered": "Delivered",
    "cancelled": "Cancelled"
  },
  "lifecycle": {
    "title": "Lifecycle",
    "confirmed": "Confirmed",
    "containerAssigned": "Container assigned",
    "blIssued": "B/L issued",
    "docsSubmitted": "Docs submitted",
    "delivered": "Delivered",
    "paymentReceived": "Payment received"
  },
  "fulfillment": {
    "title": "Fulfillment & Counterparty",
    "linkedContainers": "Linked containers",
    "colId": "ID",
    "colProduct": "Product",
    "colStage": "Stage",
    "colTDay": "T-Day",
    "avgPayment": "Avg payment: {n}d"
  }
}
```

Spanish (`es.json`):
```json
{
  "searchPlaceholder": "Buscar OCs…",
  "colId": "ID OC",
  "colProduct": "Producto",
  "colImporter": "Importador",
  "colStatus": "Estado",
  "colValue": "Valor USD",
  "colDate": "Fecha",
  "kpi": {
    "totalValue": "Valor Total",
    "quantity": "Cantidad",
    "containers": "Contenedores",
    "daysToDelivery": "Días para entrega",
    "payment": "Pago",
    "usd": "USD",
    "kg": "kg",
    "units": "unidades",
    "received": "Recibido",
    "pending": "Pendiente",
    "past": "Vencido"
  },
  "resumen": {
    "title": "Resumen Ejecutivo",
    "summary": "OC {id} en estado {status} con {n} contenedor(es) asignado(s).",
    "statusLabel": "Estado de OC",
    "coldChainLabel": "Cadena de frío",
    "docsLabel": "Documentación",
    "financeLabel": "Situación financiera",
    "coldChainActive": "Monitoreo activo",
    "coldChainPending": "Pendiente",
    "docsSubmitted": "Presentada",
    "docsInProgress": "En proceso",
    "paymentReceived": "Pago recibido",
    "paymentPending": "Pendiente de pago"
  },
  "statuses": {
    "draft": "Borrador",
    "confirmed": "Confirmado",
    "in_fulfillment": "En Ejecución",
    "delivered": "Entregado",
    "cancelled": "Cancelado"
  },
  "lifecycle": {
    "title": "Ciclo de Vida",
    "confirmed": "Confirmada",
    "containerAssigned": "Contenedor asignado",
    "blIssued": "BL emitido",
    "docsSubmitted": "Docs presentados",
    "delivered": "Entregada",
    "paymentReceived": "Pago recibido"
  },
  "fulfillment": {
    "title": "Ejecución y Contraparte",
    "linkedContainers": "Contenedores vinculados",
    "colId": "ID",
    "colProduct": "Producto",
    "colStage": "Etapa",
    "colTDay": "T-Day",
    "avgPayment": "Pago promedio: {n}d"
  }
}
```

---

### `entityFiche`

```json
{
  "purchaseOrders": "Purchase Orders",
  "containers": "Containers",
  "volumeBySeason": "Volume by Season",
  "marketProfile": "Market Profile",
  "paymentHistory": "Payment History",
  "colPo": "PO",
  "colMethod": "Method",
  "colBank": "Bank",
  "colAmount": "Amount",
  "colDays": "Days",
  "colStatus": "Status",
  "paid": "Paid",
  "paymentPending": "Pending",
  "inspectionAuthority": "Inspection Authority",
  "digitalSystem": "Digital System",
  "requiredRegistrations": "Required Registrations",
  "labelLanguages": "Label Languages",
  "coldTreatmentOptions": "Cold Treatment Options",
  "certifiedProducts": "Certified Products",
  "sagCertifications": "SAG Certifications",
  "season": "Season",
  "protocol": "Protocol",
  "coldChain": "Cold chain",
  "ambient": "Ambient",
  "valid": "Valid",
  "expiresIn": "Expires in {n}d"
}
```

Spanish:
```json
{
  "purchaseOrders": "Órdenes de Compra",
  "containers": "Contenedores",
  "volumeBySeason": "Volumen por Temporada",
  "marketProfile": "Perfil de Mercado",
  "paymentHistory": "Historial de Pagos",
  "colPo": "OC",
  "colMethod": "Método",
  "colBank": "Banco",
  "colAmount": "Monto",
  "colDays": "Días",
  "colStatus": "Estado",
  "paid": "Pagado",
  "paymentPending": "Pendiente",
  "inspectionAuthority": "Autoridad de Inspección",
  "digitalSystem": "Sistema Digital",
  "requiredRegistrations": "Registros Requeridos",
  "labelLanguages": "Idiomas de Etiqueta",
  "coldTreatmentOptions": "Tratamiento de Frío",
  "certifiedProducts": "Productos Certificados",
  "sagCertifications": "Certificaciones SAG",
  "season": "Temporada",
  "protocol": "Protocolo",
  "coldChain": "Cadena de frío",
  "ambient": "Ambiente",
  "valid": "Vigente",
  "expiresIn": "Vence en {n}d"
}
```

---

### `compliance` (new keys only)

```json
{
  "season": "Season",
  "coldChain": "Cold chain",
  "ambient": "Ambient",
  "inspectionAuthority": "Inspection Authority",
  "digitalSystem": "Digital System",
  "registrations": "Registrations",
  "labelLanguages": "Label Languages",
  "draft": "Draft",
  "activePOs": "{n} active POs",
  "bank": "Bank",
  "currency": "Currency",
  "avgCollection": "Avg collection: {n}d"
}
```

Spanish:
```json
{
  "season": "Temporada",
  "coldChain": "Cadena de frío",
  "ambient": "Ambiente",
  "inspectionAuthority": "Autoridad de Inspección",
  "digitalSystem": "Sistema Digital",
  "registrations": "Registros",
  "labelLanguages": "Idiomas de Etiqueta",
  "draft": "Borrador",
  "activePOs": "{n} OCs activas",
  "bank": "Banco",
  "currency": "Moneda",
  "avgCollection": "Cobro promedio: {n}d"
}
```

---

### `map` (new namespace)

```json
{
  "liveLabel": "ACTIVE SHIPMENTS · LIVE",
  "arcs": "{n} ARCS"
}
```

Spanish:
```json
{
  "liveLabel": "EMBARQUES ACTIVOS · EN VIVO",
  "arcs": "{n} ARCOS"
}
```

---

## Extensions to Existing Namespaces

### `containers` (add)

```json
{
  "searchPlaceholder": "Search containers…",
  "viewKanban": "Kanban",
  "viewTable": "Table",
  "reefer": "Reefer"
}
```

Spanish:
```json
{
  "searchPlaceholder": "Buscar contenedores…",
  "viewKanban": "Kanban",
  "viewTable": "Tabla",
  "reefer": "Reefer"
}
```

### `dashboard` (add)

Note: `dashboard.costAtRisk` already exists in both `en.json` and `es.json`. `dashboard/ContainerCard.tsx` only needs to be wired up to use the existing key — no new key addition needed for that string.

```json
{
  "colContainer": "CONTAINER",
  "colBuyer": "BUYER",
  "colCycle": "CYCLE",
  "colDeltaAvg": "Δ AVG",
  "colPenalty": "PENALTY"
}
```

Spanish:
```json
{
  "colContainer": "CONTENEDOR",
  "colBuyer": "COMPRADOR",
  "colCycle": "CICLO",
  "colDeltaAvg": "Δ PROM",
  "colPenalty": "MULTA"
}
```

### `penalties` (add heatmap event labels)

```json
{
  "refumigation": "Refumig.",
  "phytoReissue": "Phyto Reissue",
  "vgmLate": "VGM Late",
  "dusError": "DUS Error",
  "blCorrection": "BL Correction",
  "demurrage": "Demurrage",
  "detention": "Detention",
  "bankDiscrepancy": "Bank Discrep."
}
```

Spanish:
```json
{
  "refumigation": "Refumig.",
  "phytoReissue": "Reem. Fitosanitario",
  "vgmLate": "VGM Tardío",
  "dusError": "Error DUS",
  "blCorrection": "Corrección BL",
  "demurrage": "Demurrage",
  "detention": "Detención",
  "bankDiscrepancy": "Discrepancia Banco"
}
```

### `alerts` (add)

```json
{
  "noAlerts": "No alerts"
}
```

Spanish:
```json
{
  "noAlerts": "Sin alertas"
}
```

---

## STAGES Label Resolution

`lib/containers.ts` exports `STAGES` with hardcoded English `label` fields. Translation keys already exist as `containers.statuses.*`. `ContainerKanban` (already `'use client'`) will be updated to use `useTranslations('containers')` and pass `t('statuses.' + stage.status)` as the `label` prop to `KanbanColumn`. The `STAGES.label` field is retained as a fallback reference but no longer used at runtime.

---

## i18n Pattern Rules

| Component type | API | Example |
|---|---|---|
| Server component (no `'use client'`) | `async` fn + `await getTranslations('ns')` | `PODetail`, `ClosedTable` |
| Client component (has `'use client'`) | `useTranslations('ns')` | `ContainersPageClient`, `ShipmentMap` |
| Server component used directly inside a client component | add `'use client'` + `useTranslations('ns')` | `ContainerCard` (containers/) |

---

## Implementation Approach

Single agent, one pass:

1. Add all new/extended keys to `messages/en.json` and `messages/es.json`
2. Update each of the 21 components to use the appropriate i18n API
3. Update `ContainerKanban` to translate stage labels from `containers.statuses.*`
4. Fix the `SentinelQueue` "No alerts" hardcode

No new files, no structural refactors. Only translation key additions and `useTranslations`/`getTranslations` wiring.

---

## Verification

After implementation:
- `grep -r '>[A-Z]' components --include="*.tsx"` should return only data-driven values, not labels
- Both `en` and `es` locale should render all text in the correct language (toggle via Settings page)
- `pnpm typecheck` and `pnpm test` must pass clean
