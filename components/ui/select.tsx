'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputClass } from './input';

const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

function SelectTrigger({ className, children, ...props }: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(inputClass, 'flex items-center justify-between gap-2', className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-3.5 w-3.5 text-ink-3" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({ className, children, ...props }: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={6} className="isolate z-50 outline-none">
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            'min-w-[var(--anchor-width)] max-h-[var(--available-height)] overflow-y-auto rounded-md border border-[var(--line-soft)] bg-bg-2 p-1 text-sm text-ink-1 shadow-lg outline-none',
            'data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98]',
            'data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98]',
            'transition-all duration-150',
            className,
          )}
          {...props}
        >
          {children}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex cursor-pointer items-center rounded-sm py-1.5 pr-7 pl-2 text-sm text-ink-2 outline-none transition-colors',
        'data-[highlighted]:bg-white/5 data-[highlighted]:text-ink-1 data-[selected]:text-ink-1',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center">
        <Check className="h-3.5 w-3.5 text-mint-500" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
