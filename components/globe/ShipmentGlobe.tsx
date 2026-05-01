'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { GlobeMethods } from 'react-globe.gl';
import type { Booking } from '@/types';
import { LIFECYCLE_COLORS } from '@/components/bookings/LifecyclePill';
import * as THREE from 'three';

// Lazy-load react-globe.gl client-side only.
const Globe = dynamic(() => import('react-globe.gl').then((m) => m.default), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-bg-1" />,
});

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
  highlighted: boolean;
}

const toRad = (d: number) => (d * Math.PI) / 180;

/** Expects 6-digit hex (#rrggbb). */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function slerpLatLng(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  t: number,
): { lat: number; lng: number } {
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

// Scales orb altitude to match react-globe.gl's arcAltitudeAutoScale behavior.
function greatCircleRad(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δφ = φ2 - φ1, Δλ = toRad(lng2 - lng1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * Math.asin(Math.sqrt(a));
}

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
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), coreMat));
  return group;
}

function createHighlightOrbGroup(color: string): THREE.Group {
  const baseColor = new THREE.Color(color);
  const group = new THREE.Group();
  const glowLayers: Array<{ r: number; opacity: number }> = [
    { r: 2.0,  opacity: 0.05 },
    { r: 1.3,  opacity: 0.14 },
    { r: 0.78, opacity: 0.42 },
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
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 12), coreMat));
  return group;
}

function orbPosition(
  arc: ArcDatum,
  t: number,
  globe: GlobeMethods,
): { x: number; y: number; z: number } {
  const { lat, lng } = slerpLatLng(arc.startLat, arc.startLng, arc.endLat, arc.endLng, t);
  const angDist = greatCircleRad(arc.startLat, arc.startLng, arc.endLat, arc.endLng);
  const alt = Math.sin(Math.PI * t) * 0.4 * (angDist / Math.PI);
  return globe.getCoords(lat, lng, alt);
}

const ACTIVE_STATUSES = new Set([
  'created', 'awaiting_si', 'si_received', 'si_validated', 'si_failed',
  'esi_sent', 'draft_bl_received', 'bl_validated',
]);

interface Props {
  bookings: Booking[];
  height?: number;
  className?: string;
  style?: CSSProperties;
  highlightedBooking?: Booking | null;
}

