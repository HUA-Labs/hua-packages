"use client";

import React, { useMemo } from "react";
import { dot as dotFn } from "@hua-labs/dot";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import type { Color } from "../../lib/types/common";

const s = (input: string) => dotFn(input) as React.CSSProperties;

/**
 * ProgressCard 컴포넌트의 props / ProgressCard component props
 * @typedef {Object} ProgressCardProps
 * @property {string} title - 카드 제목 / Card title
 * @property {number} current - 현재 값 / Current value
 * @property {number} total - 전체 값 / Total value
 * @property {string} [unit] - 단위 / Unit
 * @property {string} [description] - 카드 설명 / Card description
 * @property {IconName | React.ReactNode} [icon] - 아이콘 / Icon
 * @property {"blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray" | "cyan"} [color] - 카드 색상 / Card color
 * @property {"default" | "gradient" | "outline" | "elevated"} [variant="default"] - 카드 스타일 변형 / Card style variant
 * @property {boolean} [showPercentage] - 퍼센트 표시 여부 / Show percentage
 * @property {boolean} [showLabel] - 라벨 표시 여부 / Show label
 * @property {"sm" | "md" | "lg"} [size="md"] - 카드 크기 / Card size
 * @property {boolean} [loading] - 로딩 상태 / Loading state
 * @property {string} [dot] - dot 스타일 유틸리티 문자열 / dot utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 */
export interface ProgressCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  title: string;
  current: number;
  total: number;
  unit?: string;
  description?: string;
  icon?: IconName | React.ReactNode;
  color?: Color;
  variant?: "default" | "gradient" | "outline" | "elevated";
  showPercentage?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Color palette — CSS color values per Color token
// ---------------------------------------------------------------------------
type ColorTokens = {
  /** main accent (e.g. progress bar fill) */
  accent: string;
  /** lighter accent for dark-mode text */
  accentLight: string;
  /** card border (light mode) */
  border: string;
  /** card background (light mode, low opacity) */
  bgLight: string;
  /** icon container background */
  iconBg: string;
  /** gradient start */
  gradFrom: string;
  /** gradient end */
  gradTo: string;
};

const COLOR_TOKENS: Record<Color, ColorTokens> = {
  blue: {
    accent: "#3b82f6",
    accentLight: "#93c5fd",
    border: "#bfdbfe",
    bgLight: "rgba(239,246,255,0.5)",
    iconBg: "rgba(219,234,254,0.6)",
    gradFrom: "#3b82f6",
    gradTo: "#2563eb",
  },
  purple: {
    accent: "#a855f7",
    accentLight: "#d8b4fe",
    border: "#e9d5ff",
    bgLight: "rgba(250,245,255,0.5)",
    iconBg: "rgba(233,213,255,0.6)",
    gradFrom: "#a855f7",
    gradTo: "#9333ea",
  },
  green: {
    accent: "#22c55e",
    accentLight: "#86efac",
    border: "#bbf7d0",
    bgLight: "rgba(240,253,244,0.5)",
    iconBg: "rgba(187,247,208,0.6)",
    gradFrom: "#22c55e",
    gradTo: "#16a34a",
  },
  orange: {
    accent: "#f97316",
    accentLight: "#fdba74",
    border: "#fed7aa",
    bgLight: "rgba(255,247,237,0.5)",
    iconBg: "rgba(254,215,170,0.6)",
    gradFrom: "#f97316",
    gradTo: "#ea580c",
  },
  red: {
    accent: "#ef4444",
    accentLight: "#fca5a5",
    border: "#fecaca",
    bgLight: "rgba(254,242,242,0.5)",
    iconBg: "rgba(254,202,202,0.6)",
    gradFrom: "#ef4444",
    gradTo: "#dc2626",
  },
  indigo: {
    accent: "#6366f1",
    accentLight: "#a5b4fc",
    border: "#c7d2fe",
    bgLight: "rgba(238,242,255,0.5)",
    iconBg: "rgba(199,210,254,0.6)",
    gradFrom: "#6366f1",
    gradTo: "#4f46e5",
  },
  pink: {
    accent: "#ec4899",
    accentLight: "#f9a8d4",
    border: "#fbcfe8",
    bgLight: "rgba(253,242,248,0.5)",
    iconBg: "rgba(251,207,232,0.6)",
    gradFrom: "#ec4899",
    gradTo: "#db2777",
  },
  gray: {
    accent: "#6b7280",
    accentLight: "#9ca3af",
    border: "#d1d5db",
    bgLight: "rgba(249,250,251,0.5)",
    iconBg: "rgba(209,213,219,0.6)",
    gradFrom: "#6b7280",
    gradTo: "#4b5563",
  },
  cyan: {
    accent: "#06b6d4",
    accentLight: "#67e8f9",
    border: "#a5f3fc",
    bgLight: "rgba(236,254,255,0.5)",
    iconBg: "rgba(165,243,252,0.6)",
    gradFrom: "#06b6d4",
    gradTo: "#0891b2",
  },
};

