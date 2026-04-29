'use client';
import { useTranslations } from 'next-intl';
import type { Container } from '@/types';
import { documents } from '@/lib/mock-data/documents';
import { DocumentStatusPill } from './DocumentStatusPill';
import { formatDate } from '@/lib/utils/dates';
import { DocumentsSection } from '@/components/documents/DocumentsSection';

export function DocumentsTab({ container }: { container: Container }) {
  const t = useTranslations();
  const containerDocs = documents.filter(d => d.containerId === container.id);

  return (
    <>
    <div className="rounded-md border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-bg-2/50">
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('containers.id')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('docs.colDocument')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('docs.colNumber')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('docs.colIssuer')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('containers.status')}</th>
            <th className="text-left px-4 py-3 text-ink-3 font-medium">{t('docs.colIssued')}</th>
          </tr>
        </thead>
        <tbody>
          {containerDocs.map(doc => (
            <tr key={doc.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-ink-3">{doc.id}</td>
              <td className="px-4 py-3 text-ink-2">{t(`docs.${doc.type}`)}</td>
              <td className="px-4 py-3 font-mono text-xs text-ink-3">{doc.number ?? '—'}</td>
              <td className="px-4 py-3 text-ink-3 text-xs">{doc.issuer ?? '—'}</td>
              <td className="px-4 py-3"><DocumentStatusPill status={doc.status} /></td>
              <td className="px-4 py-3 font-mono text-xs text-ink-3">
                {doc.issuedAt ? formatDate(doc.issuedAt, 'es') : '—'}
              </td>
            </tr>
          ))}
          {containerDocs.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-6 text-center text-ink-4">{t('common.empty')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
    <div className="mt-8">
      <DocumentsSection ownerId={container.id} ownerType="container" perspective="container" />
    </div>
    </>
  );
}
