/**
 * @hua-labs/hua/framework - SuspenseWrapper Negative & Edge Case Tests
 *
 * Tests with real React.Suspense suspend behaviour instead of mocks.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React, { Suspense } from "react";

// Mock @hua-labs/ui before importing SuspenseWrapper
vi.mock("@hua-labs/ui", () => ({
  Skeleton: ({
    width,
    height,
  }: {
    width?: string | number;
    height?: number;
  }) => <div data-testid="skeleton" data-width={width} data-height={height} />,
}));

import { SuspenseWrapper } from "../../loading/components/SuspenseWrapper";

// ---- Test helpers ----

/** Creates a component that suspends until the returned `resolve` is called. */
function createSuspendingComponent(): {
  Component: React.FC<{ label?: string }>;
  resolve: () => void;
} {
  let resolvePromise!: () => void;
  let resolved = false;
  const promise = new Promise<void>((r) => {
    resolvePromise = () => {
      resolved = true;
      r();
    };
  });

  const Component: React.FC<{ label?: string }> = ({ label = "Content" }) => {
    if (!resolved) throw promise;
    return <div>{label}</div>;
  };

  return { Component, resolve: resolvePromise };
}

/** A component that always suspends (never resolves). */
function InfinitelySuspending(): React.ReactElement {
  throw new Promise(() => {});
}

// ---- Tests ----

describe("SuspenseWrapper — negative & edge cases (real Suspense)", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows fallback when child component suspends", () => {
    render(
      <SuspenseWrapper fallback={<div>Loading…</div>}>
        <InfinitelySuspending />
      </SuspenseWrapper>,
    );

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("default skeleton fallback is rendered when child suspends and no fallback provided", () => {
    render(
      <SuspenseWrapper>
        <InfinitelySuspending />
      </SuspenseWrapper>,
    );

    // Default fallback renders SkeletonGroup with multiple Skeleton components
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("null fallback renders nothing when useDefaultFallback=false and child suspends", () => {
    const { container } = render(
      <SuspenseWrapper useDefaultFallback={false}>
        <InfinitelySuspending />
      </SuspenseWrapper>,
    );

    expect(container.textContent).toBe("");
  });

  it("custom fallback overrides default skeleton", () => {
    render(
      <SuspenseWrapper
        fallback={<span data-testid="custom">Custom Spinner</span>}
      >
        <InfinitelySuspending />
      </SuspenseWrapper>,
    );

    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(screen.queryAllByTestId("skeleton")).toHaveLength(0);
  });

  it("renders multiple children correctly when none suspend", () => {
    render(
      <SuspenseWrapper>
        <>
          <div>Child A</div>
          <div>Child B</div>
        </>
      </SuspenseWrapper>,
    );

    expect(screen.getByText("Child A")).toBeInTheDocument();
    expect(screen.getByText("Child B")).toBeInTheDocument();
  });

  it("nested SuspenseWrappers each show their own fallback", () => {
    render(
      <SuspenseWrapper fallback={<div>Outer fallback</div>}>
        <SuspenseWrapper fallback={<div>Inner fallback</div>}>
          <InfinitelySuspending />
        </SuspenseWrapper>
      </SuspenseWrapper>,
    );

    // Inner boundary catches first — outer should not display
    expect(screen.getByText("Inner fallback")).toBeInTheDocument();
    expect(screen.queryByText("Outer fallback")).not.toBeInTheDocument();
  });

  it("does not crash when children is null", () => {
    // null is a valid ReactNode
    expect(() =>
      render(<SuspenseWrapper>{null}</SuspenseWrapper>),
    ).not.toThrow();
  });

  it("does not crash when children is a fragment with no children", () => {
    expect(() =>
      render(
        <SuspenseWrapper>
          <></>
        </SuspenseWrapper>,
      ),
    ).not.toThrow();
  });

  it("useDefaultFallback=true is explicit and still uses skeleton on suspend", () => {
    render(
      <SuspenseWrapper useDefaultFallback={true}>
        <InfinitelySuspending />
      </SuspenseWrapper>,
    );

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("skeleton fallback has correct width/height attributes", () => {
    render(
      <SuspenseWrapper>
        <InfinitelySuspending />
      </SuspenseWrapper>,
    );

    const skeletons = screen.getAllByTestId("skeleton");
    // First skeleton: width="60%" height=32
    expect(skeletons[0]).toHaveAttribute("data-width", "60%");
    expect(skeletons[0]).toHaveAttribute("data-height", "32");
  });
});
