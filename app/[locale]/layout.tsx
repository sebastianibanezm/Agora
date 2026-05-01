import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from '@/components/ui/toast';
import { routing } from '@/i18n/routing';
import { CommandPaletteProvider } from '@/components/search/CommandPaletteProvider';
import { CommandPalette } from '@/components/search/CommandPalette';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap', axes: ['opsz'] });

export const metadata: Metadata = { title: 'Agora', description: 'Export operations platform' };

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`dark ${inter.variable} ${mono.variable} ${fraunces.variable}`}>
      <body className="bg-bg-0 text-ink-1">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CommandPaletteProvider>
            <AppShell>{children}</AppShell>
            <Toaster />
            <CommandPalette />
          </CommandPaletteProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
