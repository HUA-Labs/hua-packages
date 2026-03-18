import { dotVariants } from "@hua-labs/dot";
import type { CSSProperties } from "react";
import { createGlassStyle } from "../lib/styles/glass";
import { EASING_FUNCTIONS } from "../lib/motion/presets";

/** Spring easing — HUA 시그니처 "쫀득한" 느낌 (from motion presets) */
const SPRING = EASING_FUNCTIONS.springy;

export const buttonVariantStyles = dotVariants({
  base: "inline-flex items-center justify-center whitespace-nowrap font-medium min-w-fit",
  variants: {
    variant: {
      default:
        "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
      destructive:
        "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)]",
      outline:
        "border-2 border-[var(--color-border)] bg-transparent text-[var(--color-foreground)]",
      secondary:
        "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
      ghost: "bg-transparent text-[var(--color-foreground)]",
      link: "bg-transparent text-[var(--color-primary)]",
      gradient: "text-white",
      neon: "",
      glass: "",
    },
    size: {
      sm: "h-8 px-4 py-2 text-sm",
      md: "h-10 px-6 py-2 text-base",
      lg: "h-12 px-8 py-3 text-lg",
      xl: "h-14 px-10 py-4 text-xl",
      icon: "h-10 w-10 p-0",
    },
    rounded: {
      sm: "rounded",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    },
    shadow: {
      none: "",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
    },
    fullWidth: {
      true: "w-full",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    rounded: "md",
    shadow: "md",
    fullWidth: false,
  },
});

/** Extra base styles per variant (can't be expressed as dot utilities) */
export const VARIANT_EXTRAS: Partial<Record<string, CSSProperties>> = {
  link: { textDecoration: "underline" },
  neon: {
    backgroundColor: "#0f172a",
    color: "#2dd4bf",
    border: "1px solid rgba(20, 184, 166, 0.5)",
    boxShadow: "0 10px 15px -3px rgba(20, 184, 166, 0.2)",
  },
  glass: {
    ...createGlassStyle("heavy"),
    color: "var(--color-foreground)",
  },
};

/** Variant-specific hover overrides */
export const VARIANT_HOVER: Record<string, CSSProperties> = {
  default: { opacity: 0.9 },
  destructive: { opacity: 0.9 },
  outline: {
    backgroundColor: "var(--color-accent)",
    color: "var(--color-accent-foreground)",
  },
  secondary: { opacity: 0.8 },
  ghost: {
    backgroundColor: "var(--color-accent)",
    color: "var(--color-accent-foreground)",
  },
  link: { opacity: 0.8 },
  gradient: {
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  },
  neon: {
    boxShadow: "0 10px 15px -3px rgba(20, 184, 166, 0.4)",
    borderColor: "#2dd4bf",
  },
  glass: { backgroundColor: "rgba(255, 255, 255, 0.7)" },
};

export type HoverEffect = "springy" | "scale" | "glow" | "slide" | "none";

/** Transition strings per hover effect */
export const HOVER_TRANSITIONS: Record<HoverEffect, string> = {
  springy: `transform 180ms ${SPRING}, box-shadow 200ms ease-out, opacity 200ms ease-out, background-color 200ms ease-out, color 200ms ease-out, border-color 200ms ease-out`,
  scale:
    "transform 150ms ease-out, box-shadow 200ms ease-out, opacity 200ms ease-out, background-color 200ms ease-out, color 200ms ease-out",
  glow: "box-shadow 200ms ease-out, opacity 200ms ease-out, background-color 200ms ease-out, color 200ms ease-out",
  slide: `transform 180ms ${SPRING}, box-shadow 200ms ease-out, opacity 200ms ease-out, background-color 200ms ease-out, color 200ms ease-out, border-color 200ms ease-out`,
  none: "opacity 200ms ease-out, background-color 200ms ease-out, color 200ms ease-out",
};

/** Transform applied on hover */
export const HOVER_STYLES: Record<HoverEffect, CSSProperties> = {
  springy: { transform: "scale(1.015)" },
  scale: { transform: "scale(1.015)" },
  glow: {
    boxShadow:
      "0 10px 15px -3px color-mix(in srgb, var(--color-primary) 25%, transparent)",
  },
  slide: { transform: "translateY(-2px)" },
  none: {},
};

/** Transform applied on active (mousedown) */
export const ACTIVE_STYLES: Record<HoverEffect, CSSProperties> = {
  springy: { transform: "scale(0.985)" },
  scale: { transform: "scale(0.985)" },
  glow: {},
  slide: { transform: "translateY(0)" },
  none: {},
};

/** Focus ring variants */
const FOCUS_RING: CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 2px var(--color-background), 0 0 0 3px var(--color-ring)",
};

const FOCUS_RING_NO_OFFSET: CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 1px var(--color-ring)",
};

const FOCUS_RING_DESTRUCTIVE: CSSProperties = {
  outline: "none",
  boxShadow:
    "0 0 0 2px var(--color-background), 0 0 0 3px var(--color-destructive)",
};

export function getFocusRing(variant: string): CSSProperties {
  if (variant === "destructive") return FOCUS_RING_DESTRUCTIVE;
  if (variant === "outline" || variant === "ghost" || variant === "link")
    return FOCUS_RING_NO_OFFSET;
  return FOCUS_RING;
}

export const DISABLED_STYLES: CSSProperties = {
  pointerEvents: "none",
  opacity: 0.5,
};

/** Gradient presets as CSS linear-gradient values */
export const gradientPresets: Record<string, string> = {
  blue: "linear-gradient(to right, #14b8a6, #06b6d4)",
  purple: "linear-gradient(to right, #a855f7, #ec4899)",
  green: "linear-gradient(to right, #22c55e, #10b981)",
  orange: "linear-gradient(to right, #f97316, #ef4444)",
  pink: "linear-gradient(to right, #ec4899, #f43f5e)",
};
