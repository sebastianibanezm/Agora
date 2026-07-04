import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Fraunces, Old_Standard_TT } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { SITE_URL, LOCALE_URLS } from '@/lib/seo'

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

const KEYWORDS: Record<string, string[]> = {
  es: [
    'software gestión documental exportación',
    'software para exportadores',
    'documentos de exportación',
    'instructivo de embarque',
    'software comercio exterior Chile',
    'exportación fruta Chile',
    'bill of lading',
    'DUS',
    'certificado fitosanitario',
  ],
  en: [
    'export document management software',
    'export documentation platform',
    'shipping instruction software',
    'fruit export software',
    'bill of lading management',
  ],
}

type MetaMessages = {
  landing: { meta: { title: string; titleDefault: string; description: string; ogDescription: string } }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const messages = (await getMessages({ locale })) as unknown as MetaMessages
  const meta = messages.landing.meta
  const canonical = LOCALE_URLS[locale] ?? SITE_URL

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: meta.titleDefault,
      template: '%s | Agora',
    },
    description: meta.description,
    keywords: KEYWORDS[locale] ?? KEYWORDS.es,
    alternates: {
      canonical,
      languages: {
        es: LOCALE_URLS.es,
        en: LOCALE_URLS.en,
        'x-default': LOCALE_URLS.es,
      },
    },
    openGraph: {
      title: meta.titleDefault,
      description: meta.ogDescription,
      url: canonical,
      siteName: 'Agora',
      images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.titleDefault,
      description: meta.ogDescription,
      images: [`${SITE_URL}/og-image.jpg`],
    },
    // Replace the empty string with your Google Search Console verification code after setup
    // verification: { google: 'PASTE_GSC_CODE_HERE' },
  }
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
