import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { CommandPaletteProvider } from '@/components/search/CommandPaletteProvider'
import { CommandPalette } from '@/components/search/CommandPalette'
import { Toaster } from '@/components/ui/toast'

// Product prototype pages — must never appear in search results or compete
// with the landing page for indexation.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommandPaletteProvider>
      <AppShell>{children}</AppShell>
      <Toaster />
      <CommandPalette />
    </CommandPaletteProvider>
  )
}
