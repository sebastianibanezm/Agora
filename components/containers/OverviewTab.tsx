'use client';
import { useTranslations } from 'next-intl';
import type { Container } from '@/types';
import { getLaneProfile } from '@/lib/mock-data/lane-profiles';
import { ContainerTimeline } from './ContainerTimeline';
import { tDayFrom, formatDate, hoursUntil } from '@/lib/utils/dates';
import { formatUsd } from '@/lib/utils/currency';
import { severityFromHoursToCutoff } from '@/lib/utils/risk';
import clsx from 'clsx';

const SEV_COLOR: Record<string, string> = {
  ok: 'text-severity-ok',
  info: 'text-severity-info',
  watch: 'text-severity-watch',
  risk: 'text-severity-risk',
  crit: 'text-severity-crit',
};

export function OverviewTab({ container }: { container: Container }) {
  const t = useTranslations('containers');
  const lp = getLaneProfile(container.laneProfileId);
  const currentTDay = tDayFrom(container.etd);

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="rounded-md bg-bg-2/50 border border-white/10 p-4">
        <ContainerTimeline events={lp.timeline} currentTDay={currentTDay} />
      </div>

      {/* Route strip */}
      <div className="rounded-md bg-bg-2/50 border border-white/10 p-4 flex items-center gap-4">
        <div className="text-center">
          <div className="font-mono text-xs text-ink-3">{container.polCode}</div>
          <div className="text-sm text-ink-1">{container.polLabel}</div>
        </div>
        <div className="flex-1 flex items-center">
          <div className="flex-1 h-px bg-white/10" />
          <div className="mx-3 text-ink-4 text-xs">→</div>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <div className="text-center">
          <div className="font-mono text-xs text-ink-3">{container.podCode}</div>
          <div className="text-sm text-ink-1">{container.podLabel}</div>
        </div>
      </div>

      {/* Key facts grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Fact label={t('etd')} value={formatDate(container.etd, 'es')} mono />
        <Fact label={t('eta')} value={formatDate(container.eta, 'es')} mono />
        <Fact label={t('weight')} value={`${container.weightKg.toLocaleString('es-CL')} kg`} mono />
        <Fact label={t('value')} value={formatUsd(container.valueUsd, 'es')} mono />
        {container.cutoffAt && (
          <FactCutoff label={t('cutoff')} cutoffAt={container.cutoffAt} />
        )}
        {container.costAtRiskUsd !== undefined && container.costAtRiskUsd > 0 && (
          <Fact label="Cost at risk" value={formatUsd(container.costAtRiskUsd, 'es')} mono className="text-severity-risk" />
        )}
      </div>
    </div>
  );
}

function Fact({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className="rounded bg-bg-2/50 border border-white/10 p-3">
      <div className="text-xs text-ink-3 mb-1">{label}</div>
      <div className={clsx(mono && 'font-mono', 'text-sm text-ink-1', className)}>{value}</div>
    </div>
  );
}

function FactCutoff({ label, cutoffAt }: { label: string; cutoffAt: string }) {
  const hours = hoursUntil(cutoffAt);
  const sev = severityFromHoursToCutoff(hours);
  return (
    <div className="rounded bg-bg-2/50 border border-white/10 p-3">
      <div className="text-xs text-ink-3 mb-1">{label}</div>
      <div className={clsx('font-mono text-sm', SEV_COLOR[sev])}>
        {hours > 0 ? `${Math.round(hours)}h` : 'PAST'}
      </div>
    </div>
  );
}