// ---------------------------------------------------------------------------
// Size tokens — CSSProperties equivalents of the old Tailwind sizeStyles
// ---------------------------------------------------------------------------
type SizeTokens = {
  containerPadding: React.CSSProperties;
  iconBox: React.CSSProperties;
  iconInner: React.CSSProperties;
  titleSize: React.CSSProperties;
  valueSize: React.CSSProperties;
  progressHeight: number;
};

const SIZE_TOKENS: Record<"sm" | "md" | "lg", SizeTokens> = {
  sm: {
    containerPadding: { padding: "1rem" },
    iconBox: { width: "2rem", height: "2rem" },
    iconInner: { width: "1rem", height: "1rem" },
    titleSize: { fontSize: "0.875rem" },
    valueSize: { fontSize: "1.25rem" },
    progressHeight: 6,
  },
  md: {
    containerPadding: { padding: "1.5rem" },
    iconBox: { width: "3rem", height: "3rem" },
    iconInner: { width: "1.5rem", height: "1.5rem" },
    titleSize: { fontSize: "1rem" },
    valueSize: { fontSize: "1.5rem" },
    progressHeight: 8,
  },
  lg: {
    containerPadding: { padding: "2rem" },
    iconBox: { width: "4rem", height: "4rem" },
    iconInner: { width: "2rem", height: "2rem" },
    titleSize: { fontSize: "1.125rem" },
    valueSize: { fontSize: "1.875rem" },
    progressHeight: 12,
  },
};

/**
 * ProgressCard 컴포넌트 / ProgressCard component
 *
 * 진행률을 표시하는 카드 컴포넌트입니다.
 * 현재 값과 전체 값을 비교하여 진행률을 시각적으로 표시합니다.
 *
 * Card component that displays progress.
 * Compares current value with total value to visually display progress.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ProgressCard
 *   title="목표 달성률"
 *   current={75}
 *   total={100}
 *   unit="%"
 *   description="이번 달 목표"
 * />
 *
 * @example
 * // 퍼센트 표시 / Show percentage
 * <ProgressCard
 *   title="판매 진행률"
 *   current={150}
 *   total={200}
 *   showPercentage
 *   color="green"
 *   variant="gradient"
 * />
 *
 * @param {ProgressCardProps} props - ProgressCard 컴포넌트의 props / ProgressCard component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ProgressCard 컴포넌트 / ProgressCard component
 */
