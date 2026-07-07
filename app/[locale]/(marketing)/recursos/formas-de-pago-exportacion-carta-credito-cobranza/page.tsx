import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE_URL } from '@/lib/seo'
import { ARTICLES, articleUrl } from '@/lib/articles'
import { RecursosHeader } from '@/components/recursos/RecursosHeader'
import { RelatedArticles } from '@/components/recursos/RelatedArticles'
import { LandingFooter } from '@/components/landing/LandingFooter'

const article = ARTICLES.find((a) => a.slug === 'formas-de-pago-exportacion-carta-credito-cobranza')!
const SOURCE_URL =
  'https://centrodeayuda.prochile.gob.cl/hc/es-419/articles/360048454953--Cu%C3%A1les-son-las-formas-de-pago-en-una-exportaci%C3%B3n'

export const metadata: Metadata = {
  title: {
    absolute: 'Formas de pago en la exportación: carta de crédito, cobranza o cuenta abierta | Agora',
  },
  description:
    'Carta de crédito, cobranza documentaria y cuenta abierta reparten el riesgo de no pago de formas muy distintas. Cómo elegir la forma de pago que sí te asegura cobrar en la exportación de fruta y frutos secos, y por qué los documentos de embarque lo definen todo.',
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

export default function FormasDePagoPage() {
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
            La fruta ya salió. Ahora hay que cobrar
          </h1>
          <p className="text-[17px] leading-[1.7] m-0 mt-5" style={{ color: '#5A4A38' }}>
            Embarcar bien es la mitad del trabajo. La temporada recién se gana cuando el dinero entra a la
            cuenta. La forma de pago que acuerdas con tu comprador decide quién asume el riesgo de que eso no
            pase — y en casi todas ellas, los que mandan son los documentos de embarque.
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
          <p style={pStyle}>
            Según{' '}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#B25028' }}>
              ProChile
            </a>
            , las formas de pago en el comercio exterior se ordenan por un solo eje: cuánta confianza existe
            entre exportador e importador, y quién carga con el riesgo si esa confianza falla. Estas son las
            tres que verás en casi todo embarque de fruta.
          </p>

          <h2 style={h2Style}>Carta de crédito (acreditivo)</h2>
          <p style={pStyle}>
            Es la forma más segura para el exportador, sobre todo con un comprador nuevo o en un mercado de
            mayor riesgo. Un banco emisor se compromete a pagar contra la presentación de documentos que
            cumplan <em>exactamente</em> las condiciones pactadas. El respaldo es bancario, no solo la
            palabra del importador.
          </p>
          <p style={pStyle}>
            El costo de esa seguridad es doble: comisiones bancarias más altas y una exigencia documental
            implacable. En una carta de crédito, una discrepancia entre lo que dice el BL y lo que exige el
            acreditivo —una fecha, un peso, una descripción, un nombre— puede frenar el pago aunque la fruta
            haya llegado perfecta. Los bancos pagan contra documentos, no contra mercadería.
          </p>

          <h2 style={h2Style}>Cobranza documentaria</h2>
          <p style={pStyle}>
            Un punto intermedio. Los bancos actúan como intermediarios: el exportador entrega los documentos
            de embarque a su banco, que los remite al banco del importador, y estos se liberan contra pago
            (D/P, documents against payment) o contra aceptación de una letra (D/A, documents against
            acceptance). El banco no garantiza el pago; solo controla la entrega de los documentos.
          </p>
          <p style={pStyle}>
            Es más barata que la carta de crédito y da más control que la cuenta abierta, porque el importador
            no toma posesión de la carga hasta cumplir su parte. Su punto débil: si el comprador no paga o no
            acepta, la fruta ya está en destino y las opciones se encarecen. Vuelve a depender de que los
            documentos estén completos y a tiempo.
          </p>

          <h2 style={h2Style}>Cuenta abierta (crédito directo)</h2>
          <p style={pStyle}>
            El exportador embarca y factura, y el importador paga a plazo —vía transferencia— después de
            recibir la mercadería. Es la forma más simple, más barata y más cómoda para el comprador, y por
            eso la que muchos clientes grandes exigen. También es la de mayor riesgo para el exportador: si el
            importador no paga, la carga ya se entregó.
          </p>
          <p style={pStyle}>
            La cuenta abierta funciona con clientes conocidos y de historial sólido — pero conviene apoyarla
            en herramientas de mitigación: un <strong>seguro de crédito a la exportación</strong>, que
            indemniza ante insolvencia o incumplimiento, o coberturas como las de <strong>CORFO (COBEX)</strong>{' '}
            que respaldan operaciones de comercio exterior.
          </p>

          <h2 style={h2Style}>Cómo elegir</h2>
          <ul style={{ paddingLeft: '22px', margin: '0 0 20px' }}>
            <li style={liStyle}>
              <strong>Cliente nuevo o mercado riesgoso:</strong> carta de crédito. La seguridad justifica el
              costo.
            </li>
            <li style={liStyle}>
              <strong>Relación en construcción, confianza media:</strong> cobranza documentaria, idealmente
              D/P.
            </li>
            <li style={liStyle}>
              <strong>Cliente conocido, historial sólido:</strong> cuenta abierta, respaldada con seguro de
              crédito.
            </li>
          </ul>
          <p style={pStyle}>
            En la práctica, una exportadora convive con las tres al mismo tiempo, según el cliente y el
            mercado. Lo importante no es elegir una para siempre, sino saber en cada embarque bajo qué
            condición se cobra — y no perder de vista los vencimientos.
          </p>

          <h2 style={h2Style}>El hilo común: los documentos definen si cobras</h2>
          <p style={pStyle}>
            Las tres formas comparten un mismo talón de Aquiles. En la carta de crédito, una discrepancia
            documental congela el pago. En la cobranza, los documentos son la llave que libera la carga
            contra pago. En la cuenta abierta, la factura y el respaldo del embarque son la base para
            reclamar o gatillar el seguro. Ningún método te asegura cobrar si los documentos llegan tarde,
            incompletos o descuadrados entre sí.
          </p>
          <p style={pStyle}>
            Por eso el control documental y la cobranza son el mismo problema visto desde dos puntas. Cerrar
            el <em>loop</em> financiero —conectar cada embarque con su vencimiento, saber qué está por cobrar,
            qué está vencido y contra qué documentos— es lo que convierte una fruta bien embarcada en una
            temporada efectivamente pagada.
          </p>

          <p style={{ ...pStyle, fontSize: '13px', color: '#8A7860', fontStyle: 'italic' }}>
            Este artículo es un análisis informativo y no constituye asesoría financiera. Para condiciones
            específicas consulta a tu banco y a{' '}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#8A7860' }}>
              ProChile
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
                ¿Sabes qué embarques
                <br />
                <span className="italic" style={{ color: '#B97A1F' }}>tienes por cobrar hoy?</span>
              </h2>
              <p
                className="m-0 mt-3 text-[14px] leading-[1.6]"
                style={{ color: 'rgba(248,242,228,0.75)', maxWidth: '52ch' }}
              >
                Agora conecta cada embarque con su cobranza: prioriza por vencimiento, concilia los pagos
                contra los documentos y cierra el loop entre lo que embarcas y lo que efectivamente entra a
                la cuenta.
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

        <RelatedArticles currentSlug="formas-de-pago-exportacion-carta-credito-cobranza" />
      </main>

      <LandingFooter />
    </>
  )
}
