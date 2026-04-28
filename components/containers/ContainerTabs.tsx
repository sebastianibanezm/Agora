'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import type { Container } from '@/types';
import { OverviewTab } from './OverviewTab';

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
        <div className="text-ink-3 text-sm">Documents — coming in Task 13</div>
      </TabsContent>
      <TabsContent value="readiness">
        <div className="text-ink-3 text-sm">Readiness — coming in Task 14</div>
      </TabsContent>
      {hasColdChain && (
        <TabsContent value="coldChain">
          <div className="text-ink-3 text-sm">Cold Chain — coming in Task 15</div>
        </TabsContent>
      )}
      <TabsContent value="validations">
        <div className="text-ink-3 text-sm">Validations — coming in Task 16</div>
      </TabsContent>
      <TabsContent value="financial">
        <div className="text-ink-3 text-sm">Financial — coming in Task 16</div>
      </TabsContent>
      <TabsContent value="reconciliation">
        <div className="text-ink-3 text-sm">Reconciliation — coming in Task 16</div>
      </TabsContent>
      <TabsContent value="history">
        <div className="text-ink-3 text-sm">History — coming in Task 16</div>
      </TabsContent>
    </Tabs>
  );
}
