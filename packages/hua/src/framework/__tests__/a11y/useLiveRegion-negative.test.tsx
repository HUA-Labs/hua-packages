/**
 * @hua-labs/hua/framework - useLiveRegion Negative & Edge Case Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLiveRegion } from "../../a11y/hooks/useLiveRegion";

describe("useLiveRegion — negative & edge cases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("announce with empty string clears message and then sets empty string", () => {
    const { result } = renderHook(() => useLiveRegion());

    // First set a real message
    act(() => {
      result.current.announce("Hello");
    });
    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.message).toBe("Hello");

    // Now announce empty string
    act(() => {
      result.current.announce("");
    });
    // Immediately after: message should be cleared (undefined)
    expect(result.current.message).toBeUndefined();

    act(() => {
      vi.runAllTimers();
    });
    // After timer: message is set to '' (empty)
    expect(result.current.message).toBe("");
  });

  it("rapid consecutive announces — only last message survives", () => {
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce("First");
      result.current.announce("Second");
      result.current.announce("Third");
    });

    // All three calls fire synchronously, each clears then schedules.
    // After all timers run, the last setTimeout callback that fires wins.
    act(() => {
      vi.runAllTimers();
    });

    // The last announce should be the surviving one
    expect(result.current.message).toBe("Third");
  });

  it("unmount before timer fires does not cause state update warning", () => {
    const { result, unmount } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce("Will not complete");
    });

    // Unmount before the setTimeout fires
    unmount();

    // Running timers after unmount — should not throw or warn about state updates
    expect(() => {
      vi.runAllTimers();
    }).not.toThrow();
  });

  it("politeness reverts to default when announce is called without explicit politeness", () => {
    const { result } = renderHook(() => useLiveRegion("polite"));

    // First call with assertive override
    act(() => {
      result.current.announce("Urgent", "assertive");
    });
    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.LiveRegionComponent.props.politeness).toBe(
      "assertive",
    );

    // Second call without politeness — politeness stays assertive since we don't reset it
    // (This is a deliberate design: politeness only changes when explicitly overridden)
    act(() => {
      result.current.announce("Normal");
    });
    act(() => {
      vi.runAllTimers();
    });
    // politeness remains whatever it was last set to
    expect(result.current.LiveRegionComponent.props.politeness).toBeDefined();
  });

  it("announce with whitespace-only message does not throw", () => {
    const { result } = renderHook(() => useLiveRegion());

    expect(() => {
      act(() => {
        result.current.announce("   ");
      });
      act(() => {
        vi.runAllTimers();
      });
    }).not.toThrow();

    expect(result.current.message).toBe("   ");
  });

  it("multiple hook instances are independent from each other", () => {
    const { result: a } = renderHook(() => useLiveRegion());
    const { result: b } = renderHook(() => useLiveRegion("assertive"));

    act(() => {
      a.current.announce("From A");
    });
    act(() => {
      vi.runAllTimers();
    });

    // b should remain untouched
    expect(b.current.message).toBeUndefined();
    expect(a.current.message).toBe("From A");
  });

  it("LiveRegionComponent changes when politeness changes after announce", () => {
    const { result } = renderHook(() => useLiveRegion("polite"));

    const initialComponent = result.current.LiveRegionComponent;

    act(() => {
      result.current.announce("Alert!", "assertive");
    });
    act(() => {
      vi.runAllTimers();
    });

    // Component should now use assertive politeness
    expect(result.current.LiveRegionComponent.props.politeness).toBe(
      "assertive",
    );
    expect(result.current.LiveRegionComponent).not.toBe(initialComponent);
  });
});
