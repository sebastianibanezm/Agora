'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

function PopoverContent({
  className,
  sideOffset = 6,
  align = 'start',
  ...props
}: PopoverPrimitive.Popup.Props & { sideOffset?: number; align?: 'start' | 'center' | 'end' }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner sideOffset={sideOffset} align={align} className="isolate z-50 outline-none">
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            'rounded-md border border-[var(--line-soft)] bg-bg-2 p-3 text-sm text-ink-1 shadow-lg outline-none',
            'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity duration-150',
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverTrigger, PopoverContent };
