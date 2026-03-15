/**
 * @hua-labs/hua/framework - LiveRegion Negative & Edge Case Tests
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { LiveRegion } from "../../a11y/components/LiveRegion";

describe("LiveRegion — negative & edge cases", () => {
  it("renders nothing inside the region when message is empty string", () => {
    render(<LiveRegion message="" />);
    const region = screen.getByRole("status");
    // Empty string should not produce visible text
    expect(region.textContent).toBe("");
  });

  it("renders nothing when message is undefined (default)", () => {
    render(<LiveRegion />);
    const region = screen.getByRole("status");
    expect(region.textContent).toBe("");
  });

  it("preserves aria-live attribute when message is empty string", () => {
    render(<LiveRegion message="" politeness="assertive" />);
    const region = screen.getByRole("status");
    // aria-live should still be set even when message is empty
    expect(region).toHaveAttribute("aria-live", "assertive");
  });

  it("falls back to polite when politeness prop is omitted", () => {
    render(<LiveRegion />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("handles a message consisting only of whitespace", () => {
    render(<LiveRegion message="   " />);
    const region = screen.getByRole("status");
    // Whitespace-only message is technically rendered; verify it does not crash
    expect(region).toBeInTheDocument();
    expect(region.textContent).toBe("   ");
  });

  it("renders an extremely long message without throwing", () => {
    const longMessage = "a".repeat(10_000);
    expect(() => render(<LiveRegion message={longMessage} />)).not.toThrow();
    const region = screen.getByRole("status");
    expect(region.textContent).toBe(longMessage);
  });

  it("handles message with special HTML characters safely", () => {
    // React escapes these by default; test that they don't break rendering
    render(<LiveRegion message="<script>alert(1)</script>" />);
    const region = screen.getByRole("status");
    // textContent exposes the literal string, not HTML — no script execution risk
    expect(region.textContent).toBe("<script>alert(1)</script>");
    // But no <script> element should have been injected into the DOM
    expect(document.body.querySelectorAll("script").length).toBe(0);
  });

  it("clears message when prop changes from text to undefined", () => {
    const { rerender } = render(<LiveRegion message="Hello" />);
    expect(screen.getByRole("status").textContent).toBe("Hello");

    rerender(<LiveRegion />);
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("clears message when prop changes from text to empty string", () => {
    const { rerender } = render(<LiveRegion message="Saved!" />);
    rerender(<LiveRegion message="" />);
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it('politeness "off" still renders the region in the DOM', () => {
    render(<LiveRegion politeness="off" message="hidden" />);
    // Region should still be present (screen reader ignores it, but element exists)
    const region = screen.getByRole("status");
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("aria-live", "off");
  });
});
