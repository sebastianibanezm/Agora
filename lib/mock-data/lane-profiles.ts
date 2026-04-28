import type {
  LaneProfile,
  ProductId,
  IncotermPaymentId,
  Market,
  DocumentRequirement,
  DocumentType,
  AgentId,
  LaneTimelineEvent,
} from '@/types';
import { productProfiles } from './product-profiles';
import { marketProfiles } from './market-rules';
import { commercialProfiles } from './commercial-profiles';

function uniq<T>(xs: T[]): T[] {
  return Array.from(new Set(xs));
}

function buildDocumentRequirement(type: DocumentType): DocumentRequirement {
  return { type, label: `docs.${type}`, requiredBy: 'T-3' };
}

function composeTimeline(): LaneTimelineEvent[] {
  return [
    { tDay: 'T-7',  label: 'lane.timeline.bookingConfirmed', actor: 'exporter' },
    { tDay: 'T-5',  label: 'lane.timeline.docsCollected',    actor: 'agent' },
    { tDay: 'T-3',  label: 'lane.timeline.dusFiled',         actor: 'exporter' },
    { tDay: 'T-2',  label: 'lane.timeline.cutoff',           actor: 'exporter' },
    { tDay: 'T+0',  label: 'lane.timeline.etd',              actor: 'exporter' },
    { tDay: 'T+10', label: 'lane.timeline.midTransit',       actor: 'agent' },
    { tDay: 'T+25', label: 'lane.timeline.eta',              actor: 'importer' },
  ];
}

export function computeLaneProfile(
  productId: ProductId,
  marketId: Market,
  commercialId: IncotermPaymentId,
): LaneProfile {
  const product    = productProfiles.find(p => p.id === productId);
  const market     = marketProfiles.find(m => m.id === marketId);
  const commercial = commercialProfiles.find(c => c.id === commercialId);

  if (!product || !market || !commercial) {
    throw new Error(`Unknown lane: ${productId}.${marketId}.${commercialId}`);
  }

  const docTypes = uniq<DocumentType>([
    ...product.requiredDocs,
    ...market.requiredDocs,
    ...commercial.requiredDocs,
  ]);

  return {
    id: `${productId}.${marketId}.${commercialId}`,
    product,
    market,
    commercial,
    documentSet: docTypes.map(buildDocumentRequirement),
    agentsActive: uniq<AgentId>([
      ...product.activeAgents,
      ...market.activeAgents,
      ...commercial.activeAgents,
    ]),
    validationChecks: uniq<string>([...commercial.validationChecks]),
    timeline: composeTimeline(),
  };
}

// Pre-compute hero lanes
const heroLaneIds: [ProductId, Market, IncotermPaymentId][] = [
  ['walnuts_in_shell', 'IN', 'cif_cad_at_sight'],
  ['fresh_cherries',   'CN', 'cif_lc_at_sight'],
  ['table_grapes_red', 'CN', 'cif_lc_60'],
];

const cache = new Map<string, LaneProfile>(
  heroLaneIds.map(([p, m, c]) => [`${p}.${m}.${c}`, computeLaneProfile(p, m, c)]),
);

export function getLaneProfile(id: string): LaneProfile {
  const cached = cache.get(id);
  if (cached) return cached;
  const parts = id.split('.');
  const p = parts[0] as ProductId;
  const m = parts[1] as Market;
  const c = parts.slice(2).join('.') as IncotermPaymentId;
  return computeLaneProfile(p, m, c);
}
