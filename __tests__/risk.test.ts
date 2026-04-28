import { describe, it, expect } from 'vitest';
import { severityFromHoursToCutoff, severityFromColdChain } from '@/lib/utils/risk';

describe('risk', () => {
  it('severity scales with hours-to-cutoff', () => {
    expect(severityFromHoursToCutoff(72)).toBe('ok');
    expect(severityFromHoursToCutoff(36)).toBe('info');
    expect(severityFromHoursToCutoff(20)).toBe('watch');
    expect(severityFromHoursToCutoff(8)).toBe('risk');
    expect(severityFromHoursToCutoff(2)).toBe('crit');
  });

  it('severity from cold chain status', () => {
    expect(severityFromColdChain({ status: 'completed', excursionEvents: [] } as any)).toBe('ok');
    expect(severityFromColdChain({ status: 'breached', excursionEvents: [] } as any)).toBe('crit');
    expect(severityFromColdChain({ status: 'in_treatment', excursionEvents: [] } as any)).toBe('ok');
    expect(severityFromColdChain({ status: 'in_treatment', excursionEvents: [{ brokeCompliance: false }] } as any)).toBe('watch');
    expect(severityFromColdChain({ status: 'in_treatment', excursionEvents: [{ brokeCompliance: true }] } as any)).toBe('crit');
  });
});
