/**
 * @hua-labs/hua/framework - useLiveRegion Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLiveRegion } from "../../a11y/hooks/useLiveRegion";

describe("useLiveRegion", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns announce function and LiveRegionComponent", () => {
    const { result } = renderHook(() => useLiveRegion());
    expect(typeof result.current.announce).toBe("function");
    expect(result.current.LiveRegionComponent).toBeDefined();
  });

  it("initializes with undefined message", () => {
    const { result } = renderHook(() => useLiveRegion());
    expect(result.current.message).toBeUndefined();
  });

  it("sets message after announce is called", async () => {
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce("저장되었습니다!");
    });

    // Message is cleared first (undefined), then set via setTimeout
    expect(result.current.message).toBeUndefined();

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.message).toBe("저장되었습니다!");
  });

  it("resets message to undefined before setting new one (ensures screen reader announces)", () => {
    const { result } = renderHook(() => useLiveRegion());

    // Announce first message
    act(() => {
      result.current.announce("First");
    });
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.message).toBe("First");

    // Announce second message — message should be cleared first
    act(() => {
      result.current.announce("Second");
    });

    // At this point message is cleared
    expect(result.current.message).toBeUndefined();

    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.message).toBe("Second");
  });

  it("defaults to polite politeness", () => {
    const { result } = renderHook(() => useLiveRegion());
    // LiveRegionComponent should have polite as default
    const component = result.current.LiveRegionComponent;
    expect(component.props.politeness).toBe("polite");
  });

  it("accepts custom default politeness", () => {
    const { result } = renderHook(() => useLiveRegion("assertive"));
    const component = result.current.LiveRegionComponent;
    expect(component.props.politeness).toBe("assertive");
  });

  it("overrides politeness when announce is called with custom politeness", () => {
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce("Urgent!", "assertive");
    });
    act(() => {
      vi.runAllTimers();
    });

    const component = result.current.LiveRegionComponent;
    expect(component.props.politeness).toBe("assertive");
  });

  it("announce function is stable across renders", () => {
    const { result, rerender } = renderHook(() => useLiveRegion());
    const firstAnnounce = result.current.announce;
    rerender();
    expect(result.current.announce).toBe(firstAnnounce);
  });
});
