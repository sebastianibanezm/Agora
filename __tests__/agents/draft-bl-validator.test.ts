import { describe, it, expect } from 'vitest';
import { validateDraftBL } from '@/lib/agents/draft-bl-validator';
import { getDraftBlByBookingId } from '@/lib/mock-data/draft-bls';
import { getSIByBookingId } from '@/lib/mock-data/shipping-instructions';

function fixture(bookingId: string) {
  const bl = getDraftBlByBookingId(bookingId);
  const si = getSIByBookingId(bookingId);
  if (!bl || !si) throw new Error(`Missing BL or SI for ${bookingId}`);
  return { bl, si };
}

describe('draft-bl-validator', () => {
  it('passes all 10 checks for the Comfrut hero Draft BL', () => {
    const { bl, si } = fixture('BKG-SNG0502407');
    const checks = validateDraftBL(bl, si);
    expect(checks).toHaveLength(10);
    expect(checks.every((c) => c.result === 'pass')).toBe(true);
  });

  it('fails on weight delta above 0.5%', () => {
    const { bl, si } = fixture('BKG-MSCSAI4408');
    const checks = validateDraftBL(bl, si);
    const net = checks.find((c) => c.id === 'BLCHK-7');
    expect(net?.result).toBe('fail');
  });

  it('fails on consignee typo', () => {
    const { bl, si } = fixture('BKG-CGMURTM910');
    const checks = validateDraftBL(bl, si);
    const consignee = checks.find((c) => c.id === 'BLCHK-2');
    expect(consignee?.result === 'fail' || consignee?.result === 'warn').toBe(true);
  });

  it('fails when container/seal numbers missing', () => {
    const { bl, si } = fixture('BKG-SNG0502407');
    const tampered = {
      ...bl,
      parsedFields: { ...bl.parsedFields, containerNumber: '', sealNumber: '' },
    };
    const checks = validateDraftBL(tampered, si);
    const ctr = checks.find((c) => c.id === 'BLCHK-9');
    expect(ctr?.result).toBe('fail');
  });
});
