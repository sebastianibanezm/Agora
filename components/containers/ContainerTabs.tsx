'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import type { Container } from '@/types';
import { OverviewTab } from './OverviewTab';
import { DocumentsTab } from './DocumentsTab';
import { ReadinessTab } from './ReadinessTab';
import { ColdChainTab } from '@/components/cold-chain/ColdChainTab';
import { ValidationFeed } from '@/components/alerts/ValidationFeed';
import { FinancialTab } from './FinancialTab';
import { ReconciliationTab } from './ReconciliationTab';
import { HistoryTab } from './HistoryTab';
import { validations as allValidations } from '@/lib/mock-data/validations';

interface Props { container: Container }

export function ContainerTabs({ container }: Props) {
  const t = useTranslations('tabs');
  const hasColdChain = container.coldChain?.required === true;

  const tabs = [
    { key: 'overview',        label: t('overview') },
    { key: 'documents',       label: t('documents') },
    { key: 'readiness',       label: t('readiness') },
    ...(hasColdChain ? [{ key: 'coldChain', label: t('coldChain') }] : []),
    { key: 'validations',     label: t('validations') },
    { key: 'financial',       label: t('financial') },
    { key: 'reconciliation',  label: t('reconciliation') },
    { key: 'history',         label: t('history') },
  ];

  return (
    <Tabs defaultValue="overview">
      <TabsList className="bg-bg-2 border border-white/10 mb-6">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className="text-ink-3 data-[state=active]:text-ink-1 data-[state=active]:bg-bg-3 text-sm"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="overview">
        <OverviewTab container={container} />
      </TabsContent>
      <TabsContent value="documents">
        <DocumentsTab container={container} />
      </TabsContent>
      <TabsContent value="readiness">
        <ReadinessTab container={container} />
      </TabsContent>
      {hasColdChain && (
        <TabsContent value="coldChain">
          <ColdChainTab container={container} />
        </TabsContent>
      )}
      <TabsContent value="validations">
        <ValidationFeed validations={allValidations.filter(v => v.containerId === container.id)} />
      </TabsContent>
      <TabsContent value="financial">
        <FinancialTab container={container} />
      </TabsContent>
      <TabsContent value="reconciliation">
        <ReconciliationTab container={container} />
      </TabsContent>
      <TabsContent value="history">
        <HistoryTab container={container} />
      </TabsContent>
    </Tabs>
  );
}
