'use client';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import type { Container, Alert } from '@/types';
import { containerSeverity } from '@/lib/utils/severity';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const SEV_COLORS: Record<string, string> = {
  crit: '#EF4444',
  risk: '#F97316',
  watch: '#F59E0B',
  info: '#00E696',
  ok: '#00E696',
};

function toXY(lng: number, lat: number, w: number, h: number): [number, number] {
  const x = ((lng + 180) / 360) * w;
  const y = ((85 - lat) / 170) * h;
  return [x, y];
}

function arcPath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = Math.min(y1, y2) - Math.abs(x2 - x1) * 0.18 - 30;
  return `M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`;
}

interface Props {
  containers: Container[];
  alerts: Alert[];
}

export function ShipmentMap({ containers, alerts }: Props) {
  const W = 800, H = 380;

  return (
    <div style={{ position: 'relative', height: H, background: '#080E1A', overflow: 'hidden', borderRadius: '12px' }}>
      {/* Overlay grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* World map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140, center: [20, 10] }}
        width={W}
        height={H}
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map(geo => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1B2235"
                stroke="#0E1320"
                strokeWidth={0.5}
              />
            ))
          }
        </Geographies>
      </ComposableMap>

      {/* Arc overlays */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        {containers.map(c => {
          const sev = containerSeverity(c.id, alerts);
          const color = SEV_COLORS[sev] ?? '#00E696';
          const [x1, y1] = toXY(c.polCoords[0], c.polCoords[1], W, H);
          const [x2, y2] = toXY(c.podCoords[0], c.podCoords[1], W, H);
          return (
            <path
              key={c.id}
              d={arcPath(x1, y1, x2, y2)}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeOpacity={0.8}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Header overlay */}
      <div style={{ position: 'absolute', top: 12, left: 16, right: 16, zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#00E696', letterSpacing: '0.15em' }}>
          ACTIVE SHIPMENTS · LIVE
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(168,179,199,0.6)', letterSpacing: '0.1em' }}>
          {containers.length} ARCS
        </span>
      </div>
    </div>
  );
}
