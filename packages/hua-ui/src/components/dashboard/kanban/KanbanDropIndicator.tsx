"use client";

import React from "react";
import { merge } from "../../../lib/utils";
import type { KanbanDropIndicatorProps } from "./types";

/**
 * KanbanDropIndicator 컴포넌트
 *
 * 드래그앤드롭 시 드롭 위치를 시각적으로 표시합니다.
 */
export const KanbanDropIndicator = React.forwardRef<
  HTMLDivElement,
  KanbanDropIndicatorProps
>(({ visible, orientation = "horizontal", className, ...props }, ref) => {
  if (!visible) return null;

  return (
    <div
      ref={ref}
      className={merge(
        "transition-all duration-150",
        orientation === "horizontal"
          ? "h-1 my-1 rounded-full bg-indigo-500"
          : "w-1 mx-1 rounded-full bg-indigo-500 self-stretch",
        className
      )}
      {...props}
    />
  );
});

KanbanDropIndicator.displayName = "KanbanDropIndicator";
