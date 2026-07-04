import { getTranslations } from 'next-intl/server'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Agente Agora LLC',
  alternateName: 'Agora',
  url: 'https://www.agenteagora.com',
  logo: 'https://www.agenteagora.com/agora-logo.png',
  email: 'hola@agenteagora.com',
  description:
    'Plataforma de gestión documental y operaciones para exportadores de fruta y frutos secos en Latinoamérica.',
  areaServed: ['CL', 'PE', 'EC', 'US'],
  contactPoint: {
    '@type': 'ContactPoint',
    url: 'https://www.agenteagora.com/#contact',
    email: 'hola@agenteagora.com',
    contactType: 'sales',
    availableLanguage: ['es', 'en'],
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Agora',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Export document management',
  operatingSystem: 'Web',
  inLanguage: ['es', 'en'],
  description:
    'Software de gestión documental para exportadores. Automatiza documentos de exportación (instructivo de embarque, BL, DUS, certificados), detecta errores antes del cut-off naviero y centraliza la coordinación de embarques y la cobranza.',
  featureList: [
    'Workflow documental por embarque con dependencias y estados',
    'Detección de errores y excepciones antes del cut-off naviero',
    'Captura automática desde correo, WhatsApp y documentos',
    'Cobranza y conciliación conectadas a los documentos de embarque',
    'Inteligencia comercial por cliente (OTIF, precio neto efectivo)',
  ],
  audience: {
    '@type': 'BusinessAudience',
    audienceType: 'Exportadores de fruta y frutos secos',
  },
  offers: {
    '@type': 'Offer',
    url: 'https://www.agenteagora.com/#contact',
  },
}

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'landing.faq' })

  // FAQPage schema built from the visible FAQ — keeps markup and content in sync
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: (['1', '2', '3', '4', '5'] as const).map((n) => ({
      '@type': 'Question',
      name: t(`q${n}`),
      acceptedAnswer: { '@type': 'Answer', text: t(`a${n}`) },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  )
}
