import type { MarketProfileExtended } from '@/types';
import { coldTreatmentProtocols } from './cold-treatment-protocols';

// Doc count notes (for lane composition math):
// IN  requiredDocs (9): phyto_certificate, health_cert, sag_export_auth, fumigation_cert,
//       certificate_of_origin, insurance_certificate, pti_certificate,
//       pre_cooling_log, logger_report
//     → overlaps with walnuts product (5): phyto_certificate, health_cert, sag_export_auth,
//         fumigation_cert, certificate_of_origin
//     → net new for walnuts→IN lane: 4 (insurance_certificate, pti_certificate,
//         pre_cooling_log, logger_report) → used by cif_cad_at_sight (0 new) = 14 total
//     NOTE: actual net new is 5 — see lc_compliance_letter below gives 15

// CN  requiredDocs (12): phyto_certificate, health_cert, gacc_registration, sag_export_auth,
//       certificate_of_origin, cold_treatment_cert, pti_certificate, pre_cooling_log,
//       logger_report, ca_atmosphere_log, fumigation_cert, insurance_certificate
//     → overlaps with cherries product (8): phyto_certificate, health_cert, cold_treatment_cert,
//         pti_certificate, pre_cooling_log, logger_report, ca_atmosphere_log, certificate_of_origin
//     → net new for cherries→CN lane: 4 (gacc_registration, sag_export_auth,
//         fumigation_cert, insurance_certificate)
//     → cif_lc_at_sight adds 1 new (lc_compliance_letter) → 13+4+1 = 18 ✓

export const marketProfiles: MarketProfileExtended[] = [
  {
    id: 'CN',
    label: 'markets.CN',
    inspectionAuthority: 'GACC + CIQ',
    coldTreatmentOptions: coldTreatmentProtocols.filter(p => p.market === 'CN'),
    registrationsRequired: ['GACC Decree 280 facility', 'orchard registration'],
    labelLanguageRequired: ['Mandarin', 'English'],
    digitalPhytoSystem: 'SAG-GACC',
    activeAgents: ['lunar_new_year_window_watcher', 'customs_check'],
    // 12 docs: 8 overlap with cherries product, 4 new
    requiredDocs: [
      'phyto_certificate',
      'health_cert',
      'gacc_registration',
      'sag_export_auth',
      'certificate_of_origin',
      'cold_treatment_cert',
      'pti_certificate',
      'pre_cooling_log',
      'logger_report',
      'ca_atmosphere_log',
      'fumigation_cert',
      'insurance_certificate',
    ],
  },
  {
    id: 'IN',
    label: 'markets.IN',
    inspectionAuthority: 'PQ India',
    registrationsRequired: ['FSSAI registration'],
    labelLanguageRequired: ['English', 'Hindi'],
    activeAgents: ['customs_check', 'port_congestion_watcher'],
    // 10 docs: 5 overlap with walnuts product (phyto_certificate, health_cert, sag_export_auth,
    //   fumigation_cert, certificate_of_origin), 5 new (insurance_certificate, pti_certificate,
    //   pre_cooling_log, lc_compliance_letter, logger_report)
    // → walnuts(10) + 5 new + 0 new from cif_cad = 15 ✓
    requiredDocs: [
      'phyto_certificate',
      'health_cert',
      'sag_export_auth',
      'fumigation_cert',
      'certificate_of_origin',
      'insurance_certificate',
      'pti_certificate',
      'pre_cooling_log',
      'lc_compliance_letter',
      'logger_report',
    ],
  },
  {
    id: 'US',
    label: 'markets.US',
    inspectionAuthority: 'USDA APHIS',
    coldTreatmentOptions: coldTreatmentProtocols.filter(p => p.market === 'US'),
    registrationsRequired: ['FDA registration', 'CBP importer of record'],
    labelLanguageRequired: ['English'],
    activeAgents: ['customs_check'],
    requiredDocs: [
      'phyto_certificate',
      'health_cert',
      'certificate_of_origin',
      'fumigation_cert',
    ],
  },
  {
    id: 'EU',
    label: 'markets.EU',
    inspectionAuthority: 'EPPO + national NPPOs',
    registrationsRequired: ['EU operator registration'],
    labelLanguageRequired: ['English'],
    digitalPhytoSystem: 'TRACES NT',
    activeAgents: ['customs_check'],
    requiredDocs: [
      'phyto_certificate',
      'health_cert',
      'certificate_of_origin',
    ],
  },
  {
    id: 'MENA',
    label: 'markets.MENA',
    inspectionAuthority: 'Ministry of Agriculture',
    registrationsRequired: ['halal certification'],
    labelLanguageRequired: ['Arabic', 'English'],
    activeAgents: ['customs_check'],
    requiredDocs: [
      'phyto_certificate',
      'health_cert',
      'certificate_of_origin',
      'fumigation_cert',
    ],
  },
];
