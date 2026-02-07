import { describe, it, expect } from 'vitest';
import * as hooks from '../index';

describe('@hua-labs/hooks exports', () => {
  it('should export useLoading', () => {
    expect(hooks.useLoading).toBeDefined();
    expect(typeof hooks.useLoading).toBe('function');
  });

  it('should export useAutoScroll', () => {
    expect(hooks.useAutoScroll).toBeDefined();
    expect(typeof hooks.useAutoScroll).toBe('function');
  });

  it('should export usePerformanceMonitor', () => {
    expect(hooks.usePerformanceMonitor).toBeDefined();
    expect(typeof hooks.usePerformanceMonitor).toBe('function');
  });

  it('should export all expected hooks', () => {
    const expectedExports = [
      'useLoading',
      'useAutoScroll',
      'usePerformanceMonitor',
    ];

    for (const name of expectedExports) {
      expect(hooks).toHaveProperty(name);
    }
  });
});
