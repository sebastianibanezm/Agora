# Globe ↔ Transit Panel Hover Interaction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the user hovers a booking card in `ActiveTransitPanel`, the globe rotates to that route's midpoint, highlights the arc, dims others, and animates a glowing orb along it; on hover end, the globe snaps back and resumes auto-rotation.

**Architecture:** A new `GlobeTransitSection` client component owns `hoveredBooking` state and renders both siblings. `ShipmentGlobe` responds to a `highlightedBooking` prop via a `useEffect`. `ActiveTransitPanel` fires mouse callbacks and applies a conditional card highlight class.

**Tech Stack:** Next.js 15, React 19, react-globe.gl v2, Three.js v0.184, TypeScript, Tailwind v4

---

## Files

| Action | Path | Responsibility |
|---|---|---|
| Create | `agora-app/components/dashboard/GlobeTransitSection.tsx` | Owns hover state, renders flex row |
| Modify | `agora-app/components/globe/ShipmentGlobe.tsx` | Highlight prop, orb, arc dim/brighten |
| Modify | `agora-app/components/dashboard/ActiveTransitPanel.tsx` | Mouse callbacks, conditional card style |
| Modify | `agora-app/app/[locale]/page.tsx` | Use GlobeTransitSection instead of raw flex div |

---

### Task 1: Add `highlighted` field to `ArcDatum` and wire it into `arcs` useMemo

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx`

- [ ] **Step 1: Add `highlighted` to `ArcDatum` interface**

Find the `ArcDatum` interface (line ~24) and add the field:

```ts
interface ArcDatum {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  reefer: boolean;
  bookings: Booking[];
  laneKey: string;
  primaryBookingId: string;
  highlighted: boolean;   // ← add this
}
```

- [ ] **Step 2: Add `highlightedBooking` prop to `ShipmentGlobe`**

Update the `Props` interface and destructuring:

```ts
interface Props {
  bookings: Booking[];
  height?: number;
  className?: string;
  style?: CSSProperties;
  highlightedBooking?: Booking | null;   // ← add
}

export function ShipmentGlobe({ bookings, height = 468, className, style, highlightedBooking }: Props) {
```

- [ ] **Step 3: Add `highlightedBooking` as a dep in `arcs` useMemo and set `highlighted`**

Find the `arcs` useMemo. Add `highlightedBooking` to the dep array and set the field in `result.push(...)`:

```ts
const arcs: ArcDatum[] = useMemo(() => {
  // ... existing lane-grouping logic unchanged ...
  for (const [laneKey, list] of laneMap) {
    const reeferShare = list.filter((b) => b.isReefer).length / list.length;
    const primary = list[0]!;
    const color = LIFECYCLE_COLORS[primary.status];
    result.push({
      startLat: primary.polCoords[1],
      startLng: primary.polCoords[0],
      endLat: primary.podCoords[1],
      endLng: primary.podCoords[0],
      color,
      reefer: reeferShare >= 0.5,
      bookings: list,
      laneKey,
      primaryBookingId: primary.id,
      highlighted: !!highlightedBooking && list.some((b) => b.id === highlightedBooking.id),
    });
  }
  return result;
}, [bookings, highlightedBooking]);   // ← highlightedBooking added
```

- [ ] **Step 4: TypeScript check**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): add highlighted field to ArcDatum, wire highlightedBooking prop"
```

---

### Task 2: Add `controlsRef` and `createHighlightOrbGroup` to `ShipmentGlobe`

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx`

- [ ] **Step 1: Declare `controlsRef` alongside existing refs**

After the `orbObjectsRef` declaration (~line 216), add:

```ts
const controlsRef = useRef<ReturnType<GlobeMethods['controls']> | null>(null);
const highlightOrbRef = useRef<THREE.Group | null>(null);
const highlightedArcRef = useRef<ArcDatum | null>(null);
const highlightOrbProgressRef = useRef<number>(0);
```

- [ ] **Step 2: Store controls in `handleGlobeReady`**

In `handleGlobeReady`, right after `const controls = globeRef.current.controls()`, add:

```ts
controlsRef.current = controls;
```

- [ ] **Step 3: Add `createHighlightOrbGroup` module-level function**

Add after the existing `createOrbGroup` function (before `orbPosition`):

```ts
function createHighlightOrbGroup(color: string): THREE.Group {
  const baseColor = new THREE.Color(color);
  const group = new THREE.Group();
  const glowLayers: Array<{ r: number; opacity: number }> = [
    { r: 1.1,  opacity: 0.06 },
    { r: 0.72, opacity: 0.16 },
    { r: 0.42, opacity: 0.45 },
  ];
  for (const { r, opacity } of glowLayers) {
    const mat = new THREE.MeshBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    group.add(new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat));
  }
  const coreColor = baseColor.clone().lerp(new THREE.Color(0xffffff), 0.55);
  const coreMat = new THREE.MeshBasicMaterial({ color: coreColor, depthWrite: false });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), coreMat));
  return group;
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): add controlsRef, highlight orb refs, createHighlightOrbGroup"
```

---

### Task 3: Add hover `useEffect` to `ShipmentGlobe`

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx`

