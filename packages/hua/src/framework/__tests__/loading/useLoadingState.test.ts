/**
 * @hua-labs/hua/framework - useLoadingState Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLoadingState } from "../../loading/hooks/useLoadingState";

describe("useLoadingState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with isLoading=false and showLoading=false", () => {
    const { result } = renderHook(() => useLoadingState());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.showLoading).toBe(false);
  });

  it("startLoading sets isLoading to true", () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.startLoading();
    });

    expect(result.current.isLoading).toBe(true);
  });

  it("stopLoading sets isLoading to false", () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.startLoading();
    });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.stopLoading();
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("toggleLoading toggles isLoading state", () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.toggleLoading();
    });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.toggleLoading();
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("showLoading becomes true after delay", () => {
    const { result } = renderHook(() => useLoadingState({ delay: 300 }));

    act(() => {
      result.current.startLoading();
    });
    expect(result.current.showLoading).toBe(false);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.showLoading).toBe(true);
  });

  it("showLoading remains false if loading completes before delay", () => {
    const { result } = renderHook(() => useLoadingState({ delay: 300 }));

    act(() => {
      result.current.startLoading();
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    act(() => {
      result.current.stopLoading();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.showLoading).toBe(false);
  });

  it("startLoading function is stable across renders", () => {
    const { result, rerender } = renderHook(() => useLoadingState());
    const firstStartLoading = result.current.startLoading;
    rerender();
    expect(result.current.startLoading).toBe(firstStartLoading);
  });

  it("stopLoading function is stable across renders", () => {
    const { result, rerender } = renderHook(() => useLoadingState());
    const firstStopLoading = result.current.stopLoading;
    rerender();
    expect(result.current.stopLoading).toBe(firstStopLoading);
  });

  it("toggleLoading function is stable across renders", () => {
    const { result, rerender } = renderHook(() => useLoadingState());
    const firstToggle = result.current.toggleLoading;
    rerender();
    expect(result.current.toggleLoading).toBe(firstToggle);
  });

  it("passes options to useDelayedLoading", () => {
    const { result } = renderHook(() =>
      useLoadingState({ delay: 100, minDisplayTime: 200 }),
    );

    act(() => {
      result.current.startLoading();
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.showLoading).toBe(true);
  });
});
