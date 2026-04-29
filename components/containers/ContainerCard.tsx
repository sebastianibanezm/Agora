import type { Container, Importer } from '@/types';
import { getTodayDemo } from '@/lib/utils/dates';
import { differenceInDays } from 'date-fns';

interface Props {
  container: Container;
  importer: Importer;
}

function tDayColor(days: number): string {
  if (days >= 0) return '#00E696';
  if (days >= -3) return '#F59E0B';
  if (days >= -7) return '#F97316';
  return '#EF4444';
}

export function ContainerCard({ container, importer }: Props) {
  const today = getTodayDemo();
  const etd = new Date(container.etd);
  const tDays = differenceInDays(etd, today);

  return (
    <div
      style={{
        background: '#1a1f2e',
        border: '1px solid #ffffff12',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00E696', fontSize: '13px', fontWeight: 600 }}>
        {container.id}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e2e8f0' }}>
        {container.productLabel}
        {container.coldChain?.required && (
          <span data-testid="cold-chain-badge" style={{ fontSize: '11px', color: '#7DD3FC', display: 'flex', alignItems: 'center', gap: '3px' }}>
            ❄ Reefer
          </span>
        )}
      </div>

      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{container.market}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: tDayColor(tDays), fontWeight: 600 }}>
          T{tDays >= 0 ? '+' : ''}{tDays}d
        </span>
        <span style={{ fontSize: '11px', color: '#64748b' }}>{importer.name}</span>
      </div>
    </div>
  );
}
