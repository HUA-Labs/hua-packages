import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Slot, composeRefs } from "../Slot";

describe("Slot", () => {
  it("preserves slot then child class bytes exactly once", () => {
    render(
      <Slot className="generated raw__hash">
        <a className="child-class" href="#target">
          Target
        </a>
      </Slot>,
    );

    expect(screen.getByRole("link")).toHaveAttribute(
      "class",
      "generated raw__hash child-class",
    );
  });

  it("owns React 19 callback and object ref cleanup exactly once", () => {
    const node = document.createElement("button");
    const returnedCleanup = vi.fn();
    const cleanupRef = vi.fn((_value: HTMLButtonElement | null) =>
      _value ? returnedCleanup : undefined,
    );
    const voidRef = vi.fn((_value: HTMLButtonElement | null) => undefined);
    const objectRef = React.createRef<HTMLButtonElement>();
    const composed = composeRefs(cleanupRef, voidRef, objectRef);

    const cleanup = composed(node);
    expect(objectRef.current).toBe(node);
    expect(cleanup).toBeTypeOf("function");
    cleanup?.();

    expect(returnedCleanup).toHaveBeenCalledTimes(1);
    expect(cleanupRef).toHaveBeenCalledTimes(1);
    expect(voidRef).toHaveBeenCalledTimes(2);
    expect(voidRef).toHaveBeenNthCalledWith(1, node);
    expect(voidRef).toHaveBeenNthCalledWith(2, null);
    expect(objectRef.current).toBeNull();
  });

  it("runs a child callback-ref cleanup through the rendered Slot", () => {
    const cleanup = vi.fn();
    const childRef = vi.fn((node: HTMLAnchorElement | null) =>
      node ? cleanup : undefined,
    );
    const { unmount } = render(
      <Slot>
        <a ref={childRef} href="#cleanup">
          Cleanup
        </a>
      </Slot>,
    );

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(childRef).toHaveBeenCalledTimes(1);
  });

  it("cleans every StrictMode attachment without a null callback fallback", () => {
    const cleanup = vi.fn();
    const childRef = vi.fn((node: HTMLButtonElement | null) =>
      node ? cleanup : undefined,
    );
    const { unmount } = render(
      <React.StrictMode>
        <Slot>
          <button ref={childRef}>Strict</button>
        </Slot>
      </React.StrictMode>,
    );
    const attachmentCount = childRef.mock.calls.filter(([node]) => node).length;

    unmount();
    expect(attachmentCount).toBeGreaterThan(0);
    expect(cleanup).toHaveBeenCalledTimes(attachmentCount);
    expect(childRef.mock.calls.filter(([node]) => node === null)).toHaveLength(
      0,
    );
  });

  it("cleans an old callback ref before attaching its replacement", () => {
    const firstCleanup = vi.fn();
    const secondCleanup = vi.fn();
    const firstRef = vi.fn((node: HTMLButtonElement | null) =>
      node ? firstCleanup : undefined,
    );
    const secondRef = vi.fn((node: HTMLButtonElement | null) =>
      node ? secondCleanup : undefined,
    );
    const { rerender, unmount } = render(
      <Slot>
        <button ref={firstRef}>Replace</button>
      </Slot>,
    );

    rerender(
      <Slot>
        <button ref={secondRef}>Replace</button>
      </Slot>,
    );
    expect(firstCleanup).toHaveBeenCalledTimes(1);
    expect(secondCleanup).not.toHaveBeenCalled();

    unmount();
    expect(secondCleanup).toHaveBeenCalledTimes(1);
    expect(firstRef).toHaveBeenCalledTimes(1);
    expect(secondRef).toHaveBeenCalledTimes(1);
  });
});
