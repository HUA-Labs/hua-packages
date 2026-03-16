"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { composeRefs } from "../lib/Slot";
import { useAnimatedEntrance } from "../hooks/useAnimatedEntrance";
import { Icon } from "./Icon";
import type { AllIconName } from "../lib/icon-names";

/**
 * FeatureCard 아이콘 타입 / FeatureCard icon type
 * - AllIconName: icons.ts + PROJECT_ICONS의 모든 아이콘 / All icons from icons.ts + PROJECT_ICONS
 * - `http${string}`: 이미지 URL / Image URL
 */
type FeatureCardIconType = AllIconName | `http${string}`;

/**
 * FeatureCard 컴포넌트의 props / FeatureCard component props
 * @typedef {Object} FeatureCardProps
 * @property {FeatureCardIconType} [icon] - 아이콘 (IconName, ProjectIconName 또는 이미지 URL) / Icon (IconName, ProjectIconName or image URL)
 * @property {string} title - 카드 제목 / Card title
 * @property {string} description - 카드 설명 / Card description
 * @property {"default" | "gradient" | "glass" | "neon"} [variant="default"] - FeatureCard 스타일 변형 / FeatureCard style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - FeatureCard 크기 / FeatureCard size
 * @property {"scale" | "glow" | "slide" | "none"} [hover="scale"] - 호버 효과 / Hover effect
 * @property {"blue" | "purple" | "green" | "orange" | "pink" | "custom"} [gradient="blue"] - 그라디언트 색상 / Gradient color
 * @property {string} [customGradient] - 커스텀 그라디언트 (CSS linear-gradient value) / Custom gradient CSS value
 * @property {string} [dot] - dot utility string for additional styles
 * @property {React.CSSProperties} [style] - inline style overrides
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
export interface FeatureCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  icon?: FeatureCardIconType;
  title: string;
  description: string;
  variant?: "default" | "gradient" | "glass" | "neon";
  size?: "sm" | "md" | "lg";
  hover?: "scale" | "glow" | "slide" | "none";
  gradient?: "blue" | "purple" | "green" | "orange" | "pink" | "custom";
  customGradient?: string;
  /** Enable preset entrance animation (reads from MotionConfigContext) */
  animated?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

// ─── Size styles ──────────────────────────────────────────────────────────────

const SIZE_PADDING_DOT: Record<"sm" | "md" | "lg", string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const ICON_PX: Record<"sm" | "md" | "lg", number> = {
  sm: 30,
  md: 36,
  lg: 48,
};

const TITLE_SIZE: Record<"sm" | "md" | "lg", React.CSSProperties> = {
  sm: { fontSize: "1.125rem" },
  md: { fontSize: "1.25rem" },
  lg: { fontSize: "1.5rem" },
};

const DESC_SIZE: Record<"sm" | "md" | "lg", React.CSSProperties> = {
  sm: { fontSize: "0.875rem" },
  md: { fontSize: "0.875rem" },
  lg: { fontSize: "1rem" },
};

// ─── Variant base styles ──────────────────────────────────────────────────────

const VARIANT_BASE: Record<
  "default" | "gradient" | "glass" | "neon",
  React.CSSProperties
> = {
  default: {
    backgroundColor: "var(--color-background, hsl(210 20% 98% / 0.9))",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    border: "1px solid var(--color-border, hsl(210 15% 88% / 0.5))",
  },
  gradient: {
    border: "none",
  },
  glass: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  neon: {
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    border: "1px solid rgba(34, 211, 238, 0.3)",
    boxShadow: "0 10px 15px -3px rgba(34, 211, 238, 0.2)",
  },
};

// ─── Gradient backgrounds ─────────────────────────────────────────────────────

const GRADIENT_BACKGROUNDS: Record<string, string> = {
  blue: "linear-gradient(135deg, #6366f1, #06b6d4, #0891b2)",
  purple: "linear-gradient(135deg, #a855f7, #ec4899, #9333ea)",
  green: "linear-gradient(135deg, #22c55e, #10b981, #16a34a)",
  orange: "linear-gradient(135deg, #f97316, #ef4444, #ea580c)",
  pink: "linear-gradient(135deg, #ec4899, #f43f5e, #db2777)",
};

// ─── Hover effect styles ──────────────────────────────────────────────────────

const HOVER_EFFECTS: Record<
  "scale" | "glow" | "slide" | "none",
  React.CSSProperties
