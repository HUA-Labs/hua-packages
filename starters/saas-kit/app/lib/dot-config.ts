import { createDotConfig } from "@hua-labs/hua/dot";

/**
 * CSS Variable Bridge — maps Tailwind v4 @theme CSS variables
 * to dot semantic color tokens. Dark mode is handled automatically by CSS
 * variable resolution (no need to pass `dark: true` to dot()).
 *
 * Import this module once at app root to configure the global dot instance.
 */
createDotConfig({
  theme: {
    colors: {
      // Semantic tokens → CSS variable references
      card: "var(--color-card)",
      "card-foreground": "var(--color-card-foreground)",
      background: "var(--color-background)",
      foreground: "var(--color-foreground)",
      muted: "var(--color-muted)",
      "muted-foreground": "var(--color-muted-foreground)",
      border: "var(--color-border)",
      input: "var(--color-input)",
      ring: "var(--color-ring)",
      // NOTE: primary, secondary, destructive are NOT overridden here
      // because dot has existing shade palettes (primary-500, etc.)
      // that would break if replaced with flat strings.
      // Use 'app-primary' prefix for app-specific CSS var colors if needed.
      accent: "var(--color-accent)",
      "accent-foreground": "var(--color-accent-foreground)",
      popover: "var(--color-popover)",
      "popover-foreground": "var(--color-popover-foreground)",
    },
    borderRadius: {
      DEFAULT: "var(--radius-md)",
      sm: "var(--radius-sm)",
      lg: "var(--radius-lg)",
    },
  },
});
