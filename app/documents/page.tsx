import { getTranslations } from 'next-intl/server'
import { DocumentsPageClient } from './components/DocumentsPageClient'
import { PageTransition } from '@/components/shared/PageTransition'

export default async function DocumentsPage() {
  const t = await getTranslations('documents')
  return (
    <PageTransition>
      <DocumentsPageClient title={t('title')} uploadLabel={t('upload.trigger')} />
    </PageTransition>
  )
}