export const ProgressCard = React.forwardRef<HTMLDivElement, ProgressCardProps>(
  (
    {
      title,
      current,
      total,
      unit = "",
      description,
      icon,
      color = "blue",
      variant = "elevated",
      showPercentage = true,
      showLabel = true,
      size = "md",
      loading = false,
      dot: dotProp,
      style,
      ...props
    },
    ref
  ) => {
    const tokens = COLOR_TOKENS[color];
    const sizes = SIZE_TOKENS[size];
    const percentage =
      total > 0 ? Math.min(Math.max((current / total) * 100, 0), 100) : 0;
    const isGradient = variant === "gradient";

    // ------------------------------------------------------------------
    // Container style by variant
    // ------------------------------------------------------------------
    const containerStyle = useMemo((): React.CSSProperties => {
      const base: React.CSSProperties = {
        ...sizes.containerPadding,
        transition: "all 200ms ease-in-out",
        borderStyle: "solid",
        borderWidth: 1,
      };

      switch (variant) {
        case "gradient":
          return {
            ...base,
            borderRadius: "1rem",
            background: `linear-gradient(135deg, ${tokens.gradFrom}, ${tokens.gradTo})`,
            borderColor: tokens.gradFrom,
            color: "#ffffff",
          };
        case "outline":
          return {
            ...base,
            borderRadius: "1rem",
            borderWidth: 2,
            borderColor: tokens.accent,
            background: "transparent",
          };
        case "elevated":
          return {
            ...base,
            borderRadius: "1.5rem",
            background: "var(--color-card, #ffffff)",
            borderColor: tokens.border,
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.05)",
          };
        case "default":
        default:
          return {
            ...base,
            borderRadius: "1rem",
            background: tokens.bgLight,
            borderColor: tokens.border,
          };
      }
    }, [variant, tokens, sizes.containerPadding]);

    // ------------------------------------------------------------------
    // Icon container style
    // ------------------------------------------------------------------
    const iconContainerStyle = useMemo((): React.CSSProperties => ({
      ...sizes.iconBox,
      borderRadius: "0.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      background: isGradient ? "rgba(255,255,255,0.2)" : tokens.iconBg,
    }), [sizes.iconBox, isGradient, tokens.iconBg]);

    // ------------------------------------------------------------------
    // Text colors derived from variant / dark-mode via CSS vars
    // ------------------------------------------------------------------
    const titleStyle = useMemo((): React.CSSProperties => ({
      ...sizes.titleSize,
      fontWeight: 600,
      marginBottom: "0.25rem",
      color: isGradient ? "#ffffff" : "var(--color-foreground, #1f2937)",
    }), [sizes.titleSize, isGradient]);

    const descriptionStyle = useMemo((): React.CSSProperties => ({
      fontSize: "0.875rem",
      color: isGradient
        ? "rgba(255,255,255,0.9)"
        : "var(--color-muted-foreground, #6b7280)",
    }), [isGradient]);

    const valueStyle = useMemo((): React.CSSProperties => ({
      ...sizes.valueSize,
      fontWeight: 700,
      color: isGradient ? "#ffffff" : tokens.accent,
    }), [sizes.valueSize, isGradient, tokens.accent]);

    const totalLabelStyle = useMemo((): React.CSSProperties => ({
      fontSize: "0.875rem",
      color: isGradient
        ? "rgba(255,255,255,0.8)"
        : "var(--color-muted-foreground, #6b7280)",
    }), [isGradient]);

    const percentageLabelStyle = useMemo((): React.CSSProperties => ({
      fontSize: "0.75rem",
      fontWeight: 600,
      color: isGradient ? "rgba(255,255,255,0.9)" : tokens.accent,
    }), [isGradient, tokens.accent]);

    // ------------------------------------------------------------------
    // Progress bar track + fill
    // ------------------------------------------------------------------
    const progressTrackStyle = useMemo((): React.CSSProperties => ({
      width: "100%",
      height: sizes.progressHeight,
      borderRadius: 9999,
      overflow: "hidden",
      background: isGradient
        ? "rgba(255,255,255,0.25)"
        : "var(--color-muted, #e5e7eb)",
    }), [sizes.progressHeight, isGradient]);

    const progressFillStyle = useMemo((): React.CSSProperties => ({
      height: "100%",
      borderRadius: 9999,
      transition: "width 500ms ease-in-out",
      width: `${percentage}%`,
      background: isGradient
        ? `linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0.9))`
        : tokens.accent,
    }), [percentage, isGradient, tokens.accent]);

    // ------------------------------------------------------------------
    // Merge final container style with dot prop + consumer style override
    // ------------------------------------------------------------------
    const computedStyle = useMemo(
      () => mergeStyles(containerStyle, resolveDot(dotProp), style),
      [containerStyle, dotProp, style]
    );

    // Icon className for size (Icon still accepts className)
    const iconClassName = `w-${size === "sm" ? "4" : size === "md" ? "6" : "8"} h-${size === "sm" ? "4" : size === "md" ? "6" : "8"}`;

    return (
      <div ref={ref} style={computedStyle} {...props}>
        {/* Header row */}
        <div style={s("flex items-start justify-between mb-4")}>
          {/* Icon */}
          {icon && (
            <div style={iconContainerStyle}>
              {typeof icon === "string" ? (
                <Icon
                  name={icon as IconName}
                  className={iconClassName}
                  style={isGradient ? { color: "#ffffff" } : { color: tokens.accent }}
                />
              ) : (
                icon
              )}
            </div>
          )}

          {/* Title + description */}
          <div style={mergeStyles(s("flex-1"), icon ? { marginLeft: "1rem" } : undefined)}>
            <h3 style={titleStyle}>{title}</h3>
            {description && (
              <p style={descriptionStyle}>{description}</p>
            )}
          </div>
        </div>

        {/* Progress section */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div
              style={{
                height: "1rem",
                borderRadius: "0.25rem",
                background: "var(--color-muted, #e5e7eb)",
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }}
            />
            <div
              style={{
                height: sizes.progressHeight,
                borderRadius: "0.25rem",
                background: "var(--color-muted, #e5e7eb)",
                animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
              }}
            />
          </div>
        ) : (
          <>
            {/* Value row */}
            <div style={s("flex items-baseline justify-between mb-2")}>
              <span style={valueStyle}>
                {current.toLocaleString()}
                {unit && (
                  <span style={{ fontSize: "0.875rem", marginLeft: "0.25rem" }}>
                    {unit}
                  </span>
                )}
              </span>
              {showLabel && (
                <span style={totalLabelStyle}>
                  / {total.toLocaleString()}
                  {unit && (
                    <span style={{ marginLeft: "0.25rem" }}>{unit}</span>
                  )}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div style={progressTrackStyle}>
              <div style={progressFillStyle} />
            </div>

            {/* Percentage label */}
            {showPercentage && (
              <div style={s("mt-2 flex justify-end")}>
                <span style={percentageLabelStyle}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

ProgressCard.displayName = "ProgressCard";
