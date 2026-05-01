# Globe ↔ Transit Panel Hover Interaction

**Date:** 2026-04-30
**Status:** Approved

---

## Goal

When the user hovers a booking card in the `ActiveTransitPanel`, the `ShipmentGlobe` responds by: rotating to the booking's route midpoint, highlighting its arc, dimming others, and launching a glowing orb along the arc. On hover end, the globe snaps back to its default view and resumes auto-rotation.

---

## Architecture

A new client component `GlobeTransitSection` owns the hover state and renders both the globe and panel as siblings. `page.tsx` (server component) delegates to it, passing raw data as props.

```
page.tsx (server)
  └── GlobeTransitSection (client, owns hoveredBooking state)
        ├── ShipmentGlobe   ← receives highlightedBooking prop
        └── ActiveTransitPanel  ← receives onHoverBooking + hoveredBookingId props
```

---

## Files

| Action | Path |
|---|---|
| Create | `agora-app/components/dashboard/GlobeTransitSection.tsx` |
| Modify | `agora-app/components/globe/ShipmentGlobe.tsx` |
| Modify | `agora-app/components/dashboard/ActiveTransitPanel.tsx` |
| Modify | `agora-app/app/[locale]/page.tsx` |

---

## Component Specs

### `GlobeTransitSection`

- `'use client'`
- Props: `bookings: Booking[]`, `navieras: Naviera[]`, `height: number`
- State: `hoveredBooking: Booking | null`
- Renders the existing `flex gap-4` row containing `ShipmentGlobe` and `ActiveTransitPanel`
- Passes `hoveredBooking` to globe, `(b) => setHoveredBooking(b)` + `hoveredBooking?.id` to panel

### `ShipmentGlobe` — new prop

```ts
highlightedBooking?: Booking | null
```

#### Arc datum — encode highlight state into the datum

Add a `highlighted: boolean` field to `ArcDatum`. The `arcs` useMemo gains `highlightedBooking` as a dependency. When computing each arc, set `highlighted: !!highlightedBooking && arc.bookings.some(b => b.id === highlightedBooking.id)`. This means when `highlightedBooking` changes the array identity changes, causing `react-globe.gl` to re-call the color/stroke accessors, which then read the `highlighted` field from the datum:

```ts
arcColor={(d) => {
  const a = d as ArcDatum;
  if (!highlightedBooking) return hexToRgba(a.color, 0.35);       // default
  return a.highlighted ? hexToRgba(a.color, 0.9) : hexToRgba(a.color, 0.08);
}}
arcStroke={(d) => {
  const a = d as ArcDatum;
  if (!highlightedBooking) return 0.6;                            // default
  return a.highlighted ? 1.4 : 0.4;
}}
```

#### Controls ref

During `handleGlobeReady`, store controls: `controlsRef.current = globeRef.current.controls()`. Declare `controlsRef: useRef<ReturnType<GlobeMethods['controls']> | null>(null)` alongside the other refs. The hover `useEffect` uses `controlsRef.current` rather than re-calling `globeRef.current.controls()` each time.

**On hover start** (`highlightedBooking` becomes non-null):
1. `controlsRef.current.autoRotate = false`
2. Compute route midpoint using `slerpLatLng(lat1, lng1, lat2, lng2, 0.5)`. Note: `polCoords`/`podCoords` are GeoJSON `[lng, lat]` arrays, so `polCoords[1]` is lat and `polCoords[0]` is lng.
3. Animate: `globeRef.current.pointOfView({ lat, lng, altitude: 2.4 }, 800)`
4. `arcs` identity change (from the useMemo dep) triggers arc color/stroke re-evaluation automatically
5. Find the matching arc datum: `const matchedArc = arcs.find(a => a.highlighted)`. Store in `highlightedArcRef.current`.
6. Create highlight orb (see below), add to scene, reset `highlightOrbProgressRef.current = 0`.

**On hover end** (`highlightedBooking` becomes null — handled in `useEffect` return cleanup):
1. Remove and dispose highlight orb (see cleanup note)
2. Set `highlightedArcRef.current = null`, `highlightOrbRef.current = null`

Then in the new effect body (null case):
1. `controlsRef.current.autoRotate = true`
2. `globeRef.current.pointOfView({ lat: 0, lng: -75, altitude: 2.4 }, 800)`
3. `arcs` identity change restores arc colors/strokes automatically

