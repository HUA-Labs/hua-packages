/**
 * @hua-labs/hua/framework - LiveRegion Component Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { LiveRegion } from "../../a11y/components/LiveRegion";

describe("LiveRegion", () => {
  it('renders a div with role="status"', () => {
    render(<LiveRegion />);
    const region = screen.getByRole("status");
    expect(region).toBeInTheDocument();
  });

  it('sets aria-live="polite" by default', () => {
    render(<LiveRegion />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it('sets aria-live="assertive" when politeness is assertive', () => {
    render(<LiveRegion politeness="assertive" />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "assertive");
  });

  it('sets aria-live="off" when politeness is off', () => {
    render(<LiveRegion politeness="off" />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "off");
  });

  it('sets aria-atomic="true"', () => {
    render(<LiveRegion />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-atomic", "true");
  });

  it("renders message content", () => {
    render(<LiveRegion message="저장되었습니다!" />);
    expect(screen.getByText("저장되었습니다!")).toBeInTheDocument();
  });

  it("renders empty when no message provided", () => {
    render(<LiveRegion />);
    const region = screen.getByRole("status");
    expect(region.textContent).toBe("");
  });

  it("applies default sr-only class", () => {
    render(<LiveRegion />);
    const region = screen.getByRole("status");
    expect(region.className).toContain("sr-only");
  });

  it("applies custom className", () => {
    render(<LiveRegion className="my-class" />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("class", "my-class");
  });

  it("updates displayed message when message prop changes", () => {
    const { rerender } = render(<LiveRegion message="First message" />);
    expect(screen.getByText("First message")).toBeInTheDocument();

    rerender(<LiveRegion message="Second message" />);
    expect(screen.getByText("Second message")).toBeInTheDocument();
  });
});
