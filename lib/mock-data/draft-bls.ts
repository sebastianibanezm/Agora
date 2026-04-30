import type { DraftBL, ValidationCheck } from '@/types';

const heroBlChecks: ValidationCheck[] = [
  { id: 'BLCHK-1', checkName: 'BL booking reference matches SI', agentId: 'draft_bl_validator', result: 'pass', details: 'SNG0502407 on both.', expected: 'SNG0502407', actual: 'SNG0502407' },
  { id: 'BLCHK-2', checkName: 'BL consignee matches SI consignee', agentId: 'draft_bl_validator', result: 'pass', details: 'Walmart Inc. on both.', expected: 'Walmart Inc.', actual: 'Walmart Inc.' },
  { id: 'BLCHK-3', checkName: 'BL notify matches SI notify', agentId: 'draft_bl_validator', result: 'pass', details: 'Expeditors International — Savannah on both.' },
  { id: 'BLCHK-4', checkName: 'BL shipper matches SI shipper', agentId: 'draft_bl_validator', result: 'pass', details: 'Comfrut S.A. on both.' },
  { id: 'BLCHK-5', checkName: 'BL POL matches SI POL', agentId: 'draft_bl_validator', result: 'pass', details: 'San Antonio on both.' },
  { id: 'BLCHK-6', checkName: 'BL POD matches SI POD', agentId: 'draft_bl_validator', result: 'pass', details: 'Charleston on both.' },
  { id: 'BLCHK-7', checkName: 'BL net weight within 0.5% of SI total net', agentId: 'draft_bl_validator', result: 'pass', details: '22,860.00 kg on both (within 0.0%).', expected: '22,860.00 kg', actual: '22,860.00 kg' },
  { id: 'BLCHK-8', checkName: 'BL gross weight within 0.5% of SI total gross', agentId: 'draft_bl_validator', result: 'pass', details: '24,174.30 kg on both.', expected: '24,174.30 kg', actual: '24,174.30 kg' },
  { id: 'BLCHK-9', checkName: 'BL container/seal number present', agentId: 'draft_bl_validator', result: 'pass', details: 'Container CGMU-9176432, Seal CMA0418771 declared.' },
  { id: 'BLCHK-10', checkName: 'BL vessel/voyage matches SI', agentId: 'draft_bl_validator', result: 'pass', details: 'Matthew Schulte / 0LI1YN1MA on both.' },
];

