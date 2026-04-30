import type {
  Booking,
  Exporter,
  ShippingInstruction,
  ValidationCheck,
} from '@/types';

// Loose-string comparison: case- and whitespace-insensitive.
function normalize(s: string | undefined | null): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/[\s,.\-_/]+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m: number[][] = Array.from({ length: a.length + 1 }, () => []);
  for (let i = 0; i <= a.length; i++) m[i]![0] = i;
  for (let j = 0; j <= b.length; j++) m[0]![j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      m[i]![j] = Math.min(m[i - 1]![j]! + 1, m[i]![j - 1]! + 1, m[i - 1]![j - 1]! + cost);
    }
  }
  return m[a.length]![b.length]!;
}

function similarity(a: string, b: string): number {
  const an = normalize(a);
  const bn = normalize(b);
  if (!an && !bn) return 1;
  const dist = levenshtein(an, bn);
  const maxLen = Math.max(an.length, bn.length, 1);
  return 1 - dist / maxLen;
}

function check(
  id: string,
  checkName: string,
  agentId: ValidationCheck['agentId'],
  result: ValidationCheck['result'],
  details: string,
  extras: Partial<Pick<ValidationCheck, 'fieldRef' | 'expected' | 'actual'>> = {},
): ValidationCheck {
  return { id, checkName, agentId, result, details, ...extras };
}

/**
 * Run the V1 SI validation rules against an SI, given its target Booking + the
 * Exporter master record. Returns one ValidationCheck per rule (always all 10).
 */
