"use client";

import React from "react";
import { merge } from "../../lib/utils";

export interface MembershipBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tier: "basic" | "pro" | "premium" | "admin";
  label?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const tierConfig = {
  basic: {
    gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    label: "Basic",
  },
  pro: {
    gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
    label: "Pro",
  },
  premium: {
    gradient: "bg-gradient-to-r from-yellow-400 to-orange-500",
    label: "Premium",
  },
  admin: {
    gradient: "bg-gradient-to-r from-red-500 to-pink-500",
    label: "Admin",
  },
};

const sizeClasses = {
  sm: {
    container: "px-2 py-0.5 text-xs",
    icon: "w-2.5 h-2.5",
  },
  md: {
    container: "px-3 py-1 text-xs",
    icon: "w-3 h-3",
  },
  lg: {
    container: "px-4 py-1.5 text-sm",
    icon: "w-4 h-4",
  },
};

export const MembershipBadge = React.forwardRef<HTMLSpanElement, MembershipBadgeProps>(
  (
    {
      tier,
      label,
      size = "md",
      showIcon = true,
      className,
      ...props
    },
    ref
  ) => {
    const config = tierConfig[tier];
    const sizeStyle = sizeClasses[size];
    const displayLabel = label || config.label;

    const getIcon = () => {
      if (!showIcon) return null;

      if (tier === "premium") {
        return (
          <svg className={sizeStyle.icon} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }

      if (tier === "admin") {
        return (
          <svg className={sizeStyle.icon} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      }

      return (
        <svg className={sizeStyle.icon} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    };

    return (
      <span
        ref={ref}
        className={merge(
          "inline-flex items-center rounded-full font-semibold text-white shadow-lg",
          config.gradient,
          sizeStyle.container,
          className
        )}
        {...props}
      >
        {showIcon && <span className="mr-1">{getIcon()}</span>}
        {displayLabel}
      </span>
    );
  }
);

MembershipBadge.displayName = "MembershipBadge";