export const draftBls: DraftBL[] = [
  // ============================================================
  // HERO — clean Draft BL ready for release to exporter
  // ============================================================
  {
    id: 'BL-SNG0502407',
    bookingId: 'BKG-SNG0502407',
    receivedAt: '2026-04-21T16:30:00-04:00',
    sourceFileUrl: '/mock-docs/1.jpeg',
    parsedFields: {
      blNumber: 'CGMUSAI3052801',
      bookingReference: 'SNG0502407',
      vesselVoyage: 'Matthew Schulte / 0LI1YN1MA',
      pol: 'San Antonio, Chile',
      pod: 'Charleston, USA',
      consignee: 'Walmart Inc., 702 SW 8th St, Bentonville, AR 72716, USA',
      notify: 'Expeditors International — Savannah, 1 Diamond Causeway, Savannah, GA 31406, USA',
      shipper: 'Comfrut S.A., Camino Longitudinal Sur Km 175, Linares, Chile',
      containerNumber: 'CGMU-9176432',
      sealNumber: 'CMA0418771',
      netWeight: 22_860.0,
      grossWeight: 24_174.3,
      cargoDescription: '2,286 CARTONS — FROZEN ORGANIC CHERRIES IQF (5x2 KG + 10 KG MIX) — TEMP −18°C',
      freightTerms: 'COLLECT',
    },
    validationStatus: 'green',
    validationResults: heroBlChecks,
  },

  // ============================================================
  // DRAFT_BL_RECEIVED with discrepancies
  // ============================================================
  {
    id: 'BL-MSCSAI4408',
    bookingId: 'BKG-MSCSAI4408',
    receivedAt: '2026-04-30T07:15:00-04:00',
    sourceFileUrl: '/mock-docs/1.jpeg',
    parsedFields: {
      blNumber: 'MSCUSAI3052105',
      bookingReference: 'MSCSAI4408',
      vesselVoyage: 'MSC Lorena / EX2611R',
      pol: 'San Antonio, Chile',
      pod: 'Charleston, USA',
      consignee: 'Walmart Inc., 702 SW 8th St, Bentonville, AR 72716, USA',
      notify: 'Expeditors International — Savannah, 1 Diamond Causeway, Savannah, GA 31406, USA',
      shipper: 'Comfrut S.A., Camino Longitudinal Sur Km 175, Linares, Chile',
      containerNumber: 'MSCU-7842156',
      sealNumber: 'MSC0411832',
      netWeight: 23_010.0,
      grossWeight: 24_402.0,
      cargoDescription: '2,286 CARTONS — FROZEN ORGANIC CHERRIES IQF — TEMP −18°C',
      freightTerms: 'COLLECT',
    },
    validationStatus: 'failed',
    validationResults: [
      { id: 'BLCHK-1', checkName: 'BL booking reference matches SI', agentId: 'draft_bl_validator', result: 'pass', details: 'MSCSAI4408 on both.' },
      { id: 'BLCHK-2', checkName: 'BL consignee matches SI consignee', agentId: 'draft_bl_validator', result: 'pass', details: 'Walmart Inc. on both.' },
      { id: 'BLCHK-3', checkName: 'BL notify matches SI notify', agentId: 'draft_bl_validator', result: 'pass', details: 'Expeditors International — Savannah on both.' },
      { id: 'BLCHK-4', checkName: 'BL shipper matches SI shipper', agentId: 'draft_bl_validator', result: 'pass', details: 'Comfrut S.A. on both.' },
      { id: 'BLCHK-5', checkName: 'BL POL matches SI POL', agentId: 'draft_bl_validator', result: 'pass', details: 'San Antonio on both.' },
      { id: 'BLCHK-6', checkName: 'BL POD matches SI POD', agentId: 'draft_bl_validator', result: 'pass', details: 'Charleston on both.' },
      { id: 'BLCHK-7', checkName: 'BL net weight within 0.5% of SI total net', agentId: 'draft_bl_validator', result: 'fail', details: 'BL declares 23,010.00 kg vs SI 22,860.00 kg — delta +0.66%, above 0.5% tolerance. Will trigger BL correction fee USD 100–500 if issued.', expected: '22,860.00 kg', actual: '23,010.00 kg' },
      { id: 'BLCHK-8', checkName: 'BL gross weight within 0.5% of SI total gross', agentId: 'draft_bl_validator', result: 'fail', details: 'BL declares 24,402.00 kg vs SI 24,232.00 kg — delta +0.70%.', expected: '24,232.00 kg', actual: '24,402.00 kg' },
      { id: 'BLCHK-9', checkName: 'BL container/seal number present', agentId: 'draft_bl_validator', result: 'pass', details: 'Container MSCU-7842156, Seal MSC0411832 declared.' },
      { id: 'BLCHK-10', checkName: 'BL vessel/voyage matches SI', agentId: 'draft_bl_validator', result: 'pass', details: 'MSC Lorena / EX2611R on both.' },
    ],
  },
  {
    id: 'BL-CGMURTM910',
    bookingId: 'BKG-CGMURTM910',
    receivedAt: '2026-04-30T08:45:00-04:00',
    sourceFileUrl: '/mock-docs/1.jpeg',
    parsedFields: {
      blNumber: 'CGMURTM3041201',
      bookingReference: 'CGMURTM910',
      vesselVoyage: 'CMA CGM Otello / 0FY1NS1MA',
      pol: 'San Antonio, Chile',
      pod: 'Rotterdam, Netherlands',
      consignee: 'AH Vroegop BV, Waalhaven Z.z. 16, 3088 HH Rotterdam, NL',
      notify: 'AH Vroegop B.V., Waalhaven Z.z. 16, 3088 HH Rotterdam, NL',
      shipper: 'Copefrut S.A., Camino Las Mariposas s/n, Curicó, Chile',
      containerNumber: 'CGMU-9182374',
      sealNumber: 'CMA0419002',
      netWeight: 19_440.0,
      grossWeight: 20_520.0,
      cargoDescription: '1,080 CARTONS — FRESH GALA APPLES 18 KG',
      freightTerms: 'PREPAID',
    },
    validationStatus: 'failed',
    validationResults: [
      { id: 'BLCHK-1', checkName: 'BL booking reference matches SI', agentId: 'draft_bl_validator', result: 'pass', details: 'CGMURTM910 on both.' },
      { id: 'BLCHK-2', checkName: 'BL consignee matches SI consignee', agentId: 'draft_bl_validator', result: 'fail', details: 'BL consignee "AH Vroegop BV" missing the period after "B.V." Bank reviewer will flag mismatch with collection order. Likely BL correction fee USD 100–500.', expected: 'AH Vroegop B.V.', actual: 'AH Vroegop BV' },
      { id: 'BLCHK-3', checkName: 'BL notify matches SI notify', agentId: 'draft_bl_validator', result: 'pass', details: 'AH Vroegop B.V. on both.' },
      { id: 'BLCHK-4', checkName: 'BL shipper matches SI shipper', agentId: 'draft_bl_validator', result: 'pass', details: 'Copefrut S.A. on both.' },
      { id: 'BLCHK-5', checkName: 'BL POL matches SI POL', agentId: 'draft_bl_validator', result: 'pass', details: 'San Antonio on both.' },
      { id: 'BLCHK-6', checkName: 'BL POD matches SI POD', agentId: 'draft_bl_validator', result: 'pass', details: 'Rotterdam on both.' },
      { id: 'BLCHK-7', checkName: 'BL net weight within 0.5% of SI total net', agentId: 'draft_bl_validator', result: 'pass', details: '19,440.00 kg on both.' },
      { id: 'BLCHK-8', checkName: 'BL gross weight within 0.5% of SI total gross', agentId: 'draft_bl_validator', result: 'pass', details: '20,520.00 kg on both.' },
      { id: 'BLCHK-9', checkName: 'BL container/seal number present', agentId: 'draft_bl_validator', result: 'pass', details: 'Container CGMU-9182374, Seal CMA0419002 declared.' },
      { id: 'BLCHK-10', checkName: 'BL vessel/voyage matches SI', agentId: 'draft_bl_validator', result: 'pass', details: 'CMA CGM Otello / 0FY1NS1MA on both.' },
    ],
  },
];

export function getDraftBlById(id: string): DraftBL | undefined {
  return draftBls.find((b) => b.id === id);
}

export function getDraftBlByBookingId(bookingId: string): DraftBL | undefined {
  return draftBls.find((b) => b.bookingId === bookingId);
}
