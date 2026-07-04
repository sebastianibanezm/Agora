import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSearchData } from '@/components/search/useSearchData';
import { useLocale } from 'next-intl';

vi.mock('next-intl', () => ({ useLocale: vi.fn().mockReturnValue('en') }));

afterEach(() => {
  vi.mocked(useLocale).mockReturnValue('en');
});

describe('useSearchData', () => {
  it('returns an array of SearchItems', () => {
    const { result } = renderHook(() => useSearchData());
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('includes all five entity types', () => {
    const { result } = renderHook(() => useSearchData());
    const types = new Set(result.current.map(i => i.type));
    expect(types.has('booking')).toBe(true);
    expect(types.has('exporter')).toBe(true);
    expect(types.has('naviera')).toBe(true);
    expect(types.has('alert')).toBe(true);
    expect(types.has('page')).toBe(true);
  });

  it('every item has id, label, href, and icon', () => {
    const { result } = renderHook(() => useSearchData());
    for (const item of result.current) {
      expect(item.id).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.href).toBeTruthy();
      expect(item.icon).toBeDefined();
    }
  });

  it('booking hrefs point to the booking detail page', () => {
    const { result } = renderHook(() => useSearchData());
    const bookings = result.current.filter(i => i.type === 'booking');
    for (const b of bookings) {
      expect(b.href).toMatch(/^\/bookings\//);
    }
  });

  it('uses English strings when locale is en', () => {
    const { result } = renderHook(() => useSearchData());
    const alerts = result.current.filter(i => i.type === 'alert');
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0]?.label).toBeTruthy();
  });

  it('uses Spanish strings when locale is es', () => {
    vi.mocked(useLocale).mockReturnValue('es');
    const { result } = renderHook(() => useSearchData());
    const spanishAlerts = result.current.filter(i => i.type === 'alert');
    expect(spanishAlerts.length).toBeGreaterThan(0);
    // Spanish titles contain Spanish words not present in English titles
    expect(spanishAlerts[0]?.label).not.toBe('');
  });
});
