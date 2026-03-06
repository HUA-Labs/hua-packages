"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";

/**
 * MembershipBadge 컴포넌트의 props / MembershipBadge component props
 * @typedef {Object} MembershipBadgeProps
 * @property {"basic" | "pro" | "premium" | "admin"} tier - 멤버십 등급 / Membership tier
 * @property {string} [label] - 커스텀 라벨 (기본값: 등급별 라벨) / Custom label (default: tier-specific label)
 * @property {"sm" | "md" | "lg"} [size="md"] - 배지 크기 / Badge size
 * @property {boolean} [showIcon=true] - 아이콘 표시 여부 / Show icon
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 */
export interface MembershipBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'className'> {
  tier: "basic" | "pro" | "premium" | "admin";
  label?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  dot?: string;
}

const tierConfig = {
  basic: {
    gradient: "linear-gradient(to right, #6366f1, #06b6d4)",
    label: "Basic",
  },
  pro: {
    gradient: "linear-gradient(to right, #a855f7, #ec4899)",
    label: "Pro",
  },
  premium: {
    gradient: "linear-gradient(to right, #facc15, #f97316)",
    label: "Premium",
  },
  admin: {
    gradient: "linear-gradient(to right, #ef4444, #ec4899)",
    label: "Admin",
  },
};

const sizeConfig = {
  sm: {
    padding: "0.125rem 0.5rem",
    fontSize: "0.75rem",
    iconSize: "0.625rem",
  },
  md: {
    padding: "0.25rem 0.75rem",
    fontSize: "0.75rem",
    iconSize: "0.75rem",
  },
  lg: {
    padding: "0.375rem 1rem",
    fontSize: "0.875rem",
    iconSize: "1rem",
  },
};

/**
 * MembershipBadge 컴포넌트
 *
 * 멤버십 등급을 표시하는 배지 컴포넌트입니다.
 * 등급별로 다른 그라디언트 색상과 아이콘을 제공합니다.
 *
 * Badge component that displays membership tier.
 * Provides different gradient colors and icons for each tier.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <MembershipBadge tier="premium" />
 *
 * @example
 * // 커스텀 라벨과 크기 / Custom label and size
 * <MembershipBadge
 *   tier="pro"
 *   label="프로 플랜"
 *   size="lg"
 *   showIcon={false}
 * />
 *
 * @param {MembershipBadgeProps} props - MembershipBadge 컴포넌트의 props / MembershipBadge component props
 * @param {React.Ref<HTMLSpanElement>} ref - span 요소 ref / span element ref
 * @returns {JSX.Element} MembershipBadge 컴포넌트 / MembershipBadge component
 */
export const MembershipBadge = React.forwardRef<HTMLSpanElement, MembershipBadgeProps>(
  (
    {
      tier,
      label,
      size = "md",
      showIcon = true,
      dot,
      style,
      ...props
    },
    ref
  ) => {
    const config = tierConfig[tier];
    const sizes = sizeConfig[size];
    const displayLabel = label || config.label;

    const getIcon = () => {
      if (!showIcon) return null;

      const iconStyle: React.CSSProperties = {
        width: sizes.iconSize,
        height: sizes.iconSize,
        display: "inline-block",
      };

      if (tier === "premium") {
        return (
          <svg style={iconStyle} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }

      if (tier === "admin") {
        return (
          <svg style={iconStyle} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      }

      return (
        <svg style={iconStyle} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    };

    return (
      <span
        ref={ref}
        style={mergeStyles(
          {
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "9999px",
            fontWeight: 600,
            color: "#ffffff",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            backgroundImage: config.gradient,
            padding: sizes.padding,
            fontSize: sizes.fontSize,
          },
          resolveDot(dot),
          style
        )}
        {...props}
      >
        {showIcon && <span style={{ marginRight: "0.25rem" }}>{getIcon()}</span>}
        {displayLabel}
      </span>
    );
  }
);

MembershipBadge.displayName = "MembershipBadge";
