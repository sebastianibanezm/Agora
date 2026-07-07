import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE_URL } from '@/lib/seo'
import { ARTICLES, articleUrl } from '@/lib/articles'
import { RecursosHeader } from '@/components/recursos/RecursosHeader'
import { LandingFooter } from '@/components/landing/LandingFooter'

const article = ARTICLES.find((a) => a.slug === 'certificado-fitosanitario-electronico-ephyto-sag')!
const SOURCE_URL =
  'https://www.sag.gob.cl/noticias/chile-sera-el-primer-pais-del-mundo-con-certificacion-fitosanitaria-100-digital-con-china'
const IICA_URL =
  'https://blog.iica.int/en/blog/argentina-chile-implementan-certificacion-fitosanitaria-electronica-ephyto-para-su-comercio'

export const metadata: Metadata = {
  title: {
    absolute: 'Certificado fitosanitario electrónico (ePhyto): Chile 100% digital con China | Agora',
  },
  description:
    'Desde abril de 2026 Chile emite el certificado fitosanitario 100% electrónico (ePhyto) hacia China. Qué es el ePhyto del SAG, qué cambia para exportadoras de cerezas, ciruelas y frutos secos, y qué exige de tu flujo documental.',
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

export default function EphytoPage() {
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
            El certificado fitosanitario se vuelve 100% digital
          </h1>
          <p className="text-[17px] leading-[1.7] m-0 mt-5" style={{ color: '#5A4A38' }}>
            Desde el 20 de abril de 2026, Chile es el primer país del mundo que emite el certificado
            fitosanitario de forma totalmente electrónica hacia China. El papel que durante décadas viajó
            detrás del contenedor desaparece — y con él, una de las últimas excusas para tener el flujo
            documental desordenado.
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
          <h2 style={h2Style}>Qué es el ePhyto</h2>
          <p style={pStyle}>
            El ePhyto (certificado fitosanitario electrónico) es la versión digital del documento que emite
            el <strong>SAG</strong> (Servicio Agrícola y Ganadero) para acreditar que un envío vegetal cumple
            los requisitos fitosanitarios del país de destino. En vez de un certificado impreso y firmado
            que se despacha físicamente, el certificado se genera y se intercambia de forma electrónica y
            segura entre las organizaciones nacionales de protección fitosanitaria (ONPF) de origen y
            destino.
          </p>
          <p style={pStyle}>
            Según informó el{' '}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#B25028' }}>
              SAG
            </a>
            , Chile se convirtió en el primer país del mundo en certificar el 100% de sus envíos
            silvoagropecuarios a China en modalidad <em>paperless</em>, sin certificado en papel. No es un
            piloto aislado: Chile ya había implementado el intercambio ePhyto con socios como Argentina y
            Bolivia, según reporta el{' '}
            <a href={IICA_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#B25028' }}>
              IICA
            </a>
            . China — el destino de más del 85% de las cerezas chilenas — marca el salto de escala.
          </p>

          <h2 style={h2Style}>Por qué importa justo ahora</h2>
          <p style={pStyle}>
            El cambio llega en el punto más caliente de la temporada. Solo en la campaña 2025–2026, el SAG
            certificó del orden de <strong>663.000 toneladas</strong> de fruta fresca de exportación, con
            las cerezas a la cabeza (cerca de 494.000 toneladas), seguidas de ciruelas y nectarines. Cada una
            de esas toneladas necesita su certificado fitosanitario en regla para entrar a destino.
          </p>
          <p style={pStyle}>
            Con el papel, un error en el certificado — un dato del consignatario que no coincide, un
            tratamiento cuarentenario mal referenciado, una emisión que llega tarde — se resolvía a última
            hora, muchas veces con el contenedor ya en el puerto. En un mundo <em>paperless</em>, el
            documento correcto tiene que existir, cuadrar y estar disponible <strong>antes</strong>, porque
            ya no hay un original físico corriendo detrás de la carga para tapar el descuadre.
          </p>

          <h2 style={h2Style}>Qué gana la operación</h2>
          <ul style={{ paddingLeft: '22px', margin: '0 0 20px' }}>
            <li style={liStyle}>
              <strong>Menos tiempos muertos:</strong> el certificado no depende del courier ni de la valija;
              se transmite electrónicamente entre autoridades, reduciendo demoras en la liberación en destino.
            </li>
            <li style={liStyle}>
              <strong>Menos fraude y menos extravíos:</strong> el intercambio es seguro y trazable; no hay
              original que se pierda, se moje o se falsifique.
            </li>
            <li style={liStyle}>
              <strong>Menos costos de mensajería internacional</strong> por embarque, y una fuente de
              atrasos menos en el <em>timeline</em> del cut-off.
            </li>
            <li style={liStyle}>
              <strong>Datos comparables:</strong> al ser estructurado, el certificado se puede validar contra
              el resto de la documentación del embarque de forma automática.
            </li>
          </ul>

          <h2 style={h2Style}>La otra cara: el dato tiene que estar impecable antes</h2>
          <p style={pStyle}>
            La digitalización no perdona el desorden — lo expone. Si el nombre del consignatario, el número
            de contenedor, el peso o la descripción del producto en el certificado no coinciden con el BL, la
            factura y el packing list, el descuadre ya no se disimula con una corrección manual sobre el
            papel: queda registrado y puede frenar la liberación en destino.
          </p>
          <p style={pStyle}>
            Por eso el ePhyto sube la vara sobre la <strong>capa documental interna</strong> del exportador.
            La pregunta operativa deja de ser «¿alcanzamos a imprimir y despachar el certificado?» y pasa a
            ser «¿los datos que declaramos al SAG son exactamente los mismos que van en todos los demás
            documentos del embarque?». Eso solo se sostiene si existe una única fuente de verdad por embarque,
            no diez planillas y una cadena de correos.
          </p>

          <h2 style={h2Style}>Qué hacer con esto</h2>
          <p style={pStyle}>
            El ePhyto es una buena noticia: menos papel, menos fricción, menos riesgo de extravío. Pero
            traslada la exigencia aguas arriba, hacia el momento en que se arman los datos del embarque.
            Los exportadores que llegan bien preparados a este cambio son los que ya tratan cada embarque
            como un expediente con datos consistentes y validados entre documentos — no como una carrera de
            última hora contra el cut-off.
          </p>
          <p style={pStyle}>
            Ese ordenamiento —una fuente de verdad por embarque, con cada documento validado contra ella— es
            justamente lo que evita que un dato mal puesto en el certificado se convierta en una carga
            detenida en destino.
          </p>

          <p style={{ ...pStyle, fontSize: '13px', color: '#8A7860', fontStyle: 'italic' }}>
            Este artículo es un análisis informativo y no constituye asesoría regulatoria. Para requisitos y
            procedimientos oficiales, consulta al{' '}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#8A7860' }}>
              SAG
            </a>
            . Fuentes: SAG e IICA.
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
                ¿Los datos de tu certificado cuadran
                <br />
                <span className="italic" style={{ color: '#B97A1F' }}>con el resto del embarque?</span>
              </h2>
              <p
                className="m-0 mt-3 text-[14px] leading-[1.6]"
                style={{ color: 'rgba(248,242,228,0.75)', maxWidth: '52ch' }}
              >
                Agora valida cada documento del embarque contra una única fuente de verdad y detecta
                descuadres antes del cut-off — el punto de partida para operar sin sorpresas en un mundo
                paperless.
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
