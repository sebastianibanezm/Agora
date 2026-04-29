import type { DocumentInstance, DocStatus } from '@/types';

interface Props { documents: DocumentInstance[] }

export function PODocumentSection({ documents }: Props) {
  const sections = [
    { key: 'approved',       label: 'Listo',       borderColor: '#00E696', statuses: ['approved'] as DocStatus[] },
    { key: 'pending_review', label: 'En Revisión', borderColor: '#3B82F6', statuses: ['pending_review'] as DocStatus[] },
    { key: 'pending',        label: 'Pendiente',   borderColor: '#F59E0B', statuses: ['draft', 'missing'] as DocStatus[] },
  ];

  return (
    <section>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>Documentos</h2>
      {sections.map(s => {
        const docs = documents.filter(d => (s.statuses as string[]).includes(d.status));
        if (docs.length === 0) return null;
        return (
          <div key={s.key} style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '12px', color: s.borderColor, marginBottom: '8px', fontWeight: 600 }}>{s.label}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {docs.map(doc => (
                <div key={doc.id} style={{ background: '#1a1f2e', borderTop: `2px solid ${s.borderColor}`, borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 500 }}>{doc.type.replace(/_/g, ' ')}</div>
                  {doc.issuedAt && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      {new Date(doc.issuedAt).toLocaleDateString('es-CL')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
