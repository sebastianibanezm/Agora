# Globe Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `ShipmentGlobe` from dark night-earth + neon accents to a warm parchment surface with elegant thin arc lines and status-colored moving orbs.

**Architecture:** All changes are in one file (`ShipmentGlobe.tsx`). The globe texture is replaced via `react-globe.gl`'s `globeMaterial` prop with a custom `THREE.MeshPhongMaterial`. Arc dashes are removed in favour of thin static lines. Moving orbs use a `customThreeObjectData` layer animated by a `requestAnimationFrame` loop that mutates Three.js object positions directly — no React state churn per frame.

**Tech Stack:** `react-globe.gl` v2, `three` v0.184, React, TypeScript

---

## Files

| Action | Path |
|---|---|
| Modify | `agora-app/components/globe/ShipmentGlobe.tsx` |

---

### Task 1: Add Three.js import and pure helper functions

All helpers are module-level functions (no hooks). Add them below the existing imports, before the `ACTIVE_STATUSES` constant.

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx`

- [ ] **Step 1: Add Three.js import**

Add at the top with the other imports:

```tsx
import * as THREE from 'three';
```

- [ ] **Step 2: Add helper functions after the imports block, before `ACTIVE_STATUSES`**

```tsx
// --- Globe helpers ---

/** Decode a hex color string to an rgba() CSS string. */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Spherical linear interpolation between two lat/lng points.
 * Returns the lat/lng at parameter t (0 = start, 1 = end).
 */
function slerpLatLng(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  t: number,
): { lat: number; lng: number } {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(lat1), λ1 = toRad(lng1);
  const φ2 = toRad(lat2), λ2 = toRad(lng2);
  const [x1, y1, z1] = [Math.cos(φ1) * Math.cos(λ1), Math.cos(φ1) * Math.sin(λ1), Math.sin(φ1)];
  const [x2, y2, z2] = [Math.cos(φ2) * Math.cos(λ2), Math.cos(φ2) * Math.sin(λ2), Math.sin(φ2)];
  const dot = Math.min(1, Math.max(-1, x1 * x2 + y1 * y2 + z1 * z2));
  const Ω = Math.acos(dot);
  if (Ω < 1e-10) return { lat: lat1, lng: lng1 };
  const sinΩ = Math.sin(Ω);
  const s1 = Math.sin((1 - t) * Ω) / sinΩ;
  const s2 = Math.sin(t * Ω) / sinΩ;
  const xi = s1 * x1 + s2 * x2;
  const yi = s1 * y1 + s2 * y2;
  const zi = s1 * z1 + s2 * z2;
  return {
    lat: toDeg(Math.atan2(zi, Math.sqrt(xi * xi + yi * yi))),
    lng: toDeg(Math.atan2(yi, xi)),
  };
}

/**
 * Great-circle angular distance in radians (0–π) between two lat/lng points.
 * Used to scale orb altitude to match arcAltitudeAutoScale behavior.
 */
function greatCircleRad(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δφ = φ2 - φ1, Δλ = toRad(lng2 - lng1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * Math.asin(Math.sqrt(a));
}

/**
 * Creates a Three.js Group representing a glowing orb in the given status color.
 * Composed of 3 additive glow spheres + 1 bright core.
 */
function createOrbGroup(color: string): THREE.Group {
  const baseColor = new THREE.Color(color);
  const group = new THREE.Group();
  const glowLayers: Array<{ r: number; opacity: number }> = [
    { r: 0.65, opacity: 0.07 },
    { r: 0.42, opacity: 0.18 },
    { r: 0.25, opacity: 0.48 },
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
  const coreColor = baseColor.clone().lerp(new THREE.Color(0xffffff), 0.45);
  const coreMat = new THREE.MeshBasicMaterial({ color: coreColor, depthWrite: false });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), coreMat));
  return group;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: no new errors from these additions.

