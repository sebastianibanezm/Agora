import { describe, it, expect } from 'vitest';
import { ACTIVE_STATUSES, isActiveContainer, stageLabelKey } from '@/lib/containers';
import type { Container } from '@/types';

const makeContainer = (status: Container['status']): Container =>
  ({ id: 'X', status } as unknown as Container);

describe('isActiveContainer', () => {
  it('returns true for all active stages', () => {
    const active = ['planning', 'preparation', 'documentation', 'in_transit', 'customs_release', 'delivery_payment'] as const;
    active.forEach(s => expect(isActiveContainer(makeContainer(s))).toBe(true));
  });

  it('returns false only for closed', () => {
    expect(isActiveContainer(makeContainer('closed'))).toBe(false);
  });
});

describe('stageLabelKey', () => {
  it('returns the correct i18n key for each status', () => {
    expect(stageLabelKey('planning')).toBe('containers.statuses.planning');
    expect(stageLabelKey('preparation')).toBe('containers.statuses.preparation');
    expect(stageLabelKey('documentation')).toBe('containers.statuses.documentation');
    expect(stageLabelKey('in_transit')).toBe('containers.statuses.in_transit');
    expect(stageLabelKey('customs_release')).toBe('containers.statuses.customs_release');
    expect(stageLabelKey('delivery_payment')).toBe('containers.statuses.delivery_payment');
    expect(stageLabelKey('closed')).toBe('containers.statuses.closed');
  });
});
