import type { Producer } from '@/types';

export const producers: Producer[] = [
  { id: 'PRD-VF-MAULE', name: 'Valle Fresco — Maule', region: 'Maule', products: ['walnuts_in_shell', 'walnut_kernels'], sagId: 'SAG-MAU-00412', activeContainers: 2 },
  { id: 'PRD-VF-CURICO', name: 'Valle Fresco — Curicó', region: 'Curicó', products: ['fresh_cherries', 'fresh_blueberries'], sagId: 'SAG-CUR-00288', activeContainers: 1 },
  { id: 'PRD-VF-OHIGGINS', name: "Valle Fresco — O'Higgins", region: "O'Higgins", products: ['table_grapes_red', 'table_grapes_white'], sagId: 'SAG-OHI-00331', activeContainers: 1 },
  { id: 'PRD-EXT-COLCHAGUA', name: 'Viñedos Colchagua', region: 'Colchagua', products: ['table_grapes_red'], sagId: 'SAG-COL-00178', activeContainers: 0 },
  { id: 'PRD-VF-BIOBIO', name: 'Valle Fresco — Bío-Bío', region: 'Bío-Bío', products: ['fresh_blueberries'], sagId: 'SAG-BIO-00519', activeContainers: 1 },
];
