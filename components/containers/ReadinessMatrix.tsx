'use client';
import { useTranslations } from 'next-intl';
import type { DocumentRequirement, DocStatus, DocumentType } from '@/types';
import { DocumentStatusPill } from './DocumentStatusPill';

export interface ValidationSummaryRow {
  passed: number;
  failed: number;
  warnings: number;
}

interface Props {
  documents: DocumentRequirement[];
  documentStates: Record<DocumentType, DocStatus>;
  validationResults: Record<DocumentType, ValidationSummaryRow>;
}

export function ReadinessMatrix({ documents, documentStates, validationResults }: Props) {
  const t = useTranslations('docs');
  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-bg-2/50">
            <th className="text-left px-4 py-3 text-ink-3 font-medium w-8">#</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('colDocument')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('colStatus')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('colValidations')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('colDue')}</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((req, i) => {
            const status = documentStates[req.type] ?? 'missing';
            const valResult = validationResults[req.type] ?? { passed: 0, failed: 0, warnings: 0 };
            return (
              <tr key={req.type} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-ink-4">{i + 1}</td>
                <td className="px-4 py-3 text-ink-2 text-sm">{t(req.type as any)}</td>
                <td className="px-4 py-3"><DocumentStatusPill status={status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 text-xs font-mono">
                    {valResult.passed > 0 && <span className="text-severity-ok">✓{valResult.passed}</span>}
                    {valResult.warnings > 0 && <span className="text-severity-watch">⚠{valResult.warnings}</span>}
                    {valResult.failed > 0 && <span className="text-severity-crit">✗{valResult.failed}</span>}
                    {valResult.passed === 0 && valResult.warnings === 0 && valResult.failed === 0 && (
                      <span className="text-ink-4">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-3">{req.requiredBy}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
