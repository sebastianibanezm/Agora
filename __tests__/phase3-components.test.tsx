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
