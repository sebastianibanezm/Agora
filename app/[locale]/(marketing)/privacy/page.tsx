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
  const document = getLegalDocument('privacy', locale)
  const canonical = `${SITE_URL}${legalPath(locale, 'privacy')}`

  return {
    title: { absolute: `${document.title} | Agora` },
    description: document.summary,
    alternates: {
      canonical,
      languages: {
        es: `${SITE_URL}${legalPath('es', 'privacy')}`,
        en: `${SITE_URL}${legalPath('en', 'privacy')}`,
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

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params
  const locale = normalizeLocale(requestedLocale)

  return <LegalDocumentPage document={getLegalDocument('privacy', locale)} />
}
