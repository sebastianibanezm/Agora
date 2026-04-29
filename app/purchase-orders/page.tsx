import { PageTransition } from '@/components/shared/PageTransition';
import { purchaseOrders } from '@/lib/mock-data/purchase-orders';
import { importers } from '@/lib/mock-data/importers';
import { POListTable } from '@/components/purchase-orders/POListTable';

export default function POListPage() {
  return (
    <PageTransition>
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#e2e8f0' }}>Purchase Orders</h1>
        <POListTable purchaseOrders={purchaseOrders} importers={importers} />
      </div>
    </PageTransition>
  );
}