- [ ] **Step 4: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): add Three.js helpers for parchment restyle"
```

---

### Task 2: Parchment globe surface

Replace `earth-night.jpg` with a custom `THREE.MeshPhongMaterial`. The `color` property on a `MeshPhongMaterial` multiplies with the texture — setting it to a warm amber tint over `earth-day.jpg` gives a parchment/sepia look. Keep the bump map for topographic relief.

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx`

- [ ] **Step 1: Add `globeMaterial` memo inside the component, after the existing `useMemo` blocks**

```tsx
const globeMaterial = useMemo(() => {
  const mat = new THREE.MeshPhongMaterial({
    color: new THREE.Color('#D4B890'), // warm amber multiply over texture
    shininess: 4,
  });
  const loader = new THREE.TextureLoader();
  loader.load(
    '//unpkg.com/three-globe/example/img/earth-day.jpg',
    (tex) => { mat.map = tex; mat.needsUpdate = true; },
  );
  loader.load(
    '//unpkg.com/three-globe/example/img/earth-topology.png',
    (tex) => { mat.bumpMap = tex; mat.bumpScale = 12; mat.needsUpdate = true; },
  );
  return mat;
}, []);
```

- [ ] **Step 2: Update Globe props**

Remove `globeImageUrl` and `bumpImageUrl`. Add `globeMaterial`. Change `atmosphereColor`.

Before:
```tsx
globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
...
atmosphereColor="#7DD3FC"
atmosphereAltitude={0.18}
```

After:
```tsx
globeMaterial={globeMaterial}
atmosphereColor="#C8A870"
atmosphereAltitude={0.15}
```

- [ ] **Step 3: TypeScript check**

```bash
cd agora-app && npx tsc --noEmit
```

- [ ] **Step 4: Start dev server and visually confirm globe surface is warm/parchment**

```bash
cd agora-app && npm run dev
```

Open `http://localhost:3000` (or whichever port). The globe should no longer show a dark night earth — it should read as warm tan/sandy with muted ocean.

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): replace night earth with warm parchment material"
```

---

### Task 3: Fix port colors, tooltip HTML, and status badge

All are simple color substitutions. No logic changes.

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx`

- [ ] **Step 1: Update port marker colors in the `points` useMemo**

Find these two lines inside the `points` useMemo:
```tsx
items.push({ lat: arc.startLat, lng: arc.startLng, size: 0.4, color: '#00E696', label: arc.bookings[0]!.pol });
...
items.push({ lat: arc.endLat, lng: arc.endLng, size: 0.3, color: '#7DD3FC', label: arc.bookings[0]!.pod });
```

Replace with:
```tsx
items.push({ lat: arc.startLat, lng: arc.startLng, size: 0.4, color: '#4F7A3C', label: arc.bookings[0]!.pol });
...
items.push({ lat: arc.endLat, lng: arc.endLng, size: 0.3, color: '#5A6B85', label: arc.bookings[0]!.pod });
```

- [ ] **Step 2: Update `arcLabel` tooltip HTML**

Replace the existing `arcLabel` prop:
```tsx
arcLabel={(d: object) => {
  const a = d as ArcDatum;
  return `<div style="border-radius:8px;background:#FFFCF1;backdrop-filter:blur(8px);padding:8px 10px;font-size:12px;color:#2B1F12;border:1px solid rgba(43,31,18,0.12);font-family:monospace">
    <div style="font-weight:600">${a.bookings[0]!.pol.split(',')[0]} → ${a.bookings[0]!.pod.split(',')[0]}</div>
    <div style="color:#8A7860;font-size:11px;margin-top:3px">${a.bookings.length} active booking${a.bookings.length === 1 ? '' : 's'}</div>
  </div>`;
}}
```

- [ ] **Step 3: Fix the status badge (top-left label)**

Find:
```tsx
<div className="pointer-events-none absolute top-3 left-4 z-10 font-mono text-[10px] tracking-[0.18em] text-mint-500/80">
  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-mint-500 align-middle mr-1.5" />
  {t('globeLabel')}
</div>
```

