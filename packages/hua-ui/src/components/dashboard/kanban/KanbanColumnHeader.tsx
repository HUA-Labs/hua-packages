"use client";

import React, { useState, useRef, useEffect } from "react";
import { mergeStyles, resolveDot } from "../../../hooks/useDotMap";
import { Icon } from "../../Icon";
import type { Color } from "../../../lib/types/common";
import type { KanbanColumnHeaderProps } from "./types";

/**
 * Color dot indicator styles (inline, no Tailwind)
 */
const colorDotStyleMap: Record<Color, React.CSSProperties> = {
  blue: { backgroundColor: "#6366f1" },
  purple: { backgroundColor: "#a855f7" },
  green: { backgroundColor: "#22c55e" },
  orange: { backgroundColor: "#f97316" },
  red: { backgroundColor: "#ef4444" },
  indigo: { backgroundColor: "#6366f1" },
  pink: { backgroundColor: "#ec4899" },
  gray: { backgroundColor: "#6b7280" },
  cyan: { backgroundColor: "#06b6d4" },
  primary: { backgroundColor: "var(--color-primary, #06b6d4)" },
};

/**
 * Badge styles per color (light mode)
 */
const colorBadgeStyleMap: Record<Color, React.CSSProperties> = {
  blue: { backgroundColor: "rgba(239,246,255,0.3)", color: "#1d4ed8" },
  purple: { backgroundColor: "rgba(250,245,255,0.3)", color: "#7e22ce" },
  green: { backgroundColor: "rgba(240,253,244,0.3)", color: "#15803d" },
  orange: { backgroundColor: "rgba(255,247,237,0.3)", color: "#c2410c" },
  red: { backgroundColor: "rgba(254,242,242,0.3)", color: "#b91c1c" },
  indigo: { backgroundColor: "rgba(238,242,255,0.3)", color: "#4338ca" },
  pink: { backgroundColor: "rgba(253,242,248,0.3)", color: "#be185d" },
  gray: { backgroundColor: "rgba(249,250,251,0.3)", color: "#374151" },
  cyan: { backgroundColor: "rgba(236,254,255,0.3)", color: "#0e7490" },
  primary: {
    backgroundColor: "rgba(var(--color-primary-rgb, 6,182,212),0.1)",
    color: "var(--color-primary, #0e7490)",
  },
};

/**
 * KanbanColumnHeader 컴포넌트
 *
 * 칸반 컬럼의 헤더를 렌더링합니다.
 * 제목 편집, 삭제, 접기/펼치기 기능을 제공합니다.
 */
export const KanbanColumnHeader = React.forwardRef<
  HTMLDivElement,
  KanbanColumnHeaderProps
