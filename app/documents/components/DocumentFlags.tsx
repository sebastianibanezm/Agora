import type { ValidationFlag, WorkflowDocType } from '@/types'

interface Props {
  flags: ValidationFlag[]
  typeLabel: (type: WorkflowDocType) => string
}

export function DocumentFlags({ flags, typeLabel }: Props) {
  if (flags.length === 0) return null
  return (
    <div>
      {flags.map((flag, i) => (
        <div
          key={i}
          className="rounded-md p-3 mb-2 last:mb-0"
          style={{
            background: 'var(--color-bg-2)',
            borderLeft: `3px solid ${flag.severity === 'error' ? '#EF4444' : '#F59E0B'}`,
          }}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className="text-[10px] font-semibold"
              style={{ color: flag.severity === 'error' ? '#EF4444' : '#F59E0B' }}
            >
              {typeLabel(flag.conflictingDocType)}
            </span>
            <span className="font-mono text-[9px] text-ink-4 shrink-0 ml-2">
              {new Date(flag.detectedAt).toLocaleDateString('es-CL')}
            </span>
          </div>
          <p className="text-[10px] text-ink-2 leading-relaxed">{flag.message}</p>
        </div>
      ))}
    </div>
  )
}
