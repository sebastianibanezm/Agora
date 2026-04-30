'use client';

import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { cn } from '@/lib/utils';

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  );
}

function RadioItem({
  className,
  children,
  value,
  ...props
}: Omit<RadioPrimitive.Root.Props, 'children'> & { children?: React.ReactNode; value: string }) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2 text-sm text-ink-2 hover:text-ink-1', className)}>
      <RadioPrimitive.Root
        value={value}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[var(--line-mid)] bg-bg-2 outline-none data-[checked]:border-mint-500 data-[checked]:bg-mint-500/10"
        {...props}
      >
        <RadioPrimitive.Indicator className="h-2 w-2 rounded-full bg-mint-500 data-[unchecked]:hidden" />
      </RadioPrimitive.Root>
      {children}
    </label>
  );
}

export { RadioGroup, RadioItem };
