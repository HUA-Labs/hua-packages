/**
 * @hua-labs/hua/framework - withSuspense HOC Negative & Edge Case Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@hua-labs/ui", () => ({
  Skeleton: ({
    width,
    height,
  }: {
    width?: string | number;
    height?: number;
  }) => <div data-testid="skeleton" data-width={width} data-height={height} />,
}));

import { withSuspense } from "../../loading/hoc/withSuspense";

// ---- helpers ----

function AlwaysSuspends(): React.ReactElement {
  throw new Promise(() => {});
}

function NormalComponent({ label }: { label?: string }): React.ReactElement {
  return <div>{label ?? "Normal"}</div>;
}

// ---- tests ----

describe("withSuspense — negative & edge cases", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("wrapped suspending component shows default skeleton fallback", () => {
    const WrappedSuspends = withSuspense(AlwaysSuspends);
    render(<WrappedSuspends />);

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("wrapped suspending component shows custom fallback", () => {
    const WrappedSuspends = withSuspense(AlwaysSuspends, {
      fallback: <div>HOC Fallback</div>,
      useDefaultFallback: false,
    });

    render(<WrappedSuspends />);
    expect(screen.getByText("HOC Fallback")).toBeInTheDocument();
  });

  it("wrapped suspending component shows nothing when useDefaultFallback=false and no custom fallback", () => {
    const WrappedSuspends = withSuspense(AlwaysSuspends, {
      useDefaultFallback: false,
    });
    const { container } = render(<WrappedSuspends />);
    expect(container.textContent).toBe("");
  });

  it('displayName falls back to "Component" when component.name is empty', () => {
    const NoName = (() => <div />) as React.ComponentType<object>;
    // Force an empty name (different from undefined)
    Object.defineProperty(NoName, "name", { value: "", configurable: true });
    const Wrapped = withSuspense(NoName);
    expect(Wrapped.displayName).toBe("withSuspense(Component)");
  });

  it("passes props through to suspending component (via type signature)", () => {
    // Verify that the HOC preserves the type of props
    const Wrapped = withSuspense(NormalComponent);
    render(<Wrapped label="Prop passed" />);
    expect(screen.getByText("Prop passed")).toBeInTheDocument();
  });

  it("ReactNode string fallback: component renders normally when not suspended", () => {
    const Wrapped = withSuspense(NormalComponent, "Loading text");
    render(<Wrapped label="Not suspended" />);
    expect(screen.getByText("Not suspended")).toBeInTheDocument();
  });

  it("ReactNode string fallback shows when component suspends", () => {
    const Wrapped = withSuspense(AlwaysSuspends, "Loading text");
    render(<Wrapped />);
    expect(screen.getByText("Loading text")).toBeInTheDocument();
  });

  it("ReactElement fallback shows when component suspends", () => {
    const fallback = <div data-testid="custom-fallback">Custom</div>;
    const Wrapped = withSuspense(AlwaysSuspends, fallback);
    render(<Wrapped />);
    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
  });

  it("multiple wrapped components with different fallbacks are independent", () => {
    const Wrapped1 = withSuspense(AlwaysSuspends, {
      fallback: <div>FB1</div>,
      useDefaultFallback: false,
    });
    const Wrapped2 = withSuspense(AlwaysSuspends, {
      fallback: <div>FB2</div>,
      useDefaultFallback: false,
    });

    render(
      <>
        <Wrapped1 />
        <Wrapped2 />
      </>,
    );

    expect(screen.getByText("FB1")).toBeInTheDocument();
    expect(screen.getByText("FB2")).toBeInTheDocument();
  });

  it("wrapped component renders correctly after React key change (remount)", () => {
    const Wrapped = withSuspense(NormalComponent);
    const { rerender } = render(<Wrapped key="a" label="First" />);
    expect(screen.getByText("First")).toBeInTheDocument();

    rerender(<Wrapped key="b" label="Second" />);
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
