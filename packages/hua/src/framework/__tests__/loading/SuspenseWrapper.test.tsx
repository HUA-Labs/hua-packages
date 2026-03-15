/**
 * @hua-labs/hua/framework - SuspenseWrapper Component Tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

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

import { SuspenseWrapper } from "../../loading/components/SuspenseWrapper";

describe("SuspenseWrapper", () => {
  it("renders children when not suspended", () => {
    render(
      <SuspenseWrapper>
        <div>Content loaded</div>
      </SuspenseWrapper>,
    );
    expect(screen.getByText("Content loaded")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    // We can test this by using a component that always suspends
    const promise = new Promise(() => {});
    function SuspendingComponent() {
      throw promise;
    }

    render(
      <SuspenseWrapper fallback={<div>Custom fallback</div>}>
        <SuspendingComponent />
      </SuspenseWrapper>,
    );

    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  });

  it("renders default skeleton fallback when no fallback provided and component suspends", () => {
    const promise = new Promise(() => {});
    function SuspendingComponent() {
      throw promise;
    }

    render(
      <SuspenseWrapper>
        <SuspendingComponent />
      </SuspenseWrapper>,
    );

    // Default fallback renders SkeletonGroup with Skeleton components
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders null fallback when useDefaultFallback=false and no custom fallback", () => {
    const promise = new Promise(() => {});
    function SuspendingComponent() {
      throw promise;
    }

    const { container } = render(
      <SuspenseWrapper useDefaultFallback={false}>
        <SuspendingComponent />
      </SuspenseWrapper>,
    );

    // No fallback = null renders nothing
    expect(container.textContent).toBe("");
  });

  it("accepts useDefaultFallback=true explicitly", () => {
    render(
      <SuspenseWrapper useDefaultFallback={true}>
        <div>Content</div>
      </SuspenseWrapper>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
