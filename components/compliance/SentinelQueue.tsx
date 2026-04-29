'use client';

import type { Alert } from '@/types';
import { useTranslations } from 'next-intl';

const SEVERITY_COLORS: Record<string, string> = {
  crit: '#EF4444',
  watch: '#F59E0B',
  info: '#3B82F6',
  ok: '#00E696',
  risk: '#F97316',
};

interface Props {
  alerts: Alert[];
}

export function SentinelQueue({ alerts }: Props) {
  const t = useTranslations();

  if (alerts.length === 0) {
    return <div style={{ color: '#475569', fontSize: '13px', padding: '16px 0' }}>No alerts</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {alerts.map(alert => {
        const color = SEVERITY_COLORS[alert.severity] ?? '#64748b';
        let titleText: string;
        let bodyText: string;
        try { titleText = t(alert.titleKey as Parameters<typeof t>[0]); } catch { titleText = alert.titleKey; }
        try { bodyText = t(alert.bodyKey as Parameters<typeof t>[0]); } catch { bodyText = alert.bodyKey; }
        return (
          <div
            key={alert.id}
            data-testid={`sentinel-item-${alert.id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: '#1a1f2e', border: '1px solid #ffffff12', borderRadius: '8px', padding: '14px',
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color, fontWeight: 700, fontSize: '12px',
            }}>
              {alert.severity === 'crit' || alert.severity === 'risk' ? '!' : alert.severity === 'watch' ? '!' : 'i'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#e2e8f0' }}>{titleText}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{bodyText}</div>
            </div>
            {alert.containerId && (
              <span style={{ padding: '2px 8px', borderRadius: '8px', background: '#ffffff0d', color: '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>
                {alert.containerId}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
