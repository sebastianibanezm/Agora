'use client';

import type { VolumeHistoryEntry } from '@/types';

interface Props {
  data: VolumeHistoryEntry[];
}

export function VolumeTimeSeries({ data }: Props) {
  if (data.length === 0) return null;

  const W = 500;
  const H = 130;
  const PAD = { top: 16, right: 16, bottom: 28, left: 48 };

  const minV = Math.min(...data.map(d => d.volumeKg));
  const maxV = Math.max(...data.map(d => d.volumeKg));
  const range = maxV - minV || 1;
  const paddedMin = minV - range * 0.1;
  const paddedMax = maxV + range * 0.1;
  const paddedRange = paddedMax - paddedMin;

  const xStep = (W - PAD.left - PAD.right) / Math.max(data.length - 1, 1);
  const toX = (i: number) => PAD.left + i * xStep;
  const toY = (v: number) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - (v - paddedMin) / paddedRange);

  const points = data.map((d, i) => `${toX(i)},${toY(d.volumeKg)}`).join(' ');
  const areaPoints = [
    `${toX(0)},${H - PAD.bottom}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.volumeKg)}`),
    `${toX(data.length - 1)},${H - PAD.bottom}`,
  ].join(' ');

  const formatVol = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1_000)}k`;

  return (
    <div style={{ width: '100%', height: '180px' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="vol-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00E696" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#00E696" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((t, i) => {
          const y = PAD.top + (H - PAD.top - PAD.bottom) * t;
          const val = paddedMax - paddedRange * t;
          return (
            <g key={i}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#ffffff0d" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#ffffff50">
                {formatVol(val)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#vol-grad)" />

        {/* Line */}
        <polyline points={points} fill="none" stroke="#00E696" strokeWidth="1.8" strokeLinejoin="round" />

        {/* Past dots */}
        {data.slice(0, -1).map((d, i) => (
          <circle
            key={i}
            cx={toX(i)}
            cy={toY(d.volumeKg)}
            r="3"
            fill="none"
            stroke="#00E696"
            strokeWidth="1.5"
            opacity="0.5"
          />
        ))}

        {/* Glowing composite dot — most recent */}
        {(() => {
          const last = data[data.length - 1]!;
          const lx = toX(data.length - 1);
          const ly = toY(last.volumeKg);
          return (
            <g>
              <circle cx={lx} cy={ly} r="7" fill="#00E696" opacity="0.15" />
              <circle cx={lx} cy={ly} r="4" fill="#00E696" opacity="0.35" />
              <circle cx={lx} cy={ly} r="2.5" fill="#00E696" />
            </g>
          );
        })()}

        {/* X axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={toX(i)}
            y={H - PAD.bottom + 14}
            textAnchor="middle"
            fontSize="10"
            fill="#ffffff60"
          >
            {d.season}
          </text>
        ))}
      </svg>
    </div>
  );
}
