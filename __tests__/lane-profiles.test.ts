import { describe, it, expect } from 'vitest';
import { computeLaneProfile, getLaneProfile } from '@/lib/mock-data/lane-profiles';

describe('computeLaneProfile', () => {
  it('walnuts → IN → CAD at sight produces 15 docs', () => {
    const lp = computeLaneProfile('walnuts_in_shell', 'IN', 'cif_cad_at_sight');
    expect(lp.id).toBe('walnuts_in_shell.IN.cif_cad_at_sight');
    expect(lp.documentSet.length).toBe(15);
  });
  it('cherries → CN → L/C at sight produces 18 docs', () => {
    const lp = computeLaneProfile('fresh_cherries', 'CN', 'cif_lc_at_sight');
    expect(lp.id).toBe('fresh_cherries.CN.cif_lc_at_sight');
    expect(lp.documentSet.length).toBe(18);
  });
  it('agentsActive is the union of agents from product, market, commercial', () => {
    const lp = computeLaneProfile('fresh_cherries', 'CN', 'cif_lc_at_sight');
    const set = new Set(lp.agentsActive);
    expect(set.has('lc_discrepancy_catcher')).toBe(true);
    expect(set.has('in_transit_telemetry_watcher')).toBe(true);
    expect(set.has('lunar_new_year_window_watcher')).toBe(true);
  });
  it('getLaneProfile returns the cached profile by id', () => {
    const lp = getLaneProfile('walnuts_in_shell.IN.cif_cad_at_sight');
    expect(lp.documentSet.length).toBe(15);
  });
  it('zero hardcoded per-product conditionals (smoke check via source scan)', async () => {
    const fs = await import('node:fs');
    const src = fs.readFileSync('lib/mock-data/lane-profiles.ts', 'utf8');
    expect(src).not.toMatch(/if\s*\(\s*productId\s*===\s*'/);
    expect(src).not.toMatch(/if\s*\(\s*marketId\s*===\s*'/);
    expect(src).not.toMatch(/switch\s*\(\s*productId\s*\)/);
  });
});

