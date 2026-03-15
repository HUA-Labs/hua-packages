/**
 * SDUI registry.tsx — smoke tests
 *
 * Covers: defaultRegistry existence, extendRegistry, hasComponent
 */

import { describe, it, expect } from "vitest";
import {
  defaultRegistry,
  extendRegistry,
  hasComponent,
} from "../../sdui/registry";
import React from "react";

// ── defaultRegistry ──────────────────────────────────────────────────────────

describe("defaultRegistry", () => {
  // Layout
  it("contains Box", () => {
    expect(defaultRegistry.Box).toBeDefined();
  });

  it("contains Flex", () => {
    expect(defaultRegistry.Flex).toBeDefined();
  });

  it("contains Grid", () => {
    expect(defaultRegistry.Grid).toBeDefined();
  });

  it("contains Section", () => {
    expect(defaultRegistry.Section).toBeDefined();
  });

  it("contains Spacer", () => {
    expect(defaultRegistry.Spacer).toBeDefined();
  });

  it("contains Container", () => {
    expect(defaultRegistry.Container).toBeDefined();
  });

  it("contains Divider", () => {
    expect(defaultRegistry.Divider).toBeDefined();
  });

  // Typography
  it("contains Text", () => {
    expect(defaultRegistry.Text).toBeDefined();
  });

  it("contains H1", () => {
    expect(defaultRegistry.H1).toBeDefined();
  });

  it("contains H2", () => {
    expect(defaultRegistry.H2).toBeDefined();
  });

  it("contains H3", () => {
    expect(defaultRegistry.H3).toBeDefined();
  });

  it("contains H4", () => {
    expect(defaultRegistry.H4).toBeDefined();
  });

  it("contains Link", () => {
    expect(defaultRegistry.Link).toBeDefined();
  });

  // Media
  it("contains Image", () => {
    expect(defaultRegistry.Image).toBeDefined();
  });

  it("contains Icon", () => {
    expect(defaultRegistry.Icon).toBeDefined();
  });

  // Basic UI
  it("contains Button", () => {
    expect(defaultRegistry.Button).toBeDefined();
  });

  it("contains Badge", () => {
    expect(defaultRegistry.Badge).toBeDefined();
  });

  it("contains Avatar", () => {
    expect(defaultRegistry.Avatar).toBeDefined();
  });

  it("contains Input", () => {
    expect(defaultRegistry.Input).toBeDefined();
  });

  it("contains Textarea", () => {
    expect(defaultRegistry.Textarea).toBeDefined();
  });

  it("contains Label", () => {
    expect(defaultRegistry.Label).toBeDefined();
  });

  it("contains Checkbox", () => {
    expect(defaultRegistry.Checkbox).toBeDefined();
  });

  it("contains Switch", () => {
    expect(defaultRegistry.Switch).toBeDefined();
  });

  it("contains Skeleton", () => {
    expect(defaultRegistry.Skeleton).toBeDefined();
  });

  it("contains Progress", () => {
    expect(defaultRegistry.Progress).toBeDefined();
  });

  // Card family
  it("contains Card", () => {
    expect(defaultRegistry.Card).toBeDefined();
  });

  it("contains CardHeader", () => {
    expect(defaultRegistry.CardHeader).toBeDefined();
  });

  it("contains CardTitle", () => {
    expect(defaultRegistry.CardTitle).toBeDefined();
  });

  it("contains CardContent", () => {
    expect(defaultRegistry.CardContent).toBeDefined();
  });

  it("contains CardFooter", () => {
    expect(defaultRegistry.CardFooter).toBeDefined();
  });

  // Feedback
  it("contains Alert", () => {
    expect(defaultRegistry.Alert).toBeDefined();
  });

  // Advanced
  it("contains Header", () => {
    expect(defaultRegistry.Header).toBeDefined();
  });

  it("contains HeroSection", () => {
    expect(defaultRegistry.HeroSection).toBeDefined();
  });

  it("contains ScrollProgress", () => {
    expect(defaultRegistry.ScrollProgress).toBeDefined();
  });

  // Interactive
  it("contains Accordion", () => {
    expect(defaultRegistry.Accordion).toBeDefined();
  });

  it("contains Tabs", () => {
    expect(defaultRegistry.Tabs).toBeDefined();
  });

  // Batch A1 — Layout/Structure
  it("contains Stack", () => {
    expect(defaultRegistry.Stack).toBeDefined();
  });

  it("contains Panel", () => {
    expect(defaultRegistry.Panel).toBeDefined();
  });

  it("contains SectionHeader", () => {
    expect(defaultRegistry.SectionHeader).toBeDefined();
  });

  it("contains Pressable", () => {
    expect(defaultRegistry.Pressable).toBeDefined();
  });

  // Batch A2 — Navigation
  it("contains Breadcrumb", () => {
    expect(defaultRegistry.Breadcrumb).toBeDefined();
  });

  it("contains Pagination", () => {
    expect(defaultRegistry.Pagination).toBeDefined();
  });

  it("contains Navigation", () => {
    expect(defaultRegistry.Navigation).toBeDefined();
  });

  it("contains PageNavigation", () => {
    expect(defaultRegistry.PageNavigation).toBeDefined();
  });

  it("contains DotNav", () => {
    expect(defaultRegistry.DotNav).toBeDefined();
  });

  // Batch A3 — Display/Card variants
  it("contains FeatureCard", () => {
    expect(defaultRegistry.FeatureCard).toBeDefined();
  });

  it("contains InfoCard", () => {
    expect(defaultRegistry.InfoCard).toBeDefined();
  });

  it("contains StatsPanel", () => {
    expect(defaultRegistry.StatsPanel).toBeDefined();
  });

  it("contains LanguageToggle", () => {
    expect(defaultRegistry.LanguageToggle).toBeDefined();
  });

  it("contains ThemeToggle", () => {
    expect(defaultRegistry.ThemeToggle).toBeDefined();
  });

  it("all entries are valid React component types (function or forwardRef object)", () => {
    for (const [type, comp] of Object.entries(defaultRegistry)) {
      const isFunction = typeof comp === "function";
      // React.forwardRef returns an object with $$typeof === Symbol(react.forward_ref)
      const isForwardRef =
        typeof comp === "object" && comp !== null && "$$typeof" in comp;
      expect(
        isFunction || isForwardRef,
        `${type} should be a function or forwardRef object, got ${typeof comp}`,
      ).toBe(true);
    }
  });
});