- [ ] **Step 1: Add the hover `useEffect` after the existing `useEffect` blocks**

Add this after the material cleanup `useEffect` and before the orb sync `useEffect`:

```ts
useEffect(() => {
  // cleanup: runs before the next effect (handles rapid switching)
  return () => {
    if (highlightOrbRef.current && globeRef.current) {
      globeRef.current.scene().remove(highlightOrbRef.current);
      highlightOrbRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
    }
    highlightOrbRef.current = null;
    highlightedArcRef.current = null;
  };
}, [highlightedBooking]);
```

Wait — this alone only does cleanup. We also need the hover-start and hover-end logic. Use this full version:

```ts
useEffect(() => {
  if (!globeRef.current || !controlsRef.current) return;

  if (highlightedBooking) {
    // Pause rotation and fly to route midpoint
    controlsRef.current.autoRotate = false;
    const { lat, lng } = slerpLatLng(
      highlightedBooking.polCoords[1], highlightedBooking.polCoords[0],
      highlightedBooking.podCoords[1], highlightedBooking.podCoords[0],
      0.5,
    );
    globeRef.current.pointOfView({ lat, lng, altitude: 2.4 }, 800);

    // Create and place highlight orb
    const matchedArc = arcs.find((a) => a.highlighted) ?? null;
    highlightedArcRef.current = matchedArc;
    if (matchedArc) {
      const orb = createHighlightOrbGroup(matchedArc.color);
      const pos = orbPosition(matchedArc, 0, globeRef.current);
      orb.position.set(pos.x, pos.y, pos.z);
      globeRef.current.scene().add(orb);
      highlightOrbRef.current = orb;
      highlightOrbProgressRef.current = 0;
    }
  } else {
    // Resume rotation and return to default view
    controlsRef.current.autoRotate = true;
    globeRef.current.pointOfView({ lat: 0, lng: -75, altitude: 2.4 }, 800);
  }

  return () => {
    if (highlightOrbRef.current && globeRef.current) {
      globeRef.current.scene().remove(highlightOrbRef.current);
      highlightOrbRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
    }
    highlightOrbRef.current = null;
    highlightedArcRef.current = null;
  };
}, [highlightedBooking, arcs]);
```

Note: `arcs` is listed as a dep because we call `arcs.find(a => a.highlighted)` inside the effect. Since `arcs` identity changes when `highlightedBooking` changes (from Task 1), these always fire together.

- [ ] **Step 2: TypeScript check**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): add hover useEffect – rotate to route, launch highlight orb"
```

---

### Task 4: Animate highlight orb in the RAF loop and update arc color/stroke props

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx`

- [ ] **Step 1: Add highlight orb animation to the RAF tick**

Find the RAF `tick` function inside the `useEffect` that runs on `[arcs]`. After the `for (const [key, t] of orbProgressRef.current)` loop, add:

```ts
// Animate highlight orb
if (highlightedArcRef.current && highlightOrbRef.current && globeRef.current) {
  const newT = (highlightOrbProgressRef.current + dt * 0.000165) % 1;
  highlightOrbProgressRef.current = newT;
  const pos = orbPosition(highlightedArcRef.current, newT, globeRef.current);
  highlightOrbRef.current.position.set(pos.x, pos.y, pos.z);
}
```

- [ ] **Step 2: Update `arcColor` and `arcStroke` props on the `<Globe>` component**

Find the JSX where `arcColor` and `arcStroke` are set and replace them:

```tsx
arcColor={(d: object) => {
  const a = d as ArcDatum;
  if (!highlightedBooking) return hexToRgba(a.color, 0.35);
  return a.highlighted ? hexToRgba(a.color, 0.9) : hexToRgba(a.color, 0.08);
}}
arcStroke={(d: object) => {
  const a = d as ArcDatum;
  if (!highlightedBooking) return 0.6;
  return a.highlighted ? 1.4 : 0.4;
}}
```

- [ ] **Step 3: TypeScript check**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): animate highlight orb in RAF loop, dim/brighten arcs on hover"
```

---

### Task 5: Update `ActiveTransitPanel` with hover props

**Files:**
- Modify: `agora-app/components/dashboard/ActiveTransitPanel.tsx`

- [ ] **Step 1: Add new props to the interface and component signature**

```ts
interface Props {
  bookings: Booking[];
  navieras: Naviera[];
  height: number;
  onHoverBooking: (b: Booking | null) => void;   // ← add
  hoveredBookingId: string | null;               // ← add
}

