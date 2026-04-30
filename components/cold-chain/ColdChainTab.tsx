'use client';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import type { Container, ColdChainTrace, CaReading, PreCoolingRecord, ExcursionEvent } from '@/types';
import { ColdChainSummaryCard } from './ColdChainSummaryCard';
import { ColdChainTimeline } from './ColdChainTimeline';

export function ColdChainTab({ container }: { container: Container }) {
  const t = useTranslations('coldChain');
  const trace = container.coldChain;
  if (!trace) return null;

  const treatmentDaysLeft = Math.ceil(
    (trace.treatmentRequiredMinutes - trace.treatmentMinutesCompliant) / (24 * 60)
  );
  const projectedSatisfiedAt = treatmentDaysLeft > 0
    ? `T+${10 + treatmentDaysLeft}`
    : t('completed');

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs text-ink-3 uppercase tracking-wider mb-3">{t('statusBanner')}</h3>
        <ColdChainSummaryCard trace={trace} />
      </section>

      <section>
        <h3 className="text-xs text-ink-3 uppercase tracking-wider mb-3">{t('telemetry')}</h3>
        <div className="rounded-md bg-bg-2/50 border border-white/10 p-4 overflow-x-auto">
          <ColdChainTimeline trace={trace} />
        </div>
      </section>

      {trace.caReadings && trace.caReadings.length > 0 && (
        <section>
          <h3 className="text-xs text-ink-3 uppercase tracking-wider mb-3">{t('ca')}</h3>
          <div className="rounded-md bg-bg-2/50 border border-white/10 p-4">
            <CaAtmosphereChart caReadings={trace.caReadings} caGasMix={trace.caGasMix} />
          </div>
        </section>
      )}

      <section>
        <h3 className="text-xs text-ink-3 uppercase tracking-wider mb-3">{t('lifecycle')}</h3>
        <LifecycleStepper trace={trace} />
      </section>

      {trace.preCooling && (
        <section>
          <h3 className="text-xs text-ink-3 uppercase tracking-wider mb-3">{t('preCooling')}</h3>
          <PreCoolingSection preCooling={trace.preCooling} />
        </section>
      )}

      <section>
        <h3 className="text-xs text-ink-3 uppercase tracking-wider mb-3">{t('excursions')}</h3>
        <ExcursionTable excursions={trace.excursionEvents} />
      </section>

      <section>
        <h3 className="text-xs text-ink-3 uppercase tracking-wider mb-3">{t('compliance')}</h3>
        <div className="rounded-md bg-bg-2/50 border border-white/10 p-4">
          <div className="font-mono text-sm">
            {trace.status === 'breached' ? (
              <span className="text-severity-crit">{t('breached')} — {t('fallbackRecommended')}</span>
            ) : (
              <span className="text-severity-ok">
                {t('satisfiesAt')}: <strong>{projectedSatisfiedAt}</strong>
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function CaAtmosphereChart({ caReadings, caGasMix }: { caReadings: CaReading[]; caGasMix?: { o2Pct: number; co2Pct: number; n2Pct: number } }) {
  const t = useTranslations('coldChain');
  const SAMPLE = 12;
  const data = caReadings.filter((_, i) => i % SAMPLE === 0);
  return (
    <div>
      {caGasMix && (
        <div className="flex gap-4 mb-3 text-xs font-mono text-ink-3">
          <span>{t('o2Target', { pct: caGasMix.o2Pct })}</span>
          <span>{t('co2Target', { pct: caGasMix.co2Pct })}</span>
          <span>{t('n2', { pct: caGasMix.n2Pct })}</span>
        </div>
      )}
      <AreaChart width={900} height={180} data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
        <XAxis dataKey="t" tick={{ fill: '#A8B3C7', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickFormatter={(v: string) => { try { return new Date(v).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }); } catch { return ''; } }} />
        <YAxis tick={{ fill: '#A8B3C7', fontSize: 10 }} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
        <Tooltip contentStyle={{ background: '#141A29', border: '1px solid rgba(255,255,255,0.1)', fontSize: 10 }} />
        <Area type="monotone" dataKey="o2Pct" stackId="a" stroke="#00E696" fill="#00E696" fillOpacity={0.15} name="O₂" />
        <Area type="monotone" dataKey="co2Pct" stackId="b" stroke="#7DD3FC" fill="#7DD3FC" fillOpacity={0.15} name="CO₂" />
      </AreaChart>
    </div>
  );
}

function LifecycleStepper({ trace }: { trace: ColdChainTrace }) {
  const t = useTranslations('coldChain');
  const stages = [
    { id: 'precooling', label: t('stagePrecooling'), done: !!trace.preCooling?.completedAt, active: false, detail: trace.preCooling?.facility ?? '—' },
    { id: 'pti', label: t('stagePti'), done: !!trace.reeferPti?.passed, active: false, detail: trace.reeferPti?.technician ?? '—' },
    { id: 'loading', label: t('stageLoading'), done: true, active: false, detail: t('loaded') },
    { id: 'treatment', label: t('stageTreatment'), done: trace.status === 'completed', active: trace.status === 'in_treatment', detail: t('daysElapsed', { days: Math.round(trace.treatmentMinutesCompliant / 1440) }) },
    { id: 'arrival', label: t('stageArrival'), done: ['completed','breached'].includes(trace.status) && !!trace.loggerDownloadReportUrl, active: false, detail: '—' },
    { id: 'transfer', label: t('stageTransfer'), done: trace.arrivalTransferStatus === 'completed', active: false, detail: trace.arrivalTransferStatus ?? t('pending') },
  ];

  return (
    <div className="rounded-md bg-bg-2/50 border border-white/10 p-4">
      <div className="flex gap-0 overflow-x-auto">
        {stages.map((stage, i) => (
          <div key={stage.id} className="flex items-center flex-1 min-w-[100px]">
            <div className="flex flex-col items-center flex-1">
              <div className={clsx(
                'w-3 h-3 rounded-full border-2 mb-1 z-10',
                stage.done && 'bg-severity-ok border-severity-ok',
                stage.active && !stage.done && 'bg-mint-500 border-mint-500 animate-pulse',
                !stage.done && !stage.active && 'bg-bg-3 border-white/20',
              )} />
              <div className={clsx(
                'text-xs text-center font-medium',
                stage.done && 'text-severity-ok',
                stage.active && !stage.done && 'text-mint-500',
                !stage.done && !stage.active && 'text-ink-4',
              )}>{stage.label}</div>
              <div className="text-[10px] text-ink-4 text-center mt-0.5 truncate w-full px-1">{stage.detail}</div>
            </div>
            {i < stages.length - 1 && (
              <div className={clsx('h-px flex-1 mx-1', stage.done ? 'bg-severity-ok/30' : 'bg-white/10')} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreCoolingSection({ preCooling }: { preCooling: PreCoolingRecord }) {
  const t = useTranslations('coldChain');
  return (
    <div className="rounded-md bg-bg-2/50 border border-white/10 p-4">
      <div className="flex gap-6 mb-3 text-xs font-mono text-ink-3">
        <span>{t('facility', { name: preCooling.facility })}</span>
        <span>{t('target', { temp: preCooling.targetTempC })}</span>
        <span>{t('duration', { hours: Math.round((new Date(preCooling.completedAt).getTime() - new Date(preCooling.startedAt).getTime()) / 3600000) })}</span>
      </div>
      <LineChart width={600} height={160} data={preCooling.pulpTempCurve}>
        <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
        <XAxis dataKey="t" hide />
        <YAxis tick={{ fill: '#A8B3C7', fontSize: 10 }} tickFormatter={(v: number) => `${v}°`} />
        <ReferenceLine y={preCooling.targetTempC} stroke="#00E696" strokeDasharray="3 3" />
        <Tooltip contentStyle={{ background: '#141A29', border: '1px solid rgba(255,255,255,0.1)', fontSize: 10 }} />
        <Line type="monotone" dataKey="tempC" stroke="#7DD3FC" dot={false} strokeWidth={2} />
      </LineChart>
    </div>
  );
}

function ExcursionTable({ excursions }: { excursions: ExcursionEvent[] }) {
  const t = useTranslations('coldChain');
  if (excursions.length === 0) {
    return (
      <div className="rounded-md bg-bg-2/50 border border-white/10 p-4 text-ink-3 text-sm text-center">
        {t('noExcursions')}
      </div>
    );
  }
  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-bg-2/50">
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('excStart')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('excDuration')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('excLogger')}</th>
            <th className="text-right px-4 py-3 text-ink-3 font-medium">{t('excPeakTemp')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('excCompliance')}</th>
          </tr>
        </thead>
        <tbody>
          {excursions.map(exc => (
            <tr key={exc.id} className="border-b border-white/10">
              <td className="px-4 py-3 font-mono text-xs text-ink-2">{new Date(exc.startAt).toLocaleString('es-CL')}</td>
              <td className="px-4 py-3 font-mono text-xs text-ink-2">{exc.durationMin}min</td>
              <td className="px-4 py-3 font-mono text-xs text-ink-3">{exc.loggerId}</td>
              <td className="px-4 py-3 font-mono text-xs text-right text-severity-watch">{exc.peakTempC}°C</td>
              <td className="px-4 py-3 text-xs">
                {exc.brokeCompliance
                  ? <span className="text-severity-crit">{t('excBroke')}</span>
                  : <span className="text-severity-ok">{t('excWithinTolerance')}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
