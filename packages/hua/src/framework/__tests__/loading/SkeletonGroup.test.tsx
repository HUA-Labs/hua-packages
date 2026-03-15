/**
 * @hua-labs/hua/framework - SkeletonGroup Component Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { SkeletonGroup } from "../../loading/components/SkeletonGroup";

describe("SkeletonGroup", () => {
  it("renders children", () => {
    render(
      <SkeletonGroup>
        <div>Child 1</div>
        <div>Child 2</div>
      </SkeletonGroup>,
    );
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });

  it("applies md spacing class by default", () => {
    const { container } = render(
      <SkeletonGroup>
        <div />
      </SkeletonGroup>,
    );
    expect(container.firstChild).toHaveClass("space-y-4");
  });

  it('applies sm spacing class when spacing="sm"', () => {
    const { container } = render(
      <SkeletonGroup spacing="sm">
        <div />
      </SkeletonGroup>,
    );
    expect(container.firstChild).toHaveClass("space-y-2");
  });

  it('applies lg spacing class when spacing="lg"', () => {
    const { container } = render(
      <SkeletonGroup spacing="lg">
        <div />
      </SkeletonGroup>,
    );
    expect(container.firstChild).toHaveClass("space-y-6");
  });

  it("includes custom className alongside spacing class", () => {
    const { container } = render(
      <SkeletonGroup className="my-wrapper">
        <div />
      </SkeletonGroup>,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("space-y-4");
    expect(el.className).toContain("my-wrapper");
  });

  it("passes through additional HTML attributes", () => {
    const { container } = render(
      <SkeletonGroup data-testid="my-group">
        <div />
      </SkeletonGroup>,
    );
    expect(container.firstChild).toHaveAttribute("data-testid", "my-group");
  });

  it("renders as a div", () => {
    const { container } = render(
      <SkeletonGroup>
        <div />
      </SkeletonGroup>,
    );
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders without children", () => {
    const { container } = render(<SkeletonGroup />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
