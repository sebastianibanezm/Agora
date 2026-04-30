import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('i18n', () => {
  const es = JSON.parse(readFileSync('messages/es.json', 'utf8'));
  const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));
  const requiredNamespaces = [
    'nav',
    'common',
    'settings',
    'lifecycle',
    'dashboard',
    'containers',
    'bookings',
    'siViewer',
    'validation',
    'blViewer',
    'exporters',
    'navieras',
    'performance',
    'agents',
    'alerts',
    'cutoff',
  ];

  it('both locales have all required namespaces', () => {
    for (const ns of requiredNamespaces) {
      expect(es, `es missing namespace: ${ns}`).toHaveProperty(ns);
      expect(en, `en missing namespace: ${ns}`).toHaveProperty(ns);
    }
  });

  it('es and en have identical key shapes', () => {
    const shape = (o: unknown): unknown =>
      Array.isArray(o)
        ? '[]'
        : o && typeof o === 'object'
          ? Object.fromEntries(
              Object.keys(o as object)
                .sort()
                .map((k) => [k, shape((o as Record<string, unknown>)[k])])
            )
          : '_';
    expect(shape(es)).toEqual(shape(en));
  });

  it('routing config exports defaultLocale=es and locales=[es,en]', async () => {
    const mod = await import('@/i18n/routing');
    expect(mod.routing.defaultLocale).toBe('es');
    expect(mod.routing.locales).toContain('es');
    expect(mod.routing.locales).toContain('en');
  });
});
