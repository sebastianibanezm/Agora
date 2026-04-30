'use client';

import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@/lib/utils';

export const inputClass =
  'flex h-9 w-full rounded-md border border-[var(--line-soft)] bg-bg-2 px-3 py-1.5 text-sm text-ink-1 placeholder:text-ink-3 outline-none transition-colors hover:border-[var(--line-mid)] focus-visible:border-mint-500 focus-visible:ring-1 focus-visible:ring-mint-500/40 disabled:cursor-not-allowed disabled:opacity-50';

function Input({ className, ...props }: InputPrimitive.Props) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(inputClass, className)}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(inputClass, 'min-h-[80px] py-2', className)}
      {...props}
    />
  );
}

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="label"
      className={cn('mb-1.5 block font-mono text-[10px] tracking-wider text-ink-3 uppercase', className)}
      {...props}
    />
  );
}

export { Input, Textarea, Label };
