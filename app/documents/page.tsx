import { getTranslations } from 'next-intl/server'
import { DocumentsPageClient } from './components/DocumentsPageClient'

export default async function DocumentsPage() {
  const t = await getTranslations('documents')
  return <DocumentsPageClient title={t('title')} uploadLabel={t('upload.trigger')} />
}
