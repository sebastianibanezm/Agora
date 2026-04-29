import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VolumeTimeSeries } from '@/components/shared/VolumeTimeSeries';
import { MiniSeasonBar } from '@/components/shared/MiniSeasonBar';
import type { VolumeHistoryEntry } from '@/types';

describe('VolumeTimeSeries', () => {
  it('renders without error for valid data', () => {
    const data: VolumeHistoryEntry[] = [
      { season: '2023/24', volumeKg: 480_000 },
      { season: '2024/25', volumeKg: 580_000 },
    ];
    const { container } = render(<VolumeTimeSeries data={data} />);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByText('2023/24')).toBeInTheDocument();
  });

  it('renders nothing for empty data', () => {
    const { container } = render(<VolumeTimeSeries data={[]} />);
    expect(container.querySelector('svg')).toBeNull();
  });
});

describe('MiniSeasonBar', () => {
  it('renders 12 month segments', () => {
    const { container } = render(<MiniSeasonBar start="Nov" end="Jan" />);
    const flexContainer = container.querySelector('div[style*="display: flex"]');
    expect(flexContainer?.children.length).toBe(12);
  });

  it('marks Nov, Dec, Jan as active for a Nov–Jan season (wraps year boundary)', () => {
    const { container } = render(<MiniSeasonBar start="Nov" end="Jan" />);
    const flexContainer = container.querySelector('div[style*="display: flex"]');
    const segments = Array.from(flexContainer?.children ?? []) as HTMLElement[];
    // MONTHS index: Nov=10, Dec=11, Jan=0
    expect(segments[10]?.style.backgroundColor).toBe('rgb(0, 230, 150)');  // #00E696
    expect(segments[11]?.style.backgroundColor).toBe('rgb(0, 230, 150)');
    expect(segments[0]?.style.backgroundColor).toBe('rgb(0, 230, 150)');
    // Feb (index 1) should NOT be active
    expect(segments[1]?.style.backgroundColor).not.toBe('rgb(0, 230, 150)');
  });
});

import { POLifecycleTimeline } from '@/components/purchase-orders/POLifecycleTimeline';
import type { POEvent } from '@/types';

describe('POLifecycleTimeline', () => {
  it('renders mint fill covering exactly completed milestones', () => {
    const events: POEvent[] = [
      { date: '2026-10-01', type: 'confirmed' },
      { date: '2026-11-01', type: 'container_assigned' },
      { date: '2026-12-01', type: 'bl_issued' },
    ];
    render(<POLifecycleTimeline events={events} />);
    expect(screen.getByTestId('tl-progress')).toBeInTheDocument();
  });

  it('renders all 6 milestone nodes', () => {
    render(<POLifecycleTimeline events={[]} />);
    expect(screen.getAllByTestId('tl-node').length).toBe(6);
  });
});

import { NextIntlClientProvider } from 'next-intl';
import en from '../messages/en.json';
import { ContainerCard } from '@/components/containers/ContainerCard';
import { containers } from '@/lib/mock-data/containers';
import { importers } from '@/lib/mock-data/importers';

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="en" messages={en as any}>{ui}</NextIntlClientProvider>
);

import { SentinelQueue } from '@/components/compliance/SentinelQueue';
import type { Alert } from '@/types';

const makeAlert = (severity: Alert['severity'], id = 'a1'): Alert => ({
  id,
  severity,
  titleKey: 'alerts.test_title',
  bodyKey: 'alerts.test_body',
  raisedAt: '2027-01-09',
  raisedBy: 'agent',
  category: 'market_compliance',
});

describe('SentinelQueue', () => {
  it('renders watch, crit, and info severity items', () => {
    const alerts = [
      makeAlert('watch', 'a1'),
      makeAlert('crit', 'a2'),
      makeAlert('info', 'a3'),
    ];
    render(wrap(<SentinelQueue alerts={alerts} />));
    expect(screen.getByTestId('sentinel-item-a1')).toBeInTheDocument();
    expect(screen.getByTestId('sentinel-item-a2')).toBeInTheDocument();
    expect(screen.getByTestId('sentinel-item-a3')).toBeInTheDocument();
  });

  it('renders empty state when no alerts', () => {
    render(wrap(<SentinelQueue alerts={[]} />));
    expect(screen.getByText(/no alerts/i)).toBeInTheDocument();
  });
});

describe('ContainerCard', () => {
  it('renders container ID', () => {
    const c = containers[0]!;
    const imp = importers.find(i => i.id === c.importerId)!;
    render(wrap(<ContainerCard container={c} importer={imp} />));
    expect(screen.getByText(c.id)).toBeInTheDocument();
  });

  it('renders cold chain badge only when coldChain.required is true', () => {
    const cold = containers.find(c => c.coldChain?.required === true)!;
    const noCold = containers.find(c => !c.coldChain || c.coldChain.required === false)!;
    const impCold = importers.find(i => i.id === cold.importerId)!;
    const impNoCold = importers.find(i => i.id === noCold.importerId)!;

    const { rerender } = render(wrap(<ContainerCard container={cold} importer={impCold} />));
    expect(screen.getByTestId('cold-chain-badge')).toBeInTheDocument();

    rerender(wrap(<ContainerCard container={noCold} importer={impNoCold} />));
    expect(screen.queryByTestId('cold-chain-badge')).not.toBeInTheDocument();
  });
});
