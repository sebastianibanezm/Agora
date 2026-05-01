'use client';

import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { BookingStatus } from '@/types';
import clsx from 'clsx';

// Maps every BookingStatus to its kanban column step index (0–6).
// cancelled has no column on the board and renders nothing active.
const STATUS_TO_STEP: Record<BookingStatus, number> = {
  created: 0,          awaiting_si: 0,
  si_received: 1,
  si_failed: 2,
  si_validated: 3,
  esi_sent: 4,         draft_bl_received: 4,
  bl_validated: 5,
  bl_released: 6,      closed: 6,
  cancelled: -1,
};

interface StepDef {
  key: string;
  labelKey: string;
  isFailedBranch?: boolean;
}

const STEPS: StepDef[] = [
  { key: 'awaiting_si',       labelKey: 'awaiting_si' },
  { key: 'si_in_review',      labelKey: 'si_in_review' },
  { key: 'si_failed',         labelKey: 'si_failed',         isFailedBranch: true },
  { key: 'ready_to_send',     labelKey: 'ready_to_send' },
  { key: 'awaiting_dbl',      labelKey: 'awaiting_draft_bl' },
  { key: 'ready_to_release',  labelKey: 'ready_to_release' },
  { key: 'released',          labelKey: 'bl_released' },
];

interface Props {
  current: BookingStatus;
  className?: string;
}

export function BookingLifecycleStrip({ current, className }: Props) {
  const t = useTranslations('lifecycle');
  const trackRef = useRef<HTMLDivElement>(null);
  const activeDotRef = useRef<HTMLDivElement>(null);
  const [fillPct, setFillPct] = useState(0);

  const currentStep = STATUS_TO_STEP[current] ?? -1;
  const isFailed = current === 'si_failed';

  useEffect(() => {
    function update() {
      const dot = activeDotRef.current;
      const track = trackRef.current;
      if (!dot || !track) return;
      const dotRect = dot.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const dotCenter = dotRect.left + dotRect.width / 2;
      const pct = ((dotCenter - trackRect.left) / trackRect.width) * 100;
      setFillPct(Math.max(0, Math.min(100, pct)));
    }
    const observer = new ResizeObserver(update);
    if (trackRef.current) observer.observe(trackRef.current);
    update();
    return () => observer.disconnect();
  }, [currentStep]);

  return (
    <div className={clsx('relative', className)}>
      {/* Continuous track behind the dots */}
      <div
        ref={trackRef}
        className="absolute left-0 right-0 top-[5px] h-[2px] rounded-sm bg-[var(--line-soft)]"
      >
        <div
          className={clsx(
            'absolute left-0 top-0 h-full rounded-sm transition-[width] duration-300',
            isFailed ? 'bg-severity-crit/50' : 'bg-severity-ok/60',
          )}
          style={{ width: `${fillPct}%` }}
        />
      </div>

      {/* Step row */}
      <div className="relative flex justify-between">
        {STEPS.map((step, idx) => {
          const isActive        = idx === currentStep;
          const isReached       = !step.isFailedBranch && idx < currentStep;
          const isCurrent       = isActive && !step.isFailedBranch;
          const isFailedCurrent = isActive && !!step.isFailedBranch;
          const isGhost         = !!step.isFailedBranch && !isFailedCurrent;
          const isUnreached     = !isGhost && !isReached && !isCurrent && !isFailedCurrent;

          const alignClass =
            idx === 0
              ? 'items-start'
              : idx === STEPS.length - 1
              ? 'items-end'
              : 'items-center';

          return (
            <div key={step.key} className={clsx('flex flex-col', alignClass)}>
              {/* Dot */}
              <div
                ref={isActive ? activeDotRef : undefined}
                className={clsx(
                  'relative z-10 rounded-full border-2 transition-all duration-200',
                  isUnreached     && 'h-3 w-3 border-[var(--line-soft)] bg-bg-0',
                  isReached       && 'h-3 w-3 border-severity-ok bg-severity-ok/20',
                  isCurrent       && 'h-3.5 w-3.5 -mt-px border-severity-ok bg-severity-ok/30 shadow-[0_0_0_4px_rgba(74,222,128,0.12)]',
                  isFailedCurrent && 'h-3.5 w-3.5 -mt-px border-severity-crit bg-severity-crit/20 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]',
                  isGhost         && 'h-3 w-3 border-[var(--line-soft)] bg-transparent opacity-20',
                )}
              />

              {/* Column label */}
              <div
                className={clsx(
                  'mt-2.5 max-w-[58px] font-mono text-[10px] uppercase tracking-wide leading-snug',
                  idx === 0                 && 'text-left',
                  idx === STEPS.length - 1 && 'text-right',
                  idx !== 0 && idx !== STEPS.length - 1 && 'text-center',
                  isUnreached     && 'text-ink-4/40',
                  isReached       && 'text-ink-3',
                  isCurrent       && 'font-bold text-ink-1',
                  isFailedCurrent && 'font-bold text-severity-crit',
                  isGhost         && 'invisible',
                )}
              >
                {t(step.labelKey as Parameters<typeof t>[0])}
              </div>

              {/* Sub-badge — shown only on the active step */}
              <div className="mt-1.5 min-h-[18px] flex items-center">
                {isActive && (
                  <span
                    className={clsx(
                      'rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide',
                      isFailedCurrent
                        ? 'bg-severity-crit/10 text-severity-crit'
                        : 'bg-severity-ok/10 text-severity-ok',
                    )}
                  >
                    {current}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
