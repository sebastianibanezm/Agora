'use client';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import type { Container, Severity } from '@/types';
import { validations as allValidations } from '@/lib/mock-data/validations';
import { alerts as allAlerts } from '@/lib/mock-data/alerts';
import { formatTs } from '@/lib/utils/dates';

type EventKind = 'validation' | 'alert' | 'status';

interface HistoryEvent {
  id: string;
  at: string;
  kind: EventKind;
  severity: Severity;
  // text comes from i18n key OR a literal pre-translated string
  messageKey?: string;
  messageLiteral?: string;
}

const SEV_DOT: Record<Severity, string> = {
  ok: 'bg-severity-ok',
  info: 'bg-severity-info',
  watch: 'bg-severity-watch',
  risk: 'bg-severity-risk',
  crit: 'bg-severity-crit',
};

// Synthesize one status-change event per container at ETD.
function statusEvent(container: Container): HistoryEvent {
  return {
    id: `STATUS-${container.id}`,
    at: container.etd,
    kind: 'status',
    severity: 'info',
    messageLiteral: `containers.statuses.${container.status}`,
  };
}

export function HistoryTab({ container }: { container: Container }) {
  const t = useTranslations();

  const events: HistoryEvent[] = [
    ...allValidations
      .filter(v => v.containerId === container.id)
      .map<HistoryEvent>(v => ({
        id: `VAL-${v.id}`,
        at: v.detectedAt,
        kind: 'validation',
        severity: v.severity,
        messageKey: v.message,
      })),
    ...allAlerts
      .filter(a => a.containerId === container.id)
      .map<HistoryEvent>(a => ({
        id: `ALT-${a.id}`,
        at: a.raisedAt,
        kind: 'alert',
        severity: a.severity,
        messageKey: a.titleKey,
      })),
    statusEvent(container),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  if (events.length === 0) {
    return (
      <div className="rounded-md border border-white/10 bg-bg-2/50 px-4 py-6 text-center text-ink-4 text-sm">
        {t('common.empty')}
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {events.map(e => (
        <li
          key={e.id}
          className="rounded-md border border-white/10 bg-bg-2/50 px-4 py-3 flex items-start gap-3"
        >
          <div className="font-mono text-xs text-ink-3 shrink-0 pt-0.5">{formatTs(e.at)}</div>
          <span className={clsx('w-2 h-2 rounded-full mt-1.5 shrink-0', SEV_DOT[e.severity])} />
          <div className="flex-1 text-sm text-ink-1">
            <span className="text-ink-3 text-xs uppercase tracking-wide mr-2">
              {t(`history.kinds.${e.kind}`)}
            </span>
            <span>
              {e.messageLiteral
                ? t(e.messageLiteral)
                : e.messageKey
                ? t(e.messageKey)
                : ''}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
