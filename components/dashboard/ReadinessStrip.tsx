import { differenceInCalendarDays } from 'date-fns';
import type { Container, DocumentInstance, Importer } from '@/types';
import { getTodayDemo } from '@/lib/utils/dates';

interface Props {
  containers: Container[];
  documents: DocumentInstance[];
  importers: Importer[];
}

const TODAY = getTodayDemo();

function daysUntilEtd(etd: string): number {
  return differenceInCalendarDays(new Date(etd), TODAY);
}

function cellColor(status: string): string {
  if (status === 'approved') return 'bg-severity-ok';
  if (status === 'pending_review' || status === 'draft') return 'bg-severity-watch';
  if (status === 'missing' || status === 'rejected') return 'bg-severity-crit';
  return 'bg-ink-4 opacity-40';
}

export function ReadinessStrip({ containers, documents, importers }: Props) {
  const window = containers.filter(c => {
    const d = daysUntilEtd(c.etd);
    return d >= 0 && d <= 7;
  });

  return (
    <div className="flex gap-2.5 overflow-x-auto px-3.5 py-3.5">
      {window.map(c => {
        const docs = documents.filter(d => d.containerId === c.id);
        const total = docs.length || 1;
        const approved = docs.filter(d => d.status === 'approved').length;
        const pct = Math.round((approved / total) * 100);
        const buyer = importers.find(i => i.id === c.importerId)?.name ?? '—';

        // Pad to 15 cells
        const padded: Array<{ status: string }> = [
          ...docs.slice(0, 15).map(d => ({ status: d.status })),
        ];
        while (padded.length < 15) padded.push({ status: 'none' });

        const pctColor =
          pct >= 80
            ? 'text-severity-ok'
            : pct >= 60
              ? 'text-severity-watch'
              : 'text-severity-crit';
        const daysLeft = daysUntilEtd(c.etd);

        return (
          <div
            key={c.id}
            data-testid="ready-mini"
            className="flex-shrink-0 bg-bg-2 border border-[var(--line-soft)] rounded-lg p-3"
            style={{ width: 200 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-[11px] text-ink-1">{c.id}</span>
              <span
                data-testid="ready-pct"
                className={`font-mono text-[11px] font-semibold ${pctColor}`}
              >
                {pct}%
              </span>
            </div>
            <div className="text-[11px] text-ink-3 mb-2 truncate">{buyer}</div>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {padded.map((doc, i) => (
                <div
                  key={i}
                  data-testid="ready-cell"
                  className={`rounded-sm ${cellColor(doc.status)}`}
                  style={{ aspectRatio: '1' }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-[9px] text-ink-4">T-{daysLeft}</span>
              <span className="font-mono text-[9px] text-ink-4">
                {new Date(c.etd).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
