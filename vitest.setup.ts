import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/font/google to prevent runtime errors in tests
vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: '--font-inter' }),
  JetBrains_Mono: () => ({ variable: '--font-mono' }),
  Fraunces: () => ({ variable: '--font-fraunces' }),
  Old_Standard_TT: () => ({ variable: '--font-old-standard' }),
}));

// jsdom doesn't implement CSS.supports
if (typeof CSS === 'undefined') {
  (global as any).CSS = { supports: () => false };
} else if (typeof CSS.supports !== 'function') {
  (CSS as any).supports = () => false;
}

// cmdk uses ResizeObserver and scrollIntoView internally; jsdom doesn't provide them
if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
