/**
 * @hua-labs/hua/framework - useDelayedLoading Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDelayedLoading } from "../../loading/hooks/useDelayedLoading";

describe("useDelayedLoading", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false initially when isLoading is false", () => {
    const { result } = renderHook(() => useDelayedLoading(false));
    expect(result.current).toBe(false);
  });

  it("returns false initially even when isLoading is true (before delay)", () => {
    const { result } = renderHook(() =>
      useDelayedLoading(true, { delay: 300 }),
    );
    expect(result.current).toBe(false);
  });

  it("returns true after delay when isLoading is true", () => {
    const { result } = renderHook(() =>
      useDelayedLoading(true, { delay: 300 }),
    );
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(true);
  });

  it("never shows loading UI if isLoading becomes false before delay", () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoading(isLoading, { delay: 300 }),
      { initialProps: { isLoading: true } },
    );

    // Loading starts
    expect(result.current).toBe(false);

    // Loading completes before the delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ isLoading: false });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should still be false — never showed loading
    expect(result.current).toBe(false);
  });

  it("hides loading UI when isLoading becomes false", () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoading(isLoading, { delay: 300 }),
      { initialProps: { isLoading: true } },
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe(true);

    rerender({ isLoading: false });

    expect(result.current).toBe(false);
  });

  it("respects minDisplayTime — keeps loading visible for minimum duration", () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) =>
        useDelayedLoading(isLoading, { delay: 100, minDisplayTime: 500 }),
      { initialProps: { isLoading: true } },
    );

    // Trigger the loading UI
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(true);

    // Stop loading at 200ms — only 100ms elapsed since loading started
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ isLoading: false });

    // Still showing — minDisplayTime not reached yet
    expect(result.current).toBe(true);

    // Advance remaining minDisplayTime
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe(false);
  });

  it("uses default delay of 300ms", () => {
    const { result } = renderHook(() => useDelayedLoading(true));

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);
  });

  it("accepts delay=0 to show loading immediately", () => {
    const { result } = renderHook(() => useDelayedLoading(true, { delay: 0 }));

    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current).toBe(true);
  });

  it("cleans up timers on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = renderHook(() =>
      useDelayedLoading(true, { delay: 300 }),
    );
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("handles rapid isLoading toggles without race conditions", () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoading(isLoading, { delay: 300 }),
      { initialProps: { isLoading: true } },
    );

    // Toggle rapidly
    rerender({ isLoading: false });
    rerender({ isLoading: true });
    rerender({ isLoading: false });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Final state should be false since last isLoading is false
    expect(result.current).toBe(false);
  });
});
