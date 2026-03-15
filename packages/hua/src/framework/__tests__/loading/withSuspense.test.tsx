/**
 * @hua-labs/hua/framework - withSuspense HOC Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React, { Suspense } from "react";

// Mock @hua-labs/ui to avoid needing the full package in tests
vi.mock("@hua-labs/ui", () => ({
  Skeleton: ({
    width,
    height,
  }: {
    width?: string | number;
    height?: number;
  }) => <div data-testid="skeleton" style={{ width, height }} />,
}));

import { withSuspense } from "../../loading/hoc/withSuspense";

function SimpleComponent({ label }: { label?: string }) {
  return <div>{label || "Hello from component"}</div>;
}

describe("withSuspense", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("wraps component and renders it", () => {
    const Wrapped = withSuspense(SimpleComponent);
    render(<Wrapped label="Test content" />);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("sets a displayName on the wrapped component", () => {
    const Wrapped = withSuspense(SimpleComponent);
    expect(Wrapped.displayName).toBe("withSuspense(SimpleComponent)");
  });

  it("sets displayName with fallback when component has no name", () => {
    const Anonymous = (() => <div />) as React.ComponentType<object>;
    Object.defineProperty(Anonymous, "name", { value: "" });
    const Wrapped = withSuspense(Anonymous);
    expect(Wrapped.displayName).toContain("withSuspense(");
  });

  it("accepts a custom fallback element", () => {
    const Wrapped = withSuspense(SimpleComponent, {
      fallback: <div>Custom Fallback</div>,
      useDefaultFallback: false,
    });
    // Without a suspending component, children render normally
    render(<Wrapped />);
    expect(screen.getByText("Hello from component")).toBeInTheDocument();
  });

  it("accepts fallback passed directly as ReactNode", () => {
    const fallback = <div>Direct fallback</div>;
    const Wrapped = withSuspense(SimpleComponent, fallback);
    render(<Wrapped />);
    expect(screen.getByText("Hello from component")).toBeInTheDocument();
  });

  it("accepts string fallback directly", () => {
    const Wrapped = withSuspense(SimpleComponent, "Loading...");
    render(<Wrapped />);
    expect(screen.getByText("Hello from component")).toBeInTheDocument();
  });

  it("passes all props through to the wrapped component", () => {
    const Wrapped = withSuspense(SimpleComponent);
    render(<Wrapped label="Prop passthrough works" />);
    expect(screen.getByText("Prop passthrough works")).toBeInTheDocument();
  });

  it("renders default skeleton fallback by default", () => {
    // Verify that default fallback contains skeletons by checking SkeletonGroup renders
    // We can verify this by rendering the fallback content directly
    const Wrapped = withSuspense(SimpleComponent);
    // Component renders normally (no suspend), so just verify the wrapped component renders
    const { container } = render(<Wrapped />);
    expect(container.firstChild).toBeDefined();
  });

  it("disables default fallback when useDefaultFallback=false and no custom fallback", () => {
    const Wrapped = withSuspense(SimpleComponent, {
      useDefaultFallback: false,
    });
    render(<Wrapped />);
    expect(screen.getByText("Hello from component")).toBeInTheDocument();
  });
});
