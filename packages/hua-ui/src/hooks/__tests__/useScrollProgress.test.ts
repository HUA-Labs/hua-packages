import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useScrollProgress } from '../useScrollProgress';

describe('useScrollProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window scroll properties
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 2000,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('returns initial state for page target', () => {
    const { result } = renderHook(() => useScrollProgress({ target: 'page' }));

    expect(result.current.ref).toBeDefined();
    expect(result.current.progress).toBeDefined();
    expect(result.current.scrollY).toBeDefined();
    expect(result.current.scrollX).toBeDefined();
    expect(result.current.isScrolling).toBeDefined();
    expect(result.current.direction).toBeDefined();
  });

  it('calculates progress correctly for page scroll', async () => {
    const { result } = renderHook(() => useScrollProgress({ target: 'page', throttle: 0 }));

    // Scroll to middle: (2000 - 800) = 1200 total scrollable
    // scrollY = 600 -> progress = 600 / 1200 = 0.5
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 600,
    });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.scrollY).toBe(600);
    });

    expect(result.current.progress).toBeCloseTo(0.5, 2);
  });

  it('detects scroll direction down', async () => {
    const { result } = renderHook(() => useScrollProgress({ target: 'page', throttle: 0 }));

    Object.defineProperty(window, 'scrollY', { writable: true, value: 100 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.direction).toBe('down');
    });
  });

  it('detects scroll direction up', async () => {
    const { result } = renderHook(() => useScrollProgress({ target: 'page', throttle: 0 }));

    // First scroll down
    Object.defineProperty(window, 'scrollY', { writable: true, value: 500 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.scrollY).toBe(500);
    });

    // Then scroll up
    Object.defineProperty(window, 'scrollY', { writable: true, value: 300 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.direction).toBe('up');
    });
  });

  it('sets isScrolling to true while scrolling', async () => {
    const { result } = renderHook(() => useScrollProgress({ target: 'page', throttle: 0 }));

    Object.defineProperty(window, 'scrollY', { writable: true, value: 100 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.isScrolling).toBe(true);
    });
  });

  it('sets isScrolling flag during scroll', async () => {
    const { result } = renderHook(() => useScrollProgress({ target: 'page', throttle: 0 }));

    Object.defineProperty(window, 'scrollY', { writable: true, value: 100 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.isScrolling).toBe(true);
    });
  });

  it('tracks scrollX correctly', async () => {
    const { result } = renderHook(() => useScrollProgress({ target: 'page', throttle: 0 }));

    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 200,
    });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.scrollX).toBeGreaterThan(0);
    });
  });

  it('accepts element scroll target option', () => {
    const { result } = renderHook(() =>
      useScrollProgress({ target: 'element', throttle: 0 })
    );

    expect(result.current.ref).toBeDefined();
    expect(result.current.progress).toBeDefined();
    expect(result.current.scrollY).toBeDefined();
    expect(result.current.scrollX).toBeDefined();
  });

  it('caps progress at 1.0', async () => {
    const { result } = renderHook(() => useScrollProgress({ target: 'page', throttle: 0 }));

    // Scroll beyond maximum
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 5000,
    });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      expect(result.current.progress).toBe(1);
    });
  });

  it('accepts throttle option', () => {
    // Just verify hook accepts throttle option without errors
    const { result } = renderHook(() => useScrollProgress({ target: 'page', throttle: 50 }));

    expect(result.current).toBeDefined();
  });

  it('updates on window resize for page target', async () => {
    const { result } = renderHook(() => useScrollProgress({ target: 'page', throttle: 0 }));

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 100,
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    await waitFor(() => {
      expect(result.current.scrollY).toBe(100);
    });
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScrollProgress({ target: 'page' }));

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
