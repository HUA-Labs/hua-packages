"use client";

import React, { useState, useMemo } from "react";
import { dotVariants } from "@hua-labs/dot";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { Card, CardProps } from "./Card";
import type { CSSProperties } from "react";
import { createGlassStyle } from "../lib/styles/glass";

const panelVariantStyles = dotVariants({
  base: "",
  variants: {
    padding: {
      none: "p-0",
      small: "p-3",
      sm: "p-3",
      medium: "p-6",
      md: "p-6",
      large: "p-8",
      lg: "p-8",
      xl: "p-12",
      custom: "",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
      custom: "",
    },
  },
  defaultVariants: {
    padding: "md",
    rounded: "lg",
  },
});

const STYLE_BASE: Record<string, CSSProperties> = {
  default: {
    backgroundColor: "var(--color-card)",
    color: "var(--color-card-foreground)",
    border: "1px solid var(--color-border)",
  },
  solid: {
    backgroundColor: "var(--color-card)",
    color: "var(--color-card-foreground)",
    border: "1px solid var(--color-border)",
  },
  glass: {
    ...createGlassStyle("heavy"),
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    border:
      "1px solid color-mix(in srgb, var(--color-border) 50%, transparent)",
  },
  outline: {
    backgroundColor: "transparent",
    border: "1px solid var(--color-border)",
  },
  elevated: {
    backgroundColor: "var(--color-card)",
    color: "var(--color-card-foreground)",
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
    border: "1px solid var(--color-border)",
  },
  neon: {
    backgroundColor: "color-mix(in srgb, var(--color-muted) 50%, transparent)",
    border: "1px solid rgba(103, 232, 249, 0.3)",
    boxShadow: "0 10px 15px -3px rgba(103, 232, 249, 0.2)",
  },
  holographic: {
    ...createGlassStyle("light"),
    background:
      "linear-gradient(to bottom right, rgba(255,255,255,0.2), rgba(168,85,247,0.2), rgba(6,182,212,0.2))",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  cyberpunk: {
    backgroundColor: "var(--color-card)",
    border: "2px solid #f472b6",
    boxShadow: "0 10px 15px -3px rgba(244, 114, 182, 0.3)",
  },
  minimal: {
    backgroundColor: "var(--color-card)",
    border: "1px solid var(--color-border)",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  },
  luxury: {
    background: "linear-gradient(to bottom right, #fffbeb, #fef3c7)",
    border: "1px solid #fbbf24",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
};

const EFFECT_STYLE: Record<string, CSSProperties> = {
  none: {},
  glow: {
    boxShadow:
      "0 25px 50px -12px color-mix(in srgb, var(--color-primary) 20%, transparent)",
  },
  shadow: { boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" },
  gradient: {
    backgroundImage:
      "linear-gradient(to right, color-mix(in srgb, var(--color-primary) 10%, transparent), rgba(168,85,247,0.1), rgba(6,182,212,0.1))",
  },
  animated: { animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" },
};

/**
 * Panel 컴포넌트의 props / Panel component props
 */
export interface PanelProps extends Omit<
  CardProps,
  "variant" | "style" | "padding" | "rounded"
> {
  style?:
    | "default"
    | "solid"
    | "glass"
    | "outline"
    | "elevated"
    | "neon"
    | "holographic"
    | "cyberpunk"
    | "minimal"
    | "luxury";
  effect?: "none" | "glow" | "shadow" | "gradient" | "animated";

  transparency?: number;
  blurIntensity?: number;
  borderOpacity?: number;
  shadowOpacity?: number;
  glowIntensity?: number;
  glowColor?: string;

  particleEffect?: boolean;
  hoverEffect?: boolean;
  animationEffect?: boolean;

  padding?:
    | "none"
    | "small"
    | "sm"
    | "medium"
    | "md"
    | "large"
    | "lg"
    | "xl"
    | "custom";
  customPadding?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full" | "custom";
  customRounded?: string;

  background?: "solid" | "gradient" | "pattern" | "image" | "video";
  gradientColors?: string[];
  patternType?: "dots" | "lines" | "grid" | "waves" | "custom";
  backgroundImage?: string;
  backgroundVideo?: string;

  interactive?: boolean;
  hoverScale?: number;
  hoverRotate?: number;
  hoverGlow?: boolean;
}

/**
 * Panel 컴포넌트 / Panel component
 *
 * Card를 확장한 고급 스타일링 패널 컴포넌트입니다.
 *
 * @example
 * <Panel><div>내용</div></Panel>
 * <Panel style="glass" effect="glow"><div>Glass 패널</div></Panel>
 * <Panel style="neon" interactive hoverGlow><div>호버 효과</div></Panel>
 */
const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      dot,
      style = "default",
      effect = "none",
      transparency = 1,
      blurIntensity = 0,
      borderOpacity = 1,
      shadowOpacity = 1,
      glowIntensity = 0,
      glowColor = "blue",
      particleEffect = false,
      hoverEffect: _hoverEffect = false,
      animationEffect = false,
      padding = "md",
      customPadding,
      rounded = "lg",
      customRounded,
      background = "solid",
      gradientColors = ["#3B82F6", "#8B5CF6"],
      patternType = "dots",
      backgroundImage,
      backgroundVideo,
      interactive = false,
      hoverScale = 1.05,
      hoverRotate = 0,
      hoverGlow = false,
      children,
      ...cardProps
    },
    ref,
  ): React.ReactElement => {
    const [isHovered, setIsHovered] = useState(false);

    // 패턴 배경 생성
    const patternBackground = useMemo(() => {
      switch (patternType) {
        case "dots":
          return "radial-gradient(circle, #000 1px, transparent 1px)";
        case "lines":
          return "linear-gradient(45deg, #000 1px, transparent 1px)";
        case "grid":
          return "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)";
        case "waves":
          return "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)";
        default:
          return "";
      }
    }, [patternType]);

    // 배경 스타일 생성
    const backgroundStyles = useMemo((): CSSProperties => {
      const styles: CSSProperties = {};

      if (transparency !== 1) {
        styles.opacity = transparency;
      }

      if (blurIntensity > 0) {
        styles.backdropFilter = `blur(${blurIntensity}px)`;
      }

      if (borderOpacity < 1) {
        styles.borderColor = `rgba(0, 0, 0, ${borderOpacity})`;
      }

      if (shadowOpacity < 1) {
        styles.boxShadow = `0 4px 6px -1px rgba(0, 0, 0, ${shadowOpacity * 0.1})`;
      }

      if (glowIntensity > 0) {
        styles.boxShadow = `${styles.boxShadow || ""}, 0 0 ${glowIntensity * 10}px ${glowColor}`;
      }

      switch (background) {
        case "gradient":
          styles.background = `linear-gradient(135deg, ${gradientColors.join(", ")})`;
          break;
        case "pattern":
          styles.backgroundImage = patternBackground;
          break;
        case "image":
          if (backgroundImage) {
            styles.backgroundImage = `url(${backgroundImage})`;
            styles.backgroundSize = "cover";
            styles.backgroundPosition = "center";
          }
          break;
        case "video":
          break;
      }

      return styles;
    }, [
      transparency,
      blurIntensity,
      borderOpacity,
      shadowOpacity,
      glowIntensity,
      glowColor,
      background,
      gradientColors,
      patternBackground,
      backgroundImage,
    ]);

    // 호버 효과
    const hoverStyle = useMemo((): CSSProperties => {
      if (!interactive || !isHovered) return {};
      const s: CSSProperties = {};
      const transforms: string[] = [];
      if (hoverScale !== 1) transforms.push(`scale(${hoverScale})`);
      if (hoverRotate !== 0) transforms.push(`rotate(${hoverRotate}deg)`);
      if (transforms.length) s.transform = transforms.join(" ");
      if (hoverGlow) s.boxShadow = "0 25px 50px -12px rgba(6, 182, 212, 0.3)";
      return s;
    }, [interactive, isHovered, hoverScale, hoverRotate, hoverGlow]);

    // 최종 스타일 합산
    const computedStyle = useMemo(
      () =>
        mergeStyles(
          { transition: "all 300ms" },
          panelVariantStyles({
            padding: customPadding ? "custom" : padding,
            rounded: customRounded ? "custom" : rounded,
          }) as CSSProperties,
          STYLE_BASE[style],
          EFFECT_STYLE[effect],
          customPadding ? { padding: customPadding } : undefined,
          customRounded ? { borderRadius: customRounded } : undefined,
          hoverStyle,
          backgroundStyles,
          resolveDot(dot),
        ),
      [
        style,
        effect,
        padding,
        customPadding,
        rounded,
        customRounded,
        hoverStyle,
        backgroundStyles,
        dot,
      ],
    );

    return (
      <div style={{ position: "relative" }}>
        {/* 비디오 배경 */}
        {background === "video" && backgroundVideo && (
          <video
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "8px",
            }}
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}

        {/* 파티클 효과 */}
        {particleEffect && (
          <div
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {/* 파티클 효과 렌더링 */}
          </div>
        )}

        {/* 메인 Panel */}
        <Card
          ref={ref}
          style={computedStyle}
          onMouseEnter={interactive ? () => setIsHovered(true) : undefined}
          onMouseLeave={interactive ? () => setIsHovered(false) : undefined}
          {...cardProps}
        >
          {children}
        </Card>

        {/* 애니메이션 효과 */}
        {animationEffect && (
          <div
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            {/* 애니메이션 효과 렌더링 */}
          </div>
        )}
      </div>
    );
  },
);

Panel.displayName = "Panel";

export { Panel };
