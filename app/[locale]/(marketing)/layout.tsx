const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Agente Agora LLC',
  url: 'https://www.agenteagora.com',
  logo: 'https://www.agenteagora.com/agora-logo.png',
  description:
    'Plataforma de export intelligence para exportadores de fruta y frutos secos en Latinoamérica.',
  areaServed: ['CL', 'PE', 'EC', 'US'],
  contactPoint: {
    '@type': 'ContactPoint',
    url: 'https://www.agenteagora.com/#contacto',
    contactType: 'sales',
  },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Agora',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Plataforma operacional para exportadores. Automatiza documentos, detecta excepciones antes del cut-off naviero y centraliza la coordinación de embarques.',
  audience: {
    '@type': 'BusinessAudience',
    audienceType: 'Exportadores de fruta y frutos secos',
  },
  offers: {
    '@type': 'Offer',
    url: 'https://www.agenteagora.com/#contacto',
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
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
      {children}
    </>
  )
}
