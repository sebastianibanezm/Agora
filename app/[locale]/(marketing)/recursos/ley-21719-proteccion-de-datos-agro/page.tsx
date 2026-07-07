import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE_URL } from '@/lib/seo'
import { ARTICLES, articleUrl } from '@/lib/articles'
import { RecursosHeader } from '@/components/recursos/RecursosHeader'
import { RelatedArticles } from '@/components/recursos/RelatedArticles'
import { LandingFooter } from '@/components/landing/LandingFooter'

const article = ARTICLES.find((a) => a.slug === 'ley-21719-proteccion-de-datos-agro')!
const SOURCE_URL =
  'https://frutasdechile.cl/news/ley-21-719-el-nuevo-desafio-regulatorio-que-obligara-al-agro-a-ordenar-sus-datos-antes-de-diciembre-2026/'

export const metadata: Metadata = {
  title: { absolute: 'Ley 21.719: el agro debe ordenar sus datos antes de diciembre 2026 | Agora' },
  description:
    'La nueva ley chilena de protección de datos personales rige desde el 1 de diciembre de 2026, con multas de hasta 20.000 UTM. Qué significa para exportadoras, packings y sus proveedores, y por dónde empezar.',
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

export default function Ley21719Page() {
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
            Ley 21.719: el nuevo desafío regulatorio que obliga al agro a ordenar sus datos
          </h1>
          <p className="text-[17px] leading-[1.7] m-0 mt-5" style={{ color: '#5A4A38' }}>
            El 1 de diciembre de 2026 entra en vigencia la nueva ley chilena de protección de datos
            personales. Para exportadoras, packings y sus proveedores, el mensaje es directo: hay que saber
            qué datos se manejan, dónde viven y quién accede a ellos — y quedan pocos meses para ordenarlo.
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
          <h2 style={h2Style}>Qué es la Ley 21.719</h2>
          <p style={pStyle}>
            La Ley 21.719 moderniza el régimen chileno de protección de datos personales y crea una nueva
            autoridad fiscalizadora: la Agencia de Protección de Datos Personales. A partir del{' '}
            <strong>1 de diciembre de 2026</strong>, toda empresa que trate datos de personas — trabajadores,
            clientes, proveedores, contactos comerciales — deberá hacerlo bajo principios exigibles de
            licitud, finalidad, proporcionalidad, calidad, seguridad, transparencia y responsabilidad.
          </p>
          <p style={pStyle}>
            Como reporta{' '}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#B25028' }}>
              Frutas de Chile
            </a>
            , el agro está directamente dentro del alcance: exportadoras, packings, centros de proceso,
            contratistas y proveedores tecnológicos manejan a diario datos de trabajadores (contratos,
            información bancaria, registros biométricos de asistencia, datos de salud ocupacional), de
            productores y de clientes en decenas de mercados.
          </p>

          <h2 style={h2Style}>Por qué toca de lleno a la operación de exportación</h2>
          <p style={pStyle}>
            En una exportadora, los datos personales no viven solo en recursos humanos. Viven en el flujo
            documental de cada embarque: consignatarios y notify parties en el BL, contactos comerciales en
            contratos e instructivos, firmas y correos en la correspondencia operacional, registros de
            aplicaciones fitosanitarias asociados a cuadrillas, planillas con datos de productores. Cada
            temporada, ese material se multiplica por decenas de embarques y se dispersa entre correos,
            WhatsApp y archivos Excel.
          </p>
          <p style={pStyle}>
            Esa dispersión es exactamente el problema que la ley pone bajo lupa: si no puedes decir qué datos
            tienes, dónde están y quién accede a ellos, tampoco puedes cumplir las nuevas obligaciones de
            seguridad, acceso y respuesta ante incidentes.
          </p>

          <h2 style={h2Style}>Las obligaciones concretas</h2>
          <ul style={{ paddingLeft: '22px', margin: '0 0 20px' }}>
            <li style={liStyle}>
              <strong>Mapear los datos:</strong> identificar todos los puntos donde la empresa recolecta y
              almacena información personal — desde el packing hasta la documentación de embarque.
            </li>
            <li style={liStyle}>
              <strong>Asegurar el acceso:</strong> medidas de seguridad y control de acceso por rol; no todo
              el mundo puede ver todo.
            </li>
            <li style={liStyle}>
              <strong>Protocolos de incidentes:</strong> obligación de reportar vulneraciones de seguridad a
              la Agencia cuando exista riesgo para las personas.
            </li>
            <li style={liStyle}>
              <strong>Contratos con terceros:</strong> revisar los acuerdos con proveedores y contratistas
              que procesan datos por cuenta de la empresa.
            </li>
            <li style={liStyle}>
              <strong>Retención y respaldo:</strong> políticas claras de cuánto tiempo se guarda cada dato y
              respaldos que lo garanticen.
            </li>
            <li style={liStyle}>
              <strong>Capacitación:</strong> equipos entrenados en el manejo correcto de la información.
            </li>
          </ul>

          <h2 style={h2Style}>Las multas no son simbólicas</h2>
          <p style={pStyle}>
            Las infracciones se clasifican en leves, graves y gravísimas, con sanciones que van desde
            amonestaciones hasta multas de <strong>20.000 UTM — del orden de USD 1,4 millones</strong> — y,
            para reincidentes, multas calculadas como porcentaje de los ingresos anuales. Para una exportadora
            mediana, una sola infracción grave puede costar más que la utilidad de una temporada completa.
          </p>

          <h2 style={h2Style}>Por dónde empezar (antes de diciembre)</h2>
          <p style={pStyle}>
            El consenso de los especialistas citados por Frutas de Chile es empezar por un diagnóstico: un
            mapeo de qué datos existen y dónde viven, seguido de un plan de mitigación — seguridad
            perimetral, gestión de accesos, protocolos de incidentes y capacitación. En la práctica, para el
            área de operaciones eso significa una cosa muy concreta:{' '}
            <em>sacar el flujo documental de las bandejas de entrada personales y las planillas sueltas</em>,
            y llevarlo a una capa donde cada documento tiene dueño, estado, trazabilidad y control de acceso.
          </p>
          <p style={pStyle}>
            Ese es el mismo ordenamiento que una operación de exportación necesita para funcionar bien — la
            ley solo le pone fecha límite y multa al desorden. Los exportadores que ordenen su capa
            documental este año no solo reducen riesgo regulatorio: reaccionan antes al siguiente cut-off,
            cobran más rápido y pierden menos conocimiento cuando alguien del equipo se va.
          </p>

          <p style={{ ...pStyle, fontSize: '13px', color: '#8A7860', fontStyle: 'italic' }}>
            Este artículo es un análisis informativo y no constituye asesoría legal. Fuente:{' '}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#8A7860' }}>
              Frutas de Chile — «Ley 21.719: el nuevo desafío regulatorio que obligará al agro a ordenar sus
              datos antes de diciembre 2026»
            </a>
            .
          </p>
        </article>

        {/* CTA */}
        <div
          className="mt-14 rounded-[14px] p-8 lg:p-10"
          style={{ background: '#2B1F12' }}
        >
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
                ¿Tu flujo documental pasaría una auditoría
                <br />
                <span className="italic" style={{ color: '#B97A1F' }}>de la nueva Agencia?</span>
              </h2>
              <p className="m-0 mt-3 text-[14px] leading-[1.6]" style={{ color: 'rgba(248,242,228,0.75)', maxWidth: '52ch' }}>
                Agora ordena los documentos de cada embarque con estados, responsables, trazabilidad y datos
                aislados por organización — el punto de partida operacional para llegar bien a diciembre.
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

        <RelatedArticles currentSlug="ley-21719-proteccion-de-datos-agro" />
      </main>

      <LandingFooter />
    </>
  )
}
