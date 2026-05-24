import '@testing-library/jest-dom';

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
