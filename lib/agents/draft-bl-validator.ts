import type { DraftBL, ShippingInstruction, ValidationCheck } from '@/types';

function normalize(s: string | undefined | null): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/[\s,.\-_/]+/g, ' ')
    .trim();
}

function similarity(a: string, b: string): number {
  const an = normalize(a);
  const bn = normalize(b);
  if (an === bn) return 1;
  if (!an || !bn) return 0;
  // Cheap token-overlap ratio (sufficient for short party strings).
  const aTokens = new Set(an.split(' '));
  const bTokens = new Set(bn.split(' '));
  let common = 0;
  for (const t of aTokens) if (bTokens.has(t)) common++;
  return (2 * common) / (aTokens.size + bTokens.size);
}

function check(
  id: string,
  checkName: string,
  result: ValidationCheck['result'],
  details: string,
  extras: Partial<Pick<ValidationCheck, 'fieldRef' | 'expected' | 'actual'>> = {},
): ValidationCheck {
  return { id, checkName, agentId: 'draft_bl_validator', result, details, ...extras };
}

/**
 * Compare a Draft BL against the SI it was generated from. 10 comparison rules.
 */
export function validateDraftBL(bl: DraftBL, si: ShippingInstruction): ValidationCheck[] {
  const blF = bl.parsedFields;
  const siF = si.parsedFields;
  const out: ValidationCheck[] = [];

  // 1. BL booking ref matches SI booking ref
  out.push(
    blF.bookingReference === siF.bookingReference
      ? check('BLCHK-1', 'BL booking reference matches SI', 'pass', `${siF.bookingReference} on both.`, {
          expected: siF.bookingReference, actual: blF.bookingReference,
        })
      : check('BLCHK-1', 'BL booking reference matches SI', 'fail', 'Booking reference mismatch.', {
          expected: siF.bookingReference, actual: blF.bookingReference,
        }),
  );

  // 2. Consignee
  const consigneeSim = similarity(blF.consignee, `${siF.consignee.name} ${siF.consignee.address}`);
  out.push(
    consigneeSim >= 0.95
      ? check('BLCHK-2', 'BL consignee matches SI consignee', 'pass', `${siF.consignee.name} on both.`, {
          expected: siF.consignee.name, actual: blF.consignee,
        })
      : consigneeSim >= 0.7
        ? check('BLCHK-2', 'BL consignee matches SI consignee', 'warn', 'Consignee strings differ slightly.', {
            expected: siF.consignee.name, actual: blF.consignee,
          })
        : check('BLCHK-2', 'BL consignee matches SI consignee', 'fail', 'Consignee mismatch — bank or customs will reject.', {
            expected: siF.consignee.name, actual: blF.consignee,
          }),
  );

  // 3. Notify
  const notifySim = similarity(blF.notify, `${siF.notify.name} ${siF.notify.address}`);
  out.push(
    notifySim >= 0.85
      ? check('BLCHK-3', 'BL notify matches SI notify', 'pass', `${siF.notify.name} on both.`)
      : check('BLCHK-3', 'BL notify matches SI notify', 'fail', 'Notify mismatch.', {
          expected: siF.notify.name, actual: blF.notify,
        }),
  );

  // 4. Shipper
  const shipperSim = similarity(blF.shipper, `${siF.shipper.name} ${siF.shipper.address}`);
  out.push(
    shipperSim >= 0.85
      ? check('BLCHK-4', 'BL shipper matches SI shipper', 'pass', `${siF.shipper.name} on both.`)
      : check('BLCHK-4', 'BL shipper matches SI shipper', 'fail', 'Shipper mismatch.', {
          expected: siF.shipper.name, actual: blF.shipper,
        }),
  );

  // 5. POL
  out.push(
    similarity(blF.pol, siF.portOfLoading) >= 0.85
      ? check('BLCHK-5', 'BL POL matches SI POL', 'pass', `${siF.portOfLoading} on both.`)
      : check('BLCHK-5', 'BL POL matches SI POL', 'fail', 'POL mismatch.', {
          expected: siF.portOfLoading, actual: blF.pol,
        }),
  );

  // 6. POD
  out.push(
    similarity(blF.pod, siF.portOfDischarge) >= 0.85
      ? check('BLCHK-6', 'BL POD matches SI POD', 'pass', `${siF.portOfDischarge} on both.`)
      : check('BLCHK-6', 'BL POD matches SI POD', 'fail', 'POD mismatch.', {
          expected: siF.portOfDischarge, actual: blF.pod,
        }),
  );

  // 7. Net weight within 0.5%
  const netDelta = siF.totalKgNet === 0 ? 0 : Math.abs(blF.netWeight - siF.totalKgNet) / siF.totalKgNet;
  out.push(
    netDelta <= 0.005
      ? check('BLCHK-7', 'BL net weight within 0.5% of SI total net', 'pass', `${blF.netWeight.toFixed(2)} kg matches SI.`, {
          expected: `${siF.totalKgNet.toFixed(2)} kg`, actual: `${blF.netWeight.toFixed(2)} kg`,
        })
      : check('BLCHK-7', 'BL net weight within 0.5% of SI total net', 'fail', `Δ ${(netDelta * 100).toFixed(2)}% — above 0.5% tolerance, BL correction fee likely.`, {
          expected: `${siF.totalKgNet.toFixed(2)} kg`, actual: `${blF.netWeight.toFixed(2)} kg`,
        }),
  );

  // 8. Gross weight within 0.5%
  const grossDelta = siF.totalKgGross === 0 ? 0 : Math.abs(blF.grossWeight - siF.totalKgGross) / siF.totalKgGross;
  out.push(
    grossDelta <= 0.005
      ? check('BLCHK-8', 'BL gross weight within 0.5% of SI total gross', 'pass', `${blF.grossWeight.toFixed(2)} kg matches SI.`, {
          expected: `${siF.totalKgGross.toFixed(2)} kg`, actual: `${blF.grossWeight.toFixed(2)} kg`,
        })
      : check('BLCHK-8', 'BL gross weight within 0.5% of SI total gross', 'fail', `Δ ${(grossDelta * 100).toFixed(2)}% — above 0.5% tolerance.`, {
          expected: `${siF.totalKgGross.toFixed(2)} kg`, actual: `${blF.grossWeight.toFixed(2)} kg`,
        }),
  );

  // 9. Container/seal number present
  const hasContainer = Boolean(blF.containerNumber);
  const hasSeal = Boolean(blF.sealNumber);
  out.push(
    hasContainer && hasSeal
      ? check('BLCHK-9', 'BL container/seal number present', 'pass', `Container ${blF.containerNumber}, Seal ${blF.sealNumber} declared.`)
      : check('BLCHK-9', 'BL container/seal number present', 'fail', 'BL missing container or seal number.'),
  );

  // 10. Vessel/voyage match
  out.push(
    similarity(blF.vesselVoyage, siF.vesselVoyage) >= 0.9
      ? check('BLCHK-10', 'BL vessel/voyage matches SI', 'pass', `${siF.vesselVoyage} on both.`)
      : check('BLCHK-10', 'BL vessel/voyage matches SI', 'fail', 'Vessel/voyage mismatch.', {
          expected: siF.vesselVoyage, actual: blF.vesselVoyage,
        }),
  );

  return out;
}
