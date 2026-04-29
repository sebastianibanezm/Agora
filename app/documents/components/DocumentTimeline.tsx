import type { ShipmentDocEvent, WorkflowDocStatus } from '@/types'

const DOT_COLORS: Record<string, string> = {
  draft:        '#475063',
  submitted:    '#3B82F6',
  validating:   '#F59E0B',
  under_review: '#F97316',
  approved:     '#00E696',
  rejected:     '#EF4444',
  comment:      '#A8B3C7',
}

interface Props {
  events: ShipmentDocEvent[]
  currentStatus: WorkflowDocStatus
  statusLabel: (s: string) => string
}

export function DocumentTimeline({ events, currentStatus, statusLabel }: Props) {
  // For rejected path, don't show 'approved' as a pending future step
  const ALL_STATUSES: WorkflowDocStatus[] = currentStatus === 'rejected'
    ? ['draft', 'submitted', 'validating', 'under_review', 'rejected']
    : ['draft', 'submitted', 'validating', 'under_review', 'approved']
  const completedStatuses = new Set(events.map(e => e.status))

  return (
    <div className="relative pl-5">
      <div
        className="absolute left-[9px] top-2 bottom-2 w-px"
        style={{ background: 'var(--line-soft)' }}
      />
      {events.map((ev, i) => {
        const color = DOT_COLORS[ev.status] ?? '#475063'
        const isCurrent = ev.status === currentStatus && i === events.length - 1
        return (
          <div key={i} className="relative mb-5">
            <div
              className="absolute -left-5 top-1 w-2 h-2 rounded-full"
              style={{
                background: color,
                boxShadow: isCurrent ? `0 0 7px ${color}` : 'none',
              }}
            />
            <div className="text-[11px] font-medium" style={{ color: isCurrent ? color : '#A8B3C7' }}>
              {statusLabel(ev.status)}
            </div>
            <div className="text-[10px] text-ink-3 mt-0.5">{ev.actorName}</div>
            <div className="font-mono text-[9px] text-ink-4">
              {new Date(ev.timestamp).toLocaleString('es-CL')}
            </div>
            {ev.note && (
              <div
                className="mt-1.5 rounded p-2 text-[9px] text-ink-2 leading-relaxed"
                style={{ background: 'var(--color-bg-3)' }}
              >
                {ev.note}
              </div>
            )}
          </div>
        )
      })}
      {ALL_STATUSES.filter(s => !completedStatuses.has(s) && s !== currentStatus).map(s => (
        <div key={s} className="relative mb-5 opacity-30">
          <div
            className="absolute -left-5 top-1 w-2 h-2 rounded-full border"
            style={{ borderColor: '#475063', background: 'transparent' }}
          />
          <div className="text-[11px] text-ink-4">{statusLabel(s)}</div>
        </div>
      ))}
    </div>
  )
}