>(
  (
    {
      column,
      cardCount,
      onTitleChange,
      onDelete,
      onToggleCollapse,
      dragHandleProps,
      dot,
      style,
      ...props
    },
    ref,
  ) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(column.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const color: Color = column.color || "gray";
    const dotStyle = colorDotStyleMap[color];
    const badgeStyle = colorBadgeStyleMap[color];
    const wipBadgeStyle: React.CSSProperties = {
      backgroundColor: "#fef3c7",
      color: "#b45309",
    };

    // Focus input when editing starts
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);

    const handleTitleClick = () => {
      if (onTitleChange) {
        setIsEditing(true);
        setEditTitle(column.title);
      }
    };

    const handleTitleSubmit = () => {
      if (editTitle.trim() && editTitle !== column.title) {
        onTitleChange?.(editTitle.trim());
      } else {
        setEditTitle(column.title);
      }
      setIsEditing(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleTitleSubmit();
      } else if (e.key === "Escape") {
        setEditTitle(column.title);
        setIsEditing(false);
      }
    };

    // Collapsed state - only show title vertically centered
    if (column.collapsed) {
      return (
        <div
          ref={ref}
          style={mergeStyles(
            {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: "300px",
              ...resolveDot("py-4 px-2 rounded-xl"),
            },
            resolveDot(dot),
            style,
          )}
          {...props}
        >
          {/* Expand button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse?.();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              ...resolveDot("gap-3 rounded-lg p-2"),
              width: "100%",
              height: "100%",
              justifyContent: "center",
              cursor: "pointer",
              background: "none",
              border: "none",
              transition: "background-color 150ms",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "rgba(229,231,235,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "transparent";
            }}
          >
            <Icon name="chevronRight" size={16} style={{ color: "#9ca3af" }} />
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#374151",
                letterSpacing: "0.05em",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
              }}
            >
              {column.title}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                ...resolveDot("px-2 py-1 rounded-full"),
                fontWeight: 500,
                ...badgeStyle,
              }}
            >
              {cardCount}
            </span>
          </button>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        style={mergeStyles(
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            ...resolveDot("gap-2 p-3"),
            borderBottom: "1px solid #e5e7eb",
          },
          resolveDot(dot),
          style,
        )}
        {...props}
      >
        {/* Left: Drag handle + Color indicator + Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            ...resolveDot("gap-2"),
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* Drag handle */}
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              style={{
                flexShrink: 0,
                ...resolveDot("p-0.5 rounded"),
                marginLeft: "-0.25rem",
                cursor: "grab",
                transition: "background-color 150ms",
              }}
              title="드래그하여 컬럼 이동"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor =
                  "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor =
                  "transparent";
              }}
            >
              <Icon
                name="moreVertical"
                size={16}
                style={{ color: "#9ca3af" }}
              />
            </div>
          )}

          {/* Color dot */}
          <div
            style={{
              ...resolveDot("w-3 h-3 rounded-full"),
              flexShrink: 0,
              ...dotStyle,
            }}
          />

          {/* Title */}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              style={{
                flex: 1,
                minWidth: 0,
                ...resolveDot("px-2 py-1 rounded"),
                fontSize: "0.875rem",
                fontWeight: 600,
                backgroundColor: "transparent",
                border: "1px solid #6366f1",
                outline: "none",
                color: "#1f2937",
              }}
            />
          ) : (
            <h3
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#1f2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: onTitleChange ? "pointer" : "default",
                transition: "color 150ms",
              }}
              onClick={handleTitleClick}
              onMouseEnter={(e) => {
                if (onTitleChange) {
                  (e.currentTarget as HTMLHeadingElement).style.color =
                    "#4f46e5";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLHeadingElement).style.color = "#1f2937";
              }}
            >
              {column.title}
            </h3>
          )}

          {/* Card count badge */}
          <span
            style={{
              fontSize: "0.75rem",
              ...resolveDot("px-2 py-0.5 rounded-full"),
              flexShrink: 0,
              ...(column.limit && cardCount >= column.limit
                ? wipBadgeStyle
                : badgeStyle),
            }}
          >
            {cardCount}
            {column.limit && `/${column.limit}`}
          </span>
        </div>

        {/* Right: Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            ...resolveDot("gap-1"),
            flexShrink: 0,
          }}
        >
          {/* Collapse button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggleCollapse();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                ...resolveDot("p-1 rounded"),
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "background-color 150ms",
              }}
              aria-label="컬럼 접기"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "transparent";
              }}
            >
              <Icon name="chevronLeft" size={14} style={{ color: "#9ca3af" }} />
            </button>
          )}

          {/* Delete button */}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                ...resolveDot("p-1 rounded"),
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "background-color 150ms",
              }}
              aria-label="컬럼 삭제"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#fee2e2";
                const icon = (
                  e.currentTarget as HTMLButtonElement
                ).querySelector("[data-icon]");
                if (icon) (icon as HTMLElement).style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "transparent";
                const icon = (
                  e.currentTarget as HTMLButtonElement
                ).querySelector("[data-icon]");
                if (icon) (icon as HTMLElement).style.color = "#9ca3af";
              }}
            >
              <Icon
                name="delete"
                size={14}
                style={{ color: "#9ca3af", transition: "color 150ms" }}
              />
            </button>
          )}
        </div>
      </div>
    );
  },
);

KanbanColumnHeader.displayName = "KanbanColumnHeader";
