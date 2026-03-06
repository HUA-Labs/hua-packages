"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../../hooks/useDotMap";
import type { KanbanDropIndicatorProps } from "./types";

/**
 * KanbanDropIndicator 컴포넌트
 *
 * 드래그앤드롭 시 드롭 위치를 시각적으로 표시합니다.
 */
export const KanbanDropIndicator = React.forwardRef<HTMLDivElement, KanbanDropIndicatorProps>(
  ({ visible, orientation = "horizontal", dot, style, ...props }, ref) => {
    if (!visible) return null;

    const baseStyle: React.CSSProperties = {
      transition: "all 150ms",
      borderRadius: "9999px",
      backgroundColor: "#6366f1",
    };

    const orientationStyle: React.CSSProperties =
      orientation === "horizontal"
        ? { height: "4px", marginTop: "4px", marginBottom: "4px" }
        : { width: "4px", marginLeft: "4px", marginRight: "4px", alignSelf: "stretch" };

    return (
      <div
        ref={ref}
        style={mergeStyles(baseStyle, orientationStyle, resolveDot(dot), style)}
        {...props}
      />
    );
  }
);

KanbanDropIndicator.displayName = "KanbanDropIndicator";
