import type { Metadata } from 'next'
import { LegalDocumentPage, legalPath } from '@/components/legal/LegalDocumentPage'
import { getLegalDocument, type LegalLocale } from '@/lib/legal-content'
import { SITE_URL } from '@/lib/seo'

function normalizeLocale(locale: string): LegalLocale {
  return locale === 'en' ? 'en' : 'es'
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: requestedLocale } = await params
  const locale = normalizeLocale(requestedLocale)
  const document = getLegalDocument('terms', locale)
  const canonical = `${SITE_URL}${legalPath(locale, 'terms')}`

  return {
    title: { absolute: `${document.title} | Agora` },
    description: document.summary,
    alternates: {
      canonical,
      languages: {
        es: `${SITE_URL}${legalPath('es', 'terms')}`,
        en: `${SITE_URL}${legalPath('en', 'terms')}`,
      },
    },
    openGraph: {
      title: document.title,
      description: document.summary,
      url: canonical,
      siteName: 'Agora',
      locale: locale === 'es' ? 'es_CL' : 'en_US',
      type: 'website',
    },
  }
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params
  const locale = normalizeLocale(requestedLocale)

  return <LegalDocumentPage document={getLegalDocument('terms', locale)} />
}
