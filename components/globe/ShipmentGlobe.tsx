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
  stroke: number;
  reefer: boolean;
  bookings: Booking[];
  laneKey: string;
  primaryBookingId: string;
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
}

export function ShipmentGlobe({ bookings, height = 400, className, style }: Props) {
  const t = useTranslations('dashboard');
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hovered, setHovered] = useState<ArcDatum | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 800, h: height });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: height });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [height]);

  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableZoom = false;
    globeRef.current.pointOfView({ lat: 0, lng: -75, altitude: 2.4 }, 0);
  }, [size.w]);

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
      const baseStroke = list.length > 10 ? 1.6 : list.length > 3 ? 1.2 : 0.8;
      const reeferBoost = reeferShare >= 0.5 ? 0.6 : 0;
      result.push({
        startLat: primary.polCoords[1],
        startLng: primary.polCoords[0],
        endLat: primary.podCoords[1],
        endLng: primary.podCoords[0],
        color,
        stroke: baseStroke + reeferBoost,
        reefer: reeferShare >= 0.5,
        bookings: list,
        laneKey,
        primaryBookingId: primary.id,
      });
    }
    return result;
  }, [bookings]);

  const points = useMemo(() => {
    const seen = new Set<string>();
    const items: { lat: number; lng: number; size: number; color: string; label: string }[] = [];
    for (const arc of arcs) {
      const polKey = `${arc.startLat.toFixed(2)},${arc.startLng.toFixed(2)}`;
      if (!seen.has(polKey)) {
        seen.add(polKey);
        items.push({ lat: arc.startLat, lng: arc.startLng, size: 0.4, color: '#00E696', label: arc.bookings[0]!.pol });
      }
      const podKey = `${arc.endLat.toFixed(2)},${arc.endLng.toFixed(2)}`;
      if (!seen.has(podKey)) {
        seen.add(podKey);
        items.push({ lat: arc.endLat, lng: arc.endLng, size: 0.3, color: '#7DD3FC', label: arc.bookings[0]!.pod });
      }
    }
    return items;
  }, [arcs]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl border border-[var(--line-soft)] bg-bg-1 ${className ?? ''}`}
      style={{ height, ...style }}
    >
      <div className="pointer-events-none absolute top-3 left-4 z-10 font-mono text-[10px] tracking-[0.18em] text-mint-500/80">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-mint-500 align-middle mr-1.5" />
        {t('globeLabel')}
      </div>
      <div className="pointer-events-none absolute top-3 right-4 z-10 font-mono text-[10px] tracking-[0.14em] text-ink-3">
        {t('globeArcs', { n: arcs.length })}
      </div>

      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        atmosphereColor="#7DD3FC"
        atmosphereAltitude={0.18}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        arcsData={arcs}
        arcColor={(d: object) => (d as ArcDatum).color}
        arcStroke={(d: object) => (d as ArcDatum).stroke}
        arcDashLength={0.5}
        arcDashGap={0.25}
        arcDashAnimateTime={(d: object) => ((d as ArcDatum).reefer ? 2200 : 4000)}
        arcAltitudeAutoScale={0.4}
        arcLabel={(d: object) => {
          const a = d as ArcDatum;
          return `<div class="rounded-md bg-[#0E1320]/95 backdrop-blur p-2 text-xs text-ink-1 border border-white/10">
            <div class="font-semibold">${a.bookings[0]!.pol.split(',')[0]} → ${a.bookings[0]!.pod.split(',')[0]}</div>
            <div class="text-ink-3 text-[11px]">${a.bookings.length} active booking${a.bookings.length === 1 ? '' : 's'}</div>
          </div>`;
        }}
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
      />

      {hovered && (
        <div className="pointer-events-none absolute right-4 bottom-4 z-10 max-w-xs rounded-lg border border-[var(--line-soft)] bg-bg-2/95 p-3 text-xs shadow-lg backdrop-blur">
          <div className="font-semibold text-ink-1">
            {hovered.bookings[0]!.pol.split(',')[0]} → {hovered.bookings[0]!.pod.split(',')[0]}
          </div>
          <div className="mt-1 text-ink-3">
            {hovered.bookings.length} booking{hovered.bookings.length === 1 ? '' : 's'}
            {hovered.reefer && <span className="ml-2 rounded-sm bg-trace/15 px-1 text-trace">REEFER</span>}
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-4 z-10 font-mono text-[9.5px] tracking-[0.14em] text-ink-3 uppercase">
        {t('globeHint')}
      </div>
    </div>
  );
}
