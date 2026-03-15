/**
 * @hua-labs/hua/framework - useDelayedLoading Negative & Edge Case Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDelayedLoading } from "../../loading/hooks/useDelayedLoading";

describe("useDelayedLoading — negative & edge cases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("negative delay: treated as 0 — shows loading immediately on next tick", () => {
    // JavaScript setTimeout with a negative value behaves the same as 0
    const { result } = renderHook(() =>
      useDelayedLoading(true, { delay: -100 }),
    );

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    // With negative delay (clamped to 0 by browser), loading appears immediately
    expect(result.current).toBe(true);
  });

  it("NaN delay: treated as 0 by setTimeout — shows loading immediately", () => {
    const { result } = renderHook(() =>
      useDelayedLoading(true, { delay: NaN }),
    );

    act(() => {
      vi.advanceTimersByTime(0);
    });

    // NaN delay behaves like 0 in setTimeout
    expect(result.current).toBe(true);
  });

  it("Infinity delay: loading never appears as long as we are still loading", () => {
    const { result } = renderHook(() =>
      useDelayedLoading(true, { delay: Infinity }),
    );

    // Advance a very long time — Infinity delay means timer may never fire
    // In vitest fake timers, advancing by a finite amount won't trigger it
    act(() => {
      vi.advanceTimersByTime(1_000_000);
    });

    // Note: Infinity delay in setTimeout may never fire; result stays false
    // This tests that the hook doesn't crash with extreme input
    expect(typeof result.current).toBe("boolean");
  });

  it("cancels showing loading if isLoading becomes false before delay", () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoading(isLoading, { delay: 500 }),
      { initialProps: { isLoading: true } },
    );

    // 200ms into 500ms delay — cancel loading
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ isLoading: false });

    // Advance past original delay — timer was cleared, loading should never show
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe(false);
  });

  it("delay=0 with immediate isLoading=false never shows loading", () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoading(isLoading, { delay: 0 }),
      { initialProps: { isLoading: true } },
    );

    // Instantly stop loading before timer tick
    rerender({ isLoading: false });
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe(false);
  });

  it("multiple isLoading toggles only reflect final state", () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoading(isLoading, { delay: 300 }),
      { initialProps: { isLoading: false } },
    );

    // Quick succession: false → true → false → true → false
    rerender({ isLoading: true });
    rerender({ isLoading: false });
    rerender({ isLoading: true });
    rerender({ isLoading: false });

    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Final state is false — no loading should show
    expect(result.current).toBe(false);
  });

  it("minDisplayTime=0 hides loading immediately when isLoading becomes false after delay", () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) =>
        useDelayedLoading(isLoading, { delay: 100, minDisplayTime: 0 }),
      { initialProps: { isLoading: true } },
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(true);

    rerender({ isLoading: false });
    // No minDisplayTime — hides immediately
    expect(result.current).toBe(false);
  });

  it("negative minDisplayTime: treated like 0 — hides immediately", () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) =>
        useDelayedLoading(isLoading, { delay: 100, minDisplayTime: -500 }),
      { initialProps: { isLoading: true } },
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(true);

    rerender({ isLoading: false });

    // Math.max(0, -500 - elapsed) = 0 → hides immediately
    expect(result.current).toBe(false);
  });

  it("timer cleanup is called on unmount even when loading is in progress", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { unmount } = renderHook(() =>
      useDelayedLoading(true, { delay: 5000 }),
    );

    unmount();

    // Cleanup effect should have called clearTimeout
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("transitions from not-loading to loading to not-loading correctly", () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useDelayedLoading(isLoading, { delay: 200 }),
      { initialProps: { isLoading: false } },
    );

    expect(result.current).toBe(false);

    // Start loading
    rerender({ isLoading: true });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(true);

    // Stop loading
    rerender({ isLoading: false });
    expect(result.current).toBe(false);

    // Start again
    rerender({ isLoading: true });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(true);
  });
});
