/**
 * @hua-labs/hua/framework - useFocusTrap Hook Tests
 */

import type React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFocusTrap } from "../../a11y/hooks/useFocusTrap";

describe("useFocusTrap", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("returns a ref object", () => {
    const { result } = renderHook(() => useFocusTrap());
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty("current");
  });

  it("accepts isActive=true without throwing", () => {
    expect(() =>
      renderHook(() => useFocusTrap({ isActive: true })),
    ).not.toThrow();
  });

  it("accepts isActive=false without throwing", () => {
    expect(() =>
      renderHook(() => useFocusTrap({ isActive: false })),
    ).not.toThrow();
  });

  it("accepts initialFocus selector option", () => {
    expect(() =>
      renderHook(() =>
        useFocusTrap({ isActive: true, initialFocus: "button" }),
      ),
    ).not.toThrow();
  });

  it("accepts onFocusOut callback", () => {
    const onFocusOut = vi.fn();
    expect(() =>
      renderHook(() => useFocusTrap({ isActive: true, onFocusOut })),
    ).not.toThrow();
  });

  it("accepts onEscape callback", () => {
    const onEscape = vi.fn();
    expect(() =>
      renderHook(() => useFocusTrap({ isActive: true, onEscape })),
    ).not.toThrow();
  });

  it("returns stable ref across re-renders", () => {
    const { result, rerender } = renderHook(() => useFocusTrap());
    const firstRef = result.current;
    rerender();
    expect(result.current).toBe(firstRef);
  });

  it("ref.current is null initially (no DOM element attached)", () => {
    const { result } = renderHook(() => useFocusTrap());
    expect(result.current.current).toBeNull();
  });

  it("does not call onEscape when no container is attached", () => {
    const onEscape = vi.fn();
    renderHook(() => useFocusTrap({ isActive: true, onEscape }));

    // No container attached, dispatch to document body should not trigger onEscape
    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    document.body.dispatchEvent(event);

    expect(onEscape).not.toHaveBeenCalled();
  });

  it("handles all options together without throwing", () => {
    expect(() =>
      renderHook(() =>
        useFocusTrap({
          isActive: true,
          onEscape: vi.fn(),
          onFocusOut: vi.fn(),
          initialFocus: "[data-autofocus]",
        }),
      ),
    ).not.toThrow();
  });

  it("uses default isActive=true when not specified", () => {
    // renderHook with no options — should behave as active=true
    const { result } = renderHook(() => useFocusTrap({}));
    expect(result.current).toBeDefined();
  });
});
