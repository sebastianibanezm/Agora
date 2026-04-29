import type { PenaltyAvoidedRow, PenaltyEventType } from '@/types';

const COL_LABELS = ['Refumig.', 'Phyto Reissue', 'VGM Late', 'DUS Error', 'BL Correction', 'Demurrage', 'Detention', 'Bank Discrep.'];
const COL_KEYS: PenaltyEventType[] = ['refumigation', 'phyto_reissue', 'vgm_late', 'dus_error', 'bl_correction', 'demurrage', 'detention', 'bank_discrepancy'];

function cellClass(v: number): string {
  if (v === 0) return 'bg-bg-2 text-ink-4';
  if (v === 1) return 'bg-[rgba(0,230,150,0.10)] text-ink-3';
  if (v === 2) return 'bg-[rgba(0,230,150,0.22)] text-ink-2';
  if (v === 3) return 'bg-[rgba(0,230,150,0.40)] text-ink-1';
  return 'bg-mint-500 text-bg-0 font-semibold';
}

interface Props { matrix: PenaltyAvoidedRow[] }

export function PenaltyHeatmap({ matrix }: Props) {
  return (
    <div className="p-4">
      {/* Header row */}
      <div className="grid gap-[3px] mb-[3px]" style={{ gridTemplateColumns: '110px repeat(8, 1fr)' }}>
        <div /> {/* empty corner */}
        {COL_LABELS.map((label, i) => (
          <div
            key={i}
            data-testid="heatmap-col-header"
            className="font-mono text-[9px] text-ink-3 flex items-end justify-center pb-1"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 60 }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Buyer rows */}
      {matrix.map((row, ri) => (
        <div
          key={ri}
          data-testid="heatmap-row"
          className="grid gap-[3px] mb-[3px]"
          style={{ gridTemplateColumns: '110px repeat(8, 1fr)' }}
        >
          <span className="text-[10.5px] text-ink-2 flex items-center pr-2 truncate">{row.buyerName}</span>
          {COL_KEYS.map((key, ci) => {
            const v = row.counts[key] ?? 0;
            return (
              <div
                key={ci}
                className={`rounded-sm flex items-center justify-center text-[9px] font-mono ${cellClass(v)}`}
                style={{ aspectRatio: '2.2' }}
              >
                {v > 0 ? v : ''}
              </div>
            );
          })}
        </div>
      ))}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-ink-4">
          <span>LESS</span>
          {[0, 1, 2, 3, 4].map(v => (
            <div key={v} className={`h-3 w-3 rounded-sm ${cellClass(v)}`} />
          ))}
          <span>MORE</span>
        </div>
        <a href="/performance" className="font-mono text-[9px] text-mint-500 hover:text-mint-400">
          OPEN PERFORMANCE →
        </a>
      </div>
    </div>
  );
}