> = {
  scale: { transform: "scale(1.05)" },
  glow: { boxShadow: "0 25px 50px -12px rgba(34, 211, 238, 0.25)" },
  slide: { transform: "translateY(-0.5rem)" },
  none: {},
};

// ─── Shared card base ─────────────────────────────────────────────────────────

const CARD_BASE: React.CSSProperties = {
  borderRadius: "1rem",
  boxShadow:
    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  transition: "all 300ms ease-in-out",
};

/**
 * FeatureCard 컴포넌트 / FeatureCard component
 *
 * 기능을 소개하는 카드 컴포넌트입니다.
 * 아이콘, 제목, 설명을 포함하며, 다양한 스타일과 호버 효과를 지원합니다.
 *
 * Card component that introduces features.
 * Includes icon, title, and description, supports various styles and hover effects.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <FeatureCard
 *   icon="star"
 *   title="고급 기능"
 *   description="강력한 기능을 제공합니다"
 * />
 *
 * @example
 * // Gradient 스타일 / Gradient style
 * <FeatureCard
 *   icon="zap"
 *   title="빠른 성능"
 *   description="최적화된 성능"
 *   variant="gradient"
 *   gradient="purple"
 *   hover="glow"
 * />
 *
 * @param {FeatureCardProps} props - FeatureCard 컴포넌트의 props / FeatureCard component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} FeatureCard 컴포넌트 / FeatureCard component
 */
const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      dot: dotProp,
      icon,
      title,
      description,
      variant = "default",
      size = "md",
      hover = "scale",
      gradient = "blue",
      customGradient,
      animated,
      style,
      ...props
    },
    ref,
  ) => {
    const entrance = useAnimatedEntrance<HTMLDivElement>({
      role: "card",
      enabled: animated,
    });
    const [isHovered, setIsHovered] = useState(false);

    const gradientBackground = useMemo<React.CSSProperties | undefined>(() => {
      if (variant !== "gradient") return undefined;
      const bg =
        customGradient ??
        GRADIENT_BACKGROUNDS[gradient] ??
        GRADIENT_BACKGROUNDS.blue;
      return { background: bg };
    }, [variant, gradient, customGradient]);

    const entranceWillChange = entrance.className
      ? ({ willChange: "opacity, transform" } as React.CSSProperties)
      : undefined;

    const computedStyle = useMemo(
      () =>
        mergeStyles(
          CARD_BASE,
          resolveDot(SIZE_PADDING_DOT[size]),
          VARIANT_BASE[variant],
          gradientBackground,
          hover !== "none" && isHovered ? HOVER_EFFECTS[hover] : undefined,
          entranceWillChange,
          entrance.style,
          resolveDot(dotProp),
          style,
        ),
      [
        size,
        variant,
        gradientBackground,
        hover,
        isHovered,
        entranceWillChange,
        entrance.style,
        dotProp,
        style,
      ],
    );

    // Icon color: neon → cyan, gradient → white, others → inherit
    const iconColor: React.CSSProperties =
      variant === "neon"
        ? { color: "rgb(34, 211, 238)" }
        : variant === "gradient"
          ? { color: "rgba(255, 255, 255, 0.9)" }
          : {};

    const titleColor: React.CSSProperties =
      variant === "gradient"
        ? { color: "#ffffff" }
        : { color: "var(--color-foreground, hsl(210 10% 10%))" };

    const descColor: React.CSSProperties =
      variant === "gradient"
        ? { color: "rgba(255, 255, 255, 0.9)" }
        : { color: "var(--color-muted-foreground, hsl(210 10% 40%))" };

    return (
      <div
        ref={composeRefs(ref, entrance.ref)}
        style={computedStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {icon && (
          <div
            style={{
              ...resolveDot("mb-4"),
              ...iconColor,
            }}
          >
            {typeof icon === "string" && icon.startsWith("http") ? (
              <img
                src={icon}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Icon name={icon as AllIconName} size={ICON_PX[size]} />
            )}
          </div>
        )}

        <h3
          style={mergeStyles(
            { fontWeight: 700, ...resolveDot("mb-2") },
            TITLE_SIZE[size],
            titleColor,
          )}
        >
          {title}
        </h3>

        <p style={mergeStyles(DESC_SIZE[size], descColor)}>{description}</p>
      </div>
    );
  },
);

FeatureCard.displayName = "FeatureCard";

export { FeatureCard };
