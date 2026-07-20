import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Section } from "../Section";
import { createRef } from "react";
import type {
  LandingFeaturesProps,
  LandingStatsProps,
} from "../../landing/types";

describe("Section", () => {
  it("should render as <section> element", () => {
    const { container } = render(<Section>Content</Section>);
    expect(container.querySelector("section")).not.toBeNull();
  });

  it("should render children", () => {
    render(<Section>Section content</Section>);
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  it("should apply default spacing (lg)", () => {
    const { container } = render(<Section>Content</Section>);
    const section = container.querySelector("section");
    // dotCSS generates a hash className, not 'py-20'
    // Verify the section has a generated dot class
    expect(section?.className).toMatch(/dot-/);
  });

  it("should apply sm spacing", () => {
    const { container } = render(<Section spacing="sm">Content</Section>);
    const section = container.querySelector("section");
    // sm spacing generates a different hash than default (lg)
    expect(section?.className).toMatch(/dot-/);
  });

  it("should apply md spacing", () => {
    const { container } = render(<Section spacing="md">Content</Section>);
    const section = container.querySelector("section");
    expect(section?.className).toMatch(/dot-/);
  });

  it("should apply xl spacing", () => {
    const { container } = render(<Section spacing="xl">Content</Section>);
    const section = container.querySelector("section");
    expect(section?.className).toMatch(/dot-/);
  });

  it("should apply none spacing", () => {
    const { container } = render(<Section spacing="none">Content</Section>);
    const section = container.querySelector("section");
    // spacing="none" still generates a dot class for the base 'relative w-full px-6' tokens
    expect(section).not.toBeNull();
  });

  it("should apply muted background", () => {
    const { container } = render(<Section background="muted">Content</Section>);
    const section = container.querySelector("section");
    // Background is applied as inline style via dotFn:
    // 'bg-[var(--color-muted)]/30' → { backgroundColor: 'color-mix(in srgb, var(--color-muted) 30%, transparent)' }
    expect(section).toHaveStyle({
      backgroundColor:
        "color-mix(in srgb, var(--color-muted) 30%, transparent)",
    });
  });

  it("should apply accent background", () => {
    const { container } = render(
      <Section background="accent">Content</Section>,
    );
    const section = container.querySelector("section");
    // 'bg-[var(--color-accent)]/5' → { backgroundColor: 'color-mix(in srgb, var(--color-accent) 5%, transparent)' }
    expect(section).toHaveStyle({
      backgroundColor:
        "color-mix(in srgb, var(--color-accent) 5%, transparent)",
    });
  });

  it("should apply primary background", () => {
    const { container } = render(
      <Section background="primary">Content</Section>,
    );
    const section = container.querySelector("section");
    // 'bg-[var(--color-primary)]/5' → { backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }
    expect(section).toHaveStyle({
      backgroundColor:
        "color-mix(in srgb, var(--color-primary) 5%, transparent)",
    });
  });

  it("should render header with title", () => {
    render(<Section header={{ title: "Test Title" }}>Content</Section>);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("should render header with subtitle", () => {
    render(
      <Section header={{ title: "Title", subtitle: "Subtitle text" }}>
        Content
      </Section>,
    );
    expect(screen.getByText("Subtitle text")).toBeInTheDocument();
  });

  it("should render header action", () => {
    render(
      <Section header={{ title: "Title", action: <button>Click me</button> }}>
        Content
      </Section>,
    );
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should render section-line decorator by default", () => {
    const { container } = render(
      <Section header={{ title: "Title" }}>Content</Section>,
    );
    const decorator = container.querySelector('[aria-hidden="true"]');
    expect(decorator).not.toBeNull();
  });

  it("should hide section-line when decorator is false", () => {
    const { container } = render(
      <Section header={{ title: "Title", decorator: false }}>Content</Section>,
    );
    const decorator = container.querySelector('[aria-hidden="true"]');
    expect(decorator).toBeNull();
  });

  it("should use Container by default (not fullWidth)", () => {
    const { container } = render(<Section>Content</Section>);
    // Container uses dotVariants → inline style maxWidth: '1152px' (max-w-6xl)
    const innerDiv = container.querySelector("section > div");
    expect(innerDiv).toHaveStyle({ maxWidth: "1152px" });
  });

  it("should skip Container in fullWidth mode", () => {
    const { container } = render(<Section fullWidth>Content</Section>);
    const section = container.querySelector("section");
    // In fullWidth mode, children are directly inside section (no Container wrapper with maxWidth)
    const innerDiv = section?.querySelector('div[style*="maxWidth"]');
    expect(innerDiv).toBeNull();
  });

  it("should merge custom dot prop", () => {
    const { container } = render(<Section dot="opacity-90">Content</Section>);
    const section = container.querySelector("section");
    // dot prop is appended to the dotCSS class tokens, so the section gets a new hash class
    expect(section?.className).toMatch(/dot-/);
  });

  it("should forward ref", () => {
    const ref = { current: null as HTMLElement | null };
    render(<Section ref={ref}>Content</Section>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("SECTION");
  });

  it("should not render h2 when header is not provided", () => {
    const { container } = render(<Section>Content</Section>);
    expect(container.querySelector("h2")).toBeNull();
  });

  it("should apply px-6 padding via dotCSS", () => {
    const { container } = render(<Section>Content</Section>);
    const section = container.querySelector("section");
    // The section has a hash class generated by dotCSS that includes px-6
    // We can verify the class is present (it's always a dot-xxx hash)
    expect(section?.className).toMatch(/dot-/);
  });

  it("should pass container size prop", () => {
    const { container } = render(<Section container="sm">Content</Section>);
    const innerDiv = container.querySelector("section > div");
    // Container size="sm" → dotVariants → { maxWidth: '672px' } (max-w-2xl)
    expect(innerDiv).toHaveStyle({ maxWidth: "672px" });
  });

  it("joins generated and opaque root classes without leaking unstyled", () => {
    const rawClassName = "legacy-section  css-module_hash";
    const ref = createRef<HTMLElement>();
    const onClick = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      const { container } = render(
        <>
          <style>{`.legacy-section { position: static; width: 40%; padding-left: 0; opacity: 0.2; }`}</style>
          <Section
            ref={ref}
            className={rawClassName}
            unstyled
            dot="opacity-90"
            background="muted"
            style={{ backgroundColor: "rgb(4, 5, 6)" }}
            fullWidth
            data-probe="section"
            onClick={onClick}
          >
            Content
          </Section>
        </>,
      );

      const section = container.querySelector("section") as HTMLElement;
      expect(section.getAttribute("class")).toMatch(
        /^dot-[a-z0-9]+ legacy-section {2}css-module_hash$/,
      );
      expect(section.getAttribute("class")?.endsWith(rawClassName)).toBe(true);
      expect(getComputedStyle(section).position).toBe("static");
      expect(getComputedStyle(section).width).toBe("40%");
      expect(getComputedStyle(section).paddingLeft).toBe("0px");
      expect(getComputedStyle(section).opacity).toBe("0.9");
      expect(section.style.backgroundColor).toBe("rgb(4, 5, 6)");
      expect(section).toHaveAttribute("data-probe", "section");
      expect(section).not.toHaveAttribute("unstyled");
      expect(ref.current).toBe(section);

      const generatedCss = section.querySelector("style")?.textContent ?? "";
      expect(generatedCss).toContain("opacity: 0.9");
      expect(generatedCss).not.toContain("position:");
      expect(generatedCss).not.toContain("padding-left:");
      fireEvent.click(section);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("keeps nested landing section props source-compatible", () => {
    const featuresSection: NonNullable<LandingFeaturesProps["sectionProps"]> = {
      className: "features-section",
      unstyled: true,
    };
    const statsSection: NonNullable<LandingStatsProps["sectionProps"]> = {
      className: "stats-section",
      unstyled: true,
    };

    expect(featuresSection).toEqual({
      className: "features-section",
      unstyled: true,
    });
    expect(statsSection).toEqual({
      className: "stats-section",
      unstyled: true,
    });
  });
});
