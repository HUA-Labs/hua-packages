import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWindowSize } from '../useWindowSize';

describe('useWindowSize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set default window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  it('returns initial window size', () => {
    const { result } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it('detects mobile breakpoint correctly', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('detects tablet breakpoint correctly', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 800 });

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('detects desktop breakpoint correctly', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1440 });

    const { result } = renderHook(() => useWindowSize());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('updates on window resize', async () => {
    const { result } = renderHook(() => useWindowSize({ throttle: 0 }));

    expect(result.current.width).toBe(1024);

    // Change window size
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1440 });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // Wait for throttled update
    await waitFor(() => {
      expect(result.current.width).toBe(1440);
    });
  });

  it('respects custom breakpoints', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 900 });

    const { result } = renderHook(() =>
      useWindowSize({
        mobileBreakpoint: 600,
        tabletBreakpoint: 1200,
      })
    );

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('throttles resize events', async () => {
    const { result } = renderHook(() => useWindowSize({ throttle: 100 }));

    const initialWidth = result.current.width;

    // Trigger multiple resize events quickly
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1200 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1300 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1400 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // Should not update immediately
    expect(result.current.width).toBe(initialWidth);

    // Wait for throttle
    await waitFor(
      () => {
        expect(result.current.width).toBe(1400);
      },
      { timeout: 200 }
    );
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useWindowSize());
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
