import React, { useId } from "react";
import { dot as dotFn } from "@hua-labs/dot";

export interface ScrollbarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  children: React.ReactNode;
  dot?: string;
  variant?: "default" | "glass" | "colorful" | "minimal" | "neon";
  size?: "sm" | "md" | "lg" | "xl";
  orientation?: "vertical" | "horizontal" | "both";
  autoHide?: boolean;
  smooth?: boolean;
}

// Variant thumb color map (for CSS injection)
const VARIANT_THUMB_COLOR: Record<string, string> = {
  glass: "rgba(255,255,255,0.2)",
  colorful: "rgba(99,102,241,0.8)",
  minimal: "rgba(203,213,225,0.5)",
  neon: "rgba(34,211,238,0.6)",
  default: "rgba(203,213,225,1)",
};

// Scrollbar width in pixels map
const SIZE_WIDTH: Record<string, number> = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

const Scrollbar = React.forwardRef<HTMLDivElement, ScrollbarProps>(
  (
    {
      dot,
      variant = "default",
      size = "md",
      orientation = "both",
      autoHide = true,
      smooth = true,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const uid = useId().replace(/:/g, "");
    const scrollbarId = `hua-scrollbar-${uid}`;

    const thumbColor =
      VARIANT_THUMB_COLOR[variant] ?? VARIANT_THUMB_COLOR.default;
    const scrollbarWidth = SIZE_WIDTH[size] ?? SIZE_WIDTH.md;

    const overflowStyle: React.CSSProperties =
      orientation === "vertical"
        ? { overflowY: "auto", overflowX: "hidden" }
        : orientation === "horizontal"
          ? { overflowX: "auto", overflowY: "hidden" }
          : { overflow: "auto" };

    const containerStyle: React.CSSProperties = {
      ...overflowStyle,
      scrollbarWidth: autoHide ? "none" : "thin",
      scrollbarColor: autoHide
        ? "transparent transparent"
        : `${thumbColor} transparent`,
      scrollBehavior: smooth ? "smooth" : "auto",
      transition: "all 200ms",
      ...(dot ? (dotFn(dot) as React.CSSProperties) : {}),
      ...style,
    };

    // Inject webkit-specific pseudo-element scrollbar styles
    const cssRules = autoHide
      ? `
        .${scrollbarId}::-webkit-scrollbar { display: none; }
      `
      : `
        .${scrollbarId}::-webkit-scrollbar { width: ${scrollbarWidth}px; height: ${scrollbarWidth}px; }
        .${scrollbarId}::-webkit-scrollbar-track { background: transparent; }
        .${scrollbarId}::-webkit-scrollbar-thumb { background: ${thumbColor}; border-radius: 9999px; }
        .${scrollbarId}::-webkit-scrollbar-thumb:hover { background: ${thumbColor}; filter: brightness(1.1); }
      `;

    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: cssRules }} />
        <div
          className={scrollbarId}
          ref={ref}
          style={containerStyle}
          {...props}
        >
          {children}
        </div>
      </>
    );
  },
);
Scrollbar.displayName = "Scrollbar";

export { Scrollbar };
