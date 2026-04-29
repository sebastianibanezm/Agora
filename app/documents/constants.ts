import type { DocumentCategory, WorkflowDocType } from '@/types'

export const DOCUMENT_CATEGORIES: { key: DocumentCategory; types: WorkflowDocType[] }[] = [
  { key: 'commercial',    types: ['commercial_invoice', 'packing_list', 'lc_compliance_letter'] },
  { key: 'transport',     types: ['bill_of_lading'] },
  { key: 'phytosanitary', types: ['sag_export_auth', 'cold_treatment_cert'] },
  { key: 'customs',       types: ['certificate_of_origin', 'dus'] },
]
