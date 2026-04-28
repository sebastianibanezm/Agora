'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea } from 'recharts';
import type { ColdChainTrace } from '@/types';

interface Props {
  trace: ColdChainTrace;
  height?: number;
}

export function ColdChainTimeline({ trace, height = 320 }: Props) {
  const map = new Map<string, Record<string, number | string>>();
  for (const lg of trace.loggers) {
    for (const r of lg.readings) {
      const row = map.get(r.t) ?? { t: r.t };
      row[lg.position] = r.tempC;
      map.set(r.t, row);
    }
  }
  const data = Array.from(map.values()).sort((a, b) =>
    String(a.t).localeCompare(String(b.t))
  );

  const SAMPLE_EVERY = 6;
  const sampledData = data.filter((_, i) => i % SAMPLE_EVERY === 0);

  const upper = trace.setpointC + trace.toleranceC;

  const formatTick = (value: string) => {
    try {
      return new Date(value).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div data-testid="cold-chain-timeline" className="w-full overflow-x-auto">
      <LineChart width={900} height={height} data={sampledData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
        <XAxis
          dataKey="t"
          tickFormatter={formatTick}
          tick={{ fill: '#A8B3C7', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#A8B3C7', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          domain={['auto', 'auto']}
          tickFormatter={(v: number) => `${v}°`}
        />
        <ReferenceArea y1={upper} y2={3} fill="#EF4444" fillOpacity={0.06} />
        <ReferenceLine y={trace.setpointC} stroke="#A8B3C7" strokeDasharray="3 3" strokeOpacity={0.5} />
        <Tooltip
          contentStyle={{ background: '#141A29', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          labelFormatter={(label) => {
            try { return new Date(String(label)).toLocaleString('es-CL'); } catch { return String(label); }
          }}
        />
        {trace.excursionEvents.map(exc => (
          <ReferenceLine
            key={exc.id}
            x={exc.startAt}
            stroke="#F59E0B"
            strokeDasharray="4 4"
            strokeOpacity={0.8}
          />
        ))}
        <Line type="monotone" dataKey="top" stroke="#00E696" dot={false} strokeWidth={1.4} name="Top" />
        <Line type="monotone" dataKey="middle" stroke="#7DD3FC" dot={false} strokeWidth={1.4} name="Middle" />
        <Line type="monotone" dataKey="bottom" stroke="#3B82F6" dot={false} strokeWidth={1.4} name="Bottom" />
      </LineChart>
    </div>
  );
}
