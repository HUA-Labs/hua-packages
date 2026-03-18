/**
 * Shared focus ring utilities for HUA-UI components
 *
 * Focus ring types by component category:
 * - button: Offset double-ring (Button, Toggle)
 * - form: Thin color-mix ring + borderColor (Input, Select, Textarea)
 * - control: Simple ring (Checkbox, Switch, Badge)
 */

import type { CSSProperties } from "react";

// ── Button-style focus (offset double-ring) ────────────────────────────────

export const FOCUS_RING_OFFSET: CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 2px var(--color-background), 0 0 0 3px var(--color-ring)",
};

export const FOCUS_RING_THIN: CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 1px var(--color-ring)",
};

export const FOCUS_RING_DESTRUCTIVE: CSSProperties = {
  outline: "none",
  boxShadow:
    "0 0 0 2px var(--color-background), 0 0 0 3px var(--color-destructive)",
};

/**
 * Get focus ring for a Button/Toggle variant.
 */
export function getButtonFocusRing(variant: string): CSSProperties {
  if (variant === "destructive") return FOCUS_RING_DESTRUCTIVE;
  if (variant === "outline" || variant === "ghost" || variant === "link")
    return FOCUS_RING_THIN;
  return FOCUS_RING_OFFSET;
}

// ── Control-style focus ────────────────────────────────────────────────────

/** Checkbox: 1px ring + 3px color-mix halo */
export const FOCUS_RING_CONTROL_SOFT: CSSProperties = {
  outline: "none",
  boxShadow:
    "0 0 0 1px var(--color-ring), 0 0 0 3px color-mix(in srgb, var(--color-ring) 30%, transparent)",
};

/** Switch, Badge: 1px + 3px solid ring */
export const FOCUS_RING_CONTROL: CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 1px var(--color-ring), 0 0 0 3px var(--color-ring)",
};

// ── Form-style focus (Input, Select, Textarea) ────────────────────────────

/** Base form focus — used by default/outline variants */
export const FORM_FOCUS_BASE: CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-ring) 50%, transparent)",
  borderColor: "var(--color-ring)",
};

/** Form error focus */
export const FORM_FOCUS_ERROR: CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 1px var(--color-destructive)",
  borderColor: "var(--color-destructive)",
};

/** Form success focus */
export const FORM_FOCUS_SUCCESS: CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 1px #22c55e",
  borderColor: "#22c55e",
};

/** Form error border (non-focus) */
export const FORM_BORDER_ERROR: CSSProperties = {
  borderColor: "var(--color-destructive)",
};

/** Form success border (non-focus) */
export const FORM_BORDER_SUCCESS: CSSProperties = {
  borderColor: "#22c55e",
};

/** Form disabled style */
export const FORM_DISABLED: CSSProperties = {
  cursor: "not-allowed",
  opacity: 0.5,
};

// ── Radio focus shadow map ─────────────────────────────────────────────────

export const RADIO_FOCUS_SHADOW: Record<string, string> = {
  default: "0 0 0 1px var(--color-ring)",
  outline: "0 0 0 1px var(--color-ring)",
  filled: "0 0 0 1px var(--color-ring)",
  glass: "0 0 0 1px rgba(var(--color-ring), 0.5)",
  error: "0 0 0 1px var(--color-destructive)",
  success: "0 0 0 1px #22c55e",
};
