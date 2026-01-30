"use client";

import React, { useState, useRef, useEffect } from "react";
import { merge } from "../../../lib/utils";
import { Icon } from "../../Icon";
import { useColorStyles } from "../../../lib/styles/colors";
import type { Color } from "../../../lib/types/common";

/**
 * Color to dot class mapping
 */
const colorDotClasses: Record<Color, string> = {
  blue: "bg-indigo-500",
  purple: "bg-purple-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  indigo: "bg-indigo-500",
  pink: "bg-pink-500",
  gray: "bg-gray-500",
  cyan: "bg-cyan-500",
};
import type { KanbanColumnHeaderProps } from "./types";

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
      className,
      ...props
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(column.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const colorStyles = useColorStyles(column.color || "gray");

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
          className={merge(
            "flex flex-col items-center justify-center h-full min-h-[300px] py-4 px-2 rounded-xl",
            className
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
            className="flex flex-col items-center gap-3 w-full h-full justify-center cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors rounded-lg p-2"
          >
            <Icon
              name="chevronRight"
              size={16}
              className="text-gray-400"
            />
            <span
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 tracking-wide"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              {column.title}
            </span>
            <span className={merge("text-xs px-2 py-1 rounded-full font-medium", colorStyles.badge)}>
              {cardCount}
            </span>
          </button>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={merge(
          "flex items-center justify-between gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-700",
          className
        )}
        {...props}
      >
        {/* Left: Drag handle + Color indicator + Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Drag handle */}
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              className={merge(
                "flex-shrink-0 p-0.5 -ml-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                dragHandleProps?.className
              )}
              title="드래그하여 컬럼 이동"
            >
              <Icon name="moreVertical" size={16} className="text-gray-400" />
            </div>
          )}

          {/* Color dot */}
          <div
            className={merge(
              "w-3 h-3 rounded-full flex-shrink-0",
              colorDotClasses[column.color || "gray"]
            )}
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
              className="flex-1 min-w-0 px-2 py-1 text-sm font-semibold bg-transparent border border-indigo-500 rounded outline-none text-gray-800 dark:text-white"
            />
          ) : (
            <h3
              className={merge(
                "flex-1 min-w-0 text-sm font-semibold truncate text-gray-800 dark:text-white",
                onTitleChange && "cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
              )}
              onClick={handleTitleClick}
            >
              {column.title}
            </h3>
          )}

          {/* Card count badge */}
          <span
            className={merge(
              "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
              colorStyles.badge,
              column.limit && cardCount >= column.limit && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            )}
          >
            {cardCount}
            {column.limit && `/${column.limit}`}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
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
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="컬럼 접기"
            >
              <Icon
                name="chevronLeft"
                size={14}
                className="text-gray-400"
              />
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
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
              aria-label="컬럼 삭제"
            >
              <Icon
                name="delete"
                size={14}
                className="text-gray-400 group-hover:text-red-500"
              />
            </button>
          )}
        </div>
      </div>
    );
  }
);

KanbanColumnHeader.displayName = "KanbanColumnHeader";
