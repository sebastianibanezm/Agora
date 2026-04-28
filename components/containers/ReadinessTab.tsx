'use client';
import type { Container, DocumentType, DocStatus } from '@/types';
import { getLaneProfile } from '@/lib/mock-data/lane-profiles';
import { documents } from '@/lib/mock-data/documents';
import { validations } from '@/lib/mock-data/validations';
import { ReadinessMatrix, type ValidationSummaryRow } from './ReadinessMatrix';

export function ReadinessTab({ container }: { container: Container }) {
  const lp = getLaneProfile(container.laneProfileId);

  // Build documentStates from documents mock
  const documentStates: Record<string, DocStatus> = {};
  for (const doc of documents.filter(d => d.containerId === container.id)) {
    documentStates[doc.type] = doc.status;
  }

  // Build validationResults from validations mock
  const validationResults: Record<string, ValidationSummaryRow> = {};
  for (const val of validations.filter(v => v.containerId === container.id)) {
    if (val.documentType) {
      const key = val.documentType;
      if (!validationResults[key]) validationResults[key] = { passed: 0, failed: 0, warnings: 0 };
      if (val.status === 'passed') validationResults[key].passed++;
      else if (val.status === 'warning') validationResults[key].warnings++;
      else validationResults[key].failed++;
    }
  }

  return (
    <ReadinessMatrix
      documents={lp.documentSet}
      documentStates={documentStates as Record<DocumentType, DocStatus>}
      validationResults={validationResults as Record<DocumentType, ValidationSummaryRow>}
    />
  );
}
