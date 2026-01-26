import '@testing-library/jest-dom';

class MockIntersectionObserver {
  root: Element | null;
  rootMargin: string;
  thresholds: ReadonlyArray<number>;

  constructor() {
    this.root = null;
    this.rootMargin = '';
    this.thresholds = [];
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

(globalThis as any).IntersectionObserver = MockIntersectionObserver;
