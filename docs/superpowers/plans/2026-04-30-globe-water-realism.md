# Globe Water Realism Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add specular and normal map textures to the globe's `MeshPhongMaterial` to make ocean areas appear glossy and textured, while leaving all existing functionality untouched.

**Architecture:** Two new textures are added to the existing lazy-initialized `MeshPhongMaterial` in `ShipmentGlobe.tsx`. A specular map (water mask) restricts gloss to ocean pixels; a normal map adds micro-surface wave detail that the existing raking directional light turns into visible water texture. No new files, no new components, no lighting or arc/orb changes.

**Tech Stack:** Three.js (`THREE.MeshPhongMaterial`, `THREE.TextureLoader`, `THREE.Vector2`, `THREE.Color`, `THREE.RepeatWrapping`), react-globe.gl, Next.js

---

### Task 1: Update shininess and specular color

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx` (line ~270)

The `MeshPhongMaterial` constructor currently has `shininess: 4` and no `specular` property. The specular map added in the next task will suppress gloss on land, so raising `shininess` here is safe — ocean pixels will look glossy, land pixels stay matte.

- [ ] **Step 1: Update the material constructor**

Find this block (around line 269–271):

```ts
const mat = new THREE.MeshPhongMaterial({ color: new THREE.Color('#D4B890'), shininess: 4 });
```

Replace with:

```ts
const mat = new THREE.MeshPhongMaterial({
  color: new THREE.Color('#D4B890'),
  shininess: 60,
  specular: new THREE.Color(0x88ccff),
});
```

- [ ] **Step 2: Type-check**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): raise shininess and add cool specular for water realism"
```

---

### Task 2: Load and apply specular map

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx` (line ~272–277)

`earth-water.png` is a grayscale texture already bundled in `three-globe` — white where ocean, black where land. Assigning it as `specularMap` makes the material's specular response (shininess + specular color) apply only to ocean pixels. Land receives no specular contribution regardless of `shininess`.

- [ ] **Step 1: Add specular map loader**

After the existing `earth-topology.png` loader call and before `globeMatRef.current = mat`, add:

```ts
loader.load('https://unpkg.com/three-globe/example/img/earth-water.png',
  (tex) => { mat.specularMap = tex; mat.needsUpdate = true; });
```

The lazy-init block should now look like:

```ts
if (!globeMatRef.current && typeof window !== 'undefined') {
  const mat = new THREE.MeshPhongMaterial({
    color: new THREE.Color('#D4B890'),
    shininess: 60,
    specular: new THREE.Color(0x88ccff),
  });
  const loader = new THREE.TextureLoader();
  loader.load('https://unpkg.com/three-globe/example/img/earth-day.jpg',
    (tex) => { mat.map = tex; mat.needsUpdate = true; });
  loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png',
    (tex) => { mat.bumpMap = tex; mat.bumpScale = 18; mat.needsUpdate = true; });
  loader.load('https://unpkg.com/three-globe/example/img/earth-water.png',
    (tex) => { mat.specularMap = tex; mat.needsUpdate = true; });
  globeMatRef.current = mat;
}
```

- [ ] **Step 2: Type-check**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): add specular map to restrict gloss to ocean areas"
```

---

### Task 3: Load and apply normal map

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx` (line ~277–285)

`waternormals.jpg` is a tileable ocean normal map from the Three.js examples. It adds micro-surface wave variation that the raking `relief-light` turns into visible texture on the water. `RepeatWrapping` + `repeat.set(4, 2)` tiles the pattern at a scale where waves look physically plausible on the globe. `normalScale: (0.04, 0.04)` keeps the effect subtle — the specular map suppresses any contribution on land anyway.

- [ ] **Step 1: Add normal map loader**

After the specular map loader and before `globeMatRef.current = mat`, add:

```ts
loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg',
  (tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);
    mat.normalMap = tex;
    mat.normalScale.set(0.04, 0.04);
    mat.needsUpdate = true;
  });
