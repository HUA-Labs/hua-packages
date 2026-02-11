import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInView } from '../useInView';

describe('useInView', () => {
  let mockIntersectionObserver: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockIntersectionObserver = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
    };

    global.IntersectionObserver = vi.fn((callback) => {
      // Capture callback for later use
      (mockIntersectionObserver as any).callback = callback;
      return mockIntersectionObserver;
    }) as any;
  });

  it('returns ref, inView false, and entry null initially', () => {
    const { result } = renderHook(() => useInView());

    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
    expect(result.current.inView).toBe(false);
    expect(result.current.entry).toBeNull();
  });

  it('accepts threshold option', () => {
    const { result } = renderHook(() => useInView({ threshold: 0.5 }));

    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
  });

  it('accepts rootMargin option', () => {
    const { result } = renderHook(() => useInView({ rootMargin: '100px' }));

    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
  });

  it('accepts triggerOnce option', () => {
    const { result } = renderHook(() => useInView({ triggerOnce: true }));

    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
  });

  it('accepts array of thresholds', () => {
    const { result } = renderHook(() => useInView({ threshold: [0, 0.5, 1] }));

    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
  });

  it('accepts onChange callback option', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useInView({ onChange }));

    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
  });

  it('provides entry property', () => {
    const { result } = renderHook(() => useInView());

    expect(result.current.entry).toBeNull();
  });

  it('accepts all options together', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useInView({
        threshold: 0.5,
        rootMargin: '50px',
        triggerOnce: true,
        onChange,
      })
    );

    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
    expect(result.current.entry).toBeNull();
  });
});
