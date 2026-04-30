'use client';
import type { Container, Alert, Importer } from '@/types';
import { containerSeverity } from '@/lib/utils/severity';
import { useTranslations } from 'next-intl';

interface Props {
  container: Container;
  alerts: Alert[];
  importers: Importer[];
}

const MARKET_CLASSES: Record<string, string> = {
  IN:   'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  EU:   'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  CN:   'bg-red-500/10 text-red-400 border border-red-500/20',
  MENA: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  US:   'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

const NODE_COLORS: Record<string, string> = {
  done:   'bg-mint-500',
  crit:   'bg-severity-crit',
  warn:   'bg-severity-watch',
  future: 'bg-ink-4',
};

const SEV_COLORS: Record<string, string> = {
  crit:  'bg-severity-crit',
  risk:  'bg-severity-risk',
  watch: 'bg-severity-watch',
  info:  'bg-severity-info',
  ok:    'bg-severity-ok',
};

export function ContainerCard({ container, alerts, importers }: Props) {
  const t = useTranslations('dashboard');
  const sev = containerSeverity(container.id, alerts);
  const buyer = importers.find(i => i.id === container.importerId)?.name ?? '—';
  const marketCls = MARKET_CLASSES[container.market] ?? 'bg-ink-4/10 text-ink-3 border border-white/10';
  const activeAlerts = alerts.filter(a => a.containerId === container.id && !a.dismissed);
  const firstAlert = activeAlerts[0];

  return (
    <div className="relative bg-bg-1 border border-[var(--line-soft)] rounded-xl overflow-hidden hover:border-[var(--line-mid)] transition-colors">
      {/* Severity bar */}
      <div
        data-testid="sev-bar"
        className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-sm ${SEV_COLORS[sev] ?? 'bg-severity-ok'}`}
      />

      <div className="grid gap-4 pl-3 py-3.5 pr-4" style={{ gridTemplateColumns: '200px 1fr 220px' }}>

        {/* LEFT: container ID, buyer, market, route */}
        <div className="flex flex-col gap-1 overflow-hidden">
          <span className="font-mono font-semibold text-[14px] text-ink-1">{container.id}</span>
          <span className="text-[12px] text-ink-2 truncate">{buyer}</span>
          <span className={`self-start px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider ${marketCls}`}>
            {container.market}
          </span>
          <span data-testid="card-route" className="font-mono text-[10px] text-ink-4">
            {container.polCode} → {container.podCode} · {container.carrier}
          </span>
        </div>

        {/* CENTER: timeline */}
        <div className="flex flex-col gap-2">
          <div data-testid="timeline-mini" className="relative" style={{ height: 38 }}>
            {/* Base line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[var(--line-soft)] -translate-y-1/2" />
            {/* Nodes */}
            {container.timelineNodes?.map((node, idx) => {
              const pct = ((node.tDay + 15) / 60) * 100;
              return (
                <div
                  key={idx}
                  className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full ${NODE_COLORS[node.status] ?? 'bg-ink-4'}`}
                  style={{ left: `${pct}%` }}
                />
              );
            })}
          </div>
          {firstAlert && (
            <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${SEV_COLORS[firstAlert.severity] ?? 'bg-ink-4'}`} />
              <span className="text-[12px] text-ink-2 truncate">{firstAlert.titleKey}</span>
            </div>
          )}
        </div>

        {/* RIGHT: cost at risk */}
        <div className="flex flex-col items-end justify-center gap-1 pl-4 border-l border-[var(--line-soft)]">
          <span className="font-mono text-[9px] text-ink-4 tracking-widest uppercase">{t('costAtRisk')}</span>
          <span
            data-testid="cost-at-risk"
            className={`font-mono font-semibold text-[22px] ${sev !== 'ok' && (container.costAtRiskUsd ?? 0) > 0 ? `text-severity-${sev}` : 'text-ink-4'}`}
          >
            {(container.costAtRiskUsd ?? 0) > 0 ? `$${container.costAtRiskUsd!.toLocaleString()}` : '—'}
          </span>
        </div>

      </div>
    </div>
  );
}