export function validateSI(
  si: ShippingInstruction,
  booking: Booking,
  exporter: Exporter,
): ValidationCheck[] {
  const f = si.parsedFields;
  const out: ValidationCheck[] = [];

  // 1. Booking reference match
  out.push(
    f.bookingReference === booking.bookingNumber
      ? check('CHK-1', 'Booking reference match', 'si_validator', 'pass', `SI booking reference matches Booking ${booking.bookingNumber}.`)
      : check('CHK-1', 'Booking reference match', 'si_validator', 'fail', 'SI booking reference does not match Booking.', {
          fieldRef: 'bookingReference',
          expected: booking.bookingNumber,
          actual: f.bookingReference,
        }),
  );

  // 2. Container type match
  out.push(
    f.containerType === booking.containerType
      ? check('CHK-2', 'Container type match', 'si_validator', 'pass', `${booking.containerType} on both SI and Booking.`)
      : check('CHK-2', 'Container type match', 'si_validator', 'fail', 'Container type mismatch between SI and Booking.', {
          fieldRef: 'containerType',
          expected: booking.containerType,
          actual: f.containerType,
        }),
  );

  // 3. POL match (fuzzy)
  const polSim = similarity(f.portOfLoading, booking.pol);
  out.push(
    polSim === 1
      ? check('CHK-3', 'POL match', 'si_validator', 'pass', `${booking.pol} on both SI and Booking.`)
      : polSim >= 0.7
        ? check('CHK-3', 'POL match', 'si_validator', 'warn', 'POL strings differ but appear to match.', {
            fieldRef: 'portOfLoading', expected: booking.pol, actual: f.portOfLoading,
          })
        : check('CHK-3', 'POL match', 'si_validator', 'fail', 'POL on SI does not match Booking.', {
            fieldRef: 'portOfLoading', expected: booking.pol, actual: f.portOfLoading,
          }),
  );

  // 4. POD match (fuzzy)
  const podSim = similarity(f.portOfDischarge, booking.pod);
  out.push(
    podSim === 1
      ? check('CHK-4', 'POD match', 'si_validator', 'pass', `${booking.pod} on both SI and Booking.`)
      : podSim >= 0.7
        ? check('CHK-4', 'POD match', 'si_validator', 'warn', 'POD strings differ but appear to match.', {
            fieldRef: 'portOfDischarge', expected: booking.pod, actual: f.portOfDischarge,
          })
        : check('CHK-4', 'POD match', 'si_validator', 'fail', 'POD on SI does not match Booking.', {
            fieldRef: 'portOfDischarge', expected: booking.pod, actual: f.portOfDischarge,
          }),
  );

  // 5. Cut-off match (within tolerance)
  const cutoffDeltaH = Math.abs(
    (new Date(f.cutOff).getTime() - new Date(booking.cutOff ?? '').getTime()) / 3_600_000,
  );
  out.push(
    cutoffDeltaH <= 2
      ? check('CHK-5', 'Cut-off match', 'si_validator', 'pass', 'Cut-off matches Booking within ±2h.')
      : cutoffDeltaH <= 24
        ? check('CHK-5', 'Cut-off match', 'si_validator', 'warn', `Cut-off differs by ${cutoffDeltaH.toFixed(1)}h.`, {
            fieldRef: 'cutOff', expected: booking.cutOff, actual: f.cutOff,
          })
        : check('CHK-5', 'Cut-off match', 'si_validator', 'fail', `Cut-off differs by ${cutoffDeltaH.toFixed(1)}h.`, {
            fieldRef: 'cutOff', expected: booking.cutOff, actual: f.cutOff,
          }),
  );

  // 6. Vessel/voyage match — both must match exactly
  const vesselOk = normalize(f.vesselVoyage).includes(normalize(booking.vesselName));
  const voyageOk = normalize(f.vesselVoyage).includes(normalize(booking.voyage));
  out.push(
    vesselOk && voyageOk
      ? check('CHK-6', 'Vessel/voyage match', 'si_validator', 'pass', `${booking.vesselName} / ${booking.voyage} on both.`)
      : check('CHK-6', 'Vessel/voyage match', 'si_validator', 'fail', `${voyageOk ? 'Vessel' : 'Voyage'} mismatch on SI — carrier will reject.`, {
          fieldRef: 'vesselVoyage',
          expected: `${booking.vesselName} / ${booking.voyage}`,
          actual: f.vesselVoyage,
        }),
  );

  // 7. Required fields present
  const missing: string[] = [];
  if (!f.consignee?.name) missing.push('consignee.name');
  if (!f.consignee?.address) missing.push('consignee.address');
  if (!f.notify?.name) missing.push('notify.name');
  if (!f.notify?.address) missing.push('notify.address');
  if (!f.shipper?.name) missing.push('shipper.name');
  if (!f.shipper?.address) missing.push('shipper.address');
  if (!f.vesselVoyage) missing.push('vesselVoyage');
  out.push(
    missing.length === 0
      ? check('CHK-7', 'Required fields present', 'si_validator', 'pass', 'All required fields populated.')
      : check('CHK-7', 'Required fields present', 'si_validator', 'fail', `Missing: ${missing.join(', ')}.`),
  );

  // 8. Cargo totals reconcile
  const sumNet = f.cargo.reduce((s, l) => s + l.kgNetTotal, 0);
  const reconcileDelta = Math.abs(sumNet - f.totalKgNet);
  const reconcilePct = f.totalKgNet === 0 ? 0 : reconcileDelta / f.totalKgNet;
  out.push(
    reconcilePct <= 0.001
      ? check('CHK-8', 'Cargo totals reconcile', 'si_validator', 'pass', `Net ${f.totalKgNet.toFixed(2)} kg matches sum of cargo lines.`)
      : reconcilePct <= 0.01
        ? check('CHK-8', 'Cargo totals reconcile', 'si_validator', 'warn', `Net total off by ${(reconcilePct * 100).toFixed(2)}% from cargo line sum.`, {
            fieldRef: 'totalKgNet', expected: sumNet.toFixed(2), actual: f.totalKgNet.toFixed(2),
          })
        : check('CHK-8', 'Cargo totals reconcile', 'si_validator', 'fail', `Net total off by ${(reconcilePct * 100).toFixed(2)}% from cargo line sum.`, {
            fieldRef: 'totalKgNet', expected: sumNet.toFixed(2), actual: f.totalKgNet.toFixed(2),
          }),
  );

  // 9. Reefer setpoint present
  if (booking.isReefer) {
    out.push(
      typeof f.setpointC === 'number'
        ? check('CHK-9', 'Reefer setpoint present', 'si_validator', 'pass', `Reefer setpoint declared at ${f.setpointC} °C.`)
        : check('CHK-9', 'Reefer setpoint present', 'si_validator', 'fail', 'Reefer Booking but SI has no setpoint declared.', {
            fieldRef: 'setpointC',
          }),
    );
  } else {
    out.push(check('CHK-9', 'Reefer setpoint present', 'si_validator', 'pass', 'N/A — dry container.'));
  }

  // 10. Exporter master data match (Master Data Sentinel)
  const masterSim = similarity(f.shipper.name, exporter.legalName);
  out.push(
    masterSim === 1
      ? check('CHK-10', 'Exporter master data match', 'master_data_sentinel', 'pass', `Shipper "${exporter.legalName}" matches master record.`)
      : masterSim >= 0.85
        ? check('CHK-10', 'Exporter master data match', 'master_data_sentinel', 'warn', `Minor variant of "${exporter.legalName}".`, {
            fieldRef: 'shipper.name', expected: exporter.legalName, actual: f.shipper.name,
          })
        : check('CHK-10', 'Exporter master data match', 'master_data_sentinel', 'fail', `Shipper "${f.shipper.name}" does not match master record "${exporter.legalName}".`, {
            fieldRef: 'shipper.name', expected: exporter.legalName, actual: f.shipper.name,
          }),
  );

  return out;
}

export function summarizeChecks(checks: ValidationCheck[]) {
  let passed = 0, warnings = 0, failed = 0;
  for (const c of checks) {
    if (c.result === 'pass') passed++;
    else if (c.result === 'warn') warnings++;
    else failed++;
  }
  return { passed, warnings, failed, total: checks.length };
}
