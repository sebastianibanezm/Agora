import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Fraunces, Old_Standard_TT } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap', axes: ['opsz'] })
const oldStandard = Old_Standard_TT({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-old-standard',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.agenteagora.com'),
  title: {
    default: 'Agora — Export Intelligence para Exportadores',
    template: '%s | Agora',
  },
  description:
    'Agora es la plataforma operacional para exportadores de fruta y frutos secos. Automatiza documentos, detecta excepciones antes del cut-off y da visibilidad en tiempo real a todo tu equipo.',
  keywords: [
    'exportaciones Chile',
    'plataforma exportaciones',
    'export intelligence',
    'documentos exportación',
    'fruta exportación',
    'logística exportaciones',
    'BL',
    'bill of lading',
    'shipment intelligence',
  ],
  alternates: {
    canonical: 'https://www.agenteagora.com',
    languages: {
      es: 'https://www.agenteagora.com',
      en: 'https://www.agenteagora.com',
    },
  },
  openGraph: {
    title: 'Agora — Export Intelligence para Exportadores',
    description:
      'Plataforma operacional para exportadores de fruta y frutos secos. Automatiza documentos, detecta excepciones antes del cut-off y da visibilidad en tiempo real a todo tu equipo.',
    images: [{ url: 'https://www.agenteagora.com/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agora — Export Intelligence para Exportadores',
    description:
      'Plataforma operacional para exportadores de fruta y frutos secos. Automatiza documentos, detecta excepciones antes del cut-off y da visibilidad en tiempo real a todo tu equipo.',
    images: ['https://www.agenteagora.com/og-image.png'],
  },
  // Replace the empty string with your Google Search Console verification code after setup
  // verification: { google: 'PASTE_GSC_CODE_HERE' },
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <html lang={locale} className={`dark ${inter.variable} ${mono.variable} ${fraunces.variable} ${oldStandard.variable}`}>
      <body className="bg-bg-0 text-ink-1">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
