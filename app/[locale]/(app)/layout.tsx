import { AppShell } from '@/components/layout/AppShell'
import { CommandPaletteProvider } from '@/components/search/CommandPaletteProvider'
import { CommandPalette } from '@/components/search/CommandPalette'
import { Toaster } from '@/components/ui/toast'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommandPaletteProvider>
      <AppShell>{children}</AppShell>
      <Toaster />
      <CommandPalette />
    </CommandPaletteProvider>
  )
}
