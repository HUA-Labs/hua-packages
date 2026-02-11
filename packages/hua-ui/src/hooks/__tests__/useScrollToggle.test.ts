import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useScrollToggle } from '../useScrollToggle';

describe('useScrollToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset scroll position
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useScrollToggle());

    expect(result.current.isVisible).toBe(false);
    expect(result.current.scrollToTop).toBeInstanceOf(Function);
  });

  it('mounted flag becomes true after mount', async () => {
    const { result } = renderHook(() => useScrollToggle());

    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });
  });

  it('isVisible is false when scrollY is below threshold', async () => {
    const { result } = renderHook(() => useScrollToggle({ threshold: 400 }));

    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });

    Object.defineProperty(window, 'pageYOffset', { writable: true, value: 300 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('isVisible is true when scrollY is above threshold', async () => {
    const { result } = renderHook(() => useScrollToggle({ threshold: 400 }));

    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });

    Object.defineProperty(window, 'pageYOffset', { writable: true, value: 500 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('respects custom threshold', async () => {
    const { result } = renderHook(() => useScrollToggle({ threshold: 200 }));

    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });

    Object.defineProperty(window, 'pageYOffset', { writable: true, value: 250 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('scrollToTop calls window.scrollTo with smooth behavior', async () => {
    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;

    const { result } = renderHook(() => useScrollToggle({ smooth: true }));

    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });

    act(() => {
      result.current.scrollToTop();
    });

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('scrollToTop calls window.scrollTo without smooth behavior', async () => {
    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;

    const { result } = renderHook(() => useScrollToggle({ smooth: false }));

    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });

    act(() => {
      result.current.scrollToTop();
    });

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
  });

  it('respects showOnMount option and updates on mount', async () => {
    // Set scroll position above threshold before rendering
    Object.defineProperty(window, 'pageYOffset', { writable: true, value: 500 });

    const { result } = renderHook(() => useScrollToggle({ showOnMount: true, threshold: 400 }));

    // Initial state before mount should be true
    expect(result.current.isVisible).toBe(true);

    // Wait for mounted to be true
    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });

    // After mount, it should still be true since scroll > threshold
    expect(result.current.isVisible).toBe(true);
  });

  it('updates on resize event', async () => {
    const { result } = renderHook(() => useScrollToggle({ threshold: 400 }));

    await waitFor(() => {
      expect(result.current.mounted).toBe(true);
    });

    Object.defineProperty(window, 'pageYOffset', { writable: true, value: 500 });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('cleans up event listeners on unmount', async () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScrollToggle());

    await waitFor(() => {});

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