Replace with:
```tsx
<div className="pointer-events-none absolute top-3 left-4 z-10 font-mono text-[10px] tracking-[0.18em] text-ink-3">
  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#4F7A3C] align-middle mr-1.5" />
  {t('globeLabel')}
</div>
```

- [ ] **Step 4: TypeScript check + visual verify**

```bash
cd agora-app && npx tsc --noEmit
```

Check in browser: port dots should be moss green (origin) and slate blue (destination). Hover a lane — tooltip should have a light card background.

- [ ] **Step 5: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): warm port colors, light arc tooltip, fix status badge"
```

---

### Task 4: Thin static arc lines

Remove the dash animation. Keep arc color but at 40% opacity. Set a uniform thin stroke.

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx`

- [ ] **Step 1: Update arc props on the Globe component**

Remove these props entirely:
```tsx
arcDashLength={0.5}
arcDashGap={0.25}
arcDashAnimateTime={(d: object) => ((d as ArcDatum).reefer ? 2200 : 4000)}
```

Update these props:
```tsx
// Before
arcColor={(d: object) => (d as ArcDatum).color}
arcStroke={(d: object) => (d as ArcDatum).stroke}

// After
arcColor={(d: object) => hexToRgba((d as ArcDatum).color, 0.35)}
arcStroke={() => 0.6}
```

The `stroke` field on `ArcDatum` is no longer used. Remove it from the interface and from the `arcs` useMemo:

Remove from `ArcDatum`:
```tsx
stroke: number;
```

Remove from `arcs` useMemo (the `baseStroke`, `reeferBoost`, and `stroke` computation lines):
```tsx
const baseStroke = list.length > 10 ? 1.6 : list.length > 3 ? 1.2 : 0.8;
const reeferBoost = reeferShare >= 0.5 ? 0.6 : 0;
// and in the result.push:
stroke: baseStroke + reeferBoost,
```

- [ ] **Step 2: TypeScript check**

```bash
cd agora-app && npx tsc --noEmit
```

- [ ] **Step 3: Visual verify**

Arcs should be thin, faint, elegant lines — no animated dashes.

- [ ] **Step 4: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): replace dashed arcs with thin static lines"
```

---

### Task 5: Moving status orbs

Add a `customThreeObjectData` layer driven by a `requestAnimationFrame` loop. The loop advances each orb's `t` (0→1) at a uniform rate, computes lat/lng/alt via `slerpLatLng` + arc altitude formula, and mutates Three.js object positions directly — no React state update per frame.

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx`

- [ ] **Step 1: Add `orbProgressRef` and the Three.js object registry ref inside the component**

Add after the existing `useRef` declarations:

```tsx
const orbProgressRef = useRef<Map<string, number>>(new Map());
const orbObjectsRef = useRef<Map<string, THREE.Object3D>>(new Map());
```

- [ ] **Step 2: Add the rAF animation loop `useEffect`**

Add after the existing `useEffect` blocks (the resize observer and controls setup):

```tsx
// Initialise / carry forward orb progress when arcs change.
useEffect(() => {
  const next = new Map<string, number>();
  arcs.forEach((arc, i) => {
    // Stagger start positions so orbs don't all bunch at POL on load.
    next.set(arc.laneKey, orbProgressRef.current.get(arc.laneKey) ?? i / Math.max(arcs.length, 1));
  });
  orbProgressRef.current = next;
  // Prune stale orb objects for removed lanes.
  for (const key of orbObjectsRef.current.keys()) {
    if (!next.has(key)) orbObjectsRef.current.delete(key);
  }
}, [arcs]);

useEffect(() => {
  const SPEED = 0.000055; // t-units per ms → ~18 s full traversal
  let last = performance.now();
  let rafId: number;

  const tick = (now: number) => {
    const dt = Math.min(now - last, 100); // clamp to avoid huge jumps after tab switch
    last = now;

    for (const [key, t] of orbProgressRef.current) {
      const newT = (t + dt * SPEED) % 1;
      orbProgressRef.current.set(key, newT);

      const obj = orbObjectsRef.current.get(key);
      const arc = arcs.find((a) => a.laneKey === key);
      if (!obj || !arc || !globeRef.current) continue;

      const { lat, lng } = slerpLatLng(arc.startLat, arc.startLng, arc.endLat, arc.endLng, newT);
      const angDist = greatCircleRad(arc.startLat, arc.startLng, arc.endLat, arc.endLng);
      const alt = Math.sin(Math.PI * newT) * 0.4 * (angDist / Math.PI);
      const pos = globeRef.current.getCoords(lat, lng, alt);
      obj.position.set(pos.x, pos.y, pos.z);
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}, [arcs]); // arcs is a stable reference from useMemo
```