// ── extendRegistry ────────────────────────────────────────────────────────────

describe("extendRegistry", () => {
  const CustomCard: React.FC<Record<string, unknown>> = () =>
    React.createElement("div", null, "custom");

  it("includes all default components in the extended registry", () => {
    const extended = extendRegistry({ CustomCard });
    // Spot-check a few defaults
    expect(extended.Button).toBeDefined();
    expect(extended.Box).toBeDefined();
    expect(extended.Text).toBeDefined();
  });

  it("adds the custom component to the extended registry", () => {
    const extended = extendRegistry({ CustomCard });
    expect(extended.CustomCard).toBe(CustomCard);
  });

  it("does not mutate the defaultRegistry", () => {
    extendRegistry({ NewComp: CustomCard });
    expect(
      (defaultRegistry as Record<string, unknown>).NewComp,
    ).toBeUndefined();
  });

  it("overrides an existing component when the same key is provided", () => {
    const MyButton: React.FC<Record<string, unknown>> = () =>
      React.createElement("button", null, "custom");
    const extended = extendRegistry({ Button: MyButton });
    expect(extended.Button).toBe(MyButton);
    // Original defaultRegistry.Button is unchanged
    expect(defaultRegistry.Button).not.toBe(MyButton);
  });

  it("can add multiple custom components at once", () => {
    const A: React.FC<Record<string, unknown>> = () => null;
    const B: React.FC<Record<string, unknown>> = () => null;
    const extended = extendRegistry({ A, B });
    expect(extended.A).toBe(A);
    expect(extended.B).toBe(B);
  });

  it("returns a new object (not the original defaultRegistry reference)", () => {
    const extended = extendRegistry({});
    expect(extended).not.toBe(defaultRegistry);
  });
});

// ── hasComponent ──────────────────────────────────────────────────────────────

describe("hasComponent", () => {
  it("returns true for a known component type", () => {
    expect(hasComponent(defaultRegistry, "Button")).toBe(true);
  });

  it("returns false for an unknown type", () => {
    expect(hasComponent(defaultRegistry, "Unicorn")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(hasComponent(defaultRegistry, "")).toBe(false);
  });

  it("is case-sensitive — 'button' is not 'Button'", () => {
    expect(hasComponent(defaultRegistry, "button")).toBe(false);
  });

  it("returns true for a component added via extendRegistry", () => {
    const CustomComp: React.FC<Record<string, unknown>> = () => null;
    const extended = extendRegistry({ CustomComp });
    expect(hasComponent(extended, "CustomComp")).toBe(true);
  });

  it("works with an arbitrary registry object", () => {
    const MyComp: React.FC<Record<string, unknown>> = () => null;
    const registry = { MyComp };
    expect(hasComponent(registry, "MyComp")).toBe(true);
    expect(hasComponent(registry, "Other")).toBe(false);
  });
});
