import type { Metadata } from 'next'
import { getMessages } from 'next-intl/server'
import { SITE_URL, LOCALE_URLS } from '@/lib/seo'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingProof } from '@/components/landing/LandingProof'
import { LandingProblem } from '@/components/landing/LandingProblem'
import { LandingPillars } from '@/components/landing/LandingPillars'
import { LandingProduct } from '@/components/landing/LandingProduct'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingCtaBand } from '@/components/landing/LandingCtaBand'
import { LandingContact } from '@/components/landing/LandingContact'
import { LandingFaq } from '@/components/landing/LandingFaq'
import { LandingResources } from '@/components/landing/LandingResources'
import { LandingFooter } from '@/components/landing/LandingFooter'

type MetaMessages = {
  landing: { meta: { title: string; description: string; ogDescription: string } }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const messages = (await getMessages({ locale })) as unknown as MetaMessages
  const meta = messages.landing.meta
  const canonical = LOCALE_URLS[locale] ?? SITE_URL

  return {
    title: { absolute: meta.title },
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.ogDescription,
      url: canonical,
      siteName: 'Agora',
      images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630 }],
      locale: locale === 'es' ? 'es_CL' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.ogDescription,
      images: [`${SITE_URL}/og-image.jpg`],
    },
  }
}

export default function LandingPage() {
  return (
    <>
      <main id="landing-main">
        <LandingHero />
        <LandingProof />
        <LandingProblem />
        <LandingPillars />
        <LandingCtaBand />
        <LandingProduct />
        <LandingHowItWorks />
        <LandingContact />
        <LandingFaq />
        <LandingResources />
      </main>
      <LandingFooter />
    </>
  )
}
