import type { POEvent } from '@/types';
import { getTranslations } from 'next-intl/server';

const MILESTONE_TYPES: Array<{ type: POEvent['type']; key: string }> = [
  { type: 'confirmed',          key: 'lifecycle.confirmed' },
  { type: 'container_assigned', key: 'lifecycle.containerAssigned' },
  { type: 'bl_issued',          key: 'lifecycle.blIssued' },
  { type: 'docs_submitted',     key: 'lifecycle.docsSubmitted' },
  { type: 'delivered',          key: 'lifecycle.delivered' },
  { type: 'payment_received',   key: 'lifecycle.paymentReceived' },
];

interface Props {
  events: POEvent[];
}

export async function POLifecycleTimeline({ events }: Props) {
  const t = await getTranslations('purchaseOrders');
  const milestones = MILESTONE_TYPES.map(m => ({ type: m.type, label: t(m.key as Parameters<typeof t>[0]) }));
  const completedTypes = new Set(events.map(e => e.type));
  const lastCompletedIdx = milestones.reduce(
    (acc, m, i) => (completedTypes.has(m.type) ? i : acc),
    -1,
  );
  const progressPct = lastCompletedIdx < 0
    ? 0
    : (lastCompletedIdx / (milestones.length - 1)) * 100;

  return (
    <div style={{ position: 'relative', padding: '24px 0' }}>
      <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: '#ffffff12', transform: 'translateY(-50%)' }} />
      <div data-testid="tl-progress" style={{ position: 'absolute', top: '50%', left: '0', width: `${progressPct}%`, height: '2px', background: '#00E696', transform: 'translateY(-50%)', transition: 'width 0.3s' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        {milestones.map((m) => {
          const done = completedTypes.has(m.type);
          const event = events.find(e => e.type === m.type);
          return (
            <div key={m.type} data-testid="tl-node" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: done ? '#00E696' : '#1e293b', border: `2px solid ${done ? '#00E696' : '#334155'}`, zIndex: 1 }} />
              <span style={{ fontSize: '10px', color: done ? '#e2e8f0' : '#475569', textAlign: 'center', maxWidth: '72px' }}>{m.label}</span>
              {event?.date && (
                <span style={{ fontSize: '9px', color: '#475569' }}>
                  {new Date(event.date).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
