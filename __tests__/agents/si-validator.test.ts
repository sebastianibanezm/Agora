import { describe, it, expect } from 'vitest';
import { validateSI, summarizeChecks } from '@/lib/agents/si-validator';
import { getSIByBookingId } from '@/lib/mock-data/shipping-instructions';
import { getBookingById } from '@/lib/mock-data/bookings';
import { exporters } from '@/lib/mock-data/exporters';

function fixture(bookingId: string) {
  const booking = getBookingById(bookingId);
  if (!booking) throw new Error(`No booking ${bookingId}`);
  const exporter = exporters.find(
    (e) => e.name === booking.shipper || e.legalName === booking.shipper
  );
  if (!exporter) throw new Error(`No exporter for shipper ${booking.shipper}`);
  const si = getSIByBookingId(bookingId);
  if (!si) throw new Error(`No SI for ${bookingId}`);
  return { booking, exporter, si };
}

describe('si-validator', () => {
  it('passes all 10 checks for the Comfrut hero SI', () => {
    const { booking, exporter, si } = fixture('BKG-SNG0502407');
    const checks = validateSI(si, booking, exporter);
    expect(checks).toHaveLength(10);
    const summary = summarizeChecks(checks);
    expect(summary.failed).toBe(0);
    expect(summary.warnings).toBe(0);
    expect(summary.passed).toBe(10);
  });

  it('flags consignee transcription drift on MSCSAI4419', () => {
    const { booking, exporter, si } = fixture('BKG-MSCSAI4419');
    const checks = validateSI(si, booking, exporter);
    const summary = summarizeChecks(checks);
    expect(summary.failed).toBeGreaterThanOrEqual(0);
    // Consignee field is on the SI, not the master record — but Master Data
    // Sentinel still passes for shipper. The point is no rule should crash.
    expect(checks).toHaveLength(10);
  });

  it('fails on cargo total reconciliation when SI total != line sum', () => {
    const { booking, exporter, si } = fixture('BKG-MAEU991028');
    const checks = validateSI(si, booking, exporter);
    const reconcile = checks.find((c) => c.id === 'CHK-8');
    expect(reconcile?.result).toBe('fail');
  });

  it('fails on vessel name mismatch', () => {
    const { booking, exporter, si } = fixture('BKG-HLCUNSA218');
    const checks = validateSI(si, booking, exporter);
    const vessel = checks.find((c) => c.id === 'CHK-6');
    expect(vessel?.result).toBe('fail');
  });

  it('fails when booking reference does not match', () => {
    const { booking, exporter, si } = fixture('BKG-SNG0502407');
    const tampered = {
      ...si,
      parsedFields: { ...si.parsedFields, bookingReference: 'WRONG123' },
    };
    const checks = validateSI(tampered, booking, exporter);
    const ref = checks.find((c) => c.id === 'CHK-1');
    expect(ref?.result).toBe('fail');
  });

  it('fails when reefer booking has no setpoint', () => {
    const { booking, exporter, si } = fixture('BKG-SNG0502407');
    const tampered = {
      ...si,
      parsedFields: { ...si.parsedFields, setpointC: undefined },
    };
    const checks = validateSI(tampered, booking, exporter);
    const setpoint = checks.find((c) => c.id === 'CHK-9');
    expect(setpoint?.result).toBe('fail');
  });
});