```

The complete lazy-init block should now read:

```ts
if (!globeMatRef.current && typeof window !== 'undefined') {
  const mat = new THREE.MeshPhongMaterial({
    color: new THREE.Color('#D4B890'),
    shininess: 60,
    specular: new THREE.Color(0x88ccff),
  });
  const loader = new THREE.TextureLoader();
  loader.load('https://unpkg.com/three-globe/example/img/earth-day.jpg',
    (tex) => { mat.map = tex; mat.needsUpdate = true; });
  loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png',
    (tex) => { mat.bumpMap = tex; mat.bumpScale = 18; mat.needsUpdate = true; });
  loader.load('https://unpkg.com/three-globe/example/img/earth-water.png',
    (tex) => { mat.specularMap = tex; mat.needsUpdate = true; });
  loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg',
    (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 2);
      mat.normalMap = tex;
      mat.normalScale.set(0.04, 0.04);
      mat.needsUpdate = true;
    });
  globeMatRef.current = mat;
}
```

- [ ] **Step 2: Type-check**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "feat(globe): add normal map for ocean wave surface detail"
```

---

### Task 4: Extend disposal to cover new textures

**Files:**
- Modify: `agora-app/components/globe/ShipmentGlobe.tsx` (line ~279–287)

The cleanup `useEffect` currently disposes `mat.map`, `mat.bumpMap`, and `mat` itself. The two new textures must be disposed before `mat.dispose()` to prevent GPU memory leaks.

- [ ] **Step 1: Update the cleanup useEffect**

Find:

```ts
useEffect(() => {
  const mat = globeMatRef.current;
  return () => {
    mat?.map?.dispose();
    mat?.bumpMap?.dispose();
    mat?.dispose();
    globeMatRef.current = null;
  };
}, []);
```

Replace with:

```ts
useEffect(() => {
  const mat = globeMatRef.current;
  return () => {
    mat?.map?.dispose();
    mat?.bumpMap?.dispose();
    mat?.specularMap?.dispose();
    mat?.normalMap?.dispose();
    mat?.dispose();
    globeMatRef.current = null;
  };
}, []);
```

- [ ] **Step 2: Type-check**

```bash
cd agora-app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add agora-app/components/globe/ShipmentGlobe.tsx
git commit -m "fix(globe): dispose specularMap and normalMap on unmount"
```

---

### Task 5: Visual verification

- [ ] **Step 1: Start dev server**

```bash
cd agora-app && npm run dev
```

- [ ] **Step 2: Navigate to the dashboard**

Open the page containing the globe (GlobeTransitSection).

- [ ] **Step 3: Verify water effects**

- Ocean areas show a visible cool-toned specular highlight from the directional light
- Land areas remain matte (no gloss on continents)
- Bump map terrain relief is still visible on land — ridges and mountains cast shadows
- Atmosphere glow is unchanged (amber `#C8A870`)

- [ ] **Step 4: Verify existing arc + orb functionality**

- Arc lines render at the expected opacity
- Orbs animate continuously along arcs
- Port markers (green origin, blue destination) are visible and correctly placed
- Hovering an arc shows the tooltip (bottom-right overlay)
- Clicking an arc navigates to the booking or filtered bookings list

- [ ] **Step 5: Verify highlight interaction**

Hover a booking in the ActiveTransitPanel:
- Camera pans to the midpoint of that route
- A larger highlight orb animates faster along the highlighted arc
- Other arcs dim
- Auto-rotate is paused while hovering
- Clearing the hover restores auto-rotate and camera to default position

- [ ] **Step 6: Check browser console**

No 404s on texture URLs, no WebGL errors, no React warnings.

- [ ] **Step 7: Tune if needed**

If the water effect is too strong, reduce `normalScale` toward `(0.02, 0.02)` or `shininess` toward `40`.
If the effect is too subtle, increase `normalScale` toward `(0.07, 0.07)` or `shininess` toward `80`.
If wave pattern looks too large, increase `tex.repeat.set(6, 3)`.