export function ActiveTransitPanel({ bookings, navieras, height, onHoverBooking, hoveredBookingId }: Props) {
```

- [ ] **Step 2: Add hover handlers and conditional highlight class to each card**

Find the `<Link>` element inside the `.map()`. Replace its `className` and add event handlers:

```tsx
<Link
  key={booking.id}
  href={`/bookings/${booking.id}`}
  onMouseEnter={() => onHoverBooking(booking)}
  onMouseLeave={() => onHoverBooking(null)}
  className={`group block rounded-lg border bg-bg-2 px-3 py-2 transition-colors ${
    hoveredBookingId === booking.id
      ? 'border-[var(--line-mid)] bg-bg-3'
      : 'border-[var(--line-soft)] hover:border-white/15 hover:bg-bg-3'
  }`}
>
```

- [ ] **Step 3: TypeScript check**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add agora-app/components/dashboard/ActiveTransitPanel.tsx
git commit -m "feat(transit-panel): add hover callbacks and conditional card highlight"
```

---

### Task 6: Create `GlobeTransitSection` and update `page.tsx`

**Files:**
- Create: `agora-app/components/dashboard/GlobeTransitSection.tsx`
- Modify: `agora-app/app/[locale]/page.tsx`

- [ ] **Step 1: Create `GlobeTransitSection.tsx`**

```tsx
'use client';

import { useState } from 'react';
import type { Booking, Naviera } from '@/types';
import { ShipmentGlobe } from '@/components/globe/ShipmentGlobe';
import { ActiveTransitPanel } from '@/components/dashboard/ActiveTransitPanel';

interface Props {
  bookings: Booking[];
  navieras: Naviera[];
  height: number;
}

export function GlobeTransitSection({ bookings, navieras, height }: Props) {
  const [hoveredBooking, setHoveredBooking] = useState<Booking | null>(null);

  return (
    <div className="flex gap-4 items-stretch">
      <ShipmentGlobe
        bookings={bookings}
        height={height}
        highlightedBooking={hoveredBooking}
      />
      <ActiveTransitPanel
        bookings={bookings}
        navieras={navieras}
        height={height}
        onHoverBooking={setHoveredBooking}
        hoveredBookingId={hoveredBooking?.id ?? null}
      />
    </div>
  );
}
```

- [ ] **Step 2: Update `page.tsx` to use `GlobeTransitSection`**

Add the import:
```ts
import { GlobeTransitSection } from '@/components/dashboard/GlobeTransitSection';
```

Replace the existing flex div block:
```tsx
// Before:
<div className="flex gap-4 items-stretch">
  <ShipmentGlobe bookings={bookings} height={468} />
  <ActiveTransitPanel bookings={bookings} navieras={navieras} height={468} />
</div>

// After:
<GlobeTransitSection bookings={bookings} navieras={navieras} height={468} />
```

Also remove the now-unused imports for `ShipmentGlobe` and `ActiveTransitPanel` from `page.tsx` if they are no longer used there.

- [ ] **Step 3: TypeScript check**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add agora-app/components/dashboard/GlobeTransitSection.tsx agora-app/app/[locale]/page.tsx
git commit -m "feat(dashboard): add GlobeTransitSection, wire globe-panel hover interaction"
```

---

### Task 7: Visual verification

- [ ] **Step 1: Start dev server**

```bash
cd agora-app && pnpm dev
```

Open `http://localhost:3000`.

- [ ] **Step 2: Verify hover-start behavior**

Hover a card in the transit panel. Verify:
- Card gains highlighted border/background
- Globe camera smoothly rotates to the midpoint of that route (~800ms)
- Auto-rotation pauses
- The matching arc brightens; all other arcs dim
- A larger glowing orb appears and begins traveling along the highlighted arc

- [ ] **Step 3: Verify hover-end behavior**

Move mouse off the card. Verify:
- Card returns to normal style
- Globe camera animates back to `{ lat: 0, lng: -75, altitude: 2.4 }`
- Auto-rotation resumes
- All arcs return to default opacity/stroke
- Highlight orb disappears instantly (no lingering flash)

- [ ] **Step 4: Verify rapid switching**

Quickly hover multiple cards in sequence. Verify no duplicate orbs appear and the globe always ends on the last hovered route.

- [ ] **Step 5: Verify arc-not-found edge case**

If any booking in the panel has a status in `ACTIVE_STATUSES` but no matching arc on the globe (edge case in mock data), confirm the globe still rotates to the route midpoint but no orb appears and no JS errors are thrown.

- [ ] **Step 6: Final commit if any polish fixes were made**

```bash
git add -p
git commit -m "fix(globe-hover): visual polish from manual verification"
```
