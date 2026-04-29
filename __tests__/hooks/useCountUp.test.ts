import { describe, it, expect } from 'vitest';

// Test the pure math — easeOutCubic formula exported from the hook
import { easeOutCubic } from '@/lib/hooks/useCountUp';

describe('useCountUp — easeOutCubic', () => {
  it('returns 0 at progress 0', () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it('returns 1 at progress 1', () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it('is greater than linear midpoint at progress 0.5 (ease-out accelerates early)', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});
