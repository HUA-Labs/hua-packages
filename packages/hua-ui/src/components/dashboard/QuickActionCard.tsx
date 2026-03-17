"use client";

import React, { useState, useMemo, useEffect } from "react";
import { dot as dotFn } from "@hua-labs/dot";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import type { Color } from "../../lib/types/common";

// ─── Dark-mode detection ────────────────────────────────────────

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));

    check();

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

// ─── Color palette (hex) ────────────────────────────────────────

const PALETTE: Record<Color, Record<string, string>> = {
  blue: {
    "50": "#eff6ff",
    "200": "#bfdbfe",
    "300": "#93c5fd",
    "400": "#60a5fa",
    "500": "#3b82f6",
    "600": "#2563eb",
    "700": "#1d4ed8",
    "800": "#1e40af",
    "900": "#1e3a8a",
  },
  purple: {
    "50": "#faf5ff",
    "200": "#e9d5ff",
    "300": "#d8b4fe",
    "400": "#c084fc",
    "500": "#a855f7",
    "600": "#9333ea",
    "700": "#7e22ce",
    "800": "#6b21a8",
    "900": "#581c87",
  },
  green: {
    "50": "#f0fdf4",
    "200": "#bbf7d0",
    "300": "#86efac",
    "400": "#4ade80",
    "500": "#22c55e",
    "600": "#16a34a",
    "700": "#15803d",
    "800": "#166534",
    "900": "#14532d",
  },
  orange: {
    "50": "#fff7ed",
    "200": "#fed7aa",
    "300": "#fdba74",
    "400": "#fb923c",
    "500": "#f97316",
    "600": "#ea580c",
    "700": "#c2410c",
    "800": "#9a3412",
    "900": "#7c2d12",
  },
  red: {
    "50": "#fef2f2",
    "200": "#fecaca",
    "300": "#fca5a5",
    "400": "#f87171",
    "500": "#ef4444",
    "600": "#dc2626",
    "700": "#b91c1c",
    "800": "#991b1b",
    "900": "#7f1d1d",
  },
  indigo: {
    "50": "#eef2ff",
    "200": "#c7d2fe",
    "300": "#a5b4fc",
    "400": "#818cf8",
    "500": "#6366f1",
    "600": "#4f46e5",
    "700": "#4338ca",
    "800": "#3730a3",
    "900": "#312e81",
  },
  pink: {
    "50": "#fdf2f8",
    "200": "#fbcfe8",
    "300": "#f9a8d4",
    "400": "#f472b6",
    "500": "#ec4899",
    "600": "#db2777",
    "700": "#be185d",
    "800": "#9d174d",
    "900": "#831843",
  },
  gray: {
    "50": "#f9fafb",
    "200": "#e5e7eb",
    "300": "#d1d5db",
    "400": "#9ca3af",
    "500": "#6b7280",
    "600": "#4b5563",
    "700": "#374151",
    "800": "#1f2937",
    "900": "#111827",
  },
  cyan: {
    "50": "#ecfeff",
    "200": "#a5f3fc",
    "300": "#67e8f9",
    "400": "#22d3ee",
    "500": "#06b6d4",
    "600": "#0891b2",
    "700": "#0e7490",
    "800": "#155e75",
    "900": "#164e63",
  },
  primary: {
    "50": "var(--color-primary, #ecfeff)",
    "100": "var(--color-primary, #cffafe)",
    "200": "var(--color-primary, #a5f3fc)",
    "300": "var(--color-primary, #67e8f9)",
    "400": "var(--color-primary, #22d3ee)",
    "500": "var(--color-primary, #06b6d4)",
    "600": "var(--color-primary, #0891b2)",
    "700": "var(--color-primary, #0e7490)",
    "800": "var(--color-primary, #155e75)",
    "900": "var(--color-primary, #164e63)",
  },
};

function px(color: Color, shade: string): string {
  return PALETTE[color][shade] ?? "#000";
}

/** rgba with alpha from a hex color */
function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Per-variant style builders ─────────────────────────────────

function getGradientStyle(color: Color): React.CSSProperties {
  return {
    background: `linear-gradient(135deg, ${px(color, "500")}, ${px(color, "600")})`,
    borderColor: px(color, "400"),
    color: "#ffffff",
  };
}

function getGradientHoverStyle(color: Color): React.CSSProperties {
  return {
    boxShadow: `0 20px 25px -5px ${rgba(px(color, "500"), 0.3)}, 0 8px 10px -6px ${rgba(px(color, "500"), 0.2)}`,
  };
}

function getOutlineStyle(color: Color, isDark: boolean): React.CSSProperties {
  return {
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: isDark ? px(color, "600") : px(color, "300"),
    backgroundColor: "transparent",
    color: isDark ? px(color, "400") : px(color, "600"),
  };
}

function getOutlineHoverStyle(): React.CSSProperties {
  return {
    boxShadow:
      "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.08)",
  };
}

function getSolidStyle(color: Color): React.CSSProperties {
  return {
    backgroundColor: px(color, "600"),
    color: "#ffffff",
  };
}

function getSolidHoverStyle(color: Color): React.CSSProperties {
  return {
    backgroundColor: px(color, "700"),
    boxShadow:
      "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.08)",
  };
}

// ─── Icon container style ────────────────────────────────────────

function getIconContainerStyle(
  variant: "gradient" | "outline" | "solid",
  color: Color,
  isDark: boolean,
): React.CSSProperties {
  if (variant === "gradient" || variant === "solid") {
    return {
      backgroundColor: "rgba(255,255,255,0.2)",
      width: 48,
      height: 48,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 8px",
      flexShrink: 0,
    };
  }
  // outline
  return {
    backgroundColor: isDark
      ? rgba(px(color, "900"), 0.3)
      : rgba(px(color, "100"), 0.3),
    color: isDark ? px(color, "400") : px(color, "600"),
    width: 48,
    height: 48,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 8px",
    flexShrink: 0,
  };
}

