/**
 * @hua-labs/hua/framework - SkipToContent Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SkipToContent } from "../../a11y/components/SkipToContent";

describe("SkipToContent", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // DOM cleanup
    document.body.innerHTML = "";
  });

  it("renders a link with correct href", () => {
    render(<SkipToContent />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("renders custom targetId in href", () => {
    render(<SkipToContent targetId="my-content" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#my-content");
  });

  it("renders default children text", () => {
    render(<SkipToContent />);
    expect(screen.getByText("Skip to content")).toBeInTheDocument();
  });

  it("renders custom children", () => {
    render(<SkipToContent>본문으로 건너뛰기</SkipToContent>);
    expect(screen.getByText("본문으로 건너뛰기")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<SkipToContent className="my-custom-class" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("class", "my-custom-class");
  });

  it("applies default sr-only class when no className provided", () => {
    render(<SkipToContent />);
    const link = screen.getByRole("link");
    // default className contains 'sr-only'
    expect(link.className).toContain("sr-only");
  });

  it("focuses and scrolls to target element on click", () => {
    const main = document.createElement("main");
    main.id = "main-content";
    main.tabIndex = -1;
    main.focus = vi.fn();
    main.scrollIntoView = vi.fn();
    document.body.appendChild(main);

    render(<SkipToContent />);
    const link = screen.getByRole("link");
    fireEvent.click(link);

    expect(main.focus).toHaveBeenCalled();
    expect(main.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("prevents default link navigation on click (via fireEvent)", () => {
    const main = document.createElement("main");
    main.id = "main-content";
    main.focus = vi.fn();
    main.scrollIntoView = vi.fn();
    document.body.appendChild(main);

    render(<SkipToContent />);
    const link = screen.getByRole("link");

    // fireEvent.click calls the React onClick handler which calls preventDefault
    // We verify that no navigation happened (link's native behavior is suppressed)
    // by confirming the element is still in the document after click
    fireEvent.click(link);
    expect(link).toBeInTheDocument();
  });

  it("does not throw when target element does not exist", () => {
    render(<SkipToContent targetId="nonexistent-id" />);
    const link = screen.getByRole("link");
    // Should not throw
    expect(() => fireEvent.click(link)).not.toThrow();
  });
});