### Highlight Orb

- `highlightOrbRef: useRef<THREE.Group | null>(null)` — the Three.js group added to the scene
- `highlightedArcRef: useRef<ArcDatum | null>(null)` — the matched arc datum used by the RAF loop
- `highlightOrbProgressRef: useRef<number>(0)` — animation progress, reset to 0 on each hover start
- Created by `createHighlightOrbGroup(color)` — same structure as `createOrbGroup` but with:
  - Glow radii: `[1.1, 0.72, 0.42]` (vs `[0.65, 0.42, 0.25]`)
  - Glow opacities: `[0.06, 0.16, 0.45]`
  - Core radius: `0.18` (vs `0.11`)
- Speed: `0.000165` t-units/ms (3× the background orb speed of `0.000055`)
- In the RAF tick loop, after the background orbs block, add:
  ```ts
  if (highlightedArcRef.current && highlightOrbRef.current && globeRef.current) {
    const t = (highlightOrbProgressRef.current + dt * 0.000165) % 1;
    highlightOrbProgressRef.current = t;
    const pos = orbPosition(highlightedArcRef.current, t, globeRef.current);
    highlightOrbRef.current.position.set(pos.x, pos.y, pos.z);
  }
  ```
- **Cleanup is in the `useEffect` return function** (not the effect body), to avoid a one-frame flash of two orbs during rapid hover switching:
  ```ts
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
  ```

### `ActiveTransitPanel` — new props

```ts
onHoverBooking: (b: Booking | null) => void
hoveredBookingId: string | null
```

- Each card is a `<Link>` element (preserved for navigation). Add hover handlers to the Link: `onMouseEnter={() => onHoverBooking(booking)}`, `onMouseLeave={() => onHoverBooking(null)}`.
- **Active highlight**: apply a conditional class based on `hoveredBookingId === booking.id`, not the existing Tailwind `:hover` rule (which only applies while the pointer is physically over the element). Replace the existing `hover:border-white/15 hover:bg-bg-3` with a conditional: `hoveredBookingId === booking.id ? 'border-[var(--line-mid)] bg-bg-3' : 'hover:border-white/15 hover:bg-bg-3'`. This keeps the card visually active while the mouse is over the globe after triggering the hover.

---

## Data Flow

```
Card mouseenter
  → setHoveredBooking(booking)          [GlobeTransitSection]
  → highlightedBooking prop changes     [ShipmentGlobe]
  → useEffect fires:
      controlsRef.current.autoRotate = false
      pointOfView(midpoint, 800ms)
      arcs useMemo recomputes (highlighted field set) → react-globe.gl re-evaluates color/stroke
      highlightedArcRef set to matched arc
      createHighlightOrbGroup → added to scene, t reset to 0
      RAF loop animates orb at 3× speed

Card mouseleave
  → setHoveredBooking(null)
  → previous useEffect cleanup runs first:
      scene.remove + dispose highlight orb
      highlightOrbRef = null, highlightedArcRef = null
  → new useEffect body runs:
      controlsRef.current.autoRotate = true
      pointOfView(default, 800ms)
      arcs useMemo recomputes (no highlighted arc) → colors/strokes restored
```

---

## Implementation Note — Canvas Height

`ShipmentGlobe` currently hardcodes `h: 520` in the `ResizeObserver` callback (internal canvas height, separate from the container `height` prop). `GlobeTransitSection` passes `height` to both components for the container CSS height only. Do not change the `h: 520` hardcode as part of this feature.

---

## Edge Cases

- **Rapid hover switching**: `useEffect` cleanup removes the previous orb synchronously before the new effect creates one; `t` resets to 0 on each new hover.
- **Globe not yet ready**: all side effects guard with `if (!globeRef.current) return`. `controlsRef.current` is also null-guarded.
- **Arc not found**: if `arcs.find(a => a.highlighted)` returns `undefined`, set `highlightedArcRef.current = null`. Camera still rotates; RAF loop skips the orb branch (`if (highlightedArcRef.current && ...)` is false).
- **Mobile / touch**: `onMouseEnter`/`onMouseLeave` are mouse-only; panel remains interactive, globe just won't respond on touch devices (acceptable for this dashboard).

---

## Out of Scope

- Touch/pointer events on mobile
- Clicking a card to lock the highlight in place
- Multiple simultaneous highlights
