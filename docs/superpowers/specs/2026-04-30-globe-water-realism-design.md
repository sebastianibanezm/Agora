# Globe Water Realism — Design Spec

**Date:** 2026-04-30
**Status:** Approved

---

## Goal

Add realistic water rendering to the globe in `ShipmentGlobe.tsx` without touching any existing functionality: arc routing, orb animation, hover interaction, highlight orb, lighting, auto-rotate, point markers, or material disposal logic.

---

## Approach

Extend the existing `THREE.MeshPhongMaterial` (`globeMatRef`) with two new textures:

1. **Specular map** — Earth water mask (water = white, land = black). Makes `shininess` and `specular` apply only to ocean pixels; land stays matte automatically.
2. **Normal map** — Tileable ocean wave normals. Adds micro-surface wave detail that catches the existing raking directional light, giving water visible depth beyond pure gloss.

No shader changes. No new materials. No lighting changes. The existing raking `relief-light` (intensity 2.0, ~8° above horizon) already grazes the surface at the right angle to produce specular glints on water.

---

## Texture Sources

| Texture | URL |
|---|---|
| Specular map | `https://unpkg.com/three-globe/example/img/earth-water.png` |
| Normal map | `https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg` |

Both are loaded via `THREE.TextureLoader` in the same lazy-init block where `earth-day.jpg` and `earth-topology.png` are already loaded.

---

## Material Property Changes

| Property | Before | After |
|---|---|---|
| `shininess` | `4` | `60` |
| `specular` | _(default black)_ | `new THREE.Color(0x88ccff)` |
| `specularMap` | — | loaded `earth-water.png` texture |
| `normalMap` | — | loaded `waternormals.jpg` texture |
| `normalScale` | — | `new THREE.Vector2(0.04, 0.04)` |

### Why `shininess: 60` is safe for land
The specular map suppresses specularity on land pixels to near-zero. High `shininess` only produces visible highlights where the specular map is bright (ocean). Land remains matte.

### Why `normalScale: 0.04` is safe for land
Normal map deflections on land won't produce visible highlights because the specular contribution is suppressed by the specular map. The existing `bumpMap` continues to handle land elevation independently — these two maps don't interfere.

---

## Disposal

The existing cleanup `useEffect` disposes `mat.map` and `mat.bumpMap`. It must be extended to also dispose `mat.specularMap` and `mat.normalMap` to prevent GPU memory leaks.

```ts
mat?.specularMap?.dispose();
mat?.normalMap?.dispose();
```

---

## Constraints — Do Not Touch

The following must remain exactly as-is:

- `bumpMap` / `bumpScale` / bump map texture URL
- All scene lighting (`relief-light`, `relief-fill`, ambient light dimming)
- `globeMatRef` lazy-init pattern (`if (!globeMatRef.current && typeof window !== 'undefined')`)
- Arc data, arc rendering, arc click/hover handlers
- Orb animation loop (`SPEED`, `tick`, `rafId`)
- Highlight orb creation, positioning, and cleanup
- `controlsRef`, `autoRotate`, `pointOfView` calls
- `handleGlobeReady` function
- Point markers (`pointsData`, `pointColor`, `pointRadius`)
- All JSX props on `<Globe>` component
- The hover tooltip overlay

---

## Testing Checklist

- [ ] Water areas show visible gloss/specular highlight from the raking light
- [ ] Land areas remain matte (no unwanted shininess on continents)
- [ ] Bump map terrain relief still visible on land
- [ ] Arc lines, orbs, and port markers render correctly
- [ ] Hover tooltip appears on arc hover
- [ ] Highlight orb animates correctly on booking hover
- [ ] Auto-rotate resumes after highlight clears
- [ ] No console errors (texture 404s, WebGL warnings)
- [ ] No GPU memory leaks on unmount (disposal check)
