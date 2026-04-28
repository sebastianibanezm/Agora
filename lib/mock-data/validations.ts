import type { Validation } from '@/types';

export const validations: Validation[] = [
  // Walnuts (MSCU-7842156)
  { id: 'VAL-001', containerId: 'MSCU-7842156', checkId: 'DUS.FILED.BEFORE.CUTOFF', severity: 'crit', status: 'failed', message: 'validations.dusMissing', detectedAt: '2027-01-09T08:00:00-04:00' },
  { id: 'VAL-002', containerId: 'MSCU-7842156', documentType: 'commercial_invoice', checkId: 'INV.AMOUNT.MATCHES.PO', severity: 'ok', status: 'passed', message: 'validations.invoiceMatchesPO', detectedAt: '2027-01-08T10:00:00-04:00' },
  { id: 'VAL-003', containerId: 'MSCU-7842156', documentType: 'bill_of_lading', checkId: 'BL.CONSIGNEE.MATCHES.LC', severity: 'ok', status: 'passed', message: 'validations.blConsigneeOk', detectedAt: '2027-01-07T14:00:00-04:00' },
  { id: 'VAL-004', containerId: 'MSCU-7842156', documentType: 'phyto_certificate', checkId: 'PHYTO.SAG.SIGNATURE', severity: 'ok', status: 'passed', message: 'validations.phytoSigned', detectedAt: '2027-01-06T09:00:00-04:00' },
  { id: 'VAL-005', containerId: 'MSCU-7842156', documentType: 'packing_list', checkId: 'PL.WEIGHT.MATCHES.BL', severity: 'watch', status: 'warning', message: 'validations.weightDiscrepancy', detectedAt: '2027-01-08T11:00:00-04:00' },
  { id: 'VAL-006', containerId: 'MSCU-7842156', checkId: 'FUMIGATION.DATE.VALID', severity: 'ok', status: 'passed', message: 'validations.fumigationOk', detectedAt: '2027-01-05T09:00:00-04:00' },
  { id: 'VAL-007', containerId: 'MSCU-7842156', checkId: 'HEALTH.CERT.VALID', severity: 'ok', status: 'passed', message: 'validations.healthCertOk', detectedAt: '2027-01-05T10:00:00-04:00' },
  { id: 'VAL-008', containerId: 'MSCU-7842156', checkId: 'ORIGIN.CERT.SAG', severity: 'ok', status: 'passed', message: 'validations.originCertOk', detectedAt: '2027-01-04T15:00:00-04:00' },
  { id: 'VAL-009', containerId: 'MSCU-7842156', checkId: 'TRANSPORT.DOC.MATCH', severity: 'ok', status: 'passed', message: 'validations.transportDocOk', detectedAt: '2027-01-07T16:00:00-04:00' },
  { id: 'VAL-010', containerId: 'MSCU-7842156', checkId: 'CUTOFF.WARNING.18H', severity: 'risk', status: 'warning', message: 'validations.cutoffApproaching', detectedAt: '2027-01-09T09:00:00-04:00' },
  // Cherries (MAEU-9182734)
  { id: 'VAL-011', containerId: 'MAEU-9182734', checkId: 'COLD.TREATMENT.COMPLIANT', severity: 'ok', status: 'passed', message: 'validations.coldTreatmentOk', detectedAt: '2027-01-09T10:00:00-04:00' },
  { id: 'VAL-012', containerId: 'MAEU-9182734', checkId: 'LC.TERMS.MATCH.PO', severity: 'ok', status: 'passed', message: 'validations.lcTermsOk', detectedAt: '2026-12-28T10:00:00-04:00' },
  { id: 'VAL-013', containerId: 'MAEU-9182734', documentType: 'commercial_invoice', checkId: 'INV.AMOUNT.MATCHES.PO', severity: 'ok', status: 'passed', message: 'validations.invoiceMatchesPO', detectedAt: '2026-12-29T09:00:00-04:00' },
  { id: 'VAL-014', containerId: 'MAEU-9182734', documentType: 'phyto_certificate', checkId: 'PHYTO.GACC.REGISTERED', severity: 'ok', status: 'passed', message: 'validations.phytoGaccOk', detectedAt: '2026-12-28T14:00:00-04:00' },
  { id: 'VAL-015', containerId: 'MAEU-9182734', documentType: 'pti_certificate', checkId: 'REEFER.PTI.PASSED', severity: 'ok', status: 'passed', message: 'validations.ptiOk', detectedAt: '2026-12-29T18:00:00-04:00' },
  { id: 'VAL-016', containerId: 'MAEU-9182734', checkId: 'LOGGER.DATA.TRANSMITTED', severity: 'ok', status: 'passed', message: 'validations.loggerDataOk', detectedAt: '2027-01-09T09:00:00-04:00' },
  { id: 'VAL-017', containerId: 'MAEU-9182734', checkId: 'CA.GAS.TARGET.MET', severity: 'watch', status: 'warning', message: 'validations.caGasWatch', detectedAt: '2027-01-05T14:00:00Z' },
  { id: 'VAL-018', containerId: 'MAEU-9182734', checkId: 'BL.LC.CONSIGNEE.MATCH', severity: 'ok', status: 'passed', message: 'validations.blConsigneeOk', detectedAt: '2026-12-30T10:00:00-04:00' },
  { id: 'VAL-019', containerId: 'MAEU-9182734', checkId: 'LUNAR.NEW.YEAR.WINDOW', severity: 'info', status: 'warning', message: 'validations.lunarNewYearWindow', detectedAt: '2027-01-01T00:00:00Z' },
  { id: 'VAL-020', containerId: 'MAEU-9182734', checkId: 'INSURANCE.COVER.ADEQUATE', severity: 'ok', status: 'passed', message: 'validations.insuranceOk', detectedAt: '2026-12-29T11:00:00-04:00' },
  // Grapes (CMAU-9281744)
  { id: 'VAL-021', containerId: 'CMAU-9281744', checkId: 'COLD.STORAGE.COMPLIANT', severity: 'ok', status: 'passed', message: 'validations.coldStorageOk', detectedAt: '2027-01-09T07:00:00-04:00' },
  { id: 'VAL-022', containerId: 'CMAU-9281744', checkId: 'LC.TERMS.MATCH.PO', severity: 'ok', status: 'passed', message: 'validations.lcTermsOk', detectedAt: '2027-01-06T10:00:00-04:00' },
  { id: 'VAL-023', containerId: 'CMAU-9281744', documentType: 'commercial_invoice', checkId: 'INV.AMOUNT.MATCHES.PO', severity: 'ok', status: 'passed', message: 'validations.invoiceMatchesPO', detectedAt: '2027-01-07T09:00:00-04:00' },
  { id: 'VAL-024', containerId: 'CMAU-9281744', checkId: 'GACC.REGISTRATION.VALID', severity: 'ok', status: 'passed', message: 'validations.gaccOk', detectedAt: '2027-01-06T14:00:00-04:00' },
  { id: 'VAL-025', containerId: 'CMAU-9281744', checkId: 'TRANSPORT.DOC.MATCH', severity: 'ok', status: 'passed', message: 'validations.transportDocOk', detectedAt: '2027-01-08T11:00:00-04:00' },
];