export function ShipmentGlobe({ bookings, height = 468, className, style, highlightedBooking }: Props) {
  const t = useTranslations('dashboard');
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<ReturnType<GlobeMethods['controls']> | null>(null);
  const highlightOrbRef = useRef<THREE.Group | null>(null);
  const highlightedArcRef = useRef<ArcDatum | null>(null);
  const highlightOrbProgressRef = useRef<number>(0);
  const wasHighlightedRef = useRef(false);
  const router = useRouter();
  const [hovered, setHovered] = useState<ArcDatum | null>(null);
  // canvasH is kept square-ish so the sphere is never squished by aspect ratio.
  // The container clips to `height` via overflow:hidden.
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 800, h: 520 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: 520 });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current.pointOfView({ lat: -33, lng: -71, altitude: 2.4 }, 0);
  }, [size.w]);

  const handleGlobeReady = () => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controlsRef.current = controls;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    controls.enableZoom = false;
    globeRef.current.pointOfView({ lat: -33, lng: -71, altitude: 2.4 }, 0);

    // Terrain relief lighting setup.
    const scene = globeRef.current.scene();

    // Dim react-globe.gl's ambient light — it washes out bump map normals at full intensity.
    scene.traverse((obj) => {
      if (obj instanceof THREE.AmbientLight) obj.intensity = 0.15;
    });

    // Raking directional light (~8° above horizon) so ridges cast long shadows.
    if (!scene.getObjectByName('relief-light')) {
      const relief = new THREE.DirectionalLight(0xfff5e0, 2.0);
      relief.position.set(-5, 0.15, 1.5).normalize();
      relief.name = 'relief-light';
      scene.add(relief);
    }

    // Dim fill from the opposite side — prevents shadowed terrain from going pitch black.
    if (!scene.getObjectByName('relief-fill')) {
      const fill = new THREE.DirectionalLight(0xc8b89a, 0.25);
      fill.position.set(5, 0.4, -1.5).normalize();
      fill.name = 'relief-fill';
      scene.add(fill);
    }
  };

  const arcs: ArcDatum[] = useMemo(() => {
    const active = bookings.filter((b) => ACTIVE_STATUSES.has(b.status));
    const laneMap = new Map<string, Booking[]>();
    for (const b of active) {
      const key = `${b.pol}|${b.pod}`;
      const list = laneMap.get(key) ?? [];
      list.push(b);
      laneMap.set(key, list);
    }
    const result: ArcDatum[] = [];
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
  }, [bookings, highlightedBooking]);

  const points = useMemo(() => {
    const seen = new Set<string>();
    const items: { lat: number; lng: number; size: number; color: string; label: string }[] = [];
    for (const arc of arcs) {
      const polKey = `${arc.startLat.toFixed(2)},${arc.startLng.toFixed(2)}`;
      if (!seen.has(polKey)) {
        seen.add(polKey);
        items.push({ lat: arc.startLat, lng: arc.startLng, size: 0.4, color: '#4F7A3C', label: arc.bookings[0]!.pol });
      }
      const podKey = `${arc.endLat.toFixed(2)},${arc.endLng.toFixed(2)}`;
      if (!seen.has(podKey)) {
        seen.add(podKey);
        items.push({ lat: arc.endLat, lng: arc.endLng, size: 0.3, color: '#5A6B85', label: arc.bookings[0]!.pod });
      }
    }
    return items;
  }, [arcs]);

  const orbProgressRef = useRef<Map<string, number>>(new Map());
  const orbObjectsRef = useRef<Map<string, THREE.Object3D>>(new Map());

  const globeMatRef = useRef<THREE.MeshPhongMaterial | null>(null);
  if (!globeMatRef.current && typeof window !== 'undefined') {
    const mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color('#D4B890'),
      shininess: 8,
      specular: new THREE.Color(0x7799bb),
    });
    const loader = new THREE.TextureLoader();
    loader.load('https://unpkg.com/three-globe/example/img/earth-day.jpg',
      (tex) => { mat.map = tex; mat.needsUpdate = true; });
    loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png',
      (tex) => { mat.bumpMap = tex; mat.bumpScale = 18; mat.needsUpdate = true; });
    loader.load('https://unpkg.com/three-globe/example/img/earth-water.png',
      (tex) => { mat.specularMap = tex; mat.needsUpdate = true; });
    loader.load('/waternormals.jpg',
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 2);
        mat.normalMap = tex;
        mat.normalScale.set(0.45, 0.45);
        mat.needsUpdate = true;
      });
    globeMatRef.current = mat;
  }

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

  useEffect(() => {
    if (!globeRef.current) return;
    // Fetch controls directly each time — guards against controlsRef being stale
    // (e.g. Strict Mode remount before onGlobeReady fires a second time).
    const controls = controlsRef.current ?? globeRef.current.controls();
    if (!controlsRef.current) controlsRef.current = controls;

    if (highlightedBooking) {
      wasHighlightedRef.current = true;
      controls.autoRotate = false;
      const { lat, lng } = slerpLatLng(
        highlightedBooking.polCoords[1], highlightedBooking.polCoords[0],
        highlightedBooking.podCoords[1], highlightedBooking.podCoords[0],
        0.5,
      );
      globeRef.current.pointOfView({ lat, lng, altitude: 2.4 }, 800);

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
    } else if (wasHighlightedRef.current) {
      // Only restore on hover-end — skip on initial mount to let handleGlobeReady own the initial state.
      controls.autoRotate = true;
      globeRef.current.pointOfView({ lat: -33, lng: -71, altitude: 2.4 }, 800);
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

  useEffect(() => {
    const next = new Map<string, number>();
    arcs.forEach((arc, i) => {
      next.set(arc.laneKey, orbProgressRef.current.get(arc.laneKey) ?? i / Math.max(arcs.length, 1));
    });
    orbProgressRef.current = next;
    for (const key of orbObjectsRef.current.keys()) {
      if (!next.has(key)) orbObjectsRef.current.delete(key);
    }
  }, [arcs]);

  useEffect(() => {
    const SPEED = 0.000055;
    let last = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;

      for (const [key, t] of orbProgressRef.current) {
        const newT = (t + dt * SPEED) % 1;
        orbProgressRef.current.set(key, newT);

        const obj = orbObjectsRef.current.get(key);
        const arc = arcs.find((a) => a.laneKey === key);
        if (!obj || !arc || !globeRef.current) continue;

        const isHighlightedLane = highlightedArcRef.current?.laneKey === key;
        obj.visible = !isHighlightedLane;
        if (isHighlightedLane) continue;

        const pos = orbPosition(arc, newT, globeRef.current);
        obj.position.set(pos.x, pos.y, pos.z);
      }

      if (highlightedArcRef.current && highlightOrbRef.current && globeRef.current) {
        const newT = (highlightOrbProgressRef.current + dt * 0.000165) % 1;
        highlightOrbProgressRef.current = newT;
        const pos = orbPosition(highlightedArcRef.current, newT, globeRef.current);
        highlightOrbRef.current.position.set(pos.x, pos.y, pos.z);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [arcs]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl border border-[var(--line-soft)] bg-bg-1 ${className ?? ''}`}
      style={{ height, width: size.h, ...style }}
    >
      <div className="pointer-events-none absolute top-3 left-4 z-10 font-mono text-[10px] tracking-[0.18em] text-ink-3">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#4F7A3C] align-middle mr-1.5" />
        {t('globeLabel')}
      </div>

      <div
        className="absolute"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: Math.round(size.h * 1.1), height: Math.round(size.h * 1.1), pointerEvents: 'auto' }}
      >
      <Globe
        ref={globeRef}
        width={Math.round(size.h * 1.1)}
        height={Math.round(size.h * 1.1)}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        onGlobeReady={handleGlobeReady}
        globeMaterial={globeMatRef.current ?? undefined}
        atmosphereColor="#C8A870"
        atmosphereAltitude={0.15}
        arcsData={arcs}
        arcColor={(d: object) => {
          const a = d as ArcDatum;
          if (!highlightedBooking) return hexToRgba(a.color, 0.35);
          return a.highlighted ? hexToRgba(a.color, 0.9) : hexToRgba(a.color, 0.08);
        }}
        arcStroke={(d: object) => {
          const a = d as ArcDatum;
          if (!highlightedBooking) return 0.6;
          return a.highlighted ? 0.55 : 0.4;
        }}
        arcAltitudeAutoScale={0.4}
onArcHover={(d: object | null) => setHovered((d as ArcDatum) ?? null)}
        onArcClick={(d: object) => {
          const a = d as ArcDatum;
          if (a.bookings.length === 1) {
            router.push(`/bookings/${a.primaryBookingId}`);
          } else {
            router.push(`/bookings?pol=${encodeURIComponent(a.bookings[0]!.pol)}&pod=${encodeURIComponent(a.bookings[0]!.pod)}`);
          }
        }}
        pointsData={points}
        pointColor={(d: object) => (d as { color: string }).color}
        pointAltitude={0}
        pointRadius={(d: object) => (d as { size: number }).size}
        pointsMerge
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({
          customThreeObjectData: arcs,
          customThreeObject: (d: any) => {
            const arc = d as ArcDatum;
            const group = createOrbGroup(arc.color);
            orbObjectsRef.current.set(arc.laneKey, group);
            return group;
          },
          customThreeObjectUpdate: (obj: any, d: any) => {
            const arc = d as ArcDatum;
            const t = orbProgressRef.current.get(arc.laneKey) ?? 0;
            if (!globeRef.current) return;
            const pos = orbPosition(arc, t, globeRef.current);
            (obj as THREE.Object3D).position.set(pos.x, pos.y, pos.z);
          },
        } as any)}
      />
      </div>


    </div>
  );
}
