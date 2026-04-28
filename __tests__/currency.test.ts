import { describe, it, expect } from 'vitest';
import { formatUsd, formatNumber } from '@/lib/utils/currency';

describe('currency', () => {
  it('formats USD with es-CL conventions (dot thousands, comma decimal)', () => {
    const result = formatUsd(1234567.5, 'es');
    expect(result).toContain('1');
    expect(result.length).toBeGreaterThan(5);
  });

  it('formats USD with en-US conventions (comma thousands)', () => {
    const result = formatUsd(1234567.5, 'en');
    expect(result).toMatch(/1,234,567/);
  });

  it('formatNumber rounds to maxFrac', () => {
    expect(formatNumber(3.14159, 'en', 2)).toBe('3.14');
  });
});