- [ ] **Step 3: Add `customThreeObjectData`, `customThreeObject`, and `customThreeObjectUpdate` props to the `Globe` component**

Add these three props to the `<Globe ...>` JSX block (order doesn't matter):

```tsx
customThreeObjectData={arcs}
customThreeObject={(d: object) => {
  const arc = d as ArcDatum;
  const group = createOrbGroup(arc.color);
  orbObjectsRef.current.set(arc.laneKey, group);
  return group;
}}
customThreeObjectUpdate={(obj: object, d: object) => {
  // Initial placement — the rAF loop takes over immediately after.
  const arc = d as ArcDatum;
  const t = orbProgressRef.current.get(arc.laneKey) ?? 0;
  if (!globeRef.current) return;
  const { lat, lng } = slerpLatLng(arc.startLat, arc.startLng, arc.endLat, arc.endLng, t);
  const angDist = greatCircleRad(arc.startLat, arc.startLng, arc.endLat, arc.endLng);
  const alt = Math.sin(Math.PI * t) * 0.4 * (angDist / Math.PI);
  const pos = globeRef.current.getCoords(lat, lng, alt);
  (obj as THREE.Object3D).position.set(pos.x, pos.y, pos.z);
}}
```

- [ ] **Step 4: TypeScript check**

```bash
cd agora-app && npx tsc --noEmit
```

If `customLayerData` / `customThreeObject` / `customThreeObjectUpdate` cause TS errors on the Globe JSX (they are typed as `any` in `react-globe.gl`'s types), add `// eslint-disable-next-line` or cast as needed.

- [ ] **Step 5: Visual verify**

Open `http://localhost:3000`. Each shipping lane should have a small glowing dot — colored per booking status — smoothly traveling from origin port to destination. All orbs move at the same speed. No arc dash animation.

Check edge cases:
- Hover an arc — tooltip still works
- Click an arc — still navigates to booking

- [ ] **Step 6: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): add status-colored moving orbs along shipping lanes"
```

---

### Task 6: Final polish pass

Small checks to ensure nothing was missed.

- [ ] **Step 1: Confirm `reefer` field on `ArcDatum` is still used**

The `reefer` field is still referenced in the hover card (`hovered.reefer` for the REEFER badge). Keep it. Confirm no unused fields remain in `ArcDatum` after removing `stroke`.

- [ ] **Step 2: Check loading placeholder color**

The loading fallback div still reads `bg-bg-1`:
```tsx
loading: () => <div className="h-full w-full bg-bg-1" />,
```
This is correct for the warm palette — no change needed.

- [ ] **Step 3: Full TypeScript check**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Final visual walkthrough**

- Globe surface: warm parchment (not dark night)
- Atmosphere: amber glow (not sky blue)
- Arc lines: thin, faint, elegant
- Orbs: glowing colored dots traveling each lane at uniform speed
- Port markers: moss green origin, slate blue destination
- Arc hover tooltip: light card background
- Status badge: ink text, moss pulsing dot
- Hover card: unchanged (already warm)

- [ ] **Step 5: Final commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): complete parchment restyle with moving status orbs"
```