// ─── Base layout style (shared) ─────────────────────────────────

const s = (input: string) => dotFn(input) as React.CSSProperties;

const BASE_LAYOUT: React.CSSProperties = {
  ...s("rounded-2xl p-6 transition-all shadow-lg"),
  textAlign: "center",
  display: "block",
  boxSizing: "border-box",
  cursor: "pointer",
  width: "100%",
  textDecoration: "none",
};

// ─── Types ───────────────────────────────────────────────────────

/**
 * QuickActionCard component props
 */
export interface QuickActionCardProps extends Omit<
  React.HTMLAttributes<HTMLAnchorElement | HTMLButtonElement>,
  "className"
> {
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Icon name or ReactNode */
  icon?: IconName | React.ReactNode;
  /** Link URL — renders as <a> when provided */
  href?: string;
  /** Click handler — renders as <button> when provided */
  onClick?: () => void;
  /** Card style variant */
  variant?: "gradient" | "outline" | "solid";
  /** Card color */
  color?: Color;
  /** Loading state */
  loading?: boolean;
  /** Top-right badge label (e.g. "Coming Soon") */
  badge?: string;
  /** Extra dot utility string */
  dot?: string;
  /** Extra inline style (applied last, overrides everything) */
  style?: React.CSSProperties;
}

// ─── Component ──────────────────────────────────────────────────

/**
 * QuickActionCard component
 *
 * Card component for quick actions.
 * Works as a link or button, used as a clickable action card.
 *
 * @component
 * @example
 * // Link card
 * <QuickActionCard
 *   title="New Order"
 *   description="Create an order quickly"
 *   icon="plus"
 *   href="/orders/new"
 *   color="blue"
 * />
 *
 * @example
 * // Button card
 * <QuickActionCard
 *   title="Download Report"
 *   description="Download the latest report"
 *   icon="download"
 *   onClick={handleDownload}
 *   variant="outline"
 *   color="green"
 * />
 */
export const QuickActionCard = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  QuickActionCardProps
>(
  (
    {
      title,
      description,
      icon,
      href,
      onClick,
      variant = "gradient",
      color = "blue",
      loading = false,
      badge,
      dot: dotProp,
      style: styleProp,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const isDark = useIsDark();

    const isTextWhite = variant === "gradient" || variant === "solid";

    const computedStyle = useMemo<React.CSSProperties>(() => {
      // 1. Variant base style
      let variantStyle: React.CSSProperties;
      let variantHoverStyle: React.CSSProperties | undefined;

      if (variant === "gradient") {
        variantStyle = getGradientStyle(color);
        variantHoverStyle = getGradientHoverStyle(color);
      } else if (variant === "outline") {
        variantStyle = getOutlineStyle(color, isDark);
        variantHoverStyle = getOutlineHoverStyle();
      } else {
        variantStyle = getSolidStyle(color);
        variantHoverStyle = getSolidHoverStyle(color);
      }

      // 2. Position context for badge
      const positionStyle: React.CSSProperties = badge
        ? { position: "relative" }
        : {};

      return mergeStyles(
        BASE_LAYOUT,
        variantStyle,
        positionStyle,
        { transition: "all 200ms ease-in-out" },
        isHovered ? variantHoverStyle : undefined,
        resolveDot(dotProp),
        styleProp,
      );
    }, [variant, color, isDark, badge, isHovered, dotProp, styleProp]);

    const iconContainerStyle = useMemo(
      () => getIconContainerStyle(variant, color, isDark),
      [variant, color, isDark],
    );

    const iconStyle: React.CSSProperties = isTextWhite
      ? { width: 24, height: 24, color: "#ffffff" }
      : { width: 24, height: 24 };

    const titleStyle: React.CSSProperties = {
      fontSize: "1.25rem",
      fontWeight: 600,
      marginBottom: "0.25rem",
      ...(isTextWhite ? { color: "#ffffff" } : {}),
    };

    const descriptionStyle: React.CSSProperties = isTextWhite
      ? { fontSize: "0.875rem", color: "rgba(255,255,255,0.9)", margin: 0 }
      : {
          fontSize: "0.875rem",
          color: isDark ? "var(--color-muted-foreground, #9ca3af)" : "#4b5563",
          margin: 0,
        };

    const badgeStyle: React.CSSProperties = {
      position: "absolute",
      top: 8,
      right: 8,
      fontSize: "0.625rem",
      fontWeight: 500,
      backgroundColor: isDark ? "#374151" : "#e5e7eb",
      color: isDark ? "#9ca3af" : "#6b7280",
      padding: "2px 6px",
      borderRadius: 9999,
      pointerEvents: "none",
    };

    const content = (
      <>
        {/* Badge */}
        {badge && <span style={badgeStyle}>{badge}</span>}

        {/* Icon */}
        {icon && (
          <div style={iconContainerStyle}>
            {typeof icon === "string" ? (
              <Icon name={icon as IconName} style={iconStyle} />
            ) : (
              icon
            )}
          </div>
        )}

        {/* Title */}
        <h3 style={titleStyle}>{title}</h3>

        {/* Description */}
        {description && <p style={descriptionStyle}>{description}</p>}

        {/* Loading bar */}
        {loading && (
          <div
            style={{
              marginTop: 8,
              height: 16,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 4,
              animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
            }}
          />
        )}
      </>
    );

    const interactionHandlers = {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    };

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          style={computedStyle}
          {...interactionHandlers}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        onClick={onClick}
        style={computedStyle}
        {...interactionHandlers}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);

QuickActionCard.displayName = "QuickActionCard";
