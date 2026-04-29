import type { ShipmentDocument } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  draft:        '#475063',
  submitted:    '#3B82F6',
  validating:   '#F59E0B',
  under_review: '#F97316',
  approved:     '#00E696',
  rejected:     '#EF4444',
}

interface Props {
  doc: ShipmentDocument
  provenance?: string
  statusLabel: string
  typeLabel: string
  onClick: () => void
}

export function DocumentRow({ doc, provenance, statusLabel, typeLabel, onClick }: Props) {
  const color = STATUS_COLORS[doc.status] ?? '#475063'
  const isOverdue = doc.dueDate && new Date(doc.dueDate) < new Date()
  return (
    <tr
      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-3 py-2.5 text-[11px] text-ink-1">
        {doc.name}
        {provenance && (
          <span className="ml-2 text-[9px] text-ink-4">· {provenance}</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-[10px] text-ink-3">{typeLabel}</td>
      <td className="px-3 py-2.5">
        <span
          className="text-[9px] px-1.5 py-0.5 rounded"
          style={{ color, background: color + '22', border: `1px solid ${color}44` }}
        >
          {statusLabel}
        </span>
      </td>
      <td className="px-3 py-2.5 font-mono text-[10px] text-ink-4">
        {new Date(doc.createdAt).toLocaleDateString('es-CL')}
      </td>
      <td className="px-3 py-2.5 font-mono text-[10px]" style={{ color: isOverdue ? '#EF4444' : '#475063' }}>
        {doc.dueDate ? new Date(doc.dueDate).toLocaleDateString('es-CL') : '—'}
      </td>
    </tr>
  )
}
