interface Props { overview: Record<string, string> }

function linkHref(id: string): string {
  return id.startsWith('PO-') ? `/purchase-orders/${id}` : `/containers/${id}`
}

export function DocumentOverview({ overview }: Props) {
  const entries = Object.entries(overview)
  return (
    <div className="grid grid-cols-3 gap-3">
      {entries.map(([label, value]) => {
        const isLink = value.startsWith('$link:')
        const displayValue = isLink ? value.slice(6) : value
        return (
          <div key={label}>
            <div className="text-[9px] uppercase tracking-wider text-ink-4 mb-0.5">{label}</div>
            {isLink ? (
              <a
                href={linkHref(displayValue)}
                className="font-mono text-[11px] text-sky-300 hover:text-sky-200 cursor-pointer"
              >
                {displayValue}
              </a>
            ) : (
              <div className="text-[11px] text-ink-1">{displayValue}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}
