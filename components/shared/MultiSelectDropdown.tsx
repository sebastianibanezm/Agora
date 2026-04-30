'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  placeholder: string;
  className?: string;
}

export function MultiSelectDropdown({ options, selected, onChange, placeholder, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const toggle = (value: string) => {
    const next = new Set(selected);
    next.has(value) ? next.delete(value) : next.add(value);
    onChange(next);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(new Set());
    setOpen(false);
  };

  const hasSelection = selected.size > 0;

  let label: string;
  if (!hasSelection) {
    label = placeholder;
  } else if (selected.size === 1) {
    const val = [...selected][0] as string;
    label = options.find((o) => o.value === val)?.label ?? val;
  } else {
    label = `${placeholder} (${selected.size})`;
  }

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex items-center gap-1.5 rounded-md border px-2 py-[7px] text-xs transition-colors focus:outline-none',
          hasSelection
            ? 'border-mint-500 bg-mint-500/8 text-mint-500'
            : 'border-[var(--line-soft)] bg-bg-1 text-ink-2 hover:text-ink-1',
          open && !hasSelection && 'border-mint-500',
        )}
      >
        <span className="whitespace-nowrap">{label}</span>
        {hasSelection ? (
          <X className="h-3 w-3 shrink-0 opacity-70" onClick={clearAll} />
        ) : (
          <ChevronDown className={clsx('h-3 w-3 shrink-0 transition-transform duration-150', open && 'rotate-180')} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-lg border border-[var(--line-soft)] bg-bg-2 py-1 shadow-lg">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 px-3 py-[7px] text-xs hover:bg-bg-3"
            >
              <input
                type="checkbox"
                checked={selected.has(opt.value)}
                onChange={() => toggle(opt.value)}
                className="h-[11px] w-[11px] accent-mint-500"
              />
              <span className={selected.has(opt.value) ? 'text-ink-1' : 'text-ink-2'}>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
