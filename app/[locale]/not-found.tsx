import { getTranslations } from 'next-intl/server'
import { NotFoundDocument } from '@/components/notfound/NotFoundDocument'

export async function generateMetadata() {
  const t = await getTranslations('landing.notFound.doc')
  return {
    title: t('pageTitle').replace(/\.$/, ''),
    robots: { index: false, follow: false },
  }
}

export default function NotFound() {
  return <NotFoundDocument />
}
