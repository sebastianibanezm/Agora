import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const css = readFileSync('app/globals.css', 'utf8');

describe('design tokens', () => {
  it('defines surface color tokens bg-0..bg-3', () => {
    expect(css).toMatch(/--color-bg-0:\s*#070A12/);
    expect(css).toMatch(/--color-bg-1:\s*#0E1320/);
    expect(css).toMatch(/--color-bg-2:\s*#141A29/);
    expect(css).toMatch(/--color-bg-3:\s*#1B2235/);
  });
  it('defines ink text tokens', () => {
    expect(css).toMatch(/--color-ink-1:\s*#F4F6FA/);
    expect(css).toMatch(/--color-ink-4:\s*#475063/);
  });
  it('defines mint color scale', () => {
    expect(css).toMatch(/--color-mint-500:\s*#00E696/);
    expect(css).toMatch(/--color-mint-300:\s*#4DFFB8/);
  });
  it('defines severity color tokens', () => {
    expect(css).toMatch(/--color-severity-crit:\s*#EF4444/);
    expect(css).toMatch(/--color-severity-ok:\s*#00E696/);
  });
  it('defines trace color', () => {
    expect(css).toMatch(/--color-trace:\s*#7DD3FC/);
  });
  it('registers mono font family', () => {
    expect(css).toMatch(/--font-family-mono:\s*["']?JetBrains Mono/);
  });
  it('body ambient glows present', () => {
    expect(css).toMatch(/body::before/);
    expect(css).toMatch(/body::after/);
  });
  it('glass utility defined', () => {
    expect(css).toMatch(/\.glass/);
  });
});
