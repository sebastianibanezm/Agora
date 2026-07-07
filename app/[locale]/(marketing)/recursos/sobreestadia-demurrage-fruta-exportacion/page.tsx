import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE_URL } from '@/lib/seo'
import { ARTICLES, articleUrl } from '@/lib/articles'
import { RecursosHeader } from '@/components/recursos/RecursosHeader'
import { LandingFooter } from '@/components/landing/LandingFooter'

const article = ARTICLES.find((a) => a.slug === 'sobreestadia-demurrage-fruta-exportacion')!
const SOURCE_URL = 'https://www.portalfruticola.com/noticias/2026/01/19/exportar-fruta-2026/'

export const metadata: Metadata = {
  title: {
    absolute: 'Sobreestadía y demurrage: el costo oculto que nace de un documento atrasado | Agora',
  },
  description:
    'El demurrage supera los USD 400 por contenedor y por día, y casi siempre empieza en un documento con un error o una demora, no en la naviera. Cómo funciona la sobreestadía, por qué golpea al agro chileno y qué se puede controlar desde el flujo documental.',
  alternates: { canonical: articleUrl(article) },
  openGraph: {
    title: article.title,
    description: article.excerpt,
    url: articleUrl(article),
    siteName: 'Agora',
    type: 'article',
    publishedTime: article.datePublished,
    images: [{ url: `${SITE_URL}${article.hero}` }],
    locale: 'es_CL',
  },
  twitter: {
    card: 'summary_large_image',
    title: article.title,
    description: article.excerpt,
    images: [`${SITE_URL}${article.hero}`],
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.excerpt,
  image: `${SITE_URL}${article.hero}`,
  datePublished: article.datePublished,
  inLanguage: 'es',
  author: { '@type': 'Organization', name: 'Agora', url: SITE_URL },
  publisher: {
    '@type': 'Organization',
    name: 'Agente Agora LLC',
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/agora-logo.png` },
  },
  mainEntityOfPage: articleUrl(article),
  citation: SOURCE_URL,
}

const h2Style: React.CSSProperties = {
  fontFamily: 'var(--font-family-display)',
  fontStyle: 'italic',
  fontWeight: 400,
  fontSize: 'clamp(24px, 2.4vw, 30px)',
  lineHeight: 1.15,
  color: '#2B1F12',
  margin: '44px 0 16px',
}

const pStyle: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: 1.75,
  color: '#4A3C2C',
  margin: '0 0 20px',
}

const liStyle: React.CSSProperties = {
  fontSize: '15.5px',
  lineHeight: 1.7,
  color: '#4A3C2C',
  marginBottom: '10px',
}

export default function SobreestadiaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <RecursosHeader />

      <main className="max-w-[860px] mx-auto px-5 sm:px-8 pb-24">
        {/* Article head */}
        <div className="pt-14 pb-8">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="inline-flex px-[10px] py-[3px] rounded-full text-[9.5px] uppercase tracking-[0.10em]"
              style={{
                fontFamily: 'var(--font-family-mono)',
                color: '#5A4A38',
                background: '#F1E8D5',
                border: '1px solid rgba(60,42,22,0.10)',
              }}
            >
              {article.tag}
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.10em]"
              style={{ fontFamily: 'var(--font-family-mono)', color: '#B5A586' }}
            >
              {article.dateLabel} · {article.readingMinutes} min de lectura
            </span>
          </div>
          <h1
            className="italic font-normal m-0"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(30px, 3.8vw, 44px)',
              lineHeight: 1.12,
              letterSpacing: '-0.015em',
              color: '#2B1F12',
            }}
          >
            La sobreestadía casi nunca empieza en el puerto
          </h1>
          <p className="text-[17px] leading-[1.7] m-0 mt-5" style={{ color: '#5A4A38' }}>
            El demurrage se cobra en el puerto, pero se origina mucho antes: en un BL con un dato mal puesto,
            en un certificado que llegó tarde, en una instrucción de embarque que nadie confirmó. Para las
            exportadoras chilenas de fruta, el eslabón documental es donde más plata se pierde sin que nadie
            la vea salir.
          </p>
        </div>

        {/* Hero image */}
        <figure className="m-0 mb-12">
          <div
            className="overflow-hidden rounded-[14px]"
            style={{ border: '1px solid rgba(60,42,22,0.10)', boxShadow: '0 16px 48px rgba(43,31,18,0.14)' }}
          >
            <Image
              src={article.hero}
              alt={article.heroAlt}
              width={732}
              height={419}
              priority
              className="block w-full h-auto"
              sizes="(max-width: 900px) 100vw, 860px"
            />
          </div>
        </figure>

        {/* Body */}
        <article style={{ maxWidth: '68ch' }}>
          <h2 style={h2Style}>Demurrage y detención: qué es cada uno</h2>
          <p style={pStyle}>
            Los términos se confunden, pero apuntan a cobros distintos de la naviera:
          </p>
          <ul style={{ paddingLeft: '22px', margin: '0 0 20px' }}>
            <li style={liStyle}>
              <strong>Sobreestadía (demurrage):</strong> se cobra cuando el contenedor permanece dentro del
              recinto portuario más allá del tiempo libre pactado. Se factura por día.
            </li>
            <li style={liStyle}>
              <strong>Detención (detention):</strong> se cobra cuando el contenedor sale del puerto pero se
              retiene fuera —en el packing, en un depósito— más días de los permitidos.
            </li>
          </ul>
          <p style={pStyle}>
            En ambos casos el reloj corre por día y por contenedor. Como recuerda el análisis de{' '}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#B25028' }}>
              Portal Frutícola
            </a>
            , en 2026 la logística dejó de ser un soporte para transformarse en estrategia: producir y
            exportar mucha fruta ya no basta si el costo logístico se come el margen.
          </p>

          <h2 style={h2Style}>Por qué el origen suele ser documental</h2>
          <p style={pStyle}>
            La imagen habitual del demurrage es la de un puerto congestionado, y la congestión existe. Pero
            en la operación diaria, una parte enorme de la sobreestadía no la provoca la falta de espacio:
            la provoca un documento que no estaba listo o no estaba correcto cuando la carga lo necesitaba.
          </p>
          <p style={pStyle}>
            Un BL emitido con el consignatario equivocado hay que corregirlo, y mientras se corrige el
            contenedor espera. Un certificado fitosanitario que llega tarde retrasa la presentación de
            documentos. Un telex release que no se libera porque el pago no está confirmado deja la carga
            retenida. Cada uno de esos eventos convierte horas de descuido documental en días de cobro.
          </p>

          <h2 style={h2Style}>Cuánto cuesta de verdad</h2>
          <p style={pStyle}>
            Los números se acumulan rápido. Una corrección de BL cuesta del orden de{' '}
            <strong>USD 100 a 150</strong>; el demurrage portuario supera los <strong>USD 400 por día</strong>{' '}
            y por contenedor. En un embarque de varios contenedores, dos o tres días de sobreestadía por un
            documento mal armado pueden borrar el margen de toda la operación.
          </p>
          <p style={pStyle}>
            El problema es que ese costo casi nunca se atribuye a su causa real. Se contabiliza como «gasto
            logístico» o «demurrage», no como «error documental» — y por eso rara vez se corrige de raíz. Se
            paga temporada tras temporada como si fuera inevitable.
          </p>

          <h2 style={h2Style}>La temporada récord subió la apuesta</h2>
          <p style={pStyle}>
            La campaña récord de cerezas dejó claro que ya no hay margen para el error. Con volúmenes en
            máximos históricos, ventanas de embarque ajustadas a fechas críticas de destino y navieras
            operando al límite, un contenedor detenido por un papel ya no es solo un costo: puede significar
            perder la conexión a la nave y llegar tarde a un mercado que paga por la fecha exacta.
          </p>
          <p style={pStyle}>
            Cuando el volumen crece y los plazos se aprietan, el eslabón documental deja de ser un trámite y
            pasa a ser un punto de falla que se paga caro.
          </p>

          <h2 style={h2Style}>Qué sí se puede controlar</h2>
          <p style={pStyle}>
            La congestión portuaria está fuera del alcance del exportador. El estado y la calidad de los
            documentos, no. Reducir la sobreestadía de origen documental pasa por tres cosas concretas:
          </p>
          <ul style={{ paddingLeft: '22px', margin: '0 0 20px' }}>
            <li style={liStyle}>
              <strong>Visibilidad del cut-off:</strong> saber en todo momento qué documento falta, cuál está
              en riesgo y cuánto queda para la fecha límite de la naviera.
            </li>
            <li style={liStyle}>
              <strong>Validación antes de emitir:</strong> que los datos del BL, la factura, el packing list
              y los certificados cuadren entre sí <em>antes</em> de que la carga llegue al puerto, no después.
            </li>
            <li style={liStyle}>
              <strong>Un dueño y un estado por documento:</strong> que nada quede «en el aire» en una bandeja
              de correo o un WhatsApp sin responsable claro.
            </li>
          </ul>
          <p style={pStyle}>
            Ninguna de esas tres cosas mueve un contenedor más rápido por sí sola. Lo que hacen es evitar que
            el contenedor se detenga por una razón evitable — que es donde vive el costo oculto de la
            sobreestadía.
          </p>

          <p style={{ ...pStyle, fontSize: '13px', color: '#8A7860', fontStyle: 'italic' }}>
            Este artículo es un análisis informativo. Los montos son referenciales del mercado y varían según
            naviera, ruta y contrato. Fuente:{' '}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#8A7860' }}>
              Portal Frutícola — «Exportar fruta en 2026: cuando la logística deja de ser soporte y se
              transforma en estrategia»
            </a>
            .
          </p>
        </article>

        {/* CTA */}
        <div className="mt-14 rounded-[14px] p-8 lg:p-10" style={{ background: '#2B1F12' }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2
                className="m-0"
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontWeight: 300,
                  fontSize: 'clamp(22px, 2.4vw, 30px)',
                  lineHeight: 1.15,
                  color: '#F8F2E4',
                }}
              >
                ¿Cuántos días de demurrage pagaste
                <br />
                <span className="italic" style={{ color: '#B97A1F' }}>por un documento atrasado?</span>
              </h2>
              <p
                className="m-0 mt-3 text-[14px] leading-[1.6]"
                style={{ color: 'rgba(248,242,228,0.75)', maxWidth: '52ch' }}
              >
                Agora muestra el estado de cada documento del embarque contra el cut-off y detecta los
                descuadres antes de que se conviertan en sobreestadía — el costo que hoy pagas sin verlo.
              </p>
            </div>
            <Link
              href="/#contact"
              className="cta-solid inline-flex items-center gap-[8px] font-medium text-[14px] flex-shrink-0 btn-press self-start lg:self-auto"
              style={{ height: '46px', padding: '0 24px', borderRadius: '999px' }}
            >
              Agenda una demo <ArrowRight size={15} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </>
  )
}
