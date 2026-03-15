/**
 * @hua-labs/hua/framework - SkipToContent Negative & Edge Case Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { SkipToContent } from "../../a11y/components/SkipToContent";

describe("SkipToContent — negative & edge cases", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("does not throw when focus() throws on the target element", () => {
    const main = document.createElement("main");
    main.id = "main-content";
    main.focus = vi.fn().mockImplementation(() => {
      throw new Error("focus failed");
    });
    // scrollIntoView must be a function since jsdom does not provide it
    main.scrollIntoView = vi.fn();
    document.body.appendChild(main);

    render(<SkipToContent />);
    const link = screen.getByRole("link");

    // Should catch the error and not propagate
    expect(() => fireEvent.click(link)).not.toThrow();
  });

  it("does not throw when scrollIntoView is not available on target", () => {
    const main = document.createElement("main");
    main.id = "main-content";
    main.focus = vi.fn();
    // Explicitly remove scrollIntoView (simulate old browser)

    (main as any).scrollIntoView = undefined;
    document.body.appendChild(main);

    render(<SkipToContent />);
    const link = screen.getByRole("link");

    // The implementation wraps the call in try/catch, so undefined scrollIntoView
    // will throw a TypeError that gets swallowed
    expect(() => fireEvent.click(link)).not.toThrow();
  });

  it("does not throw when scrollIntoView throws", () => {
    const main = document.createElement("main");
    main.id = "main-content";
    main.focus = vi.fn();
    main.scrollIntoView = vi.fn().mockImplementation(() => {
      throw new Error("scrollIntoView failed");
    });
    document.body.appendChild(main);

    render(<SkipToContent />);
    const link = screen.getByRole("link");

    expect(() => fireEvent.click(link)).not.toThrow();
  });

  it("click does not navigate when target is missing — link stays in document", () => {
    // No element with id="nonexistent" in the DOM
    render(<SkipToContent targetId="nonexistent" />);
    const link = screen.getByRole("link");

    fireEvent.click(link);

    // The link still exists (no navigation happened)
    expect(link).toBeInTheDocument();
  });

  it("click on link calls focus exactly once when target exists", () => {
    const main = document.createElement("main");
    main.id = "main-content";
    main.focus = vi.fn();
    main.scrollIntoView = vi.fn();
    document.body.appendChild(main);

    render(<SkipToContent />);
    fireEvent.click(screen.getByRole("link"));

    expect(main.focus).toHaveBeenCalledTimes(1);
  });

  it("click on link calls scrollIntoView with smooth behavior exactly once", () => {
    const main = document.createElement("main");
    main.id = "main-content";
    main.focus = vi.fn();
    main.scrollIntoView = vi.fn();
    document.body.appendChild(main);

    render(<SkipToContent />);
    fireEvent.click(screen.getByRole("link"));

    expect(main.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(main.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
  });

  it("renders with empty string targetId without crashing", () => {
    // targetId="" results in href="#" and getElementById("") returns null
    render(<SkipToContent targetId="" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#");

    // Click should not throw even with empty targetId
    expect(() => fireEvent.click(link)).not.toThrow();
  });

  it("renders with empty children gracefully", () => {
    render(<SkipToContent>{""}</SkipToContent>);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link.textContent).toBe("");
  });

  it("multiple rapid clicks on the link do not cause errors", () => {
    const main = document.createElement("main");
    main.id = "main-content";
    main.focus = vi.fn();
    main.scrollIntoView = vi.fn();
    document.body.appendChild(main);

    render(<SkipToContent />);
    const link = screen.getByRole("link");

    expect(() => {
      fireEvent.click(link);
      fireEvent.click(link);
      fireEvent.click(link);
    }).not.toThrow();

    expect(main.focus).toHaveBeenCalledTimes(3);
  });
});
