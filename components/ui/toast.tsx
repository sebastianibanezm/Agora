'use client';

import * as React from 'react';
import { Toast } from '@base-ui/react/toast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const toastManager = Toast.createToastManager();

interface ShortcutOptions {
  description?: React.ReactNode;
  duration?: number;
}

export const toast = {
  success: (title: React.ReactNode, opts: ShortcutOptions = {}) =>
    toastManager.add({ title, description: opts.description, type: 'success', timeout: opts.duration ?? 4000 }),
  info: (title: React.ReactNode, opts: ShortcutOptions = {}) =>
    toastManager.add({ title, description: opts.description, type: 'info', timeout: opts.duration ?? 4000 }),
  error: (title: React.ReactNode, opts: ShortcutOptions = {}) =>
    toastManager.add({ title, description: opts.description, type: 'error', timeout: opts.duration ?? 6000 }),
};

function ToastIcon({ type }: { type?: string }) {
  if (type === 'success') return <CheckCircle2 className="h-4 w-4 text-mint-500" />;
  if (type === 'error') return <AlertCircle className="h-4 w-4 text-severity-crit" />;
  return <Info className="h-4 w-4 text-severity-info" />;
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return (
    <>
      {toasts.map((t) => (
        <Toast.Root
          key={t.id}
          toast={t}
          className={cn(
            'pointer-events-auto absolute right-0 bottom-0 left-auto flex w-[360px] gap-3 rounded-lg border border-[var(--line-soft)] bg-bg-2/95 p-3 shadow-lg backdrop-blur',
            'data-[transition-status=starting]:opacity-0 data-[transition-status=starting]:translate-y-2',
            'data-[transition-status=ending]:opacity-0 data-[transition-status=ending]:translate-y-2',
            'transition-all duration-200',
          )}
          style={{
            transform: `translateY(calc(var(--toast-index) * -110%))`,
          }}
        >
          <ToastIcon type={t.type} />
          <div className="min-w-0 flex-1">
            <Toast.Title className="text-sm font-medium text-ink-1" />
            {t.description && (
              <Toast.Description className="mt-0.5 text-xs text-ink-2" />
            )}
          </div>
          <Toast.Close
            className="text-ink-3 transition-colors hover:text-ink-1"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </Toast.Close>
        </Toast.Root>
      ))}
    </>
  );
}

export function Toaster() {
  return (
    <Toast.Provider toastManager={toastManager} timeout={4000}>
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-4 z-50 flex w-[360px] flex-col gap-2 outline-none">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
